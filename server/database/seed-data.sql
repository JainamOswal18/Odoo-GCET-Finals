-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM payment_allocations;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM payments;
DELETE FROM invoice_lines;
DELETE FROM invoices;
DELETE FROM sales_order_lines;
DELETE FROM sales_orders;
DELETE FROM bill_lines;
DELETE FROM bills;
DELETE FROM purchase_order_lines;
DELETE FROM purchase_orders;
DELETE FROM auto_analytical_conditions;
DELETE FROM auto_analytical_models;
DELETE FROM budget_lines;
DELETE FROM budgets;
DELETE FROM analytical_accounts;
DELETE FROM products;
DELETE FROM contacts;
DELETE FROM users;

-- Sample Users (passwords are hashed with bcrypt - password is 'admin123' for admin and 'User@123' for others)
INSERT INTO users (login_id, email, password_hash, full_name, role, active) VALUES
('admin123', 'admin@shivfurniture.com', '$2a$10$rQYwjQh.J5w0Y2F7YFvQmO0zG0JZxXxGXx8lK5H7x3c7QXz8H7X7e', 'System Admin', 'admin', 1),
('manager01', 'manager@shivfurniture.com', '$2a$10$rQYwjQh.J5w0Y2F7YFvQmO0zG0JZxXxGXx8lK5H7x3c7QXz8H7X7e', 'Sales Manager', 'admin', 1);

-- Sample Contacts (with ALL fields including tags and images)
INSERT INTO contacts (name, contact_type, email, phone, address, city, state, country, postal_code, tax_id, is_vendor, is_customer, credit_limit, payment_terms, contact_person, notes, tags, active, created_by) VALUES
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
('Traditional Crafts Emporium', 'customer', 'orders@traditionalcrafts.com', '+91-8987654321', '456 Heritage Street', 'Varanasi', 'Uttar Pradesh', 'India', '221001', '09LLLCP3456L1Z9', 0, 1, 200000.00, 25, 'Geeta Mishra', 'Traditional handicrafts and ethnic furniture', '["Handicraft", "Traditional", "Ethnic", "Export"]', 1, 1);

-- Sample Products (with ALL fields)
INSERT INTO products (name, internal_reference, category, description, sale_price, cost_price, product_type, unit_of_measure, default_account_code, active, image_url) VALUES
('Executive Office Chair', 'CHAIR-001', 'Furniture', 'Premium ergonomic office chair with lumbar support and adjustable armrests', 8500.00, 6000.00, 'goods', 'pcs', '4010', 1, '/images/products/chair-001.jpg'),
('Conference Table', 'TABLE-001', 'Furniture', 'Large conference table for 12 people, solid wood construction', 45000.00, 32000.00, 'goods', 'pcs', '4010', 1, '/images/products/table-001.jpg'),
('LED Monitor 24"', 'MON-001', 'Electronics', '24 inch Full HD LED monitor with IPS panel, 75Hz refresh rate', 12000.00, 8500.00, 'goods', 'pcs', '4020', 1, '/images/products/monitor-001.jpg'),
('Wireless Keyboard', 'KEY-001', 'Electronics', 'Wireless mechanical keyboard with RGB backlight', 2500.00, 1800.00, 'goods', 'pcs', '4020', 1, '/images/products/keyboard-001.jpg'),
('Desk Lamp', 'LAMP-001', 'Accessories', 'LED desk lamp with adjustable brightness and color temperature', 1500.00, 1000.00, 'goods', 'pcs', '4030', 1, '/images/products/lamp-001.jpg'),
('Installation Service', 'SERV-001', 'Services', 'Professional furniture installation and assembly service', 5000.00, 3000.00, 'service', 'hrs', '5010', 1, NULL),
('Office Desk', 'DESK-001', 'Furniture', 'Standard office desk with 3 drawers, L-shaped design', 15000.00, 10500.00, 'goods', 'pcs', '4010', 1, '/images/products/desk-001.jpg'),
('Filing Cabinet', 'FCAB-001', 'Furniture', '4-drawer vertical filing cabinet with lock', 8000.00, 5600.00, 'goods', 'pcs', '4010', 1, '/images/products/cabinet-001.jpg'),
('Mouse Wireless', 'MOUS-001', 'Electronics', 'Wireless optical mouse with ergonomic design', 800.00, 550.00, 'goods', 'pcs', '4020', 1, '/images/products/mouse-001.jpg'),
('Consulting Service', 'CONS-001', 'Services', 'Business consulting and space planning service', 8000.00, 5000.00, 'service', 'hrs', '5010', 1, NULL);

