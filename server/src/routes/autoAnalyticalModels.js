import express from 'express';
import { body } from 'express-validator';
import autoAnalyticalModelController from '../controllers/autoAnalyticalModelController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    requireAdmin,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('model_type').isIn(['purchase', 'sale', 'both']).withMessage('Valid model type is required'),
        body('conditions').isArray({ min: 1 }).withMessage('At least one condition is required')
    ],
    validate,
    autoAnalyticalModelController.create
);

router.get('/', autoAnalyticalModelController.getAll);

router.get('/:id', autoAnalyticalModelController.getById);

router.put('/:id', requireAdmin, autoAnalyticalModelController.update);

router.delete('/:id', requireAdmin, autoAnalyticalModelController.delete);

router.post('/:id/toggle', requireAdmin, autoAnalyticalModelController.toggleActive);

export default router;