import express from 'express';
import { body } from 'express-validator';
import invoiceController from '../controllers/invoiceController.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    [
        body('customer_id').isInt().withMessage('Customer ID is required'),
        body('invoice_date').isDate().withMessage('Invoice date is required'),
        body('lines').isArray({ min: 1 }).withMessage('At least one line is required')
    ],
    validate,
    invoiceController.create
);

router.get('/', invoiceController.getAll);

router.get('/:id', invoiceController.getById);

router.put('/:id', invoiceController.update);

router.post('/:id/post', invoiceController.post);

export default router;