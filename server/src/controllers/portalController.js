import { allQuery, getQuery } from '../config/database.js';

class PortalController {
    async getInvoices(req, res, next) {
        try {
            // Fetch invoices for the portal user
            const invoices = await allQuery(
                `SELECT 
                    i.id, 
                    i.invoice_number as invoiceNumber, 
                    i.invoice_date as invoiceDate, 
                    i.due_date as dueDate,
                    i.customer_id as customerId,
                    c.name as customerName,
                    i.total_amount as grandTotal,
                    i.subtotal,
                    i.tax_amount as taxTotal,
                    i.amount_paid as amountPaid,
                    i.amount_due as amountDue,
                    i.payment_status as paymentStatus,
                    i.status,
                    i.created_at as createdAt,
                    i.updated_at as updatedAt
                FROM invoices i
                JOIN contacts c ON i.customer_id = c.id
                WHERE i.customer_id = ? AND i.status != 'draft'
                ORDER BY i.invoice_date DESC`,
                [req.portalUser.contact_id]
            );

            // Fetch line items for all invoices
            for (const invoice of invoices) {
                const lineItems = await allQuery(
                    `SELECT 
                        il.id,
                        il.product_id as productId,
                        p.name as productName,
                        il.analytical_account_id as analyticalAccountId,
                        aa.name as analyticalAccountName,
                        il.quantity,
                        il.unit_price as unitPrice,
                        il.tax_rate as taxRate,
                        (il.subtotal * il.tax_rate / 100.0) as taxAmount,
                        il.subtotal,
                        (il.subtotal * (1 + il.tax_rate / 100.0)) as total
                    FROM invoice_lines il
                    JOIN products p ON il.product_id = p.id
                    LEFT JOIN analytical_accounts aa ON il.analytical_account_id = aa.id
                    WHERE il.invoice_id = ?`,
                    [invoice.id]
                );
                invoice.lineItems = lineItems;

                // Calculate paid amounts (split by payment method)
                const paymentAmounts = await getQuery(
                    `SELECT 
                        COALESCE(SUM(CASE WHEN pm.payment_method = 'cash' THEN pa.amount ELSE 0 END), 0) as paidViaCash,
                        COALESCE(SUM(CASE WHEN pm.payment_method IN ('bank_transfer', 'upi', 'razorpay') THEN pa.amount ELSE 0 END), 0) as paidViaBank
                    FROM payment_allocations pa
                    JOIN payments pm ON pa.payment_id = pm.id
                    WHERE pa.invoice_id = ?`,
                    [invoice.id]
                );

                invoice.paidViaCash = paymentAmounts?.paidViaCash || 0;
                invoice.paidViaBank = paymentAmounts?.paidViaBank || 0;
            }

            res.json({ success: true, data: invoices });
        } catch (error) {
            next(error);
        }
    }

    async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;

            const invoice = await getQuery(
                `SELECT 
                    i.id,
                    i.invoice_number as invoiceNumber,
                    i.invoice_date as invoiceDate,
                    i.due_date as dueDate,
                    i.customer_id as customerId,
                    c.name as customerName,
                    i.total_amount as grandTotal,
                    i.subtotal,
                    i.tax_amount as taxTotal,
                    i.amount_paid as amountPaid,
                    i.amount_due as amountDue,
                    i.payment_status as paymentStatus,
                    i.status,
                    i.created_at as createdAt,
                    i.updated_at as updatedAt
                FROM invoices i
                JOIN contacts c ON i.customer_id = c.id
                WHERE i.id = ? AND i.customer_id = ? AND i.status != 'draft'`,
                [id, req.portalUser.contact_id]
            );

            if (!invoice) {
                return res.status(404).json({ success: false, error: 'Invoice not found' });
            }

            const lineItems = await allQuery(
                `SELECT 
                    il.id,
                    il.product_id as productId,
                    p.name as productName,
                    il.analytical_account_id as analyticalAccountId,
                    aa.name as analyticalAccountName,
                    il.quantity,
                    il.unit_price as unitPrice,
                    il.tax_rate as taxRate,
                    (il.subtotal * il.tax_rate / 100.0) as taxAmount,
                    il.subtotal,
                    (il.subtotal * (1 + il.tax_rate / 100.0)) as total
                FROM invoice_lines il
                JOIN products p ON il.product_id = p.id
                LEFT JOIN analytical_accounts aa ON il.analytical_account_id = aa.id
                WHERE il.invoice_id = ?`,
                [id]
            );

            invoice.lineItems = lineItems;

