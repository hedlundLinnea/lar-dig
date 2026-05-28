# Startar appen lokalt i webbläsaren.
# Kör med högerklick → "Kör med PowerShell" eller dubbelklicka "starta.bat".

$port = 8765
$url = "http://localhost:$port/index.html"
$wwwPath = Join-Path $PSScriptRoot "www"

Write-Host ""
Write-Host "Startar Barnens ordbok ..." -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host "Stäng det här fönstret när du är klar." -ForegroundColor DarkGray
Write-Host ""

Start-Job -ScriptBlock {
    param($u)
    Start-Sleep -Seconds 1.5
    Start-Process $u
} -ArgumentList $url | Out-Null

Set-Location $wwwPath
python -m http.server $port
