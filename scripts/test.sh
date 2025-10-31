#!/bin/bash

echo "🧪 Running tests..."

# Backend tests
echo "Testing backend..."
cd backend
npm test
cd ..

# Frontend tests
echo "Testing frontend..."
cd frontend
npm test
cd ..

echo "✅ Tests completed!"
