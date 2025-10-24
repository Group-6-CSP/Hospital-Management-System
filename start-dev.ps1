# Starts backend and frontend concurrently (PowerShell)
Push-Location "$PSScriptRoot\backend"
Write-Host "Starting backend..."
Start-Job -ScriptBlock { dotnet run --no-build } | Out-Null
Pop-Location

Start-Sleep -Seconds 1

Push-Location "$PSScriptRoot\frontend"
Write-Host "Starting frontend..."
Start-Job -ScriptBlock { npm start } | Out-Null
Pop-Location

Write-Host "Started backend and frontend jobs. Use Get-Job and Receive-Job to view output."
