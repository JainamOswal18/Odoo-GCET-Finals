import { runQuery, getQuery, allQuery } from '../config/database.js';
import { paginate } from '../utils/helpers.js';

class AutoAnalyticalModelController {
    async create(req, res, next) {
        try {
            const { 
                status = 'new',
                partnerTag, 
                productCategory, 
                partnerId, 
                productId, 
                analyticalAccountId 
            } = req.body;

            if (!analyticalAccountId) {
                return res.status(400).json({ error: 'Analytical account is required' });
            }

            const result = await runQuery(
                `INSERT INTO auto_analytical_models 
                (status, partner_tag, product_category, partner_id, product_id, analytical_account_id)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [status, partnerTag || null, productCategory || null, 
                 partnerId || null, productId || null, analyticalAccountId]
            );

            const model = await getQuery(
                `SELECT aam.*, 
                        aa.code as analytical_account_code, 
                        aa.name as analytical_account_name,
                        c.name as partner_name,
                        p.name as product_name
                 FROM auto_analytical_models aam
                 LEFT JOIN analytical_accounts aa ON aam.analytical_account_id = aa.id
                 LEFT JOIN contacts c ON aam.partner_id = c.id
                 LEFT JOIN products p ON aam.product_id = p.id
                 WHERE aam.id = ?`, 
                [result.id]
            );

            res.status(201).json({
                message: 'Auto analytical model created successfully',
                model
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 100, status, active = '1' } = req.query;
            const { limit: lmt, offset } = paginate(page, limit);

            let query = `SELECT aam.*, 
                                aa.code as analytical_account_code, 
                                aa.name as analytical_account_name,
                                c.name as partner_name,
                                p.name as product_name
                         FROM auto_analytical_models aam
                         LEFT JOIN analytical_accounts aa ON aam.analytical_account_id = aa.id
                         LEFT JOIN contacts c ON aam.partner_id = c.id
                         LEFT JOIN products p ON aam.product_id = p.id
                         WHERE aam.active = ?`;
            const params = [active === '1' ? 1 : 0];

            if (status) {
                query += ' AND aam.status = ?';
                params.push(status);
            }

            query += ' ORDER BY aam.created_at DESC LIMIT ? OFFSET ?';
            params.push(lmt, offset);

            const models = await allQuery(query, params);

            const countQuery = `SELECT COUNT(*) as total 
                               FROM auto_analytical_models aam 
                               WHERE aam.active = ?${status ? ' AND aam.status = ?' : ''}`;
            const countParams = status ? [active === '1' ? 1 : 0, status] : [active === '1' ? 1 : 0];
            const countResult = await getQuery(countQuery, countParams);

            res.json({
                models,
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

            const model = await getQuery(
                `SELECT aam.*, 
                        aa.code as analytical_account_code, 
                        aa.name as analytical_account_name,
                        c.name as partner_name,
                        p.name as product_name
                 FROM auto_analytical_models aam
                 LEFT JOIN analytical_accounts aa ON aam.analytical_account_id = aa.id
                 LEFT JOIN contacts c ON aam.partner_id = c.id
                 LEFT JOIN products p ON aam.product_id = p.id
                 WHERE aam.id = ?`, 
                [id]
            );

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            res.json({ model });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { 
                status,
                partnerTag, 
                productCategory, 
                partnerId, 
                productId, 
                analyticalAccountId,
                active 
            } = req.body;

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            await runQuery(
                `UPDATE auto_analytical_models 
                 SET status = ?, 
                     partner_tag = ?, 
                     product_category = ?, 
                     partner_id = ?, 
                     product_id = ?, 
                     analytical_account_id = ?,
                     active = ?,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [
                    status !== undefined ? status : model.status,
                    partnerTag !== undefined ? partnerTag : model.partner_tag,
                    productCategory !== undefined ? productCategory : model.product_category,
                    partnerId !== undefined ? partnerId : model.partner_id,
                    productId !== undefined ? productId : model.product_id,
                    analyticalAccountId !== undefined ? analyticalAccountId : model.analytical_account_id,
                    active !== undefined ? active : model.active,
                    id
                ]
            );

            const updated = await getQuery(
                `SELECT aam.*, 
                        aa.code as analytical_account_code, 
                        aa.name as analytical_account_name,
                        c.name as partner_name,
                        p.name as product_name
                 FROM auto_analytical_models aam
                 LEFT JOIN analytical_accounts aa ON aam.analytical_account_id = aa.id
                 LEFT JOIN contacts c ON aam.partner_id = c.id
                 LEFT JOIN products p ON aam.product_id = p.id
                 WHERE aam.id = ?`, 
                [id]
            );

            res.json({
                message: 'Auto analytical model updated successfully',
                model: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['new', 'confirm', 'archived'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            await runQuery(
                'UPDATE auto_analytical_models SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
                [status, id]
            );

            res.json({
                message: `Auto analytical model status updated to ${status}`,
                status
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            await runQuery('DELETE FROM auto_analytical_models WHERE id = ?', [id]);

            res.json({ message: 'Auto analytical model deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async toggleActive(req, res, next) {
        try {
            const { id } = req.params;

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            const newStatus = model.active ? 0 : 1;

            await runQuery(
                'UPDATE auto_analytical_models SET active = ?, updated_at = datetime(\'now\') WHERE id = ?',
                [newStatus, id]
            );

            res.json({
                message: `Auto analytical model ${newStatus ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AutoAnalyticalModelController();