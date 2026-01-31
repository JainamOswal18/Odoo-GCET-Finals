import { runQuery, getQuery, allQuery } from '../config/database.js';
import { paginate } from '../utils/helpers.js';

class AutoAnalyticalModelController {
    async create(req, res, next) {
        try {
            const { name, model_type, priority, conditions } = req.body;

            const result = await runQuery(
                `INSERT INTO auto_analytical_models (name, model_type, priority)
         VALUES (?, ?, ?)`,
                [name, model_type, priority || 10]
            );

            const modelId = result.id;

            if (conditions && conditions.length > 0) {
                for (const condition of conditions) {
                    await runQuery(
                        `INSERT INTO auto_analytical_conditions (model_id, condition_type, field_name,
             operator, value, analytical_account_id, percentage)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [modelId, condition.condition_type, condition.field_name,
                            condition.operator, condition.value, condition.analytical_account_id,
                            condition.percentage || 100]
                    );
                }
            }

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [modelId]);

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
            const { page = 1, limit = 10, model_type, active = '1' } = req.query;
            const { limit: lmt, offset } = paginate(page, limit);

            let query = 'SELECT * FROM auto_analytical_models WHERE active = ?';
            const params = [active === '1' ? 1 : 0];

            if (model_type) {
                query += ' AND model_type = ?';
                params.push(model_type);
            }

            query += ' ORDER BY priority ASC, name ASC LIMIT ? OFFSET ?';
            params.push(lmt, offset);

            const models = await allQuery(query, params);

            const countQuery = query.split('LIMIT')[0].replace('SELECT *', 'SELECT COUNT(*) as total');
            const countResult = await getQuery(countQuery, params.slice(0, -2));

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

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            const conditions = await allQuery(
                `SELECT aac.*, aa.code, aa.name as account_name
         FROM auto_analytical_conditions aac
         JOIN analytical_accounts aa ON aac.analytical_account_id = aa.id
         WHERE aac.model_id = ?`,
                [id]
            );

            res.json({ model, conditions });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { name, model_type, priority, active, conditions } = req.body;

            const model = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            if (!model) {
                return res.status(404).json({ error: 'Auto analytical model not found' });
            }

            await runQuery(
                `UPDATE auto_analytical_models 
         SET name = ?, model_type = ?, priority = ?, active = ?, updated_at = datetime('now')
         WHERE id = ?`,
                [name || model.name, model_type || model.model_type,
                priority !== undefined ? priority : model.priority,
                active !== undefined ? active : model.active, id]
            );

            if (conditions) {
                await runQuery('DELETE FROM auto_analytical_conditions WHERE model_id = ?', [id]);

                for (const condition of conditions) {
                    await runQuery(
                        `INSERT INTO auto_analytical_conditions (model_id, condition_type, field_name,
             operator, value, analytical_account_id, percentage)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [id, condition.condition_type, condition.field_name,
                            condition.operator, condition.value, condition.analytical_account_id,
                            condition.percentage || 100]
                    );
                }
            }

            const updated = await getQuery('SELECT * FROM auto_analytical_models WHERE id = ?', [id]);

            res.json({
                message: 'Auto analytical model updated successfully',
                model: updated
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