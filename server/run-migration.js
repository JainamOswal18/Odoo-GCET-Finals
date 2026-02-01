import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, './database/shiv_furniture.db');
const migrationPath = path.join(__dirname, './database/migrations/001_update_auto_analytical_models.sql');

console.log('Running migration: Update auto_analytical_models table...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

const migration = fs.readFileSync(migrationPath, 'utf8');

db.exec(migration, (err) => {
    if (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Migration completed successfully!');
    console.log('The auto_analytical_models table has been updated.');
    db.close();
});
