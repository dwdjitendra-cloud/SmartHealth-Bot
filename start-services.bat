@echo off
echo 🚀 Starting SmartHealth-Bot Services...

REM Check if ports are available
echo Checking port availability...
netstat -ano | findstr ":5000" > nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5000 is already in use
    taskkill /f /im node.exe > nul 2>&1
)

netstat -ano | findstr ":5001" > nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5001 is already in use
    taskkill /f /im python.exe > nul 2>&1
)

netstat -ano | findstr ":5173" > nul
if %errorlevel% == 0 (
    echo ⚠️  Port 5173 is already in use
)

echo.
echo 📊 Starting AI Model Service on port 5001...
cd ai-model
start "AI Model" python app.py
cd ..
timeout /t 5 > nul

echo.
echo 🖥️  Starting Server on port 5000...
cd server
start "Server" npm run dev
cd ..
timeout /t 3 > nul

echo.
echo 🌐 Starting Client on port 5173...
cd client
start "Client" npm run dev
cd ..

echo.
echo ✅ All services started!
echo 📊 AI Model: http://localhost:5001
echo 🖥️  Server: http://localhost:5000
echo 🌐 Client: http://localhost:5173
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping all services...
taskkill /f /im node.exe > nul 2>&1
taskkill /f /im python.exe > nul 2>&1
echo ✅ All services stopped.