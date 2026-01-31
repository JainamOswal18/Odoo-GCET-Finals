import express from 'express';
import { body } from 'express-validator';
import analyticalAccountController from '../controllers/analyticalAccountController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('name').trim().notEmpty().withMessage('Name is required')
  ],
  validate,
  analyticalAccountController.create
);

router.get('/', analyticalAccountController.getAll);

router.get('/:id', analyticalAccountController.getById);

router.put('/:id', analyticalAccountController.update);

router.patch('/:id/archive', requireAdmin, analyticalAccountController.archive);

export default router;