-- Sample Analytical Accounts (with ALL fields)
INSERT INTO analytical_accounts (code, name, parent_id, plan_name, description, account_type, is_budgetable, active) VALUES
('DEPT-001', 'Operations Department', NULL, 'Departmental', 'Day-to-day operations and administrative expenses', 'department', 1, 1),
('DEPT-002', 'Sales Department', NULL, 'Departmental', 'Sales team expenses including commissions and travel', 'department', 1, 1),
('DEPT-003', 'Marketing Department', NULL, 'Departmental', 'Marketing campaigns, advertising, and promotions', 'department', 1, 1),
('PROJ-001', 'Office Renovation Q1', NULL, 'Project Based', 'Office renovation and refurbishment project', 'project', 1, 1),
('PROJ-002', 'IT Infrastructure Upgrade', NULL, 'Project Based', 'Company-wide IT infrastructure and equipment upgrade', 'project', 1, 1),
('DEPT-001-SUB1', 'Operations - Facilities', 1, 'Departmental', 'Facilities management sub-account', 'department', 1, 1),
('DEPT-002-SUB1', 'Sales - Travel', 2, 'Departmental', 'Sales team travel expenses', 'department', 1, 1);

-- Sample Budgets (with ALL fields including revision tracking)
INSERT INTO budgets (name, period_start, period_end, status, is_revision, original_budget_id, revision_number, revision_reason, created_by) VALUES
('Q1 2026 Budget', '2026-01-01', '2026-03-31', 'active', 0, NULL, 1, NULL, 1),
('Q2 2026 Budget', '2026-04-01', '2026-06-30', 'draft', 0, NULL, 1, NULL, 1),
('Annual 2026 Budget', '2026-01-01', '2026-12-31', 'active', 0, NULL, 1, NULL, 1),
('Q1 2026 Budget - Revision 1', '2026-01-01', '2026-03-31', 'cancelled', 1, 1, 2, 'Increased allocation for IT project due to scope expansion', 1);

-- Sample Budget Lines (with ALL fields including theoretical amounts and variances)
INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount, actual_amount, theoretical_amount, achievement_percentage, remaining_balance, variance) VALUES
(1, 1, 500000.00, 125000.00, 166666.67, 25.00, 375000.00, -41666.67),
(1, 2, 300000.00, 95000.00, 100000.00, 31.67, 205000.00, -5000.00),
(1, 3, 200000.00, 45000.00, 66666.67, 22.50, 155000.00, -21666.67),
(1, 4, 750000.00, 280000.00, 250000.00, 37.33, 470000.00, 30000.00),
(1, 5, 450000.00, 115000.00, 150000.00, 25.56, 335000.00, -35000.00),
(2, 1, 550000.00, 0.00, 0.00, 0.00, 550000.00, 0.00),
(2, 2, 350000.00, 0.00, 0.00, 0.00, 350000.00, 0.00),
(3, 1, 2000000.00, 125000.00, 166666.67, 6.25, 1875000.00, -41666.67),
(3, 2, 1200000.00, 95000.00, 100000.00, 7.92, 1105000.00, -5000.00);

-- Sample Auto Analytical Models (with ALL fields)
INSERT INTO auto_analytical_models (name, model_type, priority, active) VALUES
('Furniture to Operations', 'product_category', 10, 1),
('Electronics to IT Project', 'product_category', 20, 1),
('Services to Projects', 'product_type', 5, 1),
('Default Allocation', 'default', 100, 1);

-- Sample Auto Analytical Conditions (with ALL fields)
INSERT INTO auto_analytical_conditions (model_id, condition_type, field_name, operator, value, analytical_account_id, percentage) VALUES
(1, 'product_category', 'category', 'equals', 'Furniture', 1, 100.00),
(2, 'product_category', 'category', 'equals', 'Electronics', 5, 100.00),
(3, 'product_type', 'product_type', 'equals', 'service', 4, 100.00),
(4, 'default', NULL, NULL, NULL, 1, 100.00);

-- Sample Purchase Orders (with ALL fields)
INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, status, subtotal, tax_amount, total_amount, notes, created_by) VALUES
('PO-2026-001', 1, '2026-01-15', '2026-01-25', 'confirmed', 180000.00, 32400.00, 212400.00, 'Office furniture order for new branch. Delivery required before month end.', 1),
('PO-2026-002', 2, '2026-01-18', '2026-01-28', 'confirmed', 60000.00, 10800.00, 70800.00, 'IT equipment for infrastructure upgrade project', 1),
('PO-2026-003', 5, '2026-01-20', '2026-02-05', 'draft', 45000.00, 8100.00, 53100.00, 'Additional office supplies order', 1);

