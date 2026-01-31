import { runQuery, getQuery, allQuery } from '../config/database.js';
import { paginate, sanitizeInput } from '../utils/helpers.js';

class ContactController {
  async create(req, res, next) {
    try {
      const {
        name, contact_type, email, phone, address, city, state, country,
        postal_code, tax_id, credit_limit, payment_terms, contact_person, notes, tags
      } = req.body;

      const is_vendor = ['vendor', 'both'].includes(contact_type);
      const is_customer = ['customer', 'both'].includes(contact_type);

      // Handle tags - convert array to JSON string
      const tagsJson = tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : null;

      // Handle uploaded image
      const imageUrl = req.file ? `/uploads/contacts/${req.file.filename}` : null;

      const result = await runQuery(
        `INSERT INTO contacts (
          name, contact_type, email, phone, address, city, state, country,
          postal_code, tax_id, is_vendor, is_customer, credit_limit,
          payment_terms, contact_person, notes, tags, image_url, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, contact_type, email, phone, address, city, state, country,
          postal_code, tax_id, is_vendor, is_customer, credit_limit,
          payment_terms, contact_person, notes, tagsJson, imageUrl, req.user.id
        ]
      );

      const contact = await getQuery('SELECT * FROM contacts WHERE id = ?', [result.id]);

      // Parse tags back to array
      if (contact && contact.tags) {
        try {
          contact.tags = JSON.parse(contact.tags);
        } catch (e) {
          contact.tags = [];
        }
      }

      res.status(201).json({
        message: 'Contact created successfully',
        contact
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, type, search, active = '1' } = req.query;
      const { limit: lmt, offset } = paginate(page, limit);

      let query = 'SELECT * FROM contacts WHERE active = ?';
      const params = [active === '1' ? 1 : 0];

      if (type === 'vendor') {
        query += ' AND is_vendor = 1';
      } else if (type === 'customer') {
        query += ' AND is_customer = 1';
      }

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
      params.push(lmt, offset);

      const contacts = await allQuery(query, params);

      // Parse tags for each contact
      contacts.forEach(contact => {
        if (contact.tags) {
          try {
            contact.tags = JSON.parse(contact.tags);
          } catch (e) {
            contact.tags = [];
          }
        }
      });

      const countQuery = query.split('LIMIT')[0].replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await getQuery(countQuery, params.slice(0, -2));

      res.json({
        contacts,
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

      const contact = await getQuery('SELECT * FROM contacts WHERE id = ?', [id]);

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Parse tags
      if (contact.tags) {
        try {
          contact.tags = JSON.parse(contact.tags);
        } catch (e) {
          contact.tags = [];
        }
      }

      res.json({ contact });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const contact = await getQuery('SELECT * FROM contacts WHERE id = ?', [id]);

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Handle tags conversion
      if (updates.tags) {
        updates.tags = JSON.stringify(Array.isArray(updates.tags) ? updates.tags : [updates.tags]);
      }

      // Handle uploaded image
      if (req.file) {
        updates.image_url = `/uploads/contacts/${req.file.filename}`;
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      const values = fields.map(field => updates[field]);
      values.push(id);

      const setClause = fields.map(field => `${field} = ?`).join(', ');

      await runQuery(
        `UPDATE contacts SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values
      );

      const updated = await getQuery('SELECT * FROM contacts WHERE id = ?', [id]);

      // Parse tags back to array
      if (updated && updated.tags) {
        try {
          updated.tags = JSON.parse(updated.tags);
        } catch (e) {
          updated.tags = [];
        }
      }

      res.json({
        message: 'Contact updated successfully',
        contact: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async archive(req, res, next) {
    try {
      const { id } = req.params;

      const contact = await getQuery('SELECT * FROM contacts WHERE id = ?', [id]);

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      await runQuery(
        'UPDATE contacts SET active = 0, updated_at = datetime(\'now\') WHERE id = ?',
        [id]
      );

      res.json({ message: 'Contact archived successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;

      await runQuery(
        'UPDATE contacts SET active = 1, updated_at = datetime(\'now\') WHERE id = ?',
        [id]
      );

      res.json({ message: 'Contact restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ContactController();
