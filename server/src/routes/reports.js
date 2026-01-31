import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Dashboard statistics
router.get('/dashboard', reportController.dashboardStats);

router.get('/budget-vs-actual', reportController.budgetVsActual);

router.get('/analytical-account', reportController.analyticalAccount);

router.get('/payment-status', reportController.paymentStatus);

router.get('/sales', reportController.sales);

router.get('/purchase', reportController.purchase);

export default router;