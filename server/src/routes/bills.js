import express from 'express';
import { body } from 'express-validator';
import billController from '../controllers/billController.js';
import { validate } from '../middleware/validator.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
    [
        body('vendor_id').isInt().withMessage('Vendor ID is required'),
        body('bill_date').isDate().withMessage('Bill date is required'),
        body('lines').isArray({ min: 1 }).withMessage('At least one line is required')
    ],
    validate,
    billController.create
);

router.get('/', billController.getAll);

router.get('/:id', billController.getById);

router.put('/:id', billController.update);

router.post('/:id/post', billController.post);

router.delete('/:id', billController.delete);

export default router;