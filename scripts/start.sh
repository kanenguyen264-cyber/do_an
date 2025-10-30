#!/bin/bash

echo "🚀 Starting all services..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Check ports
if check_port 3001; then
    echo -e "${BLUE}⚠️  Port 3001 is already in use (Backend)${NC}"
fi

if check_port 5173; then
    echo -e "${BLUE}⚠️  Port 5173 is already in use (Frontend)${NC}"
fi

if check_port 8000; then
    echo -e "${BLUE}⚠️  Port 8000 is already in use (Python Service)${NC}"
fi

echo -e "\n${GREEN}Starting services in separate terminal windows...${NC}"

# Start Backend
echo -e "${BLUE}Starting Backend...${NC}"
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run start:dev"'

# Wait a bit
sleep 2

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"'

# Wait a bit
sleep 2

# Start Python Service
echo -e "${BLUE}Starting Python Service...${NC}"
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/python-service && source venv/bin/activate && uvicorn main:app --reload --port 8000"'

echo -e "\n${GREEN}✅ All services are starting!${NC}"
echo -e "\n${BLUE}Access the application at:${NC}"
echo -e "  Frontend:  http://localhost:5173"
echo -e "  Backend:   http://localhost:3001"
echo -e "  Python:    http://localhost:8000"
echo -e "  API Docs:  http://localhost:3001/api"
echo -e "  FastAPI:   http://localhost:8000/docs"