-- Sample Purchase Order Lines (with ALL fields)
INSERT INTO purchase_order_lines (po_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id) VALUES
(1, 1, 'Executive office chairs for management floor', 15, 8500.00, 18.00, 127500.00, 1),
(1, 2, 'Conference table for board room', 1, 45000.00, 18.00, 45000.00, 1),
(1, 6, 'Installation service for furniture', 1.5, 5000.00, 18.00, 7500.00, 4),
(2, 3, 'LED monitors for workstations', 5, 12000.00, 18.00, 60000.00, 5),
(3, 7, 'Office desks for new employees', 3, 15000.00, 18.00, 45000.00, 1);

-- Sample Vendor Bills (with ALL fields)
INSERT INTO bills (bill_number, vendor_id, po_id, bill_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by) VALUES
('BILL-2026-001', 1, 1, '2026-01-25', '2026-02-24', 'posted', 'partial', 180000.00, 32400.00, 212400.00, 100000.00, 112400.00, 'Invoice received for PO-2026-001. Partial payment made.', 1, '2026-01-25 14:30:00', 1),
('BILL-2026-002', 2, 2, '2026-01-28', '2026-03-14', 'posted', 'unpaid', 60000.00, 10800.00, 70800.00, 0.00, 70800.00, 'IT equipment invoice with 45 days payment terms', 1, '2026-01-28 11:20:00', 1),
('BILL-2026-003', 5, NULL, '2026-01-22', '2026-02-21', 'draft', 'unpaid', 25000.00, 4500.00, 29500.00, 0.00, 29500.00, 'Miscellaneous supplies - pending approval', 0, NULL, 1);

-- Sample Bill Lines (with ALL fields)
INSERT INTO bill_lines (bill_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id) VALUES
(1, 1, 'Executive office chairs as per PO', 15, 8500.00, 18.00, 127500.00, 1),
(1, 2, 'Conference table as per PO', 1, 45000.00, 18.00, 45000.00, 1),
(1, 6, 'Installation charges', 1.5, 5000.00, 18.00, 7500.00, 4),
(2, 3, 'LED monitors 24 inch', 5, 12000.00, 18.00, 60000.00, 5),
(3, 4, 'Wireless keyboards', 10, 2500.00, 18.00, 25000.00, 1);

-- Sample Sales Orders (with ALL fields)
INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by) VALUES
('SO-2026-001', 3, '2026-01-20', '2026-02-05', 'confirmed', 155000.00, 27900.00, 182900.00, 'Office furniture sale to Global Enterprises for their new office', 1),
('SO-2026-002', 4, '2026-01-22', '2026-02-10', 'confirmed', 85000.00, 15300.00, 100300.00, 'Conference room setup for Premium Buyers', 1),
('SO-2026-003', 5, '2026-01-25', '2026-02-15', 'draft', 50000.00, 9000.00, 59000.00, 'Mixed order - furniture and electronics', 1);

-- Sample Sales Order Lines (with ALL fields)
INSERT INTO sales_order_lines (so_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id) VALUES
(1, 1, 'Executive chairs for management team', 10, 8500.00, 18.00, 85000.00, 2),
(1, 7, 'L-shaped office desks', 4, 15000.00, 18.00, 60000.00, 2),
(1, 6, 'Installation and setup service', 2, 5000.00, 18.00, 10000.00, 4),
(2, 2, 'Large conference table', 1, 45000.00, 18.00, 45000.00, 2),
(2, 1, 'Executive chairs for conference room', 4, 8500.00, 18.00, 34000.00, 2),
(2, 10, 'Space planning consultation', 1, 8000.00, 18.00, 8000.00, 4),
(3, 3, 'LED monitors', 3, 12000.00, 18.00, 36000.00, 2),
(3, 4, 'Wireless keyboards', 5, 2500.00, 18.00, 12500.00, 2);

