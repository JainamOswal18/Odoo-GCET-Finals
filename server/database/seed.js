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
       ('Traditional Crafts Emporium', 'customer', 'orders@traditionalcrafts.com', '+91-8987654321', '456 Heritage Street', 'Varanasi', 'Uttar Pradesh', 'India', '221001', '09LLLCP3456L1Z9', 0, 1, 200000.00, 25, 'Geeta Mishra', 'Traditional handicrafts and ethnic furniture', '["Handicraft", "Traditional", "Ethnic", "Export"]', 1, 1),
       ('Steel Frames Industries', 'vendor', 'purchase@steelframes.com', '+91-8876543210', '88 Heavy Industries Zone', 'Jamshedpur', 'Jharkhand', 'India', '831001', '20MMMCP1234M1Z3', 1, 0, NULL, 20, 'Arun Kumar', 'Steel and metal frame manufacturer', '["Steel", "Metal", "Frames", "Industrial"]', 1, 1),
       ('City Retail Chain', 'customer', 'sales@cityretail.com', '+91-8765432109', '99 Main Market', 'Lucknow', 'Uttar Pradesh', 'India', '226001', '09NNNCP5678N1Z7', 0, 1, 600000.00, 30, 'Sunita Verma', 'Large retail chain with 50+ outlets', '["Retail", "Chain", "B2C", "Volume"]', 1, 1),
       ('Cushion & Foam Suppliers', 'vendor', 'info@cushionfoam.com', '+91-8654321098', '77 Polymer Park', 'Vadodara', 'Gujarat', 'India', '390001', '24OOOCP9012O1Z1', 1, 0, NULL, 15, 'Dinesh Patel', 'Foam and cushioning materials supplier', '["Foam", "Cushion", "Upholstery", "Padding"]', 1, 1),
       ('Designer Home Solutions', 'customer', 'contact@designerhome.in', '+91-8543210987', '66 Design District', 'Mumbai', 'Maharashtra', 'India', '400001', '27PPPCP3456P1Z5', 0, 1, 800000.00, 45, 'Priyanka Shah', 'Premium designer furniture solutions', '["Designer", "Premium", "Custom", "Luxury"]', 1, 1),
       ('Glass & Mirror Works', 'vendor', 'sales@glassmirror.com', '+91-8432109876', '55 Glass Market', 'Firozabad', 'Uttar Pradesh', 'India', '283203', '09QQQCP7890Q1Z9', 1, 0, NULL, 10, 'Ramesh Gupta', 'Glass and mirror supplier for furniture', '["Glass", "Mirror", "Transparent", "Decorative"]', 1, 1),
       ('Corporate Workspace Ltd', 'customer', 'orders@corporatews.com', '+91-8321098765', '44 Corporate Avenue', 'Gurugram', 'Haryana', 'India', '122001', '06RRRCP2345R1Z3', 0, 1, 900000.00, 30, 'Manish Kapoor', 'Corporate office workspace solutions', '["Corporate", "B2B", "Office", "Workspace"]', 1, 1),
       ('Fabric & Textiles Depot', 'vendor', 'contact@fabricdepot.in', '+91-8210987654', '33 Textile Hub', 'Surat', 'Gujarat', 'India', '395002', '24SSSCP6789S1Z7', 1, 0, NULL, 20, 'Kamlesh Modi', 'Upholstery fabric and textile supplier', '["Fabric", "Textile", "Upholstery", "Leather"]', 1, 1),
       ('Hospitality Furnishings', 'customer', 'procurement@hospitalityfurn.com', '+91-8109876543', '22 Hotel District', 'Goa', 'Goa', 'India', '403001', '30TTTCP1234T1Z1', 0, 1, 700000.00, 45, 'Maria D''Souza', 'Hotel and restaurant furniture supplier', '["Hospitality", "Hotels", "Restaurants", "Commercial"]', 1, 1),
       ('Adhesive & Glue Co', 'vendor', 'info@adhesiveglue.com', '+91-8098765432', '11 Chemical Zone', 'Ankleshwar', 'Gujarat', 'India', '393001', '24UUUCP8901U1Z5', 1, 0, NULL, 15, 'Bharat Thakkar', 'Industrial adhesives and glues', '["Adhesive", "Glue", "Chemical", "Bonding"]', 1, 1),
       ('Student Furniture Store', 'customer', 'sales@studentfurn.com', '+91-7987654321', '999 University Area', 'Pune', 'Maharashtra', 'India', '411007', '27VVVCP4567V1Z9', 0, 1, 250000.00, 20, 'Ashok Kulkarni', 'Hostel and student furniture supplier', '["Student", "Hostel", "Budget", "Volume"]', 1, 1),
       ('Hardware Tools Mart', 'vendor', 'orders@hardwaremart.in', '+91-7876543210', '888 Tool Market', 'Ludhiana', 'Punjab', 'India', '141001', '03WWWCP7890W1Z3', 1, 0, NULL, 10, 'Harjeet Singh', 'Power tools and hardware equipment', '["Tools", "Hardware", "Power Tools", "Equipment"]', 1, 1),
       ('Boutique Interiors', 'customer', 'contact@boutiqueint.com', '+91-7765432109', '777 Fashion Hub', 'Delhi', 'Delhi', 'India', '110002', '07XXXCP2345X1Z7', 0, 1, 350000.00, 30, 'Kavita Mehra', 'Boutique and showroom interiors', '["Boutique", "Showroom", "Retail", "Premium"]', 1, 1),
       ('Lighting Solutions Inc', 'vendor', 'sales@lightingsol.in', '+91-7654321098', '666 Electronics Park', 'Bangalore', 'Karnataka', 'India', '560002', '29YYYCP6789Y1Z1', 1, 0, NULL, 15, 'Venkat Rao', 'LED and decorative lighting supplier', '["Lighting", "LED", "Decorative", "Electrical"]', 1, 1),
       ('Government Projects Division', 'customer', 'tender@govprojects.in', '+91-7543210987', '555 Government Complex', 'New Delhi', 'Delhi', 'India', '110003', '07ZZZCP1234Z1Z5', 0, 1, 2000000.00, 90, 'K.P. Sharma', 'Government furniture procurement', '["Government", "Tender", "Bulk", "Projects"]', 1, 1),
       ('Packaging Materials Ltd', 'vendor', 'info@packaging.com', '+91-7432109876', '444 Industrial Area', 'Ahmedabad', 'Gujarat', 'India', '380006', '24AAAAD5678A2Z9', 1, 0, NULL, 20, 'Jayesh Patel', 'Packaging and shipping materials', '["Packaging", "Shipping", "Cardboard", "Protection"]', 1, 1),
       ('Export House International', 'customer', 'export@exporthouse.in', '+91-7321098765', '333 Export Zone', 'Chennai', 'Tamil Nadu', 'India', '600002', '33BBBBD9012B2Z3', 0, 1, 1500000.00, 60, 'Selva Kumar', 'International furniture export company', '["Export", "International", "Shipping", "B2B"]', 1, 1)`
        );
        console.log('✓ Sample contacts created (33 contacts: 18 vendors, 20 customers, 2 both)');

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
       ('Reception Desk', 'REC-001', 'Furniture', 'Modern reception desk with storage', 35000.00, 25000.00, 'goods', 'pcs', '4010', 1, '/images/products/reception.jpg'),
       ('Visitor Chair', 'VIS-001', 'Furniture', 'Stackable visitor chair with metal frame', 2200.00, 1500.00, 'goods', 'pcs', '4010', 1, '/images/products/visitor-chair.jpg'),
       ('Modular Workstation', 'WORK-001', 'Furniture', '4-seater modular workstation with partitions', 55000.00, 38000.00, 'goods', 'set', '4010', 1, '/images/products/workstation.jpg'),
       ('Standing Desk', 'STAND-001', 'Furniture', 'Height-adjustable standing desk', 22000.00, 15000.00, 'goods', 'pcs', '4010', 1, '/images/products/standing-desk.jpg'),
       ('Meeting Table Round', 'MTBL-001', 'Furniture', 'Round meeting table for 6 people', 28000.00, 19000.00, 'goods', 'pcs', '4010', 1, '/images/products/round-table.jpg'),
       ('Cafeteria Table', 'CAFE-001', 'Furniture', 'Cafeteria dining table with 4 chairs', 18000.00, 12000.00, 'goods', 'set', '4010', 1, '/images/products/cafeteria.jpg'),
       ('Locker Cabinet', 'LOCK-001', 'Furniture', '12-compartment employee locker', 15000.00, 10000.00, 'goods', 'pcs', '4010', 1, '/images/products/locker.jpg'),
       ('Sofa 3-Seater', 'SOFA-001', 'Furniture', 'Premium leather 3-seater sofa', 42000.00, 28000.00, 'goods', 'pcs', '4010', 1, '/images/products/sofa.jpg'),
       ('Center Table', 'CTBL-001', 'Furniture', 'Modern glass center table', 9500.00, 6500.00, 'goods', 'pcs', '4010', 1, '/images/products/center-table.jpg'),
       ('Whiteboard Stand', 'WB-001', 'Furniture', 'Mobile whiteboard with stand', 5500.00, 3800.00, 'goods', 'pcs', '4010', 1, '/images/products/whiteboard.jpg'),
       ('Laptop Stand', 'LAPS-001', 'Accessories', 'Adjustable aluminum laptop stand', 1200.00, 800.00, 'goods', 'pcs', '4030', 1, '/images/products/laptop-stand.jpg'),
       ('Monitor Arm', 'MARM-001', 'Accessories', 'Dual monitor adjustable arm mount', 4500.00, 3000.00, 'goods', 'pcs', '4030', 1, '/images/products/monitor-arm.jpg'),
       ('Cable Management Box', 'CABLE-001', 'Accessories', 'Under-desk cable management solution', 850.00, 550.00, 'goods', 'pcs', '4030', 1, '/images/products/cable-box.jpg'),
       ('Desk Organizer', 'ORG-001', 'Accessories', 'Wooden desk organizer with compartments', 1100.00, 750.00, 'goods', 'pcs', '4030', 1, '/images/products/organizer.jpg'),
       ('LED Monitor 27"', 'MON-002', 'Electronics', '27 inch 4K monitor with HDR support', 22000.00, 15000.00, 'goods', 'pcs', '4020', 1, '/images/products/monitor-27.jpg'),
       ('Wireless Mouse Ergonomic', 'MOUS-002', 'Electronics', 'Vertical ergonomic wireless mouse', 1800.00, 1200.00, 'goods', 'pcs', '4020', 1, '/images/products/ergo-mouse.jpg'),
       ('USB Hub 7-Port', 'USB-001', 'Electronics', '7-port powered USB hub', 1500.00, 1000.00, 'goods', 'pcs', '4020', 1, '/images/products/usb-hub.jpg'),
       ('Webcam HD', 'WEB-001', 'Electronics', '1080p HD webcam with microphone', 3500.00, 2400.00, 'goods', 'pcs', '4020', 1, '/images/products/webcam.jpg'),
       ('Headset with Mic', 'HEAD-001', 'Electronics', 'USB headset with noise cancellation', 2800.00, 1900.00, 'goods', 'pcs', '4020', 1, '/images/products/headset.jpg'),
       ('UPS 1KVA', 'UPS-001', 'Electronics', '1KVA UPS with battery backup', 6500.00, 4500.00, 'goods', 'pcs', '4020', 1, '/images/products/ups.jpg'),
       ('Printer Laser', 'PRINT-001', 'Electronics', 'Monochrome laser printer', 18000.00, 12000.00, 'goods', 'pcs', '4020', 1, '/images/products/printer.jpg'),
       ('Scanner Flatbed', 'SCAN-001', 'Electronics', 'A4 flatbed scanner', 8500.00, 5800.00, 'goods', 'pcs', '4020', 1, '/images/products/scanner.jpg'),
       ('Router Wi-Fi 6', 'ROUT-001', 'Electronics', 'Dual-band Wi-Fi 6 router', 5500.00, 3800.00, 'goods', 'pcs', '4020', 1, '/images/products/router.jpg'),
       ('Network Switch 24-Port', 'SWITCH-001', 'Electronics', '24-port gigabit network switch', 12000.00, 8000.00, 'goods', 'pcs', '4020', 1, '/images/products/switch.jpg'),
       ('Teak Wood Plank', 'TWP-001', 'Wood', 'Premium teak wood plank', 850.00, 600.00, 'goods', 'unit', '4010', 1, NULL),
       ('Oak Wood Sheet', 'OAK-001', 'Wood', 'Oak veneer wood sheet', 1200.00, 850.00, 'goods', 'sheet', '4010', 1, NULL),
       ('MDF Board 18mm', 'MDF-001', 'Wood', '18mm MDF board 8x4 feet', 2200.00, 1500.00, 'goods', 'sheet', '4010', 1, NULL),
       ('Plywood Marine Grade', 'PLY-001', 'Wood', 'Marine grade plywood 19mm', 3500.00, 2400.00, 'goods', 'sheet', '4010', 1, NULL),
       ('Laminate Sheet', 'LAM-001', 'Wood', 'Decorative laminate sheet', 450.00, 300.00, 'goods', 'sheet', '4010', 1, NULL),
       ('Wood Polish', 'POL-001', 'Chemicals', 'Premium wood polish 1 liter', 850.00, 580.00, 'goods', 'liter', '4010', 1, NULL),
       ('Wood Adhesive', 'GLUE-001', 'Chemicals', 'Industrial wood adhesive 5kg', 1200.00, 800.00, 'goods', 'kg', '4010', 1, NULL),
       ('Furniture Hardware Kit', 'HARD-001', 'Hardware', 'Complete furniture assembly hardware kit', 650.00, 450.00, 'goods', 'set', '4010', 1, NULL),
       ('Drawer Slides', 'SLIDE-001', 'Hardware', 'Soft-close drawer slides 18 inch', 450.00, 300.00, 'goods', 'pair', '4010', 1, NULL),
       ('Door Hinges', 'HINGE-001', 'Hardware', 'Concealed door hinges set of 2', 280.00, 190.00, 'goods', 'set', '4010', 1, NULL),
       ('Furniture Legs', 'LEG-001', 'Hardware', 'Adjustable furniture legs set of 4', 850.00, 580.00, 'goods', 'set', '4010', 1, NULL),
       ('Delivery Service', 'DEL-001', 'Service', 'Furniture delivery and transportation', 2500.00, 1500.00, 'service', 'trip', '5010', 1, NULL),
       ('Old CRT Monitor', 'CRT-001', 'Electronics', 'Discontinued CRT monitor - archived', 2000.00, 1500.00, 'goods', 'pcs', '4020', 0, NULL),
       ('Floppy Disk Drive', 'FDD-001', 'Electronics', 'Legacy floppy disk drive - no longer in use', 500.00, 300.00, 'goods', 'pcs', '4020', 0, NULL),
       ('Wooden Stool', 'STOOL-001', 'Furniture', 'Basic wooden stool - discontinued product line', 1200.00, 800.00, 'goods', 'pcs', '4010', 0, '/images/products/stool-001.jpg'),
       ('Repair Service', 'REP-001', 'Services', 'Furniture repair service - service discontinued', 3000.00, 2000.00, 'service', 'hrs', '5010', 0, NULL),
       ('Plastic Chair', 'PLAS-001', 'Furniture', 'Plastic chair - replaced by better quality products', 800.00, 500.00, 'goods', 'pcs', '4010', 0, '/images/products/plastic-chair.jpg')`
        );
        console.log('✓ Sample products created (56 products: 51 active + 5 archived)');

        await runQuery(
            `INSERT INTO analytical_accounts (code, name, parent_id, plan_name, description, account_type, is_budgetable, active)
       VALUES 
       ('DEPT-001', 'Operations Department', NULL, 'Departmental', 'Day-to-day operations and administrative expenses', 'department', 1, 1),
       ('DEPT-002', 'Sales Department', NULL, 'Departmental', 'Sales team expenses including commissions and travel', 'department', 1, 1),
       ('DEPT-003', 'Marketing Department', NULL, 'Departmental', 'Marketing campaigns, advertising, and promotions', 'department', 1, 1),
       ('DEPT-004', 'HR Department', NULL, 'Departmental', 'Human resources and recruitment expenses', 'department', 1, 1),
       ('DEPT-005', 'Finance Department', NULL, 'Departmental', 'Finance and accounting operations', 'department', 1, 1),
       ('DEPT-006', 'IT Department', NULL, 'Departmental', 'Information technology infrastructure and support', 'department', 1, 1),
       ('DEPT-007', 'R&D Department', NULL, 'Departmental', 'Research and development for new products', 'department', 1, 1),
       ('DEPT-008', 'Logistics Department', NULL, 'Departmental', 'Warehouse and transportation management', 'department', 1, 1),
       ('DEPT-009', 'Customer Service', NULL, 'Departmental', 'Customer support and service operations', 'department', 1, 1),
       ('DEPT-010', 'Quality Assurance', NULL, 'Departmental', 'Quality control and assurance processes', 'department', 1, 1),
       ('PROJ-001', 'Office Renovation Q1', NULL, 'Project Based', 'Office renovation and refurbishment project', 'project', 1, 1),
       ('PROJ-002', 'IT Infrastructure Upgrade', NULL, 'Project Based', 'Company-wide IT infrastructure and equipment upgrade', 'project', 1, 1),
       ('PROJ-003', 'R&D New Chair Design', NULL, 'Projects', 'Research and development for new ergonomic chair', 'project', 1, 1),
       ('PROJ-004', 'E-Commerce Platform', NULL, 'Projects', 'Development of online sales platform', 'project', 1, 1),
       ('PROJ-005', 'Showroom Expansion', NULL, 'Projects', 'New showroom setup in Bangalore', 'project', 1, 1),
       ('PROJ-006', 'Warehouse Automation', NULL, 'Projects', 'Automated warehouse management system', 'project', 1, 1),
       ('DEPT-001-SUB1', 'Operations - Facilities', 1, 'Departmental', 'Facilities management sub-account', 'department', 1, 1),
       ('DEPT-002-SUB1', 'Sales - Travel', 2, 'Departmental', 'Sales team travel expenses', 'department', 1, 1),
       ('DEPT-003-SUB1', 'Marketing - Digital', 3, 'Departmental', 'Digital marketing and social media', 'department', 1, 1),
       ('DEPT-006-SUB1', 'IT - Hardware', 6, 'Departmental', 'IT hardware procurement and maintenance', 'department', 1, 1)`
        );
        console.log('✓ Sample analytical accounts created (20 accounts with hierarchy)');

        await runQuery(
            `INSERT INTO budgets (name, period_start, period_end, status, is_revision, original_budget_id, revision_number, revision_reason, created_by)
       VALUES 
       ('Q1 2026 Budget', '2026-01-01', '2026-03-31', 'active', 0, NULL, 1, NULL, 1),
       ('Q2 2026 Budget', '2026-04-01', '2026-06-30', 'draft', 0, NULL, 1, NULL, 1),
       ('Q3 2026 Budget', '2026-07-01', '2026-09-30', 'draft', 0, NULL, 1, NULL, 1),
       ('Q4 2026 Budget', '2026-10-01', '2026-12-31', 'draft', 0, NULL, 1, NULL, 1),
       ('Annual 2026 Budget', '2026-01-01', '2026-12-31', 'active', 0, NULL, 1, NULL, 1),
       ('Q1 2026 Budget - Revision 1', '2026-01-01', '2026-03-31', 'cancelled', 1, 1, 2, 'Increased allocation for IT project due to scope expansion', 1),
       ('H1 2026 Budget', '2026-01-01', '2026-06-30', 'active', 0, NULL, 1, NULL, 1),
       ('H2 2026 Budget', '2026-07-01', '2026-12-31', 'draft', 0, NULL, 1, NULL, 1)`
        );
        console.log('✓ Sample budgets created (8 budgets including revisions)');

        await runQuery(
            `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount, actual_amount, theoretical_amount, achievement_percentage, remaining_balance, variance)
       VALUES 
       -- FY 2025-26 Annual Budget (budget_id = 1) - REALISTIC DATA WITH VARIOUS SCENARIOS
       (1, 1, 2000000.00, 1700000.00, 1666666.67, 85.00, 300000.00, 33333.33),  -- Operations: Under budget
       (1, 2, 1200000.00, 1260000.00, 1000000.00, 105.00, -60000.00, 260000.00), -- Marketing: OVER BUDGET!
       (1, 3, 800000.00, 600000.00, 666666.67, 75.00, 200000.00, -66666.67),     -- HR: Under budget
       (1, 4, 900000.00, 990000.00, 750000.00, 110.00, -90000.00, 240000.00),    -- IT Infrastructure: CRITICAL OVER BUDGET!
       (1, 5, 1500000.00, 1425000.00, 1250000.00, 95.00, 75000.00, 175000.00),   -- R&D: Near limit (warning)
       (1, 6, 500000.00, 340000.00, 416666.67, 68.00, 160000.00, -76666.67),     -- Office Supplies: Under budget
       (1, 7, 600000.00, 552000.00, 500000.00, 92.00, 48000.00, 52000.00),       -- Training: Near limit (warning)
       
       -- FY 2024-25 Budget (budget_id = 2) - Completed year
       (2, 1, 1800000.00, 1750000.00, 1800000.00, 97.22, 50000.00, -50000.00),
       (2, 2, 1000000.00, 980000.00, 1000000.00, 98.00, 20000.00, -20000.00),
       (2, 3, 750000.00, 720000.00, 750000.00, 96.00, 30000.00, -30000.00),
       (2, 4, 800000.00, 850000.00, 800000.00, 106.25, -50000.00, 50000.00),
       (2, 5, 1300000.00, 1280000.00, 1300000.00, 98.46, 20000.00, -20000.00),
       (2, 6, 450000.00, 420000.00, 450000.00, 93.33, 30000.00, -30000.00),
       (2, 7, 500000.00, 485000.00, 500000.00, 97.00, 15000.00, -15000.00),
       
       -- Annual 2026 Budget (budget_id = 3)
       (3, 1, 2000000.00, 185000.00, 166666.67, 9.25, 1815000.00, 18333.33),
       (3, 2, 1200000.00, 125000.00, 100000.00, 10.42, 1075000.00, 25000.00),
       (3, 3, 800000.00, 68000.00, 66666.67, 8.50, 732000.00, 1333.33),
       (3, 4, 600000.00, 45000.00, 50000.00, 7.50, 555000.00, -5000.00),
       (3, 5, 720000.00, 52000.00, 60000.00, 7.22, 668000.00, -8000.00),
       (5, 6, 1800000.00, 215000.00, 150000.00, 11.94, 1585000.00, 65000.00),
       (5, 7, 1000000.00, 85000.00, 83333.33, 8.50, 915000.00, 1666.67),
       (5, 8, 880000.00, 95000.00, 73333.33, 10.80, 785000.00, 21666.67),
       (7, 1, 1100000.00, 185000.00, 183333.33, 16.82, 915000.00, 1666.67),
       (7, 2, 650000.00, 125000.00, 108333.33, 19.23, 525000.00, 16666.67),
       (7, 3, 420000.00, 68000.00, 70000.00, 16.19, 352000.00, -2000.00),
       (7, 6, 930000.00, 215000.00, 155000.00, 23.12, 715000.00, 60000.00)`
        );
        console.log('✓ Sample budget lines created (29 budget lines with diverse spending patterns)');

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
       ('PO-2026-001', 1, '2026-01-05', '2026-01-15', 'confirmed', 180000.00, 32400.00, 212400.00, 'Office furniture order for new branch. Delivery completed.', 1),
       ('PO-2026-002', 2, '2026-01-07', '2026-01-17', 'confirmed', 95000.00, 17100.00, 112100.00, 'IT equipment for infrastructure upgrade project', 1),
       ('PO-2026-003', 7, '2026-01-10', '2026-01-20', 'confirmed', 85000.00, 15300.00, 100300.00, 'Premium wood materials for production', 1),
       ('PO-2026-004', 9, '2026-01-12', '2026-01-22', 'confirmed', 45000.00, 8100.00, 53100.00, 'Hardware and fittings bulk order', 1),
       ('PO-2026-005', 13, '2026-01-14', '2026-01-24', 'confirmed', 120000.00, 21600.00, 141600.00, 'Plywood and MDF boards', 1),
       ('PO-2026-006', 15, '2026-01-16', '2026-01-26', 'confirmed', 35000.00, 6300.00, 41300.00, 'Paint and polish supplies', 1),
       ('PO-2026-007', 16, '2026-01-18', '2026-01-28', 'confirmed', 65000.00, 11700.00, 76700.00, 'Smart furniture components', 1),
       ('PO-2026-008', 18, '2026-01-20', '2026-01-30', 'confirmed', 55000.00, 9900.00, 64900.00, 'Steel frames for furniture', 1),
       ('PO-2026-009', 20, '2026-01-22', '2026-02-01', 'confirmed', 28000.00, 5040.00, 33040.00, 'Foam and cushioning materials', 1),
       ('PO-2026-010', 22, '2026-01-24', '2026-02-03', 'confirmed', 18000.00, 3240.00, 21240.00, 'Glass and mirrors', 1),
       ('PO-2026-011', 24, '2026-01-26', '2026-02-05', 'confirmed', 42000.00, 7560.00, 49560.00, 'Upholstery fabrics', 1),
       ('PO-2026-012', 26, '2026-01-28', '2026-02-07', 'confirmed', 15000.00, 2700.00, 17700.00, 'Industrial adhesives', 1),
       ('PO-2026-013', 1, '2026-01-29', '2026-02-08', 'confirmed', 95000.00, 17100.00, 112100.00, 'Additional furniture order', 1),
       ('PO-2026-014', 2, '2026-01-30', '2026-02-09', 'confirmed', 75000.00, 13500.00, 88500.00, 'Electronics and IT accessories', 1),
       ('PO-2026-015', 30, '2026-01-30', '2026-02-09', 'confirmed', 38000.00, 6840.00, 44840.00, 'LED lighting solutions', 1),
       ('PO-2026-016', 28, '2026-01-31', '2026-02-10', 'draft', 22000.00, 3960.00, 25960.00, 'Power tools and equipment - pending approval', 1),
       ('PO-2026-017', 7, '2026-01-31', '2026-02-10', 'draft', 48000.00, 8640.00, 56640.00, 'Wood materials for Q2 - pending confirmation', 1),
       ('PO-2026-018', 13, '2026-02-01', '2026-02-11', 'draft', 65000.00, 11700.00, 76700.00, 'Plywood stock replenishment - draft', 1),
       ('PO-2026-019', 9, '2026-02-01', '2026-02-11', 'draft', 35000.00, 6300.00, 41300.00, 'Hardware supplies - awaiting approval', 1),
       ('PO-2026-020', 32, '2026-02-01', '2026-02-11', 'draft', 28000.00, 5040.00, 33040.00, 'Packaging materials - draft', 1)`
        );
        console.log('✓ Purchase orders created (20 orders: 15 confirmed + 5 draft)');

        // Create Purchase Order Lines
        await runQuery(
            `INSERT INTO purchase_order_lines (po_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive office chairs for management floor', 15, 8500.00, 18.00, 127500.00, 1),
       (1, 2, 'Conference table for board room', 1, 45000.00, 18.00, 45000.00, 1),
       (1, 6, 'Installation service for furniture', 1.5, 5000.00, 18.00, 7500.00, 11),
       (2, 3, 'LED monitors for workstations', 5, 12000.00, 18.00, 60000.00, 6),
       (2, 4, 'Wireless keyboards', 10, 2500.00, 18.00, 25000.00, 6),
       (2, 9, 'Wireless mice', 10, 800.00, 18.00, 8000.00, 6),
       (3, 11, 'Teak wood chairs premium quality', 10, 5000.00, 18.00, 50000.00, 1),
       (3, 12, 'Pine wood planks', 70, 500.00, 18.00, 35000.00, 1),
       (4, 48, 'Drawer slides', 100, 300.00, 18.00, 30000.00, 1),
       (4, 49, 'Door hinges', 50, 190.00, 18.00, 9500.00, 1),
       (4, 47, 'Furniture hardware kits', 10, 450.00, 18.00, 4500.00, 1),
       (5, 43, 'Plywood marine grade', 30, 2400.00, 18.00, 72000.00, 1),
       (5, 42, 'MDF boards 18mm', 20, 1500.00, 18.00, 30000.00, 1),
       (5, 44, 'Laminate sheets', 40, 300.00, 18.00, 12000.00, 1),
       (6, 45, 'Wood polish premium', 40, 580.00, 18.00, 23200.00, 1),
       (6, 46, 'Wood adhesive industrial', 10, 800.00, 18.00, 8000.00, 1),
       (7, 18, 'Modular workstations', 1, 38000.00, 18.00, 38000.00, 1),
       (7, 27, 'Monitor arms dual', 6, 3000.00, 18.00, 18000.00, 6),
       (8, 50, 'Adjustable furniture legs', 20, 580.00, 18.00, 11600.00, 1),
       (8, 16, 'Reception desk modern', 1, 25000.00, 18.00, 25000.00, 1),
       (8, 19, 'Standing desks', 1, 15000.00, 18.00, 15000.00, 1),
       (9, 28, 'Cable management boxes', 30, 550.00, 18.00, 16500.00, 6),
       (9, 26, 'Laptop stands', 10, 800.00, 18.00, 8000.00, 6),
       (10, 24, 'Glass center tables', 2, 6500.00, 18.00, 13000.00, 1),
       (11, 21, 'Cafeteria tables with chairs', 1, 12000.00, 18.00, 12000.00, 1),
       (11, 23, 'Premium leather sofas', 1, 28000.00, 18.00, 28000.00, 1),
       (12, 46, 'Industrial adhesive 5kg', 15, 800.00, 18.00, 12000.00, 1),
       (13, 7, 'Office desks L-shaped', 5, 10500.00, 18.00, 52500.00, 1),
       (13, 14, 'Bookshelves 6-tier', 6, 4500.00, 18.00, 27000.00, 1),
       (13, 15, 'Swivel chairs cushioned', 6, 2400.00, 18.00, 14400.00, 1),
       (14, 30, 'LED monitors 27 inch', 5, 15000.00, 18.00, 75000.00, 6),
       (15, 31, 'USB hubs 7-port', 10, 1000.00, 18.00, 10000.00, 6),
       (15, 32, 'HD webcams', 8, 2400.00, 18.00, 19200.00, 6),
       (15, 33, 'Headsets with mic', 6, 1900.00, 18.00, 11400.00, 6),
       (16, 47, 'Furniture hardware', 20, 450.00, 18.00, 9000.00, 1),
       (16, 48, 'Drawer slides soft-close', 30, 300.00, 18.00, 9000.00, 1),
       (17, 40, 'Teak wood planks premium', 50, 600.00, 18.00, 30000.00, 1),
       (17, 41, 'Oak wood sheets', 20, 850.00, 18.00, 17000.00, 1),
       (18, 42, 'MDF boards', 30, 1500.00, 18.00, 45000.00, 1),
       (18, 43, 'Plywood marine', 10, 2400.00, 18.00, 24000.00, 1),
       (19, 47, 'Hardware kits', 30, 450.00, 18.00, 13500.00, 1),
       (19, 49, 'Door hinges premium', 50, 190.00, 18.00, 9500.00, 1),
       (20, 44, 'Laminate sheets decorative', 50, 300.00, 18.00, 15000.00, 1),
       (20, 45, 'Wood polish', 20, 580.00, 18.00, 11600.00, 1)`
        );
        console.log('✓ Purchase order lines created (45 lines across 20 POs)');

        // Create Vendor Bills
        await runQuery(
            `INSERT INTO bills (bill_number, vendor_id, po_id, bill_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by)
       VALUES 
       ('BILL-2026-001', 1, 1, '2026-01-16', '2026-02-15', 'posted', 'paid', 180000.00, 32400.00, 212400.00, 212400.00, 0.00, 'Fully paid - furniture delivery completed', 1, '2026-01-16 14:30:00', 1),
       ('BILL-2026-002', 2, 2, '2026-01-18', '2026-03-02', 'posted', 'partial', 95000.00, 17100.00, 112100.00, 50000.00, 62100.00, 'Partial payment made - balance due', 1, '2026-01-18 11:20:00', 1),
       ('BILL-2026-003', 7, 3, '2026-01-21', '2026-02-05', 'posted', 'unpaid', 85000.00, 15300.00, 100300.00, 0.00, 100300.00, 'Wood materials invoice - payment pending', 1, '2026-01-21 10:15:00', 1),
       ('BILL-2026-004', 9, 4, '2026-01-23', '2026-01-30', 'posted', 'paid', 45000.00, 8100.00, 53100.00, 53100.00, 0.00, 'Hardware order - fully paid', 1, '2026-01-23 15:45:00', 1),
       ('BILL-2026-005', 13, 5, '2026-01-25', '2026-02-04', 'posted', 'partial', 120000.00, 21600.00, 141600.00, 80000.00, 61600.00, 'Plywood order - partial payment', 1, '2026-01-25 09:30:00', 1),
       ('BILL-2026-006', 15, 6, '2026-01-27', '2026-02-11', 'posted', 'unpaid', 35000.00, 6300.00, 41300.00, 0.00, 41300.00, 'Paint supplies - pending payment', 1, '2026-01-27 16:20:00', 1),
       ('BILL-2026-007', 16, 7, '2026-01-29', '2026-02-28', 'posted', 'unpaid', 65000.00, 11700.00, 76700.00, 0.00, 76700.00, 'Smart furniture components', 1, '2026-01-29 10:45:00', 1),
       ('BILL-2026-008', 18, 8, '2026-01-30', '2026-02-19', 'posted', 'unpaid', 55000.00, 9900.00, 64900.00, 0.00, 64900.00, 'Steel frames order', 1, '2026-01-30 14:15:00', 1),
       ('BILL-2026-009', 20, 9, '2026-01-31', '2026-02-15', 'posted', 'unpaid', 28000.00, 5040.00, 33040.00, 0.00, 33040.00, 'Foam materials invoice', 1, '2026-01-31 11:00:00', 1),
       ('BILL-2026-010', 22, 10, '2026-02-01', '2026-02-11', 'posted', 'unpaid', 18000.00, 3240.00, 21240.00, 0.00, 21240.00, 'Glass and mirrors', 1, '2026-02-01 09:20:00', 1),
       ('BILL-2026-011', 24, 11, '2026-02-01', '2026-02-21', 'posted', 'unpaid', 42000.00, 7560.00, 49560.00, 0.00, 49560.00, 'Upholstery fabrics', 1, '2026-02-01 15:30:00', 1),
       ('BILL-2026-012', 26, 12, '2026-01-30', '2026-02-14', 'posted', 'unpaid', 15000.00, 2700.00, 17700.00, 0.00, 17700.00, 'Adhesives order', 1, '2026-01-30 13:45:00', 1),
       ('BILL-2026-013', 1, 13, '2026-01-31', '2026-03-01', 'posted', 'unpaid', 95000.00, 17100.00, 112100.00, 0.00, 112100.00, 'Additional furniture order', 1, '2026-01-31 10:20:00', 1),
       ('BILL-2026-014', 2, 14, '2026-02-01', '2026-03-15', 'posted', 'unpaid', 75000.00, 13500.00, 88500.00, 0.00, 88500.00, 'Electronics accessories', 1, '2026-02-01 14:40:00', 1),
       ('BILL-2026-015', 30, 15, '2026-02-01', '2026-02-16', 'posted', 'unpaid', 38000.00, 6840.00, 44840.00, 0.00, 44840.00, 'LED lighting', 1, '2026-02-01 11:30:00', 1),
       ('BILL-2026-016', 7, NULL, '2026-01-26', '2026-02-10', 'draft', 'unpaid', 25000.00, 4500.00, 29500.00, 0.00, 29500.00, 'Miscellaneous wood supplies - pending approval', 0, NULL, 1),
       ('BILL-2026-017', 13, NULL, '2026-01-29', '2026-02-13', 'draft', 'unpaid', 18000.00, 3240.00, 21240.00, 0.00, 21240.00, 'Additional plywood - draft', 0, NULL, 1),
       ('BILL-2026-018', 9, NULL, '2026-01-31', '2026-02-14', 'draft', 'unpaid', 12000.00, 2160.00, 14160.00, 0.00, 14160.00, 'Hardware supplies - awaiting approval', 0, NULL, 1)`
        );
        console.log('✓ Vendor bills created (18 bills: 2 paid + 3 partial + 10 unpaid + 3 draft)');

        // Create Bill Lines
        await runQuery(
            `INSERT INTO bill_lines (bill_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive office chairs', 15, 8500.00, 18.00, 127500.00, 1),
       (1, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 1),
       (1, 6, 'Installation service', 1.5, 5000.00, 18.00, 7500.00, 11),
       (2, 3, 'LED monitors 24"', 5, 12000.00, 18.00, 60000.00, 6),
       (2, 4, 'Wireless keyboards', 10, 2500.00, 18.00, 25000.00, 6),
       (2, 9, 'Wireless mice', 10, 800.00, 18.00, 8000.00, 6),
       (3, 11, 'Teak wood chairs', 10, 5000.00, 18.00, 50000.00, 1),
       (3, 12, 'Pine wood planks', 70, 500.00, 18.00, 35000.00, 1),
       (4, 48, 'Drawer slides', 100, 300.00, 18.00, 30000.00, 1),
       (4, 49, 'Door hinges', 50, 190.00, 18.00, 9500.00, 1),
       (4, 47, 'Hardware kits', 10, 450.00, 18.00, 4500.00, 1),
       (5, 43, 'Plywood marine grade', 30, 2400.00, 18.00, 72000.00, 1),
       (5, 42, 'MDF boards', 20, 1500.00, 18.00, 30000.00, 1),
       (5, 44, 'Laminate sheets', 40, 300.00, 18.00, 12000.00, 1),
       (6, 45, 'Wood polish', 40, 580.00, 18.00, 23200.00, 1),
       (6, 46, 'Wood adhesive', 10, 800.00, 18.00, 8000.00, 1),
       (7, 18, 'Modular workstations', 1, 38000.00, 18.00, 38000.00, 1),
       (7, 27, 'Monitor arms', 6, 3000.00, 18.00, 18000.00, 6),
       (8, 50, 'Furniture legs', 20, 580.00, 18.00, 11600.00, 1),
       (8, 16, 'Reception desk', 1, 25000.00, 18.00, 25000.00, 1),
       (8, 19, 'Standing desks', 1, 15000.00, 18.00, 15000.00, 1),
       (9, 28, 'Cable management', 30, 550.00, 18.00, 16500.00, 6),
       (9, 26, 'Laptop stands', 10, 800.00, 18.00, 8000.00, 6),
       (10, 24, 'Glass center tables', 2, 6500.00, 18.00, 13000.00, 1),
       (11, 21, 'Cafeteria tables', 1, 12000.00, 18.00, 12000.00, 1),
       (11, 23, 'Leather sofas', 1, 28000.00, 18.00, 28000.00, 1),
       (12, 46, 'Industrial adhesive', 15, 800.00, 18.00, 12000.00, 1),
       (13, 7, 'Office desks', 5, 10500.00, 18.00, 52500.00, 1),
       (13, 14, 'Bookshelves', 6, 4500.00, 18.00, 27000.00, 1),
       (13, 15, 'Swivel chairs', 6, 2400.00, 18.00, 14400.00, 1),
       (14, 30, 'LED monitors 27"', 5, 15000.00, 18.00, 75000.00, 6),
       (15, 31, 'USB hubs', 10, 1000.00, 18.00, 10000.00, 6),
       (15, 32, 'HD webcams', 8, 2400.00, 18.00, 19200.00, 6),
       (15, 33, 'Headsets', 6, 1900.00, 18.00, 11400.00, 6),
       (16, 11, 'Teak chairs', 5, 5000.00, 18.00, 25000.00, 1),
       (17, 42, 'MDF boards', 12, 1500.00, 18.00, 18000.00, 1),
       (18, 47, 'Hardware kits', 20, 450.00, 18.00, 9000.00, 1)`
        );
        console.log('✓ Bill lines created (38 lines across 18 bills)');

        // Create Sales Orders
        await runQuery(
            `INSERT INTO sales_orders (so_number, customer_id, order_date, delivery_date, status, subtotal, tax_amount, total_amount, notes, created_by)
       VALUES 
       ('SO-2026-001', 3, '2026-01-05', '2026-01-15', 'confirmed', 185000.00, 33300.00, 218300.00, 'Office furniture for Global Enterprises new branch', 1),
       ('SO-2026-002', 4, '2026-01-07', '2026-01-17', 'confirmed', 93000.00, 16740.00, 109740.00, 'Conference room setup for Premium Buyers', 1),
       ('SO-2026-003', 6, '2026-01-09', '2026-01-19', 'confirmed', 125000.00, 22500.00, 147500.00, 'Luxury Interiors premium order', 1),
       ('SO-2026-004', 8, '2026-01-11', '2026-01-21', 'confirmed', 85000.00, 15300.00, 100300.00, 'Metro Furniture Store retail order', 1),
       ('SO-2026-005', 10, '2026-01-13', '2026-01-23', 'confirmed', 155000.00, 27900.00, 182900.00, 'Elite Office Solutions corporate order', 1),
       ('SO-2026-006', 12, '2026-01-15', '2026-01-25', 'confirmed', 45000.00, 8100.00, 53100.00, 'Home Decor Boutique order', 1),
       ('SO-2026-007', 14, '2026-01-17', '2026-01-27', 'confirmed', 195000.00, 35100.00, 230100.00, 'Royal Palace Interiors luxury project', 1),
       ('SO-2026-008', 17, '2026-01-19', '2026-01-29', 'confirmed', 65000.00, 11700.00, 76700.00, 'Traditional Crafts ethnic furniture', 1),
       ('SO-2026-009', 19, '2026-01-21', '2026-01-31', 'confirmed', 175000.00, 31500.00, 206500.00, 'City Retail Chain bulk order', 1),
       ('SO-2026-010', 21, '2026-01-23', '2026-02-02', 'confirmed', 225000.00, 40500.00, 265500.00, 'Designer Home Solutions premium', 1),
       ('SO-2026-011', 23, '2026-01-25', '2026-02-04', 'confirmed', 285000.00, 51300.00, 336300.00, 'Corporate Workspace office setup', 1),
       ('SO-2026-012', 25, '2026-01-26', '2026-02-05', 'confirmed', 165000.00, 29700.00, 194700.00, 'Hospitality Furnishings hotel project', 1),
       ('SO-2026-013', 27, '2026-01-27', '2026-02-06', 'confirmed', 55000.00, 9900.00, 64900.00, 'Student Furniture hostel order', 1),
       ('SO-2026-014', 29, '2026-01-28', '2026-02-07', 'confirmed', 75000.00, 13500.00, 88500.00, 'Boutique Interiors showroom', 1),
       ('SO-2026-015', 31, '2026-01-29', '2026-02-08', 'confirmed', 385000.00, 69300.00, 454300.00, 'Government Projects tender', 1),
       ('SO-2026-016', 33, '2026-01-30', '2026-02-09', 'confirmed', 145000.00, 26100.00, 171100.00, 'Export House international order', 1),
       ('SO-2026-017', 3, '2026-01-30', '2026-02-09', 'confirmed', 95000.00, 17100.00, 112100.00, 'Global Enterprises repeat order', 1),
       ('SO-2026-018', 6, '2026-01-31', '2026-02-10', 'confirmed', 115000.00, 20700.00, 135700.00, 'Luxury Interiors additional items', 1),
       ('SO-2026-019', 10, '2026-01-31', '2026-02-10', 'confirmed', 125000.00, 22500.00, 147500.00, 'Elite Office workstation order', 1),
       ('SO-2026-020', 14, '2026-02-01', '2026-02-11', 'confirmed', 165000.00, 29700.00, 194700.00, 'Royal Palace custom furniture', 1),
       ('SO-2026-021', 4, '2026-02-01', '2026-02-11', 'draft', 85000.00, 15300.00, 100300.00, 'Premium Buyers - awaiting confirmation', 1),
       ('SO-2026-022', 8, '2026-02-01', '2026-02-11', 'draft', 65000.00, 11700.00, 76700.00, 'Metro Furniture - pending approval', 1),
       ('SO-2026-023', 19, '2026-02-01', '2026-02-11', 'draft', 95000.00, 17100.00, 112100.00, 'City Retail - quote pending', 1),
       ('SO-2026-024', 23, '2026-02-01', '2026-02-11', 'draft', 175000.00, 31500.00, 206500.00, 'Corporate Workspace - draft order', 1),
       ('SO-2026-025', 31, '2026-02-01', '2026-02-11', 'draft', 285000.00, 51300.00, 336300.00, 'Government tender - pending approval', 1)`
        );
        console.log('✓ Sales orders created (25 orders: 20 confirmed + 5 draft)');

        // Create Sales Order Lines
        await runQuery(
            `INSERT INTO sales_order_lines (so_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive chairs', 10, 8500.00, 18.00, 85000.00, 2),
       (1, 7, 'Office desks L-shaped', 6, 15000.00, 18.00, 90000.00, 2),
       (1, 6, 'Installation service', 2, 5000.00, 18.00, 10000.00, 11),
       (2, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 2),
       (2, 1, 'Executive chairs', 4, 8500.00, 18.00, 34000.00, 2),
       (2, 10, 'Consulting service', 2, 8000.00, 18.00, 16000.00, 11),
       (3, 23, 'Premium sofas', 2, 42000.00, 18.00, 84000.00, 2),
       (3, 24, 'Center tables', 3, 9500.00, 18.00, 28500.00, 2),
       (3, 5, 'Desk lamps', 10, 1500.00, 18.00, 15000.00, 2),
       (4, 14, 'Bookshelves', 8, 6500.00, 18.00, 52000.00, 2),
       (4, 15, 'Swivel chairs', 10, 3500.00, 18.00, 35000.00, 2),
       (5, 18, 'Modular workstations', 3, 55000.00, 18.00, 165000.00, 2),
       (6, 11, 'Teak chairs', 8, 5000.00, 18.00, 40000.00, 2),
       (6, 24, 'Center tables', 1, 9500.00, 18.00, 9500.00, 2),
       (7, 2, 'Conference tables', 2, 45000.00, 18.00, 90000.00, 2),
       (7, 1, 'Executive chairs', 10, 8500.00, 18.00, 85000.00, 2),
       (7, 16, 'Reception desk', 1, 35000.00, 18.00, 35000.00, 2),
       (8, 11, 'Teak chairs traditional', 10, 5000.00, 18.00, 50000.00, 2),
       (8, 14, 'Bookshelves', 2, 6500.00, 18.00, 13000.00, 2),
       (9, 18, 'Modular workstations', 2, 55000.00, 18.00, 110000.00, 2),
       (9, 7, 'Office desks', 4, 15000.00, 18.00, 60000.00, 2),
       (9, 13, 'Assembly service', 5, 1000.00, 18.00, 5000.00, 11),
       (10, 23, 'Designer sofas', 3, 42000.00, 18.00, 126000.00, 2),
       (10, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 2),
       (10, 16, 'Reception desk premium', 1, 35000.00, 18.00, 35000.00, 2),
       (10, 10, 'Consulting service', 3, 8000.00, 18.00, 24000.00, 11),
       (11, 18, 'Modular workstations', 4, 55000.00, 18.00, 220000.00, 2),
       (11, 19, 'Standing desks', 3, 22000.00, 18.00, 66000.00, 2),
       (12, 21, 'Cafeteria tables', 5, 18000.00, 18.00, 90000.00, 2),
       (12, 23, 'Sofas', 2, 42000.00, 18.00, 84000.00, 2),
       (13, 15, 'Swivel chairs', 15, 3500.00, 18.00, 52500.00, 2),
       (14, 14, 'Bookshelves', 10, 6500.00, 18.00, 65000.00, 2),
       (14, 17, 'Visitor chairs', 5, 2200.00, 18.00, 11000.00, 2),
       (15, 18, 'Modular workstations', 5, 55000.00, 18.00, 275000.00, 2),
       (15, 2, 'Conference tables', 2, 45000.00, 18.00, 90000.00, 2),
       (15, 20, 'Meeting tables', 1, 28000.00, 18.00, 28000.00, 2),
       (16, 1, 'Executive chairs', 12, 8500.00, 18.00, 102000.00, 2),
       (16, 7, 'Office desks', 3, 15000.00, 18.00, 45000.00, 2),
       (17, 14, 'Bookshelves', 10, 6500.00, 18.00, 65000.00, 2),
       (17, 15, 'Swivel chairs', 10, 3500.00, 18.00, 35000.00, 2),
       (18, 23, 'Sofas premium', 2, 42000.00, 18.00, 84000.00, 2),
       (18, 24, 'Center tables', 3, 9500.00, 18.00, 28500.00, 2),
       (19, 18, 'Modular workstations', 2, 55000.00, 18.00, 110000.00, 2),
       (19, 19, 'Standing desks', 1, 22000.00, 18.00, 22000.00, 2),
       (20, 2, 'Conference tables custom', 2, 45000.00, 18.00, 90000.00, 2),
       (20, 1, 'Executive chairs', 8, 8500.00, 18.00, 68000.00, 2),
       (20, 10, 'Design consulting', 1, 8000.00, 18.00, 8000.00, 11),
       (21, 7, 'Office desks', 5, 15000.00, 18.00, 75000.00, 2),
       (21, 17, 'Visitor chairs', 5, 2200.00, 18.00, 11000.00, 2),
       (22, 14, 'Bookshelves', 8, 6500.00, 18.00, 52000.00, 2),
       (22, 15, 'Swivel chairs', 5, 3500.00, 18.00, 17500.00, 2),
       (23, 18, 'Modular workstations', 1, 55000.00, 18.00, 55000.00, 2),
       (23, 7, 'Office desks', 3, 15000.00, 18.00, 45000.00, 2),
       (24, 18, 'Modular workstations', 3, 55000.00, 18.00, 165000.00, 2),
       (24, 19, 'Standing desks', 1, 22000.00, 18.00, 22000.00, 2),
       (25, 18, 'Modular workstations govt spec', 5, 55000.00, 18.00, 275000.00, 2),
       (25, 2, 'Conference tables', 1, 45000.00, 18.00, 45000.00, 2)`
        );
        console.log('✓ Sales order lines created (58 lines across 25 orders)');

        // Create Customer Invoices
        await runQuery(
            `INSERT INTO invoices (invoice_number, customer_id, so_id, invoice_date, due_date, status, payment_status, subtotal, tax_amount, total_amount, amount_paid, amount_due, notes, posted, posted_at, created_by)
       VALUES 
       ('INV-2026-001', 3, 1, '2026-01-16', '2026-02-15', 'posted', 'paid', 185000.00, 33300.00, 218300.00, 218300.00, 0.00, 'Fully paid - thank you', 1, '2026-01-16 16:45:00', 1),
       ('INV-2026-002', 4, 2, '2026-01-18', '2026-02-02', 'posted', 'partial', 93000.00, 16740.00, 109740.00, 60000.00, 49740.00, 'Partial payment received', 1, '2026-01-18 10:30:00', 1),
       ('INV-2026-003', 6, 3, '2026-01-20', '2026-02-19', 'posted', 'unpaid', 125000.00, 22500.00, 147500.00, 0.00, 147500.00, 'Luxury order - payment pending', 1, '2026-01-20 14:20:00', 1),
       ('INV-2026-004', 8, 4, '2026-01-22', '2026-02-06', 'posted', 'paid', 85000.00, 15300.00, 100300.00, 100300.00, 0.00, 'Paid in full', 1, '2026-01-22 11:15:00', 1),
       ('INV-2026-005', 10, 5, '2026-01-24', '2026-03-08', 'posted', 'partial', 155000.00, 27900.00, 182900.00, 100000.00, 82900.00, 'Advance payment received', 1, '2026-01-24 09:40:00', 1),
       ('INV-2026-006', 12, 6, '2026-01-26', '2026-02-15', 'posted', 'unpaid', 45000.00, 8100.00, 53100.00, 0.00, 53100.00, 'Payment due', 1, '2026-01-26 15:30:00', 1),
       ('INV-2026-007', 14, 7, '2026-01-28', '2026-03-29', 'posted', 'unpaid', 195000.00, 35100.00, 230100.00, 0.00, 230100.00, 'Luxury project invoice', 1, '2026-01-28 13:20:00', 1),
       ('INV-2026-008', 17, 8, '2026-01-30', '2026-02-24', 'posted', 'unpaid', 65000.00, 11700.00, 76700.00, 0.00, 76700.00, 'Traditional furniture', 1, '2026-01-30 10:15:00', 1),
       ('INV-2026-009', 19, 9, '2026-01-31', '2026-03-01', 'posted', 'partial', 175000.00, 31500.00, 206500.00, 120000.00, 86500.00, 'Bulk order partial payment', 1, '2026-01-31 16:00:00', 1),
       ('INV-2026-010', 21, 10, '2026-02-01', '2026-03-15', 'posted', 'unpaid', 225000.00, 40500.00, 265500.00, 0.00, 265500.00, 'Designer premium order', 1, '2026-02-01 11:30:00', 1),
       ('INV-2026-011', 23, 11, '2026-02-01', '2026-03-03', 'posted', 'unpaid', 285000.00, 51300.00, 336300.00, 0.00, 336300.00, 'Corporate workspace setup', 1, '2026-02-01 14:45:00', 1),
       ('INV-2026-012', 25, 12, '2026-02-01', '2026-03-15', 'posted', 'unpaid', 165000.00, 29700.00, 194700.00, 0.00, 194700.00, 'Hotel furniture', 1, '2026-02-01 09:20:00', 1),
       ('INV-2026-013', 27, 13, '2026-02-01', '2026-02-21', 'posted', 'unpaid', 55000.00, 9900.00, 64900.00, 0.00, 64900.00, 'Student hostel furniture', 1, '2026-02-01 15:50:00', 1),
       ('INV-2026-014', 29, 14, '2026-02-01', '2026-03-01', 'posted', 'unpaid', 75000.00, 13500.00, 88500.00, 0.00, 88500.00, 'Boutique showroom', 1, '2026-02-01 13:15:00', 1),
       ('INV-2026-015', 31, 15, '2026-02-01', '2026-04-30', 'posted', 'unpaid', 385000.00, 69300.00, 454300.00, 0.00, 454300.00, 'Government tender - 90 days', 1, '2026-02-01 10:40:00', 1),
       ('INV-2026-016', 33, 16, '2026-02-01', '2026-03-30', 'posted', 'unpaid', 145000.00, 26100.00, 171100.00, 0.00, 171100.00, 'Export order', 1, '2026-02-01 16:25:00', 1),
       ('INV-2026-017', 3, 17, '2026-02-01', '2026-03-01', 'posted', 'unpaid', 95000.00, 17100.00, 112100.00, 0.00, 112100.00, 'Repeat customer order', 1, '2026-02-01 11:50:00', 1),
       ('INV-2026-018', 6, 18, '2026-02-01', '2026-03-02', 'posted', 'unpaid', 115000.00, 20700.00, 135700.00, 0.00, 135700.00, 'Additional luxury items', 1, '2026-02-01 14:10:00', 1),
       ('INV-2026-019', 10, 19, '2026-02-01', '2026-03-15', 'posted', 'unpaid', 125000.00, 22500.00, 147500.00, 0.00, 147500.00, 'Workstation expansion', 1, '2026-02-01 09:55:00', 1),
       ('INV-2026-020', 14, 20, '2026-02-01', '2026-03-30', 'posted', 'unpaid', 165000.00, 29700.00, 194700.00, 0.00, 194700.00, 'Custom furniture project', 1, '2026-02-01 15:35:00', 1),
       ('INV-2026-021', 6, NULL, '2026-01-27', '2026-02-26', 'draft', 'unpaid', 35000.00, 6300.00, 41300.00, 0.00, 41300.00, 'Direct invoice - pending approval', 0, NULL, 1),
       ('INV-2026-022', 10, NULL, '2026-01-29', '2026-02-28', 'draft', 'unpaid', 55000.00, 9900.00, 64900.00, 0.00, 64900.00, 'Additional items - draft', 0, NULL, 1),
       ('INV-2026-023', 19, NULL, '2026-01-31', '2026-02-28', 'draft', 'unpaid', 45000.00, 8100.00, 53100.00, 0.00, 53100.00, 'Pending customer confirmation', 0, NULL, 1)`
        );
        console.log('✓ Customer invoices created (23 invoices: 2 paid + 3 partial + 15 unpaid + 3 draft)');

        // Create Invoice Lines
        await runQuery(
            `INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_rate, subtotal, analytical_account_id)
       VALUES 
       (1, 1, 'Executive chairs', 10, 8500.00, 18.00, 85000.00, 2),
       (1, 7, 'Office desks', 6, 15000.00, 18.00, 90000.00, 2),
       (1, 6, 'Installation', 2, 5000.00, 18.00, 10000.00, 11),
       (2, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 2),
       (2, 1, 'Executive chairs', 4, 8500.00, 18.00, 34000.00, 2),
       (2, 10, 'Consulting', 2, 8000.00, 18.00, 16000.00, 11),
       (3, 23, 'Sofas', 2, 42000.00, 18.00, 84000.00, 2),
       (3, 24, 'Center tables', 3, 9500.00, 18.00, 28500.00, 2),
       (3, 5, 'Desk lamps', 10, 1500.00, 18.00, 15000.00, 2),
       (4, 14, 'Bookshelves', 8, 6500.00, 18.00, 52000.00, 2),
       (4, 15, 'Swivel chairs', 10, 3500.00, 18.00, 35000.00, 2),
       (5, 18, 'Modular workstations', 3, 55000.00, 18.00, 165000.00, 2),
       (6, 11, 'Teak chairs', 8, 5000.00, 18.00, 40000.00, 2),
       (6, 24, 'Center table', 1, 9500.00, 18.00, 9500.00, 2),
       (7, 2, 'Conference tables', 2, 45000.00, 18.00, 90000.00, 2),
       (7, 1, 'Executive chairs', 10, 8500.00, 18.00, 85000.00, 2),
       (7, 16, 'Reception desk', 1, 35000.00, 18.00, 35000.00, 2),
       (8, 11, 'Teak chairs', 10, 5000.00, 18.00, 50000.00, 2),
       (8, 14, 'Bookshelves', 2, 6500.00, 18.00, 13000.00, 2),
       (9, 18, 'Modular workstations', 2, 55000.00, 18.00, 110000.00, 2),
       (9, 7, 'Office desks', 4, 15000.00, 18.00, 60000.00, 2),
       (9, 13, 'Assembly', 5, 1000.00, 18.00, 5000.00, 11),
       (10, 23, 'Designer sofas', 3, 42000.00, 18.00, 126000.00, 2),
       (10, 2, 'Conference table', 1, 45000.00, 18.00, 45000.00, 2),
       (10, 16, 'Reception desk', 1, 35000.00, 18.00, 35000.00, 2),
       (10, 10, 'Consulting', 3, 8000.00, 18.00, 24000.00, 11),
       (11, 18, 'Modular workstations', 4, 55000.00, 18.00, 220000.00, 2),
       (11, 19, 'Standing desks', 3, 22000.00, 18.00, 66000.00, 2),
       (12, 21, 'Cafeteria tables', 5, 18000.00, 18.00, 90000.00, 2),
       (12, 23, 'Sofas', 2, 42000.00, 18.00, 84000.00, 2),
       (13, 15, 'Swivel chairs', 15, 3500.00, 18.00, 52500.00, 2),
       (14, 14, 'Bookshelves', 10, 6500.00, 18.00, 65000.00, 2),
       (14, 17, 'Visitor chairs', 5, 2200.00, 18.00, 11000.00, 2),
       (15, 18, 'Modular workstations', 5, 55000.00, 18.00, 275000.00, 2),
       (15, 2, 'Conference tables', 2, 45000.00, 18.00, 90000.00, 2),
       (15, 20, 'Meeting tables', 1, 28000.00, 18.00, 28000.00, 2),
       (16, 1, 'Executive chairs', 12, 8500.00, 18.00, 102000.00, 2),
       (16, 7, 'Office desks', 3, 15000.00, 18.00, 45000.00, 2),
       (17, 14, 'Bookshelves', 10, 6500.00, 18.00, 65000.00, 2),
       (17, 15, 'Swivel chairs', 10, 3500.00, 18.00, 35000.00, 2),
       (18, 23, 'Sofas', 2, 42000.00, 18.00, 84000.00, 2),
       (18, 24, 'Center tables', 3, 9500.00, 18.00, 28500.00, 2),
       (19, 18, 'Modular workstations', 2, 55000.00, 18.00, 110000.00, 2),
       (19, 19, 'Standing desks', 1, 22000.00, 18.00, 22000.00, 2),
       (20, 2, 'Conference tables', 2, 45000.00, 18.00, 90000.00, 2),
       (20, 1, 'Executive chairs', 8, 8500.00, 18.00, 68000.00, 2),
       (20, 10, 'Consulting', 1, 8000.00, 18.00, 8000.00, 11),
       (21, 14, 'Bookshelves', 5, 6500.00, 18.00, 32500.00, 2),
       (22, 18, 'Modular workstation', 1, 55000.00, 18.00, 55000.00, 2),
       (23, 7, 'Office desks', 3, 15000.00, 18.00, 45000.00, 2)`
        );
        console.log('✓ Invoice lines created (50 lines across 23 invoices)');

        // Create Payments
        await runQuery(
            `INSERT INTO payments (payment_number, payment_type, contact_id, payment_date, amount, payment_method, reference, notes, status, created_by)
       VALUES 
       ('PAY-IN-001', 'inbound', 3, '2026-01-17', 218300.00, 'bank_transfer', 'TXN-NEFT-123456', 'Full payment for INV-2026-001 from Global Enterprises', 'posted', 1),
       ('PAY-IN-002', 'inbound', 4, '2026-01-19', 60000.00, 'bank_transfer', 'TXN-RTGS-234567', 'Partial payment for INV-2026-002', 'posted', 1),
       ('PAY-IN-003', 'inbound', 8, '2026-01-23', 100300.00, 'cheque', 'CHQ-654321', 'Full payment INV-2026-004', 'posted', 1),
       ('PAY-IN-004', 'inbound', 10, '2026-01-25', 100000.00, 'bank_transfer', 'TXN-IMPS-345678', 'Advance payment INV-2026-005', 'posted', 1),
       ('PAY-IN-005', 'inbound', 19, '2026-02-01', 120000.00, 'bank_transfer', 'TXN-UPI-987654', 'Partial payment INV-2026-009 City Retail', 'posted', 1),
       ('PAY-OUT-001', 'outbound', 1, '2026-01-17', 212400.00, 'bank_transfer', 'TXN-RTGS-789012', 'Full payment BILL-2026-001 to ABC Suppliers', 'posted', 1),
       ('PAY-OUT-002', 'outbound', 2, '2026-01-19', 50000.00, 'bank_transfer', 'TXN-NEFT-890123', 'Partial payment BILL-2026-002 to XYZ Traders', 'posted', 1),
       ('PAY-OUT-003', 'outbound', 9, '2026-01-24', 53100.00, 'cheque', 'CHQ-789456', 'Full payment BILL-2026-004 Hardware & Fittings', 'posted', 1),
       ('PAY-OUT-004', 'outbound', 13, '2026-01-26', 80000.00, 'bank_transfer', 'TXN-IMPS-901234', 'Partial payment BILL-2026-005 plywood order', 'posted', 1),
       ('PAY-IN-006', 'inbound', 3, '2026-01-20', 50000.00, 'bank_transfer', 'TXN-NEFT-456789', 'Advance for upcoming order', 'posted', 1),
       ('PAY-IN-007', 'inbound', 6, '2026-01-22', 75000.00, 'cheque', 'CHQ-987654', 'Payment on account Luxury Interiors', 'posted', 1),
       ('PAY-IN-008', 'inbound', 10, '2026-01-28', 90000.00, 'bank_transfer', 'TXN-RTGS-567890', 'Additional payment Elite Office', 'posted', 1),
       ('PAY-IN-009', 'inbound', 14, '2026-01-30', 125000.00, 'bank_transfer', 'TXN-NEFT-678901', 'Advance Royal Palace Interiors', 'posted', 1),
       ('PAY-IN-010', 'inbound', 19, '2026-02-01', 80000.00, 'bank_transfer', 'TXN-UPI-789012', 'Second partial payment City Retail', 'posted', 1),
       ('PAY-OUT-005', 'outbound', 1, '2026-01-28', 50000.00, 'bank_transfer', 'TXN-NEFT-112233', 'Advance payment to ABC Suppliers', 'posted', 1),
       ('PAY-OUT-006', 'outbound', 7, '2026-01-29', 60000.00, 'cheque', 'CHQ-445566', 'Payment to WoodCraft Suppliers', 'posted', 1),
       ('PAY-OUT-007', 'outbound', 13, '2026-01-30', 50000.00, 'bank_transfer', 'TXN-RTGS-778899', 'Additional payment Industrial Plywood', 'posted', 1),
       ('PAY-OUT-008', 'outbound', 15, '2026-01-31', 41300.00, 'bank_transfer', 'TXN-IMPS-334455', 'Full payment BILL-2026-006 Paint supplies', 'posted', 1),
       ('PAY-OUT-009', 'outbound', 20, '2026-02-01', 33040.00, 'bank_transfer', 'TXN-NEFT-556677', 'Full payment BILL-2026-009 Foam materials', 'posted', 1),
       ('PAY-OUT-010', 'outbound', 2, '2026-02-01', 40000.00, 'cheque', 'CHQ-998877', 'Additional payment XYZ Traders', 'posted', 1)`
        );
        console.log('✓ Payments created (20 payments: 10 inbound + 10 outbound)');

        // Create Payment Allocations
        await runQuery(
            `INSERT INTO payment_allocations (payment_id, invoice_id, bill_id, amount)
       VALUES 
       (1, 1, NULL, 218300.00),
       (2, 2, NULL, 60000.00),
       (3, 4, NULL, 100300.00),
       (4, 5, NULL, 100000.00),
       (5, 9, NULL, 120000.00),
       (6, NULL, 1, 212400.00),
       (7, NULL, 2, 50000.00),
       (8, NULL, 4, 53100.00),
       (9, NULL, 5, 80000.00),
       (10, NULL, NULL, 50000.00),
       (11, NULL, NULL, 75000.00),
       (12, NULL, NULL, 90000.00),
       (13, NULL, NULL, 125000.00),
       (14, NULL, NULL, 80000.00),
       (15, NULL, NULL, 50000.00),
       (16, NULL, 3, 60000.00),
       (17, NULL, 5, 50000.00),
       (18, NULL, 6, 41300.00),
       (19, NULL, 9, 33040.00),
       (20, NULL, 2, 40000.00)`
        );
        console.log('✓ Payment allocations created (20 allocations)');

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