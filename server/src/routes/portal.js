import express from 'express';
import portalController from '../controllers/portalController.js';
import { authenticatePortal } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticatePortal);

router.get('/dashboard', portalController.getDashboard);

router.get('/invoices', portalController.getInvoices);
router.get('/invoices/:id', portalController.getInvoiceById);

router.get('/bills', portalController.getBills);
router.get('/bills/:id', portalController.getBillById);

router.get('/sales-orders', portalController.getSalesOrders);
router.get('/sales-orders/:id', portalController.getSalesOrderById);

router.get('/purchase-orders', portalController.getPurchaseOrders);
router.get('/purchase-orders/:id', portalController.getPurchaseOrderById);

router.get('/payments', portalController.getPayments);

export default router;