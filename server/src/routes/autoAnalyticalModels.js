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
        body('analyticalAccountId').trim().notEmpty().withMessage('Analytical account is required')
    ],
    validate,
    autoAnalyticalModelController.create
);

router.get('/', autoAnalyticalModelController.getAll);

router.get('/:id', autoAnalyticalModelController.getById);

router.put('/:id', requireAdmin, autoAnalyticalModelController.update);

router.patch('/:id/status', requireAdmin, autoAnalyticalModelController.updateStatus);

router.delete('/:id', requireAdmin, autoAnalyticalModelController.delete);

router.post('/:id/toggle', requireAdmin, autoAnalyticalModelController.toggleActive);

export default router;