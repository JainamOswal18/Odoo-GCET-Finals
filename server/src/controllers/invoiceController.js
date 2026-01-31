import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateUniqueNumber, calculateTotals, paginate } from '../utils/helpers.js';
import analyticalService from '../services/analyticalService.js';

class InvoiceController {
  async create(req, res, next) {
    try {
      const { customer_id, so_id, invoice_date, due_date, lines, notes } = req.body;

      const lastInvoice = await getQuery(
        'SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1'
      );
      const invoice_number = generateUniqueNumber('INV-', lastInvoice?.invoice_number);

      const processedLines = await analyticalService.assignAnalyticalAccounts(
        lines, 'sale', { customer_id }
      );

      const totals = calculateTotals(processedLines);

      const result = await runQuery(
        `INSERT INTO invoices (invoice_number, customer_id, so_id, invoice_date, due_date,
         subtotal, tax_amount, total_amount, amount_due, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoice_number, customer_id, so_id || null, invoice_date, due_date,
         totals.subtotal, totals.taxAmount, totals.totalAmount, totals.totalAmount, notes, req.user.id]
      );

      const invoiceId = result.id;

      for (const line of processedLines) {
        await runQuery(
          `INSERT INTO invoice_lines (invoice_id, product_id, description, quantity,
           unit_price, tax_rate, subtotal, analytical_account_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [invoiceId, line.product_id, line.description, line.quantity,
           line.unit_price, line.tax_rate || 0,
           line.quantity * line.unit_price, line.analytical_account_id || null]
        );
      }

      const invoice = await getQuery('SELECT * FROM invoices WHERE id = ?', [invoiceId]);

      res.status(201).json({ message: 'Invoice created successfully', invoice });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, status, payment_status, customer_id } = req.query;
      const { limit: lmt, offset } = paginate(page, limit);

      let query = `
        SELECT i.*, c.name as customer_name
        FROM invoices i
        JOIN contacts c ON i.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND i.status = ?';
        params.push(status);
      }

      if (payment_status) {
        query += ' AND i.payment_status = ?';
        params.push(payment_status);
      }

      if (customer_id) {
        query += ' AND i.customer_id = ?';
        params.push(customer_id);
      }

      query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
      params.push(lmt, offset);

      const invoices = await allQuery(query, params);

      res.json({ invoices });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const invoice = await getQuery(
        `SELECT i.*, c.name as customer_name
         FROM invoices i
         JOIN contacts c ON i.customer_id = c.id
         WHERE i.id = ?`,
        [id]
      );

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const lines = await allQuery(
        `SELECT il.*, p.name as product_name, aa.code as analytical_code
         FROM invoice_lines il
         JOIN products p ON il.product_id = p.id
         LEFT JOIN analytical_accounts aa ON il.analytical_account_id = aa.id
         WHERE il.invoice_id = ?`,
        [id]
      );

      res.json({ invoice, lines });
    } catch (error) {
      next(error);
    }
  }

  async post(req, res, next) {
    try {
      const { id } = req.params;

      await runQuery(
        `UPDATE invoices SET status = 'confirmed', posted = 1, posted_at = datetime('now')
         WHERE id = ?`,
        [id]
      );

      res.json({ message: 'Invoice posted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
