import express from 'express';

import authRoutes from './auth.js';
import contactRoutes from './contacts.js';
import productRoutes from './products.js';
import analyticalAccountRoutes from './analyticalAccounts.js';
import budgetRoutes from './budgets.js';
import autoAnalyticalModelRoutes from './autoAnalyticalModels.js';
import purchaseOrderRoutes from './purchaseOrders.js';
import salesOrderRoutes from './salesOrders.js';
import invoiceRoutes from './invoices.js';
import billRoutes from './bills.js';
import paymentRoutes from './payments.js';
import reportRoutes from './reports.js';
import portalRoutes from './portal.js';
import regionRoutes from './regions.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/contacts', contactRoutes);
router.use('/products', productRoutes);
router.use('/analytical-accounts', analyticalAccountRoutes);
router.use('/budgets', budgetRoutes);
router.use('/auto-analytical-models', autoAnalyticalModelRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/portal', portalRoutes);
router.use('/regions', regionRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;