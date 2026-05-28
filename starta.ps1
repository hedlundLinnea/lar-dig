# Startar appen lokalt i webbläsaren.
# Kör med högerklick → "Kör med PowerShell" eller dubbelklicka "starta.bat".

$port = 8765
$url = "http://localhost:$port/index.html"

Write-Host ""
Write-Host "Startar Lär dig! ..." -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host "Stäng det här fönstret när du är klar." -ForegroundColor DarkGray
Write-Host ""

# Öppna webbläsaren efter 1.5s
Start-Job -ScriptBlock {
    param($u)
    Start-Sleep -Seconds 1.5
    Start-Process $u
} -ArgumentList $url | Out-Null

# Starta enkel HTTP-server från denna mapp
Set-Location $PSScriptRoot
python -m http.server $port
