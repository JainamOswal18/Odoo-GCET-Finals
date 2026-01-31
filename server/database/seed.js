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

        // Create Contacts first (needed for portal users) - with comprehensive details
        await runQuery(
            `INSERT INTO contacts (name, contact_type, email, phone, address, city, state, country, postal_code, tax_id, is_vendor, is_customer, credit_limit, payment_terms, contact_person, notes, tags, active, created_by)
       VALUES 
       ('ABC Suppliers Ltd', 'vendor', 'contact@abcsuppliers.com', '+91-9876543210', '123 Industrial Area, Phase 2', 'Ahmedabad', 'Gujarat', 'India', '380001', 'GSTIN24ABCDE1234F1Z5', 1, 0, NULL, 30, 'Mr. Rajesh Kumar', 'Reliable furniture supplier with 10+ years experience', '["Premium Supplier", "Wood", "Raw Material"]', 1, 1),
       ('XYZ Traders', 'vendor', 'info@xyztraders.com', '+91-9876543211', '456 Market Street, Sector 5', 'Ahmedabad', 'Gujarat', 'India', '380002', 'GSTIN24XYZTR5678G2A6', 1, 0, NULL, 45, 'Ms. Priya Sharma', 'Electronics and IT equipment supplier', '["Electronics", "IT Equipment", "Wholesale"]', 1, 1),
       ('Global Enterprises', 'customer', 'sales@globalent.com', '+91-9876543212', '789 Business Park, Tower A', 'Ahmedabad', 'Gujarat', 'India', '380003', 'GSTIN24GLOBE9012H3B7', 0, 1, 500000.00, 30, 'Mr. Amit Patel', 'Large corporate client, orders bulk furniture', '["B2B", "Corporate", "Bulk Orders"]', 1, 1),
       ('Premium Buyers Co', 'customer', 'purchase@premiumbuyers.com', '+91-9876543213', '321 Tech Hub, Building 3', 'Ahmedabad', 'Gujarat', 'India', '380004', 'GSTIN24PREMI3456I4C8', 0, 1, 300000.00, 15, 'Ms. Neha Desai', 'Premium segment client with quick payment cycles', '["Premium", "B2B", "Fast Payment"]', 1, 1),
       ('Multi Trade Corp', 'both', 'admin@multitrade.com', '+91-9876543214', '654 Commerce Center, Wing B', 'Ahmedabad', 'Gujarat', 'India', '380005', 'GSTIN24MULTI7890J5D9', 1, 1, 750000.00, 30, 'Mr. Vijay Singh', 'Both supplier and customer, strong business relationship', '["Wholesale", "B2B", "Trading"]', 1, 1),
       ('Luxury Interiors Pvt Ltd', 'customer', 'contact@luxuryinteriors.com', '+91-9876501234', '101 Luxury Towers, MG Road', 'Bangalore', 'Karnataka', 'India', '560001', '29AAACP1234A1Z5', 0, 1, 500000.00, 30, 'Kavita Reddy', 'High-end interior design firm', '["B2B", "Interior Design", "Premium", "Large Orders"]', 1, 1),
       ('WoodCraft Suppliers', 'vendor', 'sales@woodcraft.in', '+91-9123450987', '45 Timber Market, Industrial Area', 'Gandhinagar', 'Gujarat', 'India', '382010', '24BBBCP5678B1Z9', 1, 0, NULL, 15, 'Suresh Mehta', 'Quality wood supplier with wide variety', '["Wood Supplier", "Raw Material", "Teak", "Oak"]', 1, 1),
       ('Metro Furniture Store', 'customer', 'orders@metrofurniture.com', '+91-9988776655', '234 Shopping Plaza, Sector 18', 'Noida', 'Uttar Pradesh', 'India', '201301', '09CCCCP9012C1Z3', 0, 1, 300000.00, 15, 'Neha Gupta', 'Retail chain with multiple outlets', '["Retail", "B2C", "Chain Store"]', 1, 1),
       ('Hardware & Fittings Co', 'vendor', 'info@hardwarefittings.com', '+91-9765432109', '67 Hardware Market, Station Road', 'Delhi', 'Delhi', 'India', '110001', '07DDDCP3456D1Z7', 1, 0, NULL, 7, 'Ravi Singh', 'Complete hardware and fittings supplier', '["Hardware", "Fittings", "Tools", "Fasteners"]', 1, 1),
       ('Elite Office Solutions', 'customer', 'procurement@eliteoffice.com', '+91-9654321098', '890 IT Park, Phase 2', 'Hyderabad', 'Telangana', 'India', '500081', '36EEECP7890E1Z1', 0, 1, 750000.00, 45, 'Deepak Verma', 'Corporate office furniture solutions provider', '["B2B", "Office Furniture", "Corporate", "Bulk"]', 1, 1),
       ('Eco-Friendly Materials', 'vendor', 'contact@ecomaterials.in', '+91-9543210987', '12 Green Zone, Eco Park', 'Chennai', 'Tamil Nadu', 'India', '600001', '33FFFCP2345F1Z8', 1, 0, NULL, 30, 'Lakshmi Iyer', 'Sustainable and eco-friendly materials', '["Eco-Friendly", "Sustainable", "Bamboo", "Recycled"]', 1, 1),
       ('Home Decor Boutique', 'customer', 'orders@homedecorboutique.com', '+91-9432109876', '567 Fashion Street', 'Kolkata', 'West Bengal', 'India', '700001', '19GGGCP6789G1Z2', 0, 1, 150000.00, 20, 'Ananya Banerjee', 'Premium home decor boutique', '["Retail", "Boutique", "Premium", "Home Decor"]', 1, 1),
       ('Industrial Plywood Suppliers', 'vendor', 'sales@industrialplywood.com', '+91-9321098765', '345 Industrial Estate, Zone A', 'Surat', 'Gujarat', 'India', '395001', '24HHHCP1234H1Z6', 1, 0, NULL, 10, 'Kiran Shah', 'Plywood and laminates wholesale supplier', '["Plywood", "MDF", "Particle Board", "Laminates"]', 1, 1),
       ('Royal Palace Interiors', 'customer', 'contact@royalpalace.in', '+91-9210987654', '901 Heritage Complex, Old City', 'Jaipur', 'Rajasthan', 'India', '302001', '08IIICP8901I1Z4', 0, 1, 1000000.00, 60, 'Maharaja Singh', 'Luxury heritage interior projects', '["Luxury", "Heritage", "Custom", "High-End"]', 1, 1),
       ('Paint & Polish Distributors', 'vendor', 'info@paintpolish.com', '+91-9109876543', '678 Chemical Market', 'Coimbatore', 'Tamil Nadu', 'India', '641001', '33JJJCP4567J1Z0', 1, 0, NULL, 15, 'Muthu Kumar', 'Paint and polish wholesale distributor', '["Paint", "Polish", "Varnish", "Chemicals"]', 1, 1),
       ('Smart Home Furnishings', 'both', 'sales@smarthome.in', '+91-9098765432', '123 Smart City, Tech Hub', 'Pune', 'Maharashtra', 'India', '411045', '27KKKCP7890K1Z5', 1, 1, 400000.00, 30, 'Rahul Deshmukh', 'Smart and IoT-enabled furniture solutions', '["Smart Furniture", "IoT", "Modern", "Tech"]', 1, 1),
       ('Traditional Crafts Emporium', 'customer', 'orders@traditionalcrafts.com', '+91-8987654321', '456 Heritage Street', 'Varanasi', 'Uttar Pradesh', 'India', '221001', '09LLLCP3456L1Z9', 0, 1, 200000.00, 25, 'Geeta Mishra', 'Traditional handicrafts and ethnic furniture', '["Handicraft", "Traditional", "Ethnic", "Export"]', 1, 1)`
        );
        console.log('✓ Sample contacts created (17 contacts with full details)');

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
            `INSERT INTO products (name, internal_reference, category, description, sale_price, cost_price, product_type, unit_of_measure, default_account_code, active, image_url)
       VALUES 
       ('Executive Office Chair', 'CHAIR-001', 'Furniture', 'Premium ergonomic office chair with lumbar support and adjustable armrests', 8500.00, 6000.00, 'goods', 'pcs', '4010', 1, '/images/products/chair-001.jpg'),
       ('Conference Table', 'TABLE-001', 'Furniture', 'Large conference table for 12 people, solid wood construction', 45000.00, 32000.00, 'goods', 'pcs', '4010', 1, '/images/products/table-001.jpg'),
       ('LED Monitor 24"', 'MON-001', 'Electronics', '24 inch Full HD LED monitor with IPS panel, 75Hz refresh rate', 12000.00, 8500.00, 'goods', 'pcs', '4020', 1, '/images/products/monitor-001.jpg'),
       ('Wireless Keyboard', 'KEY-001', 'Electronics', 'Wireless mechanical keyboard with RGB backlight', 2500.00, 1800.00, 'goods', 'pcs', '4020', 1, '/images/products/keyboard-001.jpg'),
       ('Desk Lamp', 'LAMP-001', 'Accessories', 'LED desk lamp with adjustable brightness and color temperature', 1500.00, 1000.00, 'goods', 'pcs', '4030', 1, '/images/products/lamp-001.jpg'),
       ('Installation Service', 'SERV-001', 'Services', 'Professional furniture installation and assembly service', 5000.00, 3000.00, 'service', 'hrs', '5010', 1, NULL),
       ('Office Desk', 'DESK-001', 'Furniture', 'Standard office desk with 3 drawers, L-shaped design', 15000.00, 10500.00, 'goods', 'pcs', '4010', 1, '/images/products/desk-001.jpg'),
       ('Filing Cabinet', 'FCAB-001', 'Furniture', '4-drawer vertical filing cabinet with lock', 8000.00, 5600.00, 'goods', 'pcs', '4010', 1, '/images/products/cabinet-001.jpg'),
       ('Mouse Wireless', 'MOUS-001', 'Electronics', 'Wireless optical mouse with ergonomic design', 800.00, 550.00, 'goods', 'pcs', '4020', 1, '/images/products/mouse-001.jpg'),
       ('Consulting Service', 'CONS-001', 'Services', 'Business consulting and space planning service', 8000.00, 5000.00, 'service', 'hrs', '5010', 1, NULL),
       ('Teak Wood Chair', 'TWC-001', 'Furniture', 'Classic teak wood chair with premium finish', 5000.00, 3500.00, 'goods', 'pcs', '4010', 1, '/images/products/teak-chair.jpg'),
       ('Pine Wood Plank', 'PWP-001', 'Wood', 'Premium pine wood plank for furniture making', 500.00, 350.00, 'goods', 'unit', '4010', 1, NULL),
       ('Assembly Service', 'AS-001', 'Service', 'Furniture assembly and setup service', 1000.00, 600.00, 'service', 'hrs', '5010', 1, NULL),
       ('Bookshelf', 'BOOK-001', 'Furniture', '6-tier wooden bookshelf with modern design', 6500.00, 4500.00, 'goods', 'pcs', '4010', 1, '/images/products/bookshelf.jpg'),
       ('Swivel Chair', 'SWIV-001', 'Furniture', 'Comfortable swivel chair with cushioned seat', 3500.00, 2400.00, 'goods', 'pcs', '4010', 1, '/images/products/swivel-chair.jpg'),
       ('Old CRT Monitor', 'CRT-001', 'Electronics', 'Discontinued CRT monitor - archived', 2000.00, 1500.00, 'goods', 'pcs', '4020', 0, NULL),
       ('Floppy Disk Drive', 'FDD-001', 'Electronics', 'Legacy floppy disk drive - no longer in use', 500.00, 300.00, 'goods', 'pcs', '4020', 0, NULL),
       ('Wooden Stool', 'STOOL-001', 'Furniture', 'Basic wooden stool - discontinued product line', 1200.00, 800.00, 'goods', 'pcs', '4010', 0, '/images/products/stool-001.jpg'),
       ('Repair Service', 'REP-001', 'Services', 'Furniture repair service - service discontinued', 3000.00, 2000.00, 'service', 'hrs', '5010', 0, NULL),
       ('Plastic Chair', 'PLAS-001', 'Furniture', 'Plastic chair - replaced by better quality products', 800.00, 500.00, 'goods', 'pcs', '4010', 0, '/images/products/plastic-chair.jpg')`
        );
        console.log('✓ Sample products created (20 products: 15 active + 5 archived)');

        await runQuery(
            `INSERT INTO analytical_accounts (code, name, parent_id, plan_name, description, account_type, is_budgetable, active)
       VALUES 
       ('DEPT-001', 'Operations Department', NULL, 'Departmental', 'Day-to-day operations and administrative expenses', 'department', 1, 1),
       ('DEPT-002', 'Sales Department', NULL, 'Departmental', 'Sales team expenses including commissions and travel', 'department', 1, 1),
       ('DEPT-003', 'Marketing Department', NULL, 'Departmental', 'Marketing campaigns, advertising, and promotions', 'department', 1, 1),
       ('PROJ-001', 'Office Renovation Q1', NULL, 'Project Based', 'Office renovation and refurbishment project', 'project', 1, 1),
       ('PROJ-002', 'IT Infrastructure Upgrade', NULL, 'Project Based', 'Company-wide IT infrastructure and equipment upgrade', 'project', 1, 1),
       ('DEPT-001-SUB1', 'Operations - Facilities', 1, 'Departmental', 'Facilities management sub-account', 'department', 1, 1),
       ('DEPT-002-SUB1', 'Sales - Travel', 2, 'Departmental', 'Sales team travel expenses', 'department', 1, 1),
       ('PROJ-003', 'R&D New Chair', NULL, 'Projects', 'Research and development for new chair design', 'project', 1, 1)`
        );
        console.log('✓ Sample analytical accounts created (8 accounts with hierarchy)');

        await runQuery(
            `INSERT INTO budgets (name, period_start, period_end, status, is_revision, original_budget_id, revision_number, revision_reason, created_by)
       VALUES 
       ('Q1 2026 Budget', '2026-01-01', '2026-03-31', 'active', 0, NULL, 1, NULL, 1),
       ('Q2 2026 Budget', '2026-04-01', '2026-06-30', 'draft', 0, NULL, 1, NULL, 1),
       ('Annual 2026 Budget', '2026-01-01', '2026-12-31', 'active', 0, NULL, 1, NULL, 1),
       ('Q1 2026 Budget - Revision 1', '2026-01-01', '2026-03-31', 'cancelled', 1, 1, 2, 'Increased allocation for IT project due to scope expansion', 1)`
        );
        console.log('✓ Sample budgets created (4 budgets including revision)');

        await runQuery(
            `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount, actual_amount, theoretical_amount, achievement_percentage, remaining_balance, variance)
       VALUES 
       (1, 1, 500000.00, 125000.00, 166666.67, 25.00, 375000.00, -41666.67),
       (1, 2, 300000.00, 95000.00, 100000.00, 31.67, 205000.00, -5000.00),
       (1, 3, 200000.00, 45000.00, 66666.67, 22.50, 155000.00, -21666.67),
       (1, 4, 750000.00, 280000.00, 250000.00, 37.33, 470000.00, 30000.00),
       (1, 5, 450000.00, 115000.00, 150000.00, 25.56, 335000.00, -35000.00),
       (2, 1, 550000.00, 0.00, 0.00, 0.00, 550000.00, 0.00),
       (2, 2, 350000.00, 0.00, 0.00, 0.00, 350000.00, 0.00),
       (3, 1, 2000000.00, 125000.00, 166666.67, 6.25, 1875000.00, -41666.67),
       (3, 2, 1200000.00, 95000.00, 100000.00, 7.92, 1105000.00, -5000.00),
       (3, 3, 800000.00, 45000.00, 66666.67, 5.63, 755000.00, -21666.67)`
        );
        console.log('✓ Sample budget lines created (10 budget lines with actual spending)');

        await runQuery(
            `INSERT INTO auto_analytical_models (name, model_type, priority, active)
       VALUES 
       ('Furniture to Operations', 'product_category', 10, 1),
       ('Electronics to IT Project', 'product_category', 20, 1),
       ('Services to Projects', 'product_type', 5, 1),
       ('Default Allocation', 'default', 100, 1)`
        );
        console.log('✓ Sample auto analytical models created (4 models)');

        await runQuery(
            `INSERT INTO auto_analytical_conditions (model_id, condition_type, field_name, operator, value, analytical_account_id, percentage)
       VALUES 
       (1, 'product_category', 'category', 'equals', 'Furniture', 1, 100.00),
       (2, 'product_category', 'category', 'equals', 'Electronics', 5, 100.00),
       (3, 'product_type', 'product_type', 'equals', 'service', 4, 100.00),
       (4, 'default', NULL, NULL, NULL, 1, 100.00)`
        );
        console.log('✓ Sample auto analytical conditions created (4 conditions)');

        // Create Purchase Orders
        await runQuery(
            `INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, status, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES 
       ('PO-2026-001', 1, '2026-01-15', '2026-01-25', 'confirmed', 180000.00, 32400.00, 212400.00, 'Office furniture order for new branch. Delivery required before month end.', 1),
       ('PO-2026-002', 2, '2026-01-18', '2026-01-28', 'confirmed', 60000.00, 10800.00, 70800.00, 'IT equipment for infrastructure upgrade project', 1),
       ('PO-2026-003', 16, '2026-01-20', '2026-02-05', 'confirmed', 45000.00, 8100.00, 53100.00, 'Office supplies order', 1),
       ('PO-2026-004', 7, '2026-01-22', '2026-02-10', 'draft', 35000.00, 6300.00, 41300.00, 'Wood materials for production', 1),
       ('PO-2026-005', 9, '2026-01-25', '2026-02-08', 'draft', 15000.00, 2700.00, 17700.00, 'Hardware and fittings', 1)`
        );
        console.log('✓ Purchase orders created (5 orders)');

        // Create Purchase Order Lines
        await runQuery(
            `INSERT INTO purchase_order_lines (po_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive office chairs for management floor', 15, 8500.00, 18.00, 127500.00, 1),
       (1, 2, 'Conference table for board room', 1, 45000.00, 18.00, 45000.00, 1),
       (1, 6, 'Installation service for furniture', 1.5, 5000.00, 18.00, 7500.00, 4),
       (2, 3, 'LED monitors for workstations', 5, 12000.00, 18.00, 60000.00, 5),
       (3, 7, 'Office desks for new employees', 3, 15000.00, 18.00, 45000.00, 1),
       (4, 12, 'Pine wood planks', 70, 500.00, 18.00, 35000.00, 1),
       (5, 4, 'Wireless keyboards', 6, 2500.00, 18.00, 15000.00, 5)`
        );
        console.log('✓ Purchase order lines created (7 lines)');

        // Create Vendor Bills
        await runQuery(
            `INSERT INTO bills (bill_number, vendor_id, po_id, bill_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by)
       VALUES 
       ('BILL-2026-001', 1, 1, '2026-01-25', '2026-02-24', 'posted', 'partial', 180000.00, 32400.00, 212400.00, 100000.00, 112400.00, 'Invoice received for PO-2026-001. Partial payment made.', 1, '2026-01-25 14:30:00', 1),
       ('BILL-2026-002', 2, 2, '2026-01-28', '2026-03-14', 'posted', 'unpaid', 60000.00, 10800.00, 70800.00, 0.00, 70800.00, 'IT equipment invoice with 45 days payment terms', 1, '2026-01-28 11:20:00', 1),
       ('BILL-2026-003', 16, 3, '2026-01-22', '2026-02-21', 'posted', 'unpaid', 45000.00, 8100.00, 53100.00, 0.00, 53100.00, 'Office supplies invoice', 1, '2026-01-22 10:15:00', 1),
       ('BILL-2026-004', 7, NULL, '2026-01-26', '2026-02-10', 'draft', 'unpaid', 25000.00, 4500.00, 29500.00, 0.00, 29500.00, 'Miscellaneous wood supplies - pending approval', 0, NULL, 1)`
        );
        console.log('✓ Vendor bills created (4 bills)');

        // Create Bill Lines
        await runQuery(
            `INSERT INTO bill_lines (bill_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive office chairs as per PO', 15, 8500.00, 18.00, 127500.00, 1),
       (1, 2, 'Conference table as per PO', 1, 45000.00, 18.00, 45000.00, 1),
       (1, 6, 'Installation charges', 1.5, 5000.00, 18.00, 7500.00, 4),
       (2, 3, 'LED monitors 24 inch', 5, 12000.00, 18.00, 60000.00, 5),
       (3, 7, 'Office desks L-shaped', 3, 15000.00, 18.00, 45000.00, 1),
       (4, 11, 'Teak wood chairs', 5, 5000.00, 18.00, 25000.00, 1)`
        );
        console.log('✓ Bill lines created (6 lines)');

        // Create Sales Orders
        await runQuery(
            `INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES 
       ('SO-2026-001', 3, '2026-01-20', '2026-02-05', 'confirmed', 155000.00, 27900.00, 182900.00, 'Office furniture sale to Global Enterprises for their new office', 1),
       ('SO-2026-002', 4, '2026-01-22', '2026-02-10', 'confirmed', 85000.00, 15300.00, 100300.00, 'Conference room setup for Premium Buyers', 1),
       ('SO-2026-003', 5, '2026-01-25', '2026-02-15', 'confirmed', 50000.00, 9000.00, 59000.00, 'Mixed order - furniture and electronics', 1),
       ('SO-2026-004', 10, '2026-01-26', '2026-02-20', 'draft', 75000.00, 13500.00, 88500.00, 'Corporate office furniture order - pending confirmation', 1),
       ('SO-2026-005', 8, '2026-01-28', '2026-02-18', 'draft', 40000.00, 7200.00, 47200.00, 'Retail store furniture order', 1)`
        );
        console.log('✓ Sales orders created (5 orders)');

        // Create Sales Order Lines
        await runQuery(
            `INSERT INTO sales_order_lines (so_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive chairs for management team', 10, 8500.00, 18.00, 85000.00, 2),
       (1, 7, 'L-shaped office desks', 4, 15000.00, 18.00, 60000.00, 2),
       (1, 6, 'Installation and setup service', 2, 5000.00, 18.00, 10000.00, 4),
       (2, 2, 'Large conference table', 1, 45000.00, 18.00, 45000.00, 2),
       (2, 1, 'Executive chairs for conference room', 4, 8500.00, 18.00, 34000.00, 2),
       (2, 10, 'Space planning consultation', 1, 8000.00, 18.00, 8000.00, 4),
       (3, 3, 'LED monitors', 3, 12000.00, 18.00, 36000.00, 2),
       (3, 4, 'Wireless keyboards', 5, 2500.00, 18.00, 12500.00, 2),
       (4, 7, 'Office desks', 5, 15000.00, 18.00, 75000.00, 2),
       (5, 14, 'Bookshelves', 6, 6500.00, 18.00, 39000.00, 2)`
        );
        console.log('✓ Sales order lines created (10 lines)');

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
        console.log('✓ Customer invoices created (5 invoices)');

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
        console.log('✓ Invoice lines created (10 lines)');

        // Create Payments
        await runQuery(
            `INSERT INTO payments (payment_number, payment_type, contact_id, payment_date, amount, payment_method, reference, notes, status, created_by)
       VALUES 
       ('PAY-IN-001', 'inbound', 3, '2026-01-26', 80000.00, 'bank_transfer', 'TXN-NEFT-123456', 'Partial payment for INV-2026-001 from Global Enterprises', 'posted', 1),
       ('PAY-OUT-001', 'outbound', 1, '2026-01-27', 100000.00, 'bank_transfer', 'TXN-RTGS-789012', 'Partial payment to ABC Suppliers for BILL-2026-001', 'posted', 1),
       ('PAY-IN-002', 'inbound', 4, '2026-01-29', 50000.00, 'cheque', 'CHQ-564321', 'Advance payment from Premium Buyers', 'posted', 1),
       ('PAY-OUT-002', 'outbound', 2, '2026-01-30', 35000.00, 'bank_transfer', 'TXN-IMPS-345678', 'Partial payment to XYZ Traders', 'posted', 1),
       ('PAY-IN-003', 'inbound', 5, '2026-01-30', 30000.00, 'bank_transfer', 'TXN-UPI-987654', 'Payment from Multi Trade Corp', 'posted', 1)`
        );
        console.log('✓ Payments created (5 payments)');

        // Create Payment Allocations
        await runQuery(
            `INSERT INTO payment_allocations (payment_id, invoice_id, bill_id, amount)
       VALUES 
       (1, 1, NULL, 80000.00),
       (2, NULL, 1, 100000.00),
       (3, 2, NULL, 50000.00),
       (4, NULL, 2, 35000.00),
       (5, 3, NULL, 30000.00)`
        );
        console.log('✓ Payment allocations created (5 allocations)');

        // Create Journal Entries
        await runQuery(
            `INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, description, status, posted, posted_at, created_by)
       VALUES 
       ('JE-2026-001', '2026-01-25', 'invoice', 1, 'Customer invoice INV-2026-001 posted', 'posted', 1, '2026-01-25 16:50:00', 1),
       ('JE-2026-002', '2026-01-27', 'bill', 1, 'Vendor bill BILL-2026-001 posted', 'posted', 1, '2026-01-27 14:20:00', 1),
       ('JE-2026-003', '2026-01-26', 'payment', 1, 'Customer payment received PAY-IN-001', 'posted', 1, '2026-01-26 11:30:00', 1),
       ('JE-2026-004', '2026-01-28', 'invoice', 2, 'Customer invoice INV-2026-002 posted', 'posted', 1, '2026-01-28 10:35:00', 1)`
        );
        console.log('✓ Journal entries created (4 entries)');

        // Create Journal Entry Lines
        await runQuery(
            `INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, analytical_account_id, description, debit, credit)
       VALUES 
       (1, '1200', 'Accounts Receivable', 2, 'Invoice to Global Enterprises', 182900.00, 0.00),
       (1, '4010', 'Sales Revenue - Furniture', 2, 'Furniture sales', 0.00, 155000.00),
       (1, '2300', 'Output GST Payable', NULL, 'GST on sales', 0.00, 27900.00),
       (2, '5010', 'Purchase Expense - Furniture', 1, 'Furniture purchase', 180000.00, 0.00),
       (2, '1100', 'Input GST Recoverable', NULL, 'GST on purchase', 32400.00, 0.00),
       (2, '2100', 'Accounts Payable', NULL, 'Payable to ABC Suppliers', 0.00, 212400.00),
       (3, '1000', 'Bank Account', NULL, 'Payment received', 80000.00, 0.00),
       (3, '1200', 'Accounts Receivable', 2, 'Payment against INV-2026-001', 0.00, 80000.00),
       (4, '1200', 'Accounts Receivable', 2, 'Invoice to Premium Buyers', 100300.00, 0.00),
       (4, '4010', 'Sales Revenue - Furniture', 2, 'Furniture and consulting sales', 0.00, 85000.00),
       (4, '2300', 'Output GST Payable', NULL, 'GST on sales', 0.00, 15300.00)`
        );
        console.log('✓ Journal entry lines created (11 lines)');

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