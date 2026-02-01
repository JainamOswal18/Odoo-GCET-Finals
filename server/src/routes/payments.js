import express from 'express';
import { body } from 'express-validator';
import paymentController from '../controllers/paymentController.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    [
        body('payment_type').isIn(['inbound', 'outbound']).withMessage('Valid payment type is required'),
        body('contact_id').isInt().withMessage('Contact ID is required'),
        body('payment_date').isDate().withMessage('Payment date is required'),
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    ],
    validate,
    paymentController.create
);

router.get('/', paymentController.getAll);

router.get('/:id', paymentController.getById);

router.put('/:id', paymentController.update);

export default router;