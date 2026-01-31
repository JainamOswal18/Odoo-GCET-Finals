import { allQuery, getQuery } from '../config/database.js';

class PortalController {
    async getInvoices(req, res, next) {
        try {
            const invoices = await allQuery(
                `SELECT id, invoice_number, invoice_date, due_date, total_amount, 
         amount_paid, amount_due, payment_status, status
         FROM invoices
         WHERE customer_id = ? AND status != 'draft'
         ORDER BY invoice_date DESC`,
                [req.portalUser.contact_id]
            );

            res.json({ invoices });
        } catch (error) {
            next(error);
        }
    }

    async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;

            const invoice = await getQuery(
                `SELECT i.*, c.name as customer_name
         FROM invoices i
         JOIN contacts c ON i.customer_id = c.id
         WHERE i.id = ? AND i.customer_id = ? AND i.status != 'draft'`,
                [id, req.portalUser.contact_id]
            );

            if (!invoice) {
                return res.status(404).json({ error: 'Invoice not found' });
            }

            const lines = await allQuery(
                `SELECT il.*, p.name as product_name
         FROM invoice_lines il
         JOIN products p ON il.product_id = p.id
         WHERE il.invoice_id = ?`,
                [id]
            );

            res.json({ invoice, lines });
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

            res.json({ payments });
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