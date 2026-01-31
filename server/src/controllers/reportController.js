import reportService from '../services/reportService.js';

class ReportController {
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
