#!/bin/bash

echo "🚀 Setting up Library Management System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your Supabase credentials"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
npx prisma generate
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd python-service
pip install -r requirements.txt
cd ..

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Run 'npm run prisma:migrate' in backend directory to create database tables"
echo "3. Run 'npm run prisma:seed' in backend directory to seed initial data"
echo "4. Run './scripts/start.sh' to start all services"
