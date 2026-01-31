import express from 'express';
import { body } from 'express-validator';
import salesOrderController from '../controllers/salesOrderController.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    [
        body('customer_id').isInt().withMessage('Customer ID is required'),
        body('order_date').isDate().withMessage('Order date is required'),
        body('lines').isArray({ min: 1 }).withMessage('At least one line is required')
    ],
    validate,
    salesOrderController.create
);

router.get('/', salesOrderController.getAll);

router.get('/:id', salesOrderController.getById);

router.put('/:id', salesOrderController.update);

router.post('/:id/confirm', salesOrderController.confirm);

router.post('/:id/cancel', salesOrderController.cancel);

export default router;