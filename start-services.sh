#!/bin/bash
# SmartHealth-Bot Startup Script

echo "🚀 Starting SmartHealth-Bot Services..."

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -ano | findstr ":$port" > /dev/null; then
        echo "⚠️  Port $port is already in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Function to start AI Model
start_ai_model() {
    echo "📊 Starting AI Model Service on port 5001..."
    cd ai-model
    python app.py &
    AI_PID=$!
    echo "AI Model PID: $AI_PID"
    cd ..
}

# Function to start Server
start_server() {
    echo "🖥️  Starting Server on port 5000..."
    cd server
    npm run dev &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    cd ..
}

# Function to start Client
start_client() {
    echo "🌐 Starting Client on port 5173..."
    cd client
    npm run dev &
    CLIENT_PID=$!
    echo "Client PID: $CLIENT_PID"
    cd ..
}

# Check ports availability
check_port 5000
check_port 5001
check_port 5173

# Start services
start_ai_model
sleep 5  # Wait for AI model to load

start_server
sleep 3  # Wait for server to start

start_client

echo "✅ All services started!"
echo "📊 AI Model: http://localhost:5001"
echo "🖥️  Server: http://localhost:5000"
echo "🌐 Client: http://localhost:5173"

# Keep script running
wait