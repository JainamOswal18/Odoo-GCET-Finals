#!/bin/bash

echo "================================"
echo "Shiv Furniture Backend Setup"
echo "================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database logs uploads

echo "✓ Directories created"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
node -e "
const { initializeDatabase } = require('./src/config/database');
initializeDatabase()
  .then(() => {
    console.log('✓ Database initialized successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Setup completed successfully!"
echo "================================"
echo ""
echo "Default Admin Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "To start the server:"
echo "  Development: npm run dev"
echo "  Production:  npm start"
echo ""
echo "Server will run on: http://localhost:5000"
echo "================================"