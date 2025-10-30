#!/bin/bash

echo "🛑 Stopping all services..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to kill process on port
kill_port() {
    PORT=$1
    NAME=$2
    PID=$(lsof -ti :$PORT)
    if [ ! -z "$PID" ]; then
        kill -9 $PID
        echo -e "${GREEN}✓ Stopped $NAME (port $PORT)${NC}"
    else
        echo -e "${RED}✗ No process found on port $PORT${NC}"
    fi
}

# Stop services
kill_port 3001 "Backend"
kill_port 5173 "Frontend"
kill_port 8000 "Python Service"

echo -e "\n${GREEN}✅ All services stopped${NC}"
