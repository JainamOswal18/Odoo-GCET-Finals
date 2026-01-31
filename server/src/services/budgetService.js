import { runQuery, getQuery, allQuery } from '../config/database.js';
import { calculateBudgetMetrics, calculateTheoreticalAmount } from '../utils/helpers.js';

class BudgetService {
  async updateBudgetActuals(budgetId) {
    try {
      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [budgetId]);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      const budgetLines = await allQuery(
        'SELECT * FROM budget_lines WHERE budget_id = ?',
        [budgetId]
      );

      for (const line of budgetLines) {
        const actualAmount = await this.calculateActualAmount(
          line.analytical_account_id,
          budget.period_start,
          budget.period_end
        );

        const theoreticalAmount = calculateTheoreticalAmount(
          line.budgeted_amount,
          budget.period_start,
          budget.period_end
        );

        const metrics = calculateBudgetMetrics(
          line.budgeted_amount,
          actualAmount,
          theoreticalAmount
        );

        await runQuery(
          `UPDATE budget_lines 
           SET actual_amount = ?, 
               theoretical_amount = ?,
               achievement_percentage = ?,
               remaining_balance = ?,
               variance = ?,
               last_updated = datetime('now')
           WHERE id = ?`,
          [
            actualAmount,
            theoreticalAmount,
            metrics.achievementPercentage,
            metrics.remainingBalance,
            metrics.variance,
            line.id
          ]
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating budget actuals:', error);
      throw error;
    }
  }

  async calculateActualAmount(analyticalAccountId, periodStart, periodEnd) {
    try {
      const result = await getQuery(
        `SELECT 
          COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) as actual
         FROM journal_entry_lines jel
         JOIN journal_entries je ON jel.journal_entry_id = je.id
         WHERE jel.analytical_account_id = ?
           AND je.posted = 1
           AND je.entry_date BETWEEN ? AND ?`,
        [analyticalAccountId, periodStart, periodEnd]
      );

      return parseFloat(result?.actual || 0);
    } catch (error) {
      console.error('Error calculating actual amount:', error);
      return 0;
    }
  }

  async getBudgetReport(budgetId) {
    try {
      const budget = await getQuery(
        `SELECT b.*, u.login_id as created_by_name
         FROM budgets b
         LEFT JOIN users u ON b.created_by = u.id
         WHERE b.id = ?`,
        [budgetId]
      );

      if (!budget) {
        throw new Error('Budget not found');
      }

      const lines = await allQuery(
        `SELECT bl.*, aa.code, aa.name as account_name, aa.plan_name
         FROM budget_lines bl
         JOIN analytical_accounts aa ON bl.analytical_account_id = aa.id
         WHERE bl.budget_id = ?
         ORDER BY aa.plan_name, aa.code`,
        [budgetId]
      );

      const totals = {
        budgeted: 0,
        actual: 0,
        theoretical: 0,
        remaining: 0
      };

      lines.forEach(line => {
        totals.budgeted += parseFloat(line.budgeted_amount);
        totals.actual += parseFloat(line.actual_amount);
        totals.theoretical += parseFloat(line.theoretical_amount);
        totals.remaining += parseFloat(line.remaining_balance);
      });

      const overallMetrics = calculateBudgetMetrics(
        totals.budgeted,
        totals.actual,
        totals.theoretical
      );

      return {
        budget,
        lines,
        totals,
        overallMetrics
      };
    } catch (error) {
      console.error('Error generating budget report:', error);
      throw error;
    }
  }

  async createBudgetRevision(budgetId, revisionReason, newLines, userId) {
    try {
      const originalBudget = await getQuery('SELECT * FROM budgets WHERE id = ?', [budgetId]);
      
      if (!originalBudget) {
        throw new Error('Original budget not found');
      }

      const revisionNumber = await this.getNextRevisionNumber(
        originalBudget.original_budget_id || budgetId
      );

      const result = await runQuery(
        `INSERT INTO budgets (name, period_start, period_end, status, is_revision, 
         original_budget_id, revision_number, revision_reason, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${originalBudget.name} - Rev ${revisionNumber}`,
          originalBudget.period_start,
          originalBudget.period_end,
          'draft',
          1,
          originalBudget.original_budget_id || budgetId,
          revisionNumber,
          revisionReason,
          userId
        ]
      );

      const newBudgetId = result.id;

      for (const line of newLines) {
        await runQuery(
          `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount)
           VALUES (?, ?, ?)`,
          [newBudgetId, line.analytical_account_id, line.budgeted_amount]
        );
      }

      return newBudgetId;
    } catch (error) {
      console.error('Error creating budget revision:', error);
      throw error;
    }
  }

  async getNextRevisionNumber(originalBudgetId) {
    const result = await getQuery(
      `SELECT MAX(revision_number) as max_revision 
       FROM budgets 
       WHERE original_budget_id = ? OR id = ?`,
      [originalBudgetId, originalBudgetId]
    );

    return (result?.max_revision || 0) + 1;
  }

  async getBudgetHistory(budgetId) {
    try {
      const budget = await getQuery('SELECT * FROM budgets WHERE id = ?', [budgetId]);
      
      if (!budget) {
        throw new Error('Budget not found');
      }

      const originalId = budget.original_budget_id || budgetId;

      const history = await allQuery(
        `SELECT b.*, u.login_id as created_by_name
         FROM budgets b
         LEFT JOIN users u ON b.created_by = u.id
         WHERE b.id = ? OR b.original_budget_id = ?
         ORDER BY b.revision_number ASC`,
        [originalId, originalId]
      );

      return history;
    } catch (error) {
      console.error('Error fetching budget history:', error);
      throw error;
    }
  }
}

export default new BudgetService();
