import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateUniqueNumber, calculateTotals, paginate } from '../utils/helpers.js';
import analyticalService from '../services/analyticalService.js';

class PurchaseOrderController {
    async create(req, res, next) {
        try {
            const { vendor_id, order_date, expected_date, lines, notes } = req.body;

            const lastPO = await getQuery(
                'SELECT po_number FROM purchase_orders ORDER BY id DESC LIMIT 1'
            );
            const po_number = generateUniqueNumber('PO-', lastPO?.po_number);

            const processedLines = await analyticalService.assignAnalyticalAccounts(
                lines, { vendor_id }
            );

            const totals = calculateTotals(processedLines);

            const result = await runQuery(
                `INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date,
         subtotal, tax_amount, total_amount, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [po_number, vendor_id, order_date, expected_date,
                    totals.subtotal, totals.taxAmount, totals.totalAmount, notes, req.user.id]
            );

            const poId = result.id;

            for (const line of processedLines) {
                await runQuery(
                    `INSERT INTO purchase_order_lines (po_id, product_id, description, quantity,
           unit_price, tax_rate, subtotal, analytical_account_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [poId, line.product_id, line.description, line.quantity,
                        line.unit_price, line.tax_rate || 0,
                        line.quantity * line.unit_price, line.analytical_account_id || null]
                );
            }

            const purchaseOrder = await getQuery('SELECT * FROM purchase_orders WHERE id = ?', [poId]);

            res.status(201).json({
                message: 'Purchase order created successfully',
                purchaseOrder
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, status, vendor_id } = req.query;
            const { limit: lmt, offset } = paginate(page, limit);

            let query = `
        SELECT po.*, c.name as vendor_name
        FROM purchase_orders po
        JOIN contacts c ON po.vendor_id = c.id
        WHERE 1=1
      `;
            const params = [];

            if (status) {
                query += ' AND po.status = ?';
                params.push(status);
            }

            if (vendor_id) {
                query += ' AND po.vendor_id = ?';
                params.push(vendor_id);
            }

            query += ' ORDER BY po.created_at DESC LIMIT ? OFFSET ?';
            params.push(lmt, offset);

            const purchaseOrders = await allQuery(query, params);

            // Fetch line items for all purchase orders
            const mappedOrders = await Promise.all(purchaseOrders.map(async (po) => {
                const lines = await allQuery(
                    `SELECT pol.*, p.name as product_name
                     FROM purchase_order_lines pol
                     JOIN products p ON pol.product_id = p.id
                     WHERE pol.po_id = ?`,
                    [po.id]
                );

                const lineItems = lines.map(line => ({
                    id: line.id,
                    productId: String(line.product_id),
                    productName: line.product_name,
                    quantity: line.quantity,
                    unitPrice: line.unit_price,
                    analyticalAccountId: line.analytical_account_id ? String(line.analytical_account_id) : null
                }));

                return {
                    id: String(po.id),
                    orderNumber: po.po_number,
                    vendorId: String(po.vendor_id),
                    vendorName: po.vendor_name,
                    orderDate: po.order_date,
                    expectedDate: po.expected_date,
                    status: po.status,
                    subtotal: po.subtotal,
                    taxTotal: po.tax_amount,
                    grandTotal: po.total_amount,
                    notes: po.notes,
                    lineItems,
                    createdAt: po.created_at,
                    updatedAt: po.updated_at
                };
            }));

            const countQuery = query.split('LIMIT')[0].replace('SELECT po.*, c.name as vendor_name', 'SELECT COUNT(*) as total');
            const countResult = await getQuery(countQuery, params.slice(0, -2));

            res.json({
                purchaseOrders: mappedOrders,
                pagination: {
                    page: parseInt(page),
                    limit: lmt,
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / lmt)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const purchaseOrder = await getQuery(
                `SELECT po.*, c.name as vendor_name
         FROM purchase_orders po
         JOIN contacts c ON po.vendor_id = c.id
         WHERE po.id = ?`,
                [id]
            );

            if (!purchaseOrder) {
                return res.status(404).json({ error: 'Purchase order not found' });
            }

            const lines = await allQuery(
                `SELECT pol.*, p.name as product_name, aa.code as analytical_code
         FROM purchase_order_lines pol
         JOIN products p ON pol.product_id = p.id
         LEFT JOIN analytical_accounts aa ON pol.analytical_account_id = aa.id
         WHERE pol.po_id = ?`,
                [id]
            );

            const lineItems = lines.map(line => ({
                id: line.id,
                productId: String(line.product_id),
                productName: line.product_name,
                quantity: line.quantity,
                unitPrice: line.unit_price,
                analyticalAccountId: line.analytical_account_id ? String(line.analytical_account_id) : null,
                analyticalCode: line.analytical_code
            }));

            const formattedPO = {
                id: String(purchaseOrder.id),
                orderNumber: purchaseOrder.po_number,
                vendorId: String(purchaseOrder.vendor_id),
                vendorName: purchaseOrder.vendor_name,
                orderDate: purchaseOrder.order_date,
                expectedDate: purchaseOrder.expected_date,
                status: purchaseOrder.status,
                subtotal: purchaseOrder.subtotal,
                taxTotal: purchaseOrder.tax_amount,
                grandTotal: purchaseOrder.total_amount,
                notes: purchaseOrder.notes,
                lineItems,
                createdAt: purchaseOrder.created_at,
                updatedAt: purchaseOrder.updated_at
            };

            res.json({ purchaseOrder: formattedPO });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { vendor_id, order_date, expected_date, status, notes, lines } = req.body;

            const purchaseOrder = await getQuery('SELECT * FROM purchase_orders WHERE id = ?', [id]);

            if (!purchaseOrder) {
                return res.status(404).json({ error: 'Purchase order not found' });
            }

            // If lines are provided, recalculate totals and update line items
            if (lines && lines.length > 0) {
                const processedLines = await analyticalService.assignAnalyticalAccounts(
                    lines, { vendor_id: vendor_id || purchaseOrder.vendor_id }
                );

                const totals = calculateTotals(processedLines);

                await runQuery(
                    `UPDATE purchase_orders 
                     SET vendor_id = ?, order_date = ?, expected_date = ?, status = ?, 
                         subtotal = ?, tax_amount = ?, total_amount = ?, notes = ?, 
                         updated_at = datetime('now')
                     WHERE id = ?`,
                    [
                        vendor_id || purchaseOrder.vendor_id,
                        order_date || purchaseOrder.order_date,
                        expected_date || purchaseOrder.expected_date,
                        status || purchaseOrder.status,
                        totals.subtotal,
                        totals.taxAmount,
                        totals.totalAmount,
                        notes || purchaseOrder.notes,
                        id
                    ]
                );

                // Delete existing line items
                await runQuery('DELETE FROM purchase_order_lines WHERE po_id = ?', [id]);

                // Insert new line items
                for (const line of processedLines) {
                    await runQuery(
                        `INSERT INTO purchase_order_lines (po_id, product_id, description, quantity,
                         unit_price, tax_rate, subtotal, analytical_account_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            id,
                            line.product_id,
                            line.description,
                            line.quantity,
                            line.unit_price,
                            line.tax_rate || 0,
                            line.quantity * line.unit_price,
                            line.analytical_account_id || null
                        ]
                    );
                }
            } else {
                // Just update header fields
                await runQuery(
                    `UPDATE purchase_orders 
                     SET status = ?, expected_date = ?, notes = ?, updated_at = datetime('now')
                     WHERE id = ?`,
                    [
                        status || purchaseOrder.status,
                        expected_date || purchaseOrder.expected_date,
                        notes || purchaseOrder.notes,
                        id
                    ]
                );
            }

            const updated = await getQuery(
                `SELECT po.*, c.name as vendor_name
                 FROM purchase_orders po
                 JOIN contacts c ON po.vendor_id = c.id
                 WHERE po.id = ?`,
                [id]
            );

            const lineItems = await allQuery(
                `SELECT pol.*, p.name as product_name
                 FROM purchase_order_lines pol
                 JOIN products p ON pol.product_id = p.id
                 WHERE pol.po_id = ?`,
                [id]
            );

            const formattedPO = {
                id: String(updated.id),
                orderNumber: updated.po_number,
                vendorId: String(updated.vendor_id),
                vendorName: updated.vendor_name,
                orderDate: updated.order_date,
                expectedDate: updated.expected_date,
                status: updated.status,
                subtotal: updated.subtotal,
                taxTotal: updated.tax_amount,
                grandTotal: updated.total_amount,
                notes: updated.notes,
                lineItems: lineItems.map(line => ({
                    id: line.id,
                    productId: String(line.product_id),
                    productName: line.product_name,
                    quantity: line.quantity,
                    unitPrice: line.unit_price,
                    analyticalAccountId: line.analytical_account_id ? String(line.analytical_account_id) : null
                })),
                createdAt: updated.created_at,
                updatedAt: updated.updated_at
            };

            res.json({
                message: 'Purchase order updated successfully',
                purchaseOrder: formattedPO
            });
        } catch (error) {
            next(error);
        }
    }

    async confirm(req, res, next) {
        try {
            const { id } = req.params;

            await runQuery(
                `UPDATE purchase_orders SET status = 'confirmed', updated_at = datetime('now')
         WHERE id = ?`,
                [id]
            );

            res.json({ message: 'Purchase order confirmed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async cancel(req, res, next) {
        try {
            const { id } = req.params;

            await runQuery(
                `UPDATE purchase_orders SET status = 'cancelled', updated_at = datetime('now')
         WHERE id = ?`,
                [id]
            );

            res.json({ message: 'Purchase order cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default new PurchaseOrderController();