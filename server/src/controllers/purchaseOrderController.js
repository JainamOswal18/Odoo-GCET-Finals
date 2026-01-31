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
                lines, 'purchase', { vendor_id }
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

            const countQuery = query.split('LIMIT')[0].replace('SELECT po.*, c.name as vendor_name', 'SELECT COUNT(*) as total');
            const countResult = await getQuery(countQuery, params.slice(0, -2));

            res.json({
                purchaseOrders,
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

            res.json({ purchaseOrder, lines });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { status, expected_date, notes } = req.body;

            const purchaseOrder = await getQuery('SELECT * FROM purchase_orders WHERE id = ?', [id]);

            if (!purchaseOrder) {
                return res.status(404).json({ error: 'Purchase order not found' });
            }

            await runQuery(
                `UPDATE purchase_orders 
         SET status = ?, expected_date = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?`,
                [status || purchaseOrder.status, expected_date || purchaseOrder.expected_date,
                notes || purchaseOrder.notes, id]
            );

            const updated = await getQuery('SELECT * FROM purchase_orders WHERE id = ?', [id]);

            res.json({
                message: 'Purchase order updated successfully',
                purchaseOrder: updated
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