            // Calculate paid amounts
            const paymentAmounts = await getQuery(
                `SELECT 
                    COALESCE(SUM(CASE WHEN pm.payment_method = 'cash' THEN pa.amount ELSE 0 END), 0) as paidViaCash,
                    COALESCE(SUM(CASE WHEN pm.payment_method IN ('bank_transfer', 'upi', 'razorpay') THEN pa.amount ELSE 0 END), 0) as paidViaBank
                FROM payment_allocations pa
                JOIN payments pm ON pa.payment_id = pm.id
                WHERE pa.invoice_id = ?`,
                [id]
            );

            invoice.paidViaCash = paymentAmounts?.paidViaCash || 0;
            invoice.paidViaBank = paymentAmounts?.paidViaBank || 0;

            res.json({ success: true, data: invoice });
        } catch (error) {
            next(error);
        }
    }

    async getBills(req, res, next) {
        try {
            const bills = await allQuery(
                `SELECT id, bill_number, bill_date, due_date, total_amount,
         amount_paid, amount_due, payment_status, status
         FROM bills
         WHERE vendor_id = ? AND status != 'draft'
         ORDER BY bill_date DESC`,
                [req.portalUser.contact_id]
            );

            res.json({ bills });
        } catch (error) {
            next(error);
        }
    }

    async getBillById(req, res, next) {
        try {
            const { id } = req.params;

            const bill = await getQuery(
                `SELECT b.*, c.name as vendor_name
         FROM bills b
         JOIN contacts c ON b.vendor_id = c.id
         WHERE b.id = ? AND b.vendor_id = ? AND b.status != 'draft'`,
                [id, req.portalUser.contact_id]
            );

            if (!bill) {
                return res.status(404).json({ error: 'Bill not found' });
            }

            const lines = await allQuery(
                `SELECT bl.*, p.name as product_name
         FROM bill_lines bl
         JOIN products p ON bl.product_id = p.id
         WHERE bl.bill_id = ?`,
                [id]
            );

            res.json({ bill, lines });
        } catch (error) {
            next(error);
        }
    }

    async getSalesOrders(req, res, next) {
        try {
            const orders = await allQuery(
                `SELECT id, so_number, order_date, delivery_date, total_amount, status
         FROM sales_orders
         WHERE customer_id = ? AND status != 'draft'
         ORDER BY order_date DESC`,
                [req.portalUser.contact_id]
            );

            res.json({ orders });
        } catch (error) {
            next(error);
        }
    }

    async getSalesOrderById(req, res, next) {
        try {
            const { id } = req.params;

            const order = await getQuery(
                `SELECT so.*, c.name as customer_name
         FROM sales_orders so
         JOIN contacts c ON so.customer_id = c.id
         WHERE so.id = ? AND so.customer_id = ? AND so.status != 'draft'`,
                [id, req.portalUser.contact_id]
            );

            if (!order) {
                return res.status(404).json({ error: 'Sales order not found' });
            }

            const lines = await allQuery(
                `SELECT sol.*, p.name as product_name
         FROM sales_order_lines sol
         JOIN products p ON sol.product_id = p.id
         WHERE sol.so_id = ?`,
                [id]
            );

            res.json({ order, lines });
        } catch (error) {
            next(error);
        }
    }

    async getPurchaseOrders(req, res, next) {
        try {
            const orders = await allQuery(
                `SELECT id, po_number, order_date, expected_date, total_amount, status
         FROM purchase_orders
         WHERE vendor_id = ? AND status != 'draft'
         ORDER BY order_date DESC`,
                [req.portalUser.contact_id]
            );

            res.json({ orders });
        } catch (error) {
            next(error);
        }
    }

    async getPurchaseOrderById(req, res, next) {
        try {
            const { id } = req.params;

            const order = await getQuery(
                `SELECT po.*, c.name as vendor_name
         FROM purchase_orders po
         JOIN contacts c ON po.vendor_id = c.id
         WHERE po.id = ? AND po.vendor_id = ? AND po.status != 'draft'`,
                [id, req.portalUser.contact_id]
            );

            if (!order) {
                return res.status(404).json({ error: 'Purchase order not found' });
            }

            const lines = await allQuery(
                `SELECT pol.*, p.name as product_name
         FROM purchase_order_lines pol
         JOIN products p ON pol.product_id = p.id
         WHERE pol.po_id = ?`,
                [id]
            );

            res.json({ order, lines });
        } catch (error) {
            next(error);
        }
    }

    async getOrders(req, res, next) {
        try {
            // Fetch sales orders (where user is customer)
            const salesOrders = await allQuery(
                `SELECT 
                    so.id,
                    so.so_number as orderNumber,
                    so.order_date as orderDate,
                    'sales' as type,
                    so.customer_id as partnerId,
                    c.name as partnerName,
                    so.total_amount as total,
                    so.status,
                    so.created_at as createdAt,
                    so.updated_at as updatedAt
                FROM sales_orders so
                JOIN contacts c ON so.customer_id = c.id
                WHERE so.customer_id = ? AND so.status != 'draft'`,
                [req.portalUser.contact_id]
            );

            // Fetch purchase orders (where user is vendor)
            const purchaseOrders = await allQuery(
                `SELECT 
                    po.id,
                    po.po_number as orderNumber,
                    po.order_date as orderDate,
                    'purchase' as type,
                    po.vendor_id as partnerId,
                    c.name as partnerName,
                    po.total_amount as total,
                    po.status,
                    po.created_at as createdAt,
                    po.updated_at as updatedAt
                FROM purchase_orders po
                JOIN contacts c ON po.vendor_id = c.id
                WHERE po.vendor_id = ? AND po.status != 'draft'`,
                [req.portalUser.contact_id]
            );

            // Combine both order types
            const allOrders = [...salesOrders, ...purchaseOrders];

            // Sort by order date (newest first)
            allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

            // Fetch line items for each order
            for (const order of allOrders) {
                let lineItems;
                if (order.type === 'sales') {
                    lineItems = await allQuery(
                        `SELECT 
                            sol.id,
                            sol.product_id as productId,
                            p.name as productName,
                            sol.quantity,
                            sol.unit_price as unitPrice,
                            sol.subtotal as total
                        FROM sales_order_lines sol
                        JOIN products p ON sol.product_id = p.id
                        WHERE sol.so_id = ?`,
                        [order.id]
                    );
                } else {
                    lineItems = await allQuery(
                        `SELECT 
                            pol.id,
                            pol.product_id as productId,
                            p.name as productName,
                            pol.quantity,
                            pol.unit_price as unitPrice,
                            pol.subtotal as total
                        FROM purchase_order_lines pol
                        JOIN products p ON pol.product_id = p.id
                        WHERE pol.po_id = ?`,
                        [order.id]
                    );
                }
                order.lineItems = lineItems;
            }

            res.json({ success: true, data: allOrders });
        } catch (error) {
            next(error);
        }
    }

    async getPayments(req, res, next) {
        try {
            const payments = await allQuery(
                `SELECT p.*, pa.invoice_id, pa.bill_id, pa.amount as allocated_amount,
         i.invoice_number, b.bill_number
         FROM payments p
         LEFT JOIN payment_allocations pa ON p.id = pa.payment_id
         LEFT JOIN invoices i ON pa.invoice_id = i.id
         LEFT JOIN bills b ON pa.bill_id = b.id
         WHERE p.contact_id = ?
         ORDER BY p.payment_date DESC`,
                [req.portalUser.contact_id]
            );

            res.json({ success: true, data: payments });
        } catch (error) {
            next(error);
        }
    }

    async getDashboard(req, res, next) {
        try {
            const stats = {};

            // Invoice stats
            const invoiceStats = await getQuery(
                `SELECT 
          COUNT(*) as total_invoices,
          SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
          SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END) as unpaid_amount,
          SUM(total_amount) as total_amount
         FROM invoices
         WHERE customer_id = ? AND status != 'draft'`,
                [req.portalUser.contact_id]
            );

            // Bill stats
            const billStats = await getQuery(
                `SELECT 
          COUNT(*) as total_bills,
          SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
          SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END) as unpaid_amount,
          SUM(total_amount) as total_amount
         FROM bills
         WHERE vendor_id = ? AND status != 'draft'`,
                [req.portalUser.contact_id]
            );

            // Recent invoices
            const recentInvoices = await allQuery(
                `SELECT id, invoice_number, invoice_date, total_amount, payment_status
         FROM invoices
         WHERE customer_id = ? AND status != 'draft'
         ORDER BY invoice_date DESC
         LIMIT 5`,
                [req.portalUser.contact_id]
            );

            // Recent bills
            const recentBills = await allQuery(
                `SELECT id, bill_number, bill_date, total_amount, payment_status
         FROM bills
         WHERE vendor_id = ? AND status != 'draft'
         ORDER BY bill_date DESC
         LIMIT 5`,
                [req.portalUser.contact_id]
            );

            res.json({
                invoiceStats,
                billStats,
                recentInvoices,
                recentBills
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PortalController();