-- Sample Customer Invoices (with ALL fields)
INSERT INTO invoices (invoice_number, customer_id, so_id, invoice_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by) VALUES
('INV-2026-001', 3, 1, '2026-01-25', '2026-02-24', 'posted', 'partial', 155000.00, 27900.00, 182900.00, 80000.00, 102900.00, 'Partial payment received via bank transfer. Balance due in 15 days.', 1, '2026-01-25 16:45:00', 1),
('INV-2026-002', 4, 2, '2026-01-28', '2026-02-12', 'posted', 'unpaid', 85000.00, 15300.00, 100300.00, 0.00, 100300.00, 'Invoice sent to customer. 15 days payment terms.', 1, '2026-01-28 10:30:00', 1),
('INV-2026-003', 5, NULL, '2026-01-26', '2026-02-25', 'draft', 'unpaid', 35000.00, 6300.00, 41300.00, 0.00, 41300.00, 'Direct invoice without SO - pending approval', 0, NULL, 1);

-- Sample Invoice Lines (with ALL fields)
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id) VALUES
(1, 1, 'Executive office chairs', 10, 8500.00, 18.00, 85000.00, 2),
(1, 7, 'L-shaped office desks', 4, 15000.00, 18.00, 60000.00, 2),
(1, 6, 'Installation service', 2, 5000.00, 18.00, 10000.00, 4),
(2, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 2),
(2, 1, 'Executive chairs', 4, 8500.00, 18.00, 34000.00, 2),
(2, 10, 'Consulting service', 1, 8000.00, 18.00, 8000.00, 4),
(3, 8, 'Filing cabinets', 4, 8000.00, 18.00, 32000.00, 2);

-- Sample Payments (with ALL fields)
INSERT INTO payments (payment_number, payment_type, contact_id, payment_date, amount, payment_method, reference, notes, status, created_by) VALUES
('PAY-IN-001', 'inbound', 3, '2026-01-26', 80000.00, 'bank_transfer', 'TXN-NEFT-123456', 'Partial payment for INV-2026-001 from Global Enterprises', 'posted', 1),
('PAY-OUT-001', 'outbound', 1, '2026-01-27', 100000.00, 'bank_transfer', 'TXN-RTGS-789012', 'Partial payment to ABC Suppliers for BILL-2026-001', 'posted', 1),
('PAY-IN-002', 'inbound', 4, '2026-01-29', 50000.00, 'cheque', 'CHQ-564321', 'Advance payment from Premium Buyers', 'posted', 1),
('PAY-OUT-002', 'outbound', 2, '2026-01-30', 35000.00, 'bank_transfer', 'TXN-IMPS-345678', 'Partial payment to XYZ Traders', 'posted', 1);

-- Sample Payment Allocations (with ALL fields)
INSERT INTO payment_allocations (payment_id, invoice_id, bill_id, amount) VALUES
(1, 1, NULL, 80000.00),
(2, NULL, 1, 100000.00),
(3, 2, NULL, 50000.00),
(4, NULL, 2, 35000.00);

-- Sample Journal Entries (with ALL fields)
INSERT INTO journal_entries (entry_number, entry_date, reference_type, reference_id, description, status, posted, posted_at, created_by) VALUES
('JE-2026-001', '2026-01-25', 'invoice', 1, 'Customer invoice INV-2026-001 posted', 'posted', 1, '2026-01-25 16:50:00', 1),
('JE-2026-002', '2026-01-27', 'bill', 1, 'Vendor bill BILL-2026-001 posted', 'posted', 1, '2026-01-27 14:20:00', 1),
('JE-2026-003', '2026-01-26', 'payment', 1, 'Customer payment received PAY-IN-001', 'posted', 1, '2026-01-26 11:30:00', 1);

-- Sample Journal Entry Lines (with ALL fields)
INSERT INTO journal_entry_lines (journal_entry_id, account_code, account_name, analytical_account_id, description, debit, credit) VALUES
(1, '1200', 'Accounts Receivable', 2, 'Invoice to Global Enterprises', 182900.00, 0.00),
(1, '4010', 'Sales Revenue - Furniture', 2, 'Furniture sales', 0.00, 155000.00),
(1, '2300', 'Output GST Payable', NULL, 'GST on sales', 0.00, 27900.00),
(2, '5010', 'Purchase Expense - Furniture', 1, 'Furniture purchase', 180000.00, 0.00),
(2, '1100', 'Input GST Recoverable', NULL, 'GST on purchase', 32400.00, 0.00),
(2, '2100', 'Accounts Payable', NULL, 'Payable to ABC Suppliers', 0.00, 212400.00),
(3, '1000', 'Bank Account', NULL, 'Payment received', 80000.00, 0.00),
(3, '1200', 'Accounts Receivable', 2, 'Payment against INV-2026-001', 0.00, 80000.00);
