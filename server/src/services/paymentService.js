import { runQuery, getQuery, allQuery } from '../config/database.js';
import { calculatePaymentStatus } from '../utils/helpers.js';

class PaymentService {
  async allocatePayment(paymentId, allocations) {
    try {
      for (const allocation of allocations) {
        await runQuery(
          `INSERT INTO payment_allocations (payment_id, invoice_id, bill_id, amount)
           VALUES (?, ?, ?, ?)`,
          [paymentId, allocation.invoice_id || null, allocation.bill_id || null, allocation.amount]
        );

        if (allocation.invoice_id) {
          await this.updateInvoicePaymentStatus(allocation.invoice_id);
        }

        if (allocation.bill_id) {
          await this.updateBillPaymentStatus(allocation.bill_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error allocating payment:', error);
      throw error;
    }
  }

  async updateInvoicePaymentStatus(invoiceId) {
    try {
      const invoice = await getQuery('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const payments = await getQuery(
        `SELECT COALESCE(SUM(amount), 0) as total_paid
         FROM payment_allocations
         WHERE invoice_id = ?`,
        [invoiceId]
      );

      const amountPaid = parseFloat(payments.total_paid || 0);
      const amountDue = parseFloat(invoice.total_amount) - amountPaid;
      const paymentStatus = calculatePaymentStatus(invoice.total_amount, amountPaid);

      await runQuery(
        `UPDATE invoices 
         SET amount_paid = ?, amount_due = ?, payment_status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [amountPaid, amountDue, paymentStatus, invoiceId]
      );

      return { amountPaid, amountDue, paymentStatus };
    } catch (error) {
      console.error('Error updating invoice payment status:', error);
      throw error;
    }
  }

  async updateBillPaymentStatus(billId) {
    try {
      const bill = await getQuery('SELECT * FROM bills WHERE id = ?', [billId]);
      
      if (!bill) {
        throw new Error('Bill not found');
      }

      const payments = await getQuery(
        `SELECT COALESCE(SUM(amount), 0) as total_paid
         FROM payment_allocations
         WHERE bill_id = ?`,
        [billId]
      );

      const amountPaid = parseFloat(payments.total_paid || 0);
      const amountDue = parseFloat(bill.total_amount) - amountPaid;
      const paymentStatus = calculatePaymentStatus(bill.total_amount, amountPaid);

      await runQuery(
        `UPDATE bills 
         SET amount_paid = ?, amount_due = ?, payment_status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [amountPaid, amountDue, paymentStatus, billId]
      );

      return { amountPaid, amountDue, paymentStatus };
    } catch (error) {
      console.error('Error updating bill payment status:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const payment = await getQuery(
        `SELECT p.*, c.name as contact_name
         FROM payments p
         JOIN contacts c ON p.contact_id = c.id
         WHERE p.id = ?`,
        [paymentId]
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      const allocations = await allQuery(
        `SELECT pa.*, 
          i.invoice_number, i.total_amount as invoice_amount,
          b.bill_number, b.total_amount as bill_amount
         FROM payment_allocations pa
         LEFT JOIN invoices i ON pa.invoice_id = i.id
         LEFT JOIN bills b ON pa.bill_id = b.id
         WHERE pa.payment_id = ?`,
        [paymentId]
      );

      return { payment, allocations };
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  }

  async createJournalEntryForPayment(paymentId) {
    try {
      const { payment, allocations } = await this.getPaymentDetails(paymentId);

      const entryNumber = `JE-PAY-${paymentId}`;

      const result = await runQuery(
        `INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, 
         description, status, posted, posted_at, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
        [
          entryNumber,
          payment.payment_date,
          'payment',
          paymentId,
          `Payment ${payment.payment_number}`,
          'posted',
          1,
          payment.created_by
        ]
      );

      const journalEntryId = result.id;

      if (payment.payment_type === 'inbound') {
        await runQuery(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, 
           description, debit, credit)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [journalEntryId, 'BANK', 'Bank Account', 'Payment received', payment.amount, 0]
        );

        await runQuery(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, 
           description, debit, credit)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [journalEntryId, 'AR', 'Accounts Receivable', 'Payment received', 0, payment.amount]
        );
      } else {
        await runQuery(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, 
           description, debit, credit)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [journalEntryId, 'AP', 'Accounts Payable', 'Payment made', payment.amount, 0]
        );

        await runQuery(
          `INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, 
           description, debit, credit)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [journalEntryId, 'BANK', 'Bank Account', 'Payment made', 0, payment.amount]
        );
      }

      return journalEntryId;
    } catch (error) {
      console.error('Error creating journal entry for payment:', error);
      throw error;
    }
  }
}

export default new PaymentService();
