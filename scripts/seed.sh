#!/bin/bash

echo "🌱 Seeding database with sample data..."

# Check if backend container is running
if [ ! "$(docker ps -q -f name=library-backend)" ]; then
    echo "❌ Backend container is not running!"
    echo "Please start the services first with: docker compose up -d"
    exit 1
fi

# Run seed script in backend container
echo "📝 Creating admin, librarian, and sample data..."
docker exec library-backend npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo ""
    echo "📝 Login credentials:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Admin:     admin@library.com / admin123"
    echo "Librarian: librarian@library.com / admin123"
    echo "Reader:    reader@library.com / admin123"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Failed to seed database!"
    exit 1
fi
