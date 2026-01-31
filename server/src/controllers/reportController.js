import reportService from '../services/reportService.js';
import { getQuery } from '../config/database.js';

class ReportController {
  // Dashboard statistics endpoint
  async dashboardStats(req, res, next) {
    try {
      // Get budget stats
      const budgetStats = await getQuery(`
        SELECT 
          COUNT(*) as total_budgets,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_budgets,
          COALESCE(SUM(bl.budgeted_amount), 0) as total_budget,
          COALESCE(SUM(bl.actual_amount), 0) as actual_spending
        FROM budgets b
        LEFT JOIN budget_lines bl ON b.id = bl.budget_id
        WHERE b.is_revision = 0
      `);

      const invoiceStats = await getQuery(`
        SELECT 
          COUNT(*) as total_invoices,
          SUM(CASE WHEN status IN ('draft', 'posted') THEN 1 ELSE 0 END) as pending_invoices,
          COALESCE(SUM(total_amount), 0) as total_invoiced
        FROM invoices
      `);

      const billStats = await getQuery(`
        SELECT 
          COUNT(*) as total_bills,
          SUM(CASE WHEN status IN ('draft', 'posted') THEN 1 ELSE 0 END) as pending_bills,
          COALESCE(SUM(total_amount), 0) as total_billed
        FROM bills
      `);

      const paymentStats = await getQuery(`
        SELECT 
          COUNT(*) as total_payments,
          COALESCE(SUM(amount), 0) as total_payments_amount
        FROM payments
        WHERE status = 'posted'
      `);

      const stats = {
        totalBudget: budgetStats?.total_budget || 0,
        actualSpending: budgetStats?.actual_spending || 0,
        remainingBudget: (budgetStats?.total_budget || 0) - (budgetStats?.actual_spending || 0),
        budgetUtilization: budgetStats?.total_budget > 0
          ? ((budgetStats.actual_spending / budgetStats.total_budget) * 100).toFixed(2)
          : 0,
        activeBudgets: budgetStats?.active_budgets || 0,
        totalBudgets: budgetStats?.total_budgets || 0,
        pendingInvoices: invoiceStats?.pending_invoices || 0,
        totalInvoices: invoiceStats?.total_invoices || 0,
        totalInvoiced: invoiceStats?.total_invoiced || 0,
        pendingBills: billStats?.pending_bills || 0,
        totalBills: billStats?.total_bills || 0,
        totalBilled: billStats?.total_billed || 0,
        totalPayments: paymentStats?.total_payments || 0,
        totalPaymentsAmount: paymentStats?.total_payments_amount || 0,
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async budgetVsActual(req, res, next) {
    try {
      const { budget_id } = req.query;

      if (!budget_id) {
        return res.status(400).json({ error: 'Budget ID is required' });
      }

      const report = await reportService.getBudgetVsActualReport(budget_id);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async analyticalAccount(req, res, next) {
    try {
      const { account_id, start_date, end_date } = req.query;

      if (!account_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'Account ID, start date, and end date are required' });
      }

      const report = await reportService.getAnalyticalAccountReport(account_id, start_date, end_date);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async paymentStatus(req, res, next) {
    try {
      const { start_date, end_date, contact_type } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const report = await reportService.getPaymentStatusReport(start_date, end_date, contact_type);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async sales(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const report = await reportService.getSalesReport(start_date, end_date);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async purchase(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const report = await reportService.getPurchaseReport(start_date, end_date);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
