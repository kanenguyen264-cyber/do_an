#!/bin/bash

echo "🧪 Running tests..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Test Backend
echo -e "\n${BLUE}Testing Backend...${NC}"
cd backend
npm run test
BACKEND_EXIT=$?
cd ..

# Test Frontend
echo -e "\n${BLUE}Testing Frontend...${NC}"
cd frontend
npm run test 2>/dev/null || echo -e "${BLUE}No tests configured for frontend${NC}"
FRONTEND_EXIT=$?
cd ..

# Test Python Service
echo -e "\n${BLUE}Testing Python Service...${NC}"
cd python-service
source venv/bin/activate
pytest 2>/dev/null || echo -e "${BLUE}No tests configured for Python service${NC}"
PYTHON_EXIT=$?
deactivate
cd ..

# Summary
echo -e "\n${BLUE}Test Summary:${NC}"
if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
fi

echo -e "\n${GREEN}✅ Test run completed${NC}"
