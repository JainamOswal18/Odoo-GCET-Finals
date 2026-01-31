import express from 'express';
import { body } from 'express-validator';
import productController from '../controllers/productController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('sale_price').isFloat({ min: 0 }).withMessage('Sale price must be positive')
  ],
  validate,
  productController.create
);

router.get('/', productController.getAll);

router.get('/:id', productController.getById);

router.put('/:id', productController.update);

router.patch('/:id/archive', requireAdmin, productController.archive);

export default router;
