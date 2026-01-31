import { runQuery, getQuery, allQuery } from '../config/database.js';
import { generateUniqueNumber, paginate } from '../utils/helpers.js';
import paymentService from '../services/paymentService.js';

class PaymentController {
  async create(req, res, next) {
    try {
      const { payment_type, contact_id, payment_date, amount, payment_method, reference, allocations, notes } = req.body;

      const lastPayment = await getQuery(
        'SELECT payment_number FROM payments ORDER BY id DESC LIMIT 1'
      );
      const payment_number = generateUniqueNumber('PAY-', lastPayment?.payment_number);

      const result = await runQuery(
        `INSERT INTO payments (payment_number, payment_type, contact_id, payment_date,
         amount, payment_method, reference, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [payment_number, payment_type, contact_id, payment_date, amount,
         payment_method, reference, notes, req.user.id]
      );

      const paymentId = result.id;

      if (allocations && allocations.length > 0) {
        await paymentService.allocatePayment(paymentId, allocations);
      }

      await paymentService.createJournalEntryForPayment(paymentId);

      const payment = await getQuery('SELECT * FROM payments WHERE id = ?', [paymentId]);

      res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, payment_type, contact_id } = req.query;
      const { limit: lmt, offset } = paginate(page, limit);

      let query = `
        SELECT p.*, c.name as contact_name
        FROM payments p
        JOIN contacts c ON p.contact_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (payment_type) {
        query += ' AND p.payment_type = ?';
        params.push(payment_type);
      }

      if (contact_id) {
        query += ' AND p.contact_id = ?';
        params.push(contact_id);
      }

      query += ' ORDER BY p.payment_date DESC LIMIT ? OFFSET ?';
      params.push(lmt, offset);

      const payments = await allQuery(query, params);

      res.json({ payments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const details = await paymentService.getPaymentDetails(id);

      if (!details.payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json(details);
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
