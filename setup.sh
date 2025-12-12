#!/bin/bash

# Resource Management System - Automated Setup Script
# This script sets up the authentication microservice from scratch

echo "🚀 Resource Management System - Setup Started"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

echo "✅ Docker found"

# Step 1: Install dependencies
echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

# Step 2: Start PostgreSQL
echo ""
echo "🐘 Step 2: Starting PostgreSQL..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker container"
    exit 1
fi

echo "✅ PostgreSQL container started"

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Step 3: Generate Prisma Client
echo ""
echo "📝 Step 3: Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client generated"

# Step 4: Run migrations
echo ""
echo "🗂️  Step 4: Running database migrations..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi
echo "✅ Migrations completed"

# Step 5: Success message
echo ""
echo "=============================================="
echo "✅ Setup completed successfully!"
echo "=============================================="
echo ""
echo "📖 Next steps:"
echo "1. Start development server:"
echo "   npm run start:dev"
echo ""
echo "2. API will be available at:"
echo "   http://localhost:3001/api/v1"
echo ""
echo "3. Test the API:"
echo "   curl -X POST http://localhost:3001/api/v1/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"firstName\":\"Test\"}'"
echo ""
echo "📚 For more info, see:"
echo "   - QUICKSTART.md for quick start guide"
echo "   - API_EXAMPLES.md for API documentation"
echo "   - README.md for full documentation"
echo ""
