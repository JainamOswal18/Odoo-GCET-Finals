-- Migration script to update auto_analytical_models table structure
-- Run this to update existing database

-- Drop the old conditions table (no longer needed)
DROP TABLE IF EXISTS auto_analytical_conditions;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_auto_models_type;
DROP INDEX IF EXISTS idx_auto_models_priority;

-- Create backup of existing data (optional - comment out if not needed)
-- CREATE TABLE auto_analytical_models_backup AS SELECT * FROM auto_analytical_models;

-- Drop old table
DROP TABLE IF EXISTS auto_analytical_models;

-- Create new simplified table
CREATE TABLE IF NOT EXISTS auto_analytical_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status VARCHAR(20) DEFAULT 'new',
    partner_tag VARCHAR(100),
    product_category VARCHAR(100),
    partner_id INTEGER,
    product_id INTEGER,
    analytical_account_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES contacts(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (analytical_account_id) REFERENCES analytical_accounts(id),
    CHECK (status IN ('new', 'confirm', 'archived'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_auto_models_status ON auto_analytical_models(status);
CREATE INDEX IF NOT EXISTS idx_auto_models_active ON auto_analytical_models(active);
CREATE INDEX IF NOT EXISTS idx_auto_models_partner ON auto_analytical_models(partner_id);
CREATE INDEX IF NOT EXISTS idx_auto_models_product ON auto_analytical_models(product_id);
CREATE INDEX IF NOT EXISTS idx_auto_models_analytical ON auto_analytical_models(analytical_account_id);

-- Insert sample data for testing
INSERT INTO auto_analytical_models (status, partner_tag, product_category, analytical_account_id) 
SELECT 'confirm', 'VIP', 'Wooden Furniture', id 
FROM analytical_accounts 
WHERE code = 'DEPT-001' OR name LIKE '%Marketing%'
LIMIT 1;

-- Success message
SELECT 'Migration completed successfully!' as message;
