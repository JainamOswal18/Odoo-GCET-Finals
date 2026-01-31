import { runQuery, getQuery, allQuery } from '../config/database.js';
import { paginate } from '../utils/helpers.js';

class AnalyticalAccountController {
  async create(req, res, next) {
    try {
      const { code, name, parent_id, plan_name, description, account_type } = req.body;

      const result = await runQuery(
        `INSERT INTO analytical_accounts (code, name, parent_id, plan_name, description, account_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [code, name, parent_id || null, plan_name, description, account_type]
      );

      const account = await getQuery('SELECT * FROM analytical_accounts WHERE id = ?', [result.id]);

      res.status(201).json({ message: 'Analytical account created successfully', account });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { plan_name, account_type, active = '1', search } = req.query;

      let query = 'SELECT * FROM analytical_accounts WHERE active = ?';
      const params = [active === '1' ? 1 : 0];

      if (plan_name) {
        query += ' AND plan_name = ?';
        params.push(plan_name);
      }

      if (account_type) {
        query += ' AND account_type = ?';
        params.push(account_type);
      }

      if (search) {
        query += ' AND (code LIKE ? OR name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY plan_name, code ASC';

      const accounts = await allQuery(query, params);

      res.json({ accounts });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const account = await getQuery('SELECT * FROM analytical_accounts WHERE id = ?', [id]);

      if (!account) {
        return res.status(404).json({ error: 'Analytical account not found' });
      }

      res.json({ account });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const account = await getQuery('SELECT * FROM analytical_accounts WHERE id = ?', [id]);
      if (!account) {
        return res.status(404).json({ error: 'Analytical account not found' });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      const values = fields.map(field => updates[field]);
      values.push(id);

      const setClause = fields.map(field => `${field} = ?`).join(', ');

      await runQuery(
        `UPDATE analytical_accounts SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values
      );

      const updated = await getQuery('SELECT * FROM analytical_accounts WHERE id = ?', [id]);

      res.json({ message: 'Analytical account updated successfully', account: updated });
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const { id } = req.params;
      await runQuery('UPDATE analytical_accounts SET active = 0, updated_at = datetime(\'now\') WHERE id = ?', [id]);
      res.json({ message: 'Analytical account archived successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticalAccountController();
