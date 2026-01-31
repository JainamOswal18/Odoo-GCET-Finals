import { allQuery, getQuery } from '../config/database.js';

class ReportService {
  async getBudgetVsActualReport(budgetId) {
    try {
      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [budgetId]);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      const lines = await allQuery(
        `SELECT 
          bl.*,
          aa.code,
          aa.name as account_name,
          aa.plan_name,
          aa.account_type
         FROM budget_lines bl
         JOIN analytical_accounts aa ON bl.analytical_account_id = aa.id
         WHERE bl.budget_id = ?
         ORDER BY aa.plan_name, aa.code`,
        [budgetId]
      );

      const groupedByPlan = lines.reduce((acc, line) => {
        const plan = line.plan_name || 'Uncategorized';
        if (!acc[plan]) {
          acc[plan] = [];
        }
        acc[plan].push(line);
        return acc;
      }, {});

      return {
        budget,
        lines,
        groupedByPlan
      };
    } catch (error) {
      console.error('Error generating budget vs actual report:', error);
      throw error;
    }
  }

  async getAnalyticalAccountReport(accountId, startDate, endDate) {
    try {
      const account = await getQuery(
        'SELECT * FROM analytical_accounts WHERE id = ?',
        [accountId]
      );

      if (!account) {
        throw new Error('Analytical account not found');
      }

      const transactions = await allQuery(
        `SELECT 
          jel.*,
          je.entry_number,
          je.entry_date,
          je.description as entry_description,
          je.reference_type,
          je.reference_id
         FROM journal_entry_lines jel
         JOIN journal_entries je ON jel.journal_entry_id = je.id
         WHERE jel.analytical_account_id = ?
           AND je.posted = 1
           AND je.entry_date BETWEEN ? AND ?
         ORDER BY je.entry_date ASC`,
        [accountId, startDate, endDate]
      );

      let runningBalance = 0;
      const transactionsWithBalance = transactions.map(txn => {
        const amount = parseFloat(txn.debit) - parseFloat(txn.credit);
        runningBalance += amount;
        return {
          ...txn,
          amount,
          balance: runningBalance
        };
      });

      const summary = {
        totalDebit: transactions.reduce((sum, t) => sum + parseFloat(t.debit), 0),
        totalCredit: transactions.reduce((sum, t) => sum + parseFloat(t.credit), 0),
        netAmount: runningBalance
      };

      return {
        account,
        transactions: transactionsWithBalance,
        summary
      };
    } catch (error) {
      console.error('Error generating analytical account report:', error);
      throw error;
    }
  }

  async getPaymentStatusReport(startDate, endDate, contactType) {
    try {
      let query = '';
      let params = [startDate, endDate];

      if (contactType === 'customer') {
        query = `
          SELECT 
            i.id,
            i.invoice_number as document_number,
            i.invoice_date as document_date,
            i.due_date,
            c.name as contact_name,
            i.total_amount,
            i.amount_paid,
            i.amount_due,
            i.payment_status,
            'invoice' as document_type
          FROM invoices i
          JOIN contacts c ON i.customer_id = c.id
          WHERE i.invoice_date BETWEEN ? AND ?
            AND i.status != 'draft'
          ORDER BY i.invoice_date DESC
        `;
      } else if (contactType === 'vendor') {
        query = `
          SELECT 
            b.id,
            b.bill_number as document_number,
            b.bill_date as document_date,
            b.due_date,
            c.name as contact_name,
            b.total_amount,
            b.amount_paid,
            b.amount_due,
            b.payment_status,
            'bill' as document_type
          FROM bills b
          JOIN contacts c ON b.vendor_id = c.id
          WHERE b.bill_date BETWEEN ? AND ?
            AND b.status != 'draft'
          ORDER BY b.bill_date DESC
        `;
      } else {
        query = `
          SELECT * FROM (
            SELECT 
              i.id,
              i.invoice_number as document_number,
              i.invoice_date as document_date,
              i.due_date,
              c.name as contact_name,
              i.total_amount,
              i.amount_paid,
              i.amount_due,
              i.payment_status,
              'invoice' as document_type
            FROM invoices i
            JOIN contacts c ON i.customer_id = c.id
            WHERE i.invoice_date BETWEEN ? AND ?
              AND i.status != 'draft'
            
            UNION ALL
            
            SELECT 
              b.id,
              b.bill_number as document_number,
              b.bill_date as document_date,
              b.due_date,
              c.name as contact_name,
              b.total_amount,
              b.amount_paid,
              b.amount_due,
              b.payment_status,
              'bill' as document_type
            FROM bills b
            JOIN contacts c ON b.vendor_id = c.id
            WHERE b.bill_date BETWEEN ? AND ?
              AND b.status != 'draft'
          ) combined
          ORDER BY document_date DESC
        `;
        params = [startDate, endDate, startDate, endDate];
      }

      const documents = await allQuery(query, params);

      const summary = {
        total: documents.length,
        paid: documents.filter(d => d.payment_status === 'paid').length,
        partiallyPaid: documents.filter(d => d.payment_status === 'partially_paid').length,
        unpaid: documents.filter(d => d.payment_status === 'unpaid').length,
        totalAmount: documents.reduce((sum, d) => sum + parseFloat(d.total_amount), 0),
        totalPaid: documents.reduce((sum, d) => sum + parseFloat(d.amount_paid), 0),
        totalDue: documents.reduce((sum, d) => sum + parseFloat(d.amount_due || 0), 0)
      };

      return { documents, summary };
    } catch (error) {
      console.error('Error generating payment status report:', error);
      throw error;
    }
  }

  async getSalesReport(startDate, endDate) {
    try {
      const invoices = await allQuery(
        `SELECT 
          i.*,
          c.name as customer_name
         FROM invoices i
         JOIN contacts c ON i.customer_id = c.id
         WHERE i.invoice_date BETWEEN ? AND ?
           AND i.status != 'draft'
         ORDER BY i.invoice_date DESC`,
        [startDate, endDate]
      );

      const summary = {
        totalInvoices: invoices.length,
        totalSales: invoices.reduce((sum, i) => sum + parseFloat(i.total_amount), 0),
        totalCollected: invoices.reduce((sum, i) => sum + parseFloat(i.amount_paid), 0),
        totalOutstanding: invoices.reduce((sum, i) => sum + parseFloat(i.amount_due || 0), 0)
      };

      return { invoices, summary };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  async getPurchaseReport(startDate, endDate) {
    try {
      const bills = await allQuery(
        `SELECT 
          b.*,
          c.name as vendor_name
         FROM bills b
         JOIN contacts c ON b.vendor_id = c.id
         WHERE b.bill_date BETWEEN ? AND ?
           AND b.status != 'draft'
         ORDER BY b.bill_date DESC`,
        [startDate, endDate]
      );

      const summary = {
        totalBills: bills.length,
        totalPurchases: bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
        totalPaid: bills.reduce((sum, b) => sum + parseFloat(b.amount_paid), 0),
        totalOutstanding: bills.reduce((sum, b) => sum + parseFloat(b.amount_due || 0), 0)
      };

      return { bills, summary };
    } catch (error) {
      console.error('Error generating purchase report:', error);
      throw error;
    }
  }
}

export default new ReportService();
