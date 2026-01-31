import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateUniqueNumber, calculateTotals, paginate } from '../utils/helpers.js';
import analyticalService from '../services/analyticalService.js';

class BillController {
    async create(req, res, next) {
        try {
            const { vendor_id, po_id, bill_date, due_date, lines, notes } = req.body;

            const lastBill = await getQuery(
                'SELECT bill_number FROM bills ORDER BY id DESC LIMIT 1'
            );
            const bill_number = generateUniqueNumber('BILL-', lastBill?.bill_number);

            const processedLines = await analyticalService.assignAnalyticalAccounts(
                lines, 'purchase', { vendor_id }
            );

            const totals = calculateTotals(processedLines);

            const result = await runQuery(
                `INSERT INTO bills (bill_number, vendor_id, po_id, bill_date, due_date,
         subtotal, tax_amount, total_amount, amount_due, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [bill_number, vendor_id, po_id || null, bill_date, due_date,
                    totals.subtotal, totals.taxAmount, totals.totalAmount, totals.totalAmount, notes, req.user.id]
            );

            const billId = result.id;

            for (const line of processedLines) {
                await runQuery(
                    `INSERT INTO bill_lines (bill_id, product_id, description, quantity,
           unit_price, tax_rate, subtotal, analytical_account_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [billId, line.product_id, line.description, line.quantity,
                        line.unit_price, line.tax_rate || 0,
                        line.quantity * line.unit_price, line.analytical_account_id || null]
                );
            }

            const bill = await getQuery('SELECT * FROM bills WHERE id = ?', [billId]);

            res.status(201).json({
                message: 'Bill created successfully',
                bill
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, status, payment_status, vendor_id } = req.query;
            const { limit: lmt, offset } = paginate(page, limit);

            let query = `
        SELECT b.*, c.name as vendor_name
        FROM bills b
        JOIN contacts c ON b.vendor_id = c.id
        WHERE 1=1
      `;
            const params = [];

            if (status) {
                query += ' AND b.status = ?';
                params.push(status);
            }

            if (payment_status) {
                query += ' AND b.payment_status = ?';
                params.push(payment_status);
            }

            if (vendor_id) {
                query += ' AND b.vendor_id = ?';
                params.push(vendor_id);
            }

            query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
            params.push(lmt, offset);

            const bills = await allQuery(query, params);

            const countQuery = query.split('LIMIT')[0].replace('SELECT b.*, c.name as vendor_name', 'SELECT COUNT(*) as total');
            const countResult = await getQuery(countQuery, params.slice(0, -2));

            res.json({
                bills,
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

            const bill = await getQuery(
                `SELECT b.*, c.name as vendor_name
         FROM bills b
         JOIN contacts c ON b.vendor_id = c.id
         WHERE b.id = ?`,
                [id]
            );

            if (!bill) {
                return res.status(404).json({ error: 'Bill not found' });
            }

            const lines = await allQuery(
                `SELECT bl.*, p.name as product_name, aa.code as analytical_code
         FROM bill_lines bl
         JOIN products p ON bl.product_id = p.id
         LEFT JOIN analytical_accounts aa ON bl.analytical_account_id = aa.id
         WHERE bl.bill_id = ?`,
                [id]
            );

            res.json({ bill, lines });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { status, due_date, notes } = req.body;

            const bill = await getQuery('SELECT * FROM bills WHERE id = ?', [id]);

            if (!bill) {
                return res.status(404).json({ error: 'Bill not found' });
            }

            await runQuery(
                `UPDATE bills 
         SET status = ?, due_date = ?, notes = ?, updated_at = datetime('now')
         WHERE id = ?`,
                [status || bill.status, due_date || bill.due_date, notes || bill.notes, id]
            );

            const updated = await getQuery('SELECT * FROM bills WHERE id = ?', [id]);

            res.json({
                message: 'Bill updated successfully',
                bill: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async post(req, res, next) {
        try {
            const { id } = req.params;

            await runQuery(
                `UPDATE bills SET status = 'confirmed', posted = 1, posted_at = datetime('now')
         WHERE id = ?`,
                [id]
            );

            res.json({ message: 'Bill posted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const bill = await getQuery('SELECT * FROM bills WHERE id = ?', [id]);

            if (!bill) {
                return res.status(404).json({ error: 'Bill not found' });
            }

            if (bill.status !== 'draft') {
                return res.status(400).json({ error: 'Only draft bills can be deleted' });
            }

            await runQuery('DELETE FROM bills WHERE id = ?', [id]);

            res.json({ message: 'Bill deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export default new BillController();