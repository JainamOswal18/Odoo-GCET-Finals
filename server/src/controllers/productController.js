import { runQuery, getQuery, allQuery } from '../config/database.js';
import { paginate } from '../utils/helpers.js';

class ProductController {
  async create(req, res, next) {
    try {
      const {
        name, internal_reference, category, description, sale_price,
        cost_price, product_type, unit_of_measure, default_account_code
      } = req.body;

      const result = await runQuery(
        `INSERT INTO products (
          name, internal_reference, category, description, sale_price,
          cost_price, product_type, unit_of_measure, default_account_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, internal_reference, category, description, sale_price,
         cost_price, product_type || 'goods', unit_of_measure || 'pcs', default_account_code]
      );

      const product = await getQuery('SELECT * FROM products WHERE id = ?', [result.id]);

      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, category, search, active = '1' } = req.query;
      const { limit: lmt, offset } = paginate(page, limit);

      let query = 'SELECT * FROM products WHERE active = ?';
      const params = [active === '1' ? 1 : 0];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR internal_reference LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
      params.push(lmt, offset);

      const products = await allQuery(query, params);

      const countQuery = query.split('LIMIT')[0].replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await getQuery(countQuery, params.slice(0, -2));

      res.json({
        products,
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
      const product = await getQuery('SELECT * FROM products WHERE id = ?', [id]);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const product = await getQuery('SELECT * FROM products WHERE id = ?', [id]);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      const values = fields.map(field => updates[field]);
      values.push(id);

      const setClause = fields.map(field => `${field} = ?`).join(', ');

      await runQuery(
        `UPDATE products SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values
      );

      const updated = await getQuery('SELECT * FROM products WHERE id = ?', [id]);

      res.json({ message: 'Product updated successfully', product: updated });
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const { id } = req.params;
      await runQuery('UPDATE products SET active = 0, updated_at = datetime(\'now\') WHERE id = ?', [id]);
      res.json({ message: 'Product archived successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
