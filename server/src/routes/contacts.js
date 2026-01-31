import express from 'express';
import { body } from 'express-validator';
import contactController from '../controllers/contactController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadContactImage } from '../config/multer.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
  uploadContactImage.single('image'), // Handle image upload
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contact_type').isIn(['vendor', 'customer', 'both', 'individual']).withMessage('Invalid contact type'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  validate,
  contactController.create
);

router.get('/', contactController.getAll);

router.get('/:id', contactController.getById);

router.put('/:id',
  uploadContactImage.single('image'), // Handle image upload on update
  contactController.update
);

router.patch('/:id/archive', requireAdmin, contactController.archive);

router.patch('/:id/unarchive', requireAdmin, contactController.restore);

export default router;
