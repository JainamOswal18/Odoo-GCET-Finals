-- Migration: Add countries table and update contacts table
-- This migration adds a countries reference table and updates contacts to use it

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iso2 VARCHAR(2) UNIQUE NOT NULL,
    iso3 VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_code VARCHAR(10) NOT NULL,
    currency VARCHAR(10),
    currency_symbol VARCHAR(10),
    capital VARCHAR(255),
    region VARCHAR(100),
    subregion VARCHAR(100),
    flag VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on country name for fast searching
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_countries_iso2 ON countries(iso2);

-- Create states table
CREATE TABLE IF NOT EXISTS states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    state_code VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE INDEX idx_states_country ON states(country_id);
CREATE INDEX idx_states_name ON states(name);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    country_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE INDEX idx_cities_state ON cities(state_id);
CREATE INDEX idx_cities_country ON cities(country_id);
CREATE INDEX idx_cities_name ON cities(name);

-- Add country_id to contacts table (if not exists)
-- Note: Run this after populating countries table
-- ALTER TABLE contacts ADD COLUMN country_id INTEGER REFERENCES countries(id);
-- ALTER TABLE contacts ADD COLUMN state_id INTEGER REFERENCES states(id);
-- ALTER TABLE contacts ADD COLUMN city_id INTEGER REFERENCES cities(id);
