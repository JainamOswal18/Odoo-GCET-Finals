-- Migration: Update auto_analytical_models table structure
-- This migration updates the auto_analytical_models table to match controller expectations

-- Drop the old table (this will delete existing data)
DROP TABLE IF EXISTS auto_analytical_conditions;
DROP TABLE IF EXISTS auto_analytical_models;

-- Recreate with correct structure
CREATE TABLE IF NOT EXISTS auto_analytical_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status VARCHAR(20) DEFAULT 'new',
    partner_tag VARCHAR(255),
    product_category VARCHAR(255),
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
