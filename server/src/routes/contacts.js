import express from 'express';
import { body } from 'express-validator';
import contactController from '../controllers/contactController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contact_type').isIn(['vendor', 'customer', 'both']).withMessage('Invalid contact type'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  validate,
  contactController.create
);

router.get('/', contactController.getAll);

router.get('/:id', contactController.getById);

router.put('/:id', contactController.update);

router.delete('/:id/archive', requireAdmin, contactController.archive);

router.post('/:id/restore', requireAdmin, contactController.restore);

export default router;
