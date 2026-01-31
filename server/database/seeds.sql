require('dotenv').config();
const bcrypt = require('bcryptjs');
const { runQuery, closeDatabase } = require('../src/config/database');

async function seed() {
  try {
    console.log('Starting database seeding...');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await runQuery(
      `INSERT INTO users (login_id, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@shivfurniture.com', hashedPassword, 'System Admin', 'admin']
    );
    console.log('✓ Admin user created');

    await runQuery(
      `INSERT INTO contacts (name, contact_type, email, phone, is_vendor, is_customer, created_by)
       VALUES 
       ('ABC Suppliers', 'vendor', 'abc@supplier.com', '9876543210', 1, 0, 1),
       ('XYZ Customer', 'customer', 'xyz@customer.com', '9123456789', 0, 1, 1),
       ('General Trading Co', 'both', 'general@trading.com', '9111222333', 1, 1, 1)`
    );
    console.log('✓ Sample contacts created');

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
      `INSERT INTO budget_lines (budget_id, analytical_account_id, budgeted_amount)
       VALUES 
       (1, 1, 500000.00),
       (1, 2, 300000.00),
       (1, 3, 150000.00),
       (1, 4, 200000.00)`
    );
    console.log('✓ Sample budget lines created');

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

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');

    await closeDatabase();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
