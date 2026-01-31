import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { runQuery, closeDatabase, initializeDatabase } from '../src/config/database.js';

async function seed() {
    try {
        console.log('Starting database seeding...');

        // Initialize database schema first
        await initializeDatabase();
        console.log('✓ Database schema initialized');

        // Disable Foreign Keys for the entire seeding process to allow circular references or out-of-order inserts
        await runQuery('PRAGMA foreign_keys = OFF');

        // Clear existing data
        await runQuery('DELETE FROM payment_allocations');
        await runQuery('DELETE FROM payments');
        await runQuery('DELETE FROM invoice_lines');
        await runQuery('DELETE FROM invoices');
        await runQuery('DELETE FROM sales_order_lines');
        await runQuery('DELETE FROM sales_orders');
        await runQuery('DELETE FROM bill_lines');
        await runQuery('DELETE FROM bills');
        await runQuery('DELETE FROM purchase_order_lines');
        await runQuery('DELETE FROM purchase_orders');
        await runQuery('DELETE FROM auto_analytical_conditions');
        await runQuery('DELETE FROM auto_analytical_models');
        await runQuery('DELETE FROM budget_lines');
        await runQuery('DELETE FROM budgets');
        await runQuery('DELETE FROM analytical_accounts');
        await runQuery('DELETE FROM products');
        await runQuery('DELETE FROM users');
        await runQuery('DELETE FROM contacts');

        // Reset Auto Increment counters (Optional but cleaner)
        await runQuery("DELETE FROM sqlite_sequence");

        console.log('✓ Existing data cleared');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create Admin Users
        await runQuery(
            `INSERT INTO users (login_id, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
            ['admin123', 'admin@shivfurniture.com', hashedPassword, 'System Admin', 'admin']
        );
        console.log('✓ Admin user created');

        // Create Additional Test Users
        const userPassword = await bcrypt.hash('User@123', 10);
        await runQuery(
            `INSERT INTO users (login_id, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
            ['manager01', 'manager@shivfurniture.com', userPassword, 'Sales Manager', 'admin']
        );
        console.log('✓ Additional admin user created');

        // Create Contacts first (needed for portal users)
        await runQuery(
            `INSERT INTO contacts (name, contact_type, email, phone, is_vendor, is_customer, created_by)
       VALUES 
       ('ABC Suppliers', 'vendor', 'abc@supplier.com', '9876543210', 1, 0, 1),
       ('XYZ Customer', 'customer', 'xyz@customer.com', '9123456789', 0, 1, 1),
       ('General Trading Co', 'both', 'general@trading.com', '9111222333', 1, 1, 1),
       ('Premium Retail Ltd', 'customer', 'contact@premiumretail.com', '9876509876', 0, 1, 1),
       ('Quality Suppliers', 'vendor', 'info@qualitysuppliers.com', '9123450987', 1, 0, 1)`
        );
        console.log('✓ Sample contacts created');

        // Create Portal Users (linked to contacts) - using DIFFERENT emails to avoid constraint
        const portalPassword = await bcrypt.hash('Portal@123', 10);

        await runQuery(
            `INSERT INTO users (login_id, email, password_hash, full_name, role, contact_id)
       VALUES 
       ('customer01', 'customer01@portal.com', ?, 'XYZ Customer', 'portal', 2),
       ('premium01', 'premium01@portal.com', ?, 'Premium Retail Ltd', 'portal', 4)`,
            [portalPassword, portalPassword]
        );
        console.log('✓ Portal users created');

        await runQuery(
            `INSERT INTO products (name, internal_reference, category, sale_price, cost_price, product_type)
       VALUES 
       ('Teak Wood Chair', 'TWC-001', 'Furniture', 5000.00, 3500.00, 'goods'),
       ('Office Desk', 'OD-001', 'Furniture', 12000.00, 8000.00, 'goods'),
       ('Pine Wood Plank', 'PWP-001', 'Wood', 500.00, 350.00, 'goods'),
       ('Assembly Service', 'AS-001', 'Service', 1000.00, 600.00, 'service')`
        );
        console.log('✓ Sample products created');

        await runQuery(
            `INSERT INTO analytical_accounts (code, name, plan_name, account_type, is_budgetable)
       VALUES 
       ('PROJ-001', 'Furniture Expo 2026', 'Projects', 'project', 1),
       ('DEPT-PROD', 'Production', 'Departments', 'department', 1),
       ('DEPT-MKT', 'Marketing', 'Departments', 'department', 1),
       ('PROJ-002', 'R&D New Chair', 'Projects', 'project', 1)`
        );
        console.log('✓ Sample analytical accounts created');

        await runQuery(
            `INSERT INTO budgets (name, period_start, period_end, status, created_by)
       VALUES ('Q1 2026 Budget', '2026-01-01', '2026-03-31', 'active', 1)`
        );
        console.log('✓ Sample budget created');

        await runQuery(
            `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount, actual_amount, theoretical_amount, achievement_percentage, remaining_balance, variance)
       VALUES 
       (1, 1, 500000.00, 125000.00, 166666.67, 25.00, 375000.00, -41666.67),
       (1, 2, 300000.00, 95000.00, 100000.00, 31.67, 205000.00, -5000.00),
       (1, 3, 150000.00, 45000.00, 50000.00, 30.00, 105000.00, -5000.00),
       (1, 4, 200000.00, 80000.00, 66666.67, 40.00, 120000.00, 13333.33)`
        );
        console.log('✓ Sample budget lines created with actual spending');

        await runQuery(
            `INSERT INTO auto_analytical_models (name, model_type, priority, active)
       VALUES 
       ('Wood Products to Production', 'purchase', 10, 1),
       ('Marketing Products', 'sale', 10, 1)`
        );
        console.log('✓ Sample auto analytical models created');

        await runQuery(
            `INSERT INTO auto_analytical_conditions (model_id, condition_type, field_name, operator, value, analytical_account_id, percentage)
       VALUES 
       (1, 'product_category', 'line.category', 'equals', 'Wood', 2, 100),
       (2, 'product_category', 'line.category', 'contains', 'marketing', 3, 100)`
        );
        console.log('✓ Sample auto analytical conditions created');

        // Create Purchase Orders
        await runQuery(
            `INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, status, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES 
       ('PO-2026-001', 1, '2026-01-15', '2026-01-25', 'confirmed', 45000.00, 8100.00, 53100.00, 'Wood materials for production', 1),
       ('PO-2026-002', 5, '2026-01-20', '2026-02-05', 'confirmed', 28000.00, 5040.00, 33040.00, 'Quality supplies order', 1),
       ('PO-2026-003', 1, '2026-01-25', '2026-02-10', 'draft', 15000.00, 2700.00, 17700.00, 'Additional materials', 1)`
        );
        console.log('✓ Purchase orders created');

        // Create Purchase Order Lines
        await runQuery(
            `INSERT INTO purchase_order_lines (po_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 3, 'Pine wood planks for furniture', 90, 500.00, 18.00, 45000.00, 2),
       (2, 2, 'Office desks', 2, 12000.00, 18.00, 24000.00, 1),
       (2, 4, 'Assembly service', 4, 1000.00, 18.00, 4000.00, 1),
       (3, 3, 'Additional pine wood', 30, 500.00, 18.00, 15000.00, 2)`
        );
        console.log('✓ Purchase order lines created');

        // Create Vendor Bills
        await runQuery(
            `INSERT INTO bills (bill_number, vendor_id, po_id, bill_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by)
       VALUES 
       ('BILL-2026-001', 1, 1, '2026-01-25', '2026-02-24', 'posted', 'partial', 45000.00, 8100.00, 53100.00, 25000.00, 28100.00, 'Partial payment made', 1, '2026-01-25 10:30:00', 1),
       ('BILL-2026-002', 5, 2, '2026-01-28', '2026-02-27', 'posted', 'unpaid', 28000.00, 5040.00, 33040.00, 0.00, 33040.00, 'Pending payment', 1, '2026-01-28 14:20:00', 1),
       ('BILL-2026-003', 1, NULL, '2026-01-29', '2026-02-28', 'draft', 'unpaid', 12000.00, 2160.00, 14160.00, 0.00, 14160.00, 'Direct bill - pending approval', 0, NULL, 1)`
        );
        console.log('✓ Vendor bills created');

        // Create Bill Lines
        await runQuery(
            `INSERT INTO bill_lines (bill_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 3, 'Pine wood planks as per PO', 90, 500.00, 18.00, 45000.00, 2),
       (2, 2, 'Office desks as ordered', 2, 12000.00, 18.00, 24000.00, 1),
       (2, 4, 'Assembly service', 4, 1000.00, 18.00, 4000.00, 1),
       (3, 1, 'Teak wood chairs', 2, 5000.00, 18.00, 10000.00, 2),
       (3, 4, 'Setup service', 2, 1000.00, 18.00, 2000.00, 1)`
        );
        console.log('✓ Bill lines created');

        // Create Sales Orders
        await runQuery(
            `INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES 
       ('SO-2026-001', 2, '2026-01-18', '2026-02-05', 'confirmed', 60000.00, 10800.00, 70800.00, 'Office furniture order from XYZ Customer', 1),
       ('SO-2026-002', 4, '2026-01-22', '2026-02-10', 'confirmed', 45000.00, 8100.00, 53100.00, 'Premium retail order', 1),
       ('SO-2026-003', 3, '2026-01-26', '2026-02-15', 'draft', 30000.00, 5400.00, 35400.00, 'General Trading order - pending confirmation', 1)`
        );
        console.log('✓ Sales orders created');

        // Create Sales Order Lines
        await runQuery(
            `INSERT INTO sales_order_lines (so_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Teak wood chairs', 10, 5000.00, 18.00, 50000.00, 1),
       (1, 4, 'Delivery and setup', 10, 1000.00, 18.00, 10000.00, 1),
       (2, 2, 'Office desks premium', 3, 12000.00, 18.00, 36000.00, 1),
       (2, 1, 'Teak chairs', 2, 5000.00, 18.00, 10000.00, 1),
       (3, 2, 'Office desks', 2, 12000.00, 18.00, 24000.00, 1),
       (3, 1, 'Teak chairs', 1, 5000.00, 18.00, 5000.00, 1),
       (3, 4, 'Assembly', 1, 1000.00, 18.00, 1000.00, 1)`
        );
        console.log('✓ Sales order lines created');

        // Create Customer Invoices
        await runQuery(
            `INSERT INTO invoices (invoice_number, customer_id, so_id, invoice_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by)
       VALUES 
       ('INV-2026-001', 2, 1, '2026-01-20', '2026-02-19', 'posted', 'partial', 60000.00, 10800.00, 70800.00, 30000.00, 40800.00, 'Partial payment received', 1, '2026-01-20 11:15:00', 1),
       ('INV-2026-002', 4, 2, '2026-01-25', '2026-02-24', 'posted', 'unpaid', 45000.00, 8100.00, 53100.00, 0.00, 53100.00, 'Pending payment from Premium Retail', 1, '2026-01-25 15:30:00', 1),
       ('INV-2026-003', 3, NULL, '2026-01-28', '2026-02-27', 'posted', 'unpaid', 25000.00, 4500.00, 29500.00, 0.00, 29500.00, 'Direct invoice', 1, '2026-01-28 09:45:00', 1),
       ('INV-2026-004', 2, NULL, '2026-01-29', '2026-02-28', 'draft', 'unpaid', 15000.00, 2700.00, 17700.00, 0.00, 17700.00, 'Pending approval', 0, NULL, 1),
       -- New Invoices for Premium Retail Ltd (ID: 4)
       ('INV-2026-005', 4, NULL, '2026-02-01', '2026-03-02', 'posted', 'unpaid', 25000.00, 4500.00, 29500.00, 0.00, 29500.00, 'Bulk Order - Chairs', 1, '2026-02-01 09:00:00', 1),
       ('INV-2026-006', 4, NULL, '2026-02-02', '2026-03-03', 'posted', 'paid', 10000.00, 1800.00, 11800.00, 11800.00, 0.00, 'Express Delivery Service', 1, '2026-02-02 10:30:00', 1),
       ('INV-2026-007', 4, NULL, '2026-02-05', '2026-03-06', 'posted', 'unpaid', 75000.00, 13500.00, 88500.00, 0.00, 88500.00, 'Office Renovation Project', 1, '2026-02-05 14:15:00', 1),
       ('INV-2026-008', 4, NULL, '2026-02-08', '2026-03-09', 'draft', 'unpaid', 5000.00, 900.00, 5900.00, 0.00, 5900.00, 'Draft Invoice - Consultation', 0, NULL, 1),
       ('INV-2026-009', 4, NULL, '2026-02-10', '2026-03-11', 'posted', 'partial', 100000.00, 18000.00, 118000.00, 50000.00, 68000.00, 'Large Bulk Order', 1, '2026-02-10 11:00:00', 1)`
        );
        console.log('✓ Customer invoices created');

        // Create Invoice Lines
        await runQuery(
            `INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Teak wood chairs', 10, 5000.00, 18.00, 50000.00, 1),
       (1, 4, 'Delivery and setup service', 10, 1000.00, 18.00, 10000.00, 1),
       (2, 2, 'Office desks premium quality', 3, 12000.00, 18.00, 36000.00, 1),
       (2, 1, 'Teak chairs', 2, 5000.00, 18.00, 10000.00, 1),
       (3, 1, 'Teak wood chairs', 5, 5000.00, 18.00, 25000.00, 1),
       (4, 2, 'Office desk', 1, 12000.00, 18.00, 12000.00, 1),
       (4, 1, 'Teak chair', 1, 5000.00, 18.00, 5000.00, 1),
       
       -- Lines for INV-2026-005
       (5, 1, 'Teak Wood Chair (Bulk)', 5, 5000.00, 18.00, 25000.00, 1),

       -- Lines for INV-2026-006
       (6, 4, 'Express Delivery', 10, 1000.00, 18.00, 10000.00, 1),

       -- Lines for INV-2026-007
       (7, 2, 'Office Desk (Large)', 5, 12000.00, 18.00, 60000.00, 1),
       (7, 4, 'Installation Service', 15, 1000.00, 18.00, 15000.00, 1),

       -- Lines for INV-2026-008
       (8, 4, 'Consultation Fee', 5, 1000.00, 18.00, 5000.00, 1),

       -- Lines for INV-2026-009
       (9, 2, 'Executive Office Desk', 8, 12500.00, 18.00, 100000.00, 1)`
        );
        console.log('✓ Invoice lines created');

        // Create Payments
        await runQuery(
            `INSERT INTO payments (payment_number, payment_type, contact_id, payment_date, amount, payment_method, reference, notes, status, created_by)
       VALUES 
       ('PAY-IN-001', 'inbound', 2, '2026-01-22', 30000.00, 'bank_transfer', 'NEFT-123456', 'Partial payment for INV-2026-001', 'posted', 1),
       ('PAY-OUT-001', 'outbound', 1, '2026-01-26', 25000.00, 'bank_transfer', 'RTGS-789012', 'Partial payment for BILL-2026-001', 'posted', 1),
       ('PAY-IN-002', 'inbound', 4, '2026-01-27', 20000.00, 'cheque', 'CHQ-456789', 'Advance from Premium Retail', 'posted', 1)`
        );
        console.log('✓ Payments created');

        // Create Payment Allocations
        await runQuery(
            `INSERT INTO payment_allocations (payment_id, invoice_id, bill_id, amount)
       VALUES 
       (1, 1, NULL, 30000.00),
       (2, NULL, 1, 25000.00),
       (3, 2, NULL, 20000.00)`
        );
        console.log('✓ Payment allocations created');

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n' + '='.repeat(60));
        console.log('📋 LOGIN CREDENTIALS');
        console.log('='.repeat(60));

        console.log('\n🔐 ADMIN USERS:');
        console.log('─'.repeat(60));
        console.log('  1. System Administrator');
        console.log('     Login ID: admin123');
        console.log('     Password: admin123');
        console.log('     Email:    admin@shivfurniture.com');

        console.log('\n  2. Sales Manager');
        console.log('     Login ID: manager01');
        console.log('     Password: User@123');
        console.log('     Email:    manager@shivfurniture.com');

        console.log('\n🌐 PORTAL USERS (Customers):');
        console.log('─'.repeat(60));
        console.log('  1. XYZ Customer');
        console.log('     Login ID: customer01');
        console.log('     Email:    xyz@customer.com');
        console.log('     Password: Portal@123');

        console.log('\n  2. Premium Retail Ltd');
        console.log('     Login ID: premium01');
        console.log('     Email:    contact@premiumretail.com');
        console.log('     Password: Portal@123');

        console.log('\n' + '='.repeat(60));
        console.log('⚠️  Please change all passwords after first login!');
        console.log('='.repeat(60) + '\n');

        await closeDatabase();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();