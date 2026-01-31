import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateUniqueNumber, calculateTotals, paginate } from '../utils/helpers.js';
import analyticalService from '../services/analyticalService.js';

class SalesOrderController {
    async create(req, res, next) {
        try {
            const { customer_id, order_date, delivery_date, lines, notes } = req.body;

            const lastSO = await getQuery(
                'SELECT so_number FROM sales_orders ORDER BY id DESC LIMIT 1'
            );
            const so_number = generateUniqueNumber('SO-', lastSO?.so_number);

            const processedLines = await analyticalService.assignAnalyticalAccounts(
                lines, 'sale', { customer_id }
            );

            const totals = calculateTotals(processedLines);

            const result = await runQuery(
                `INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date,
         subtotal, tax_amount, total_amount, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [so_number, customer_id, order_date, delivery_date,
                    totals.subtotal, totals.taxAmount, totals.totalAmount, notes, req.user.id]
            );

            const soId = result.id;

            for (const line of processedLines) {
                await runQuery(
                    `INSERT INTO sales_order_lines (so_id, product_id, description, quantity,
           unit_price, tax_rate, subtotal, analytical_account_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [soId, line.product_id, line.description, line.quantity,
                        line.unit_price, line.tax_rate || 0,
                        line.quantity * line.unit_price, line.analytical_account_id || null]
                );
            }

            const salesOrder = await getQuery('SELECT * FROM sales_orders WHERE id = ?', [soId]);

            res.status(201).json({
                message: 'Sales order created successfully',
                salesOrder
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, status, customer_id } = req.query;
            const { limit: lmt, offset } = paginate(page, limit);

            let query = `
        SELECT so.*, c.name as customer_name
        FROM sales_orders so
        JOIN contacts c ON so.customer_id = c.id
        WHERE 1=1
      `;
            const params = [];

            if (status) {
                query += ' AND so.status = ?';
                params.push(status);
            }

            if (customer_id) {
                query += ' AND so.customer_id = ?';
                params.push(customer_id);
            }

            query += ' ORDER BY so.created_at DESC LIMIT ? OFFSET ?';
            params.push(lmt, offset);

            const salesOrders = await allQuery(query, params);

            const countQuery = query.split('LIMIT')[0].replace('SELECT so.*, c.name as customer_name', 'SELECT COUNT(*) as total');
            const countResult = await getQuery(countQuery, params.slice(0, -2));

            res.json({
                salesOrders,
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

            const salesOrder = await getQuery(
                `SELECT so.*, c.name as customer_name
         FROM sales_orders so
         JOIN contacts c ON so.customer_id = c.id
         WHERE so.id = ?`,
                [id]
            );

            if (!salesOrder) {
                return res.status(404).json({ error: 'Sales order not found' });
            }

            const lines = await allQuery(
                `SELECT sol.*, p.name as product_name, aa.code as analytical_code
         FROM sales_order_lines sol
         JOIN products p ON sol.product_id = p.id
         LEFT JOIN analytical_accounts aa ON sol.analytical_account_id = aa.id
         WHERE sol.so_id = ?`,
                [id]
            );

            res.json({ salesOrder, lines });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { status, delivery_date, notes } = req.body;

            const salesOrder = await getQuery('SELECT * FROM sales_orders WHERE id = ?', [id]);

            if (!salesOrder) {
                return res.status(404).json({ error: 'Sales order not found' });
            }

            await runQuery(
                `UPDATE sales_orders 
         SET status = ?, delivery_date = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?`,
                [status || salesOrder.status, delivery_date || salesOrder.delivery_date,
                notes || salesOrder.notes, id]
            );

            const updated = await getQuery('SELECT * FROM sales_orders WHERE id = ?', [id]);

            res.json({
                message: 'Sales order updated successfully',
                salesOrder: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async confirm(req, res, next) {
        try {
            const { id } = req.params;

            await runQuery(
                `UPDATE sales_orders SET status = 'confirmed', updated_at = datetime('now')
         WHERE id = ?`,
                [id]
            );

            res.json({ message: 'Sales order confirmed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async cancel(req, res, next) {
        try {
            const { id } = req.params;

            await runQuery(
                `UPDATE sales_orders SET status = 'cancelled', updated_at = datetime('now')
         WHERE id = ?`,
                [id]
            );

            res.json({ message: 'Sales order cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default new SalesOrderController();