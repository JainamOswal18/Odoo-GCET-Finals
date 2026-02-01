#!/bin/bash

# Script to reinitialize the database

echo "🗑️  Deleting old database..."
rm -f database/shiv_furniture.db
rm -f database/shiv_furniture.db-shm
rm -f database/shiv_furniture.db-wal

echo "📦 Creating new database from schema..."
sqlite3 database/shiv_furniture.db < database/schema.sql

echo "🌍 Seeding countries, states, and cities..."
node database/migrations/seed-countries.js

echo "📊 Seeding application data..."
npm run seed

echo "✅ Database reinitialized successfully!"
echo ""
echo "You can now start the server: npm run dev"
