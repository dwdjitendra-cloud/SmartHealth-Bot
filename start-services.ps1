# SmartHealth-Bot Startup Script for Windows PowerShell
Write-Host "🚀 Starting SmartHealth-Bot Services..." -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $result = netstat -ano | Select-String ":$Port "
    return $result.Count -gt 0
}

# Function to kill processes on port
function Stop-ProcessOnPort {
    param([int]$Port)
    $processes = netstat -ano | Select-String ":$Port " | ForEach-Object {
        $fields = $_ -split '\s+'
        $fields[4]
    }
    foreach ($processId in $processes) {
        if ($processId -and $processId -ne "0") {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process $processId on port $Port" -ForegroundColor Yellow
            } catch {
                # Ignore errors
            }
        }
    }
}

Write-Host "Checking and cleaning up ports..." -ForegroundColor Yellow

# Stop any existing processes
Stop-ProcessOnPort 5000
Stop-ProcessOnPort 5001  
Stop-ProcessOnPort 5173

Start-Sleep -Seconds 2

Write-Host "📊 Starting AI Model Service on port 5001..." -ForegroundColor Cyan
Set-Location "ai-model"
Start-Process -FilePath "python" -ArgumentList "app.py" -WindowStyle Normal
Set-Location ".."
Start-Sleep -Seconds 5

Write-Host "🖥️  Starting Server on port 5000..." -ForegroundColor Cyan
Set-Location "server"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
Set-Location ".."
Start-Sleep -Seconds 3

Write-Host "🌐 Starting Client on port 5173..." -ForegroundColor Cyan
Set-Location "client"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
Set-Location ".."

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "📊 AI Model: http://localhost:5001" -ForegroundColor Blue
Write-Host "🖥️  Server: http://localhost:5000" -ForegroundColor Blue
Write-Host "🌐 Client: http://localhost:5173" -ForegroundColor Blue
Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "Stopping all services..." -ForegroundColor Red
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ All services stopped." -ForegroundColor Green