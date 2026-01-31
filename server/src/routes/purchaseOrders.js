import express from 'express';
import { body } from 'express-validator';
import purchaseOrderController from '../controllers/purchaseOrderController.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    [
        body('vendor_id').isInt().withMessage('Vendor ID is required'),
        body('order_date').isDate().withMessage('Order date is required'),
        body('lines').isArray({ min: 1 }).withMessage('At least one line is required')
    ],
    validate,
    purchaseOrderController.create
);

router.get('/', purchaseOrderController.getAll);

router.get('/:id', purchaseOrderController.getById);

router.put('/:id', purchaseOrderController.update);

router.post('/:id/confirm', purchaseOrderController.confirm);

router.post('/:id/cancel', purchaseOrderController.cancel);

export default router;