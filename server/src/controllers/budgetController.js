import { runQuery, getQuery, allQuery } from '../config/database.js';
import budgetService from '../services/budgetService.js';
import { paginate } from '../utils/helpers.js';

class BudgetController {
  async create(req, res, next) {
    try {
      const { name, period_start, period_end, lines } = req.body;

      const result = await runQuery(
        `INSERT INTO budgets (name, period_start, period_end, status, created_by)
         VALUES (?, ?, ?, ?, ?)`,
        [name, period_start, period_end, 'draft', req.user.id]
      );

      const budgetId = result.id;

      if (lines && lines.length > 0) {
        for (const line of lines) {
          await runQuery(
            `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount)
             VALUES (?, ?, ?)`,
            [budgetId, line.analytical_account_id, line.budgeted_amount]
          );
        }
      }

      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [budgetId]);

      res.status(201).json({
        message: 'Budget created successfully',
        budget
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const { limit: lmt, offset } = paginate(page, limit);

      let query = `
        SELECT b.*, u.login_id as created_by_name
        FROM budgets b
        LEFT JOIN users u ON b.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND b.name LIKE ?';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(lmt, offset);

      const budgets = await allQuery(query, params);

      const countResult = await getQuery(
        'SELECT COUNT(*) as total FROM budgets WHERE 1=1' +
        (status ? ' AND status = ?' : '') +
        (search ? ' AND name LIKE ?' : ''),
        params.slice(0, -2)
      );

      res.json({
        budgets,
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

      const budget = await getQuery(
        `SELECT b.*, u.login_id as created_by_name
         FROM budgets b
         LEFT JOIN users u ON b.created_by = u.id
         WHERE b.id = ?`,
        [id]
      );

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      const lines = await allQuery(
        `SELECT bl.*, aa.code, aa.name as account_name, aa.plan_name
         FROM budget_lines bl
         JOIN analytical_accounts aa ON bl.analytical_account_id = aa.id
         WHERE bl.budget_id = ?
         ORDER BY aa.plan_name, aa.code`,
        [id]
      );

      res.json({ budget, lines });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, period_start, period_end, status } = req.body;

      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [id]);

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      await runQuery(
        `UPDATE budgets 
         SET name = ?, period_start = ?, period_end = ?, status = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name, period_start, period_end, status, id]
      );

      const updated = await getQuery('SELECT * FROM budgets WHERE id = ?', [id]);

      res.json({
        message: 'Budget updated successfully',
        budget: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLines(req, res, next) {
    try {
      const { id } = req.params;
      const { lines } = req.body;

      await runQuery('DELETE FROM budget_lines WHERE budget_id = ?', [id]);

      for (const line of lines) {
        await runQuery(
          `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount)
           VALUES (?, ?, ?)`,
          [id, line.analytical_account_id, line.budgeted_amount]
        );
      }

      res.json({ message: 'Budget lines updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [id]);

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }

      if (budget.status !== 'draft') {
        return res.status(400).json({ error: 'Only draft budgets can be deleted' });
      }

      await runQuery('DELETE FROM budgets WHERE id = ?', [id]);

      res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async refreshActuals(req, res, next) {
    try {
      const { id } = req.params;

      await budgetService.updateBudgetActuals(id);

      const report = await budgetService.getBudgetReport(id);

      res.json({
        message: 'Budget actuals refreshed successfully',
        report
      });
    } catch (error) {
      next(error);
    }
  }

  async getReport(req, res, next) {
    try {
      const { id } = req.params;

      const report = await budgetService.getBudgetReport(id);

      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async createRevision(req, res, next) {
    try {
      const { id } = req.params;
      const { revision_reason, lines } = req.body;

      const newBudgetId = await budgetService.createBudgetRevision(
        id,
        revision_reason,
        lines,
        req.user.id
      );

      const newBudget = await getQuery('SELECT * FROM budgets WHERE id = ?', [newBudgetId]);

      res.status(201).json({
        message: 'Budget revision created successfully',
        budget: newBudget
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { id } = req.params;

      const history = await budgetService.getBudgetHistory(id);

      res.json({ history });
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetController();
