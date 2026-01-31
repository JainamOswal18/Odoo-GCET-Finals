import express from 'express';
import { body } from 'express-validator';
import budgetController from '../controllers/budgetController.js';
import { validate } from '../middleware/validator.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('period_start').isDate().withMessage('Valid start date is required'),
    body('period_end').isDate().withMessage('Valid end date is required'),
    body('lines').isArray({ min: 1 }).withMessage('At least one budget line is required')
  ],
  validate,
  budgetController.create
);

router.get('/', budgetController.getAll);

router.get('/:id', budgetController.getById);

router.put('/:id', budgetController.update);

router.put('/:id/lines', budgetController.updateLines);

router.patch('/:id/archive', requireAdmin, budgetController.archive);

router.delete('/:id', budgetController.delete);

router.post('/:id/refresh-actuals', budgetController.refreshActuals);

router.get('/:id/report', budgetController.getReport);

router.post('/:id/revisions',
  [
    body('revision_reason').trim().notEmpty().withMessage('Revision reason is required'),
    body('lines').isArray({ min: 1 }).withMessage('At least one budget line is required')
  ],
  validate,
  budgetController.createRevision
);

router.get('/:id/history', budgetController.getHistory);

export default router;
