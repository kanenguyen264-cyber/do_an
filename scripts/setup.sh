#!/bin/bash

echo "🚀 Setting up Fullstack Application..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${BLUE}.env file already exists${NC}"
fi

# Setup Backend
echo -e "\n${BLUE}Setting up Backend (NestJS)...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${BLUE}Backend dependencies already installed${NC}"
fi
cd ..

# Setup Frontend
echo -e "\n${BLUE}Setting up Frontend (React)...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${BLUE}Frontend dependencies already installed${NC}"
fi
cd ..

# Setup Python Service
echo -e "\n${BLUE}Setting up Python Service (FastAPI)...${NC}"
cd python-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"
deactivate
cd ..

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Update .env file with your configuration"
echo -e "2. Run './scripts/start.sh' to start all services"
echo -e "3. Or run services individually:"
echo -e "   - Backend: cd backend && npm run start:dev"
echo -e "   - Frontend: cd frontend && npm run dev"
echo -e "   - Python: cd python-service && source venv/bin/activate && uvicorn main:app --reload"
