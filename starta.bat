@echo off
title Lär dig! - lokal server
cd /d "%~dp0"
echo.
echo Startar Lär dig! ...
echo Öppnar webbläsaren på http://localhost:8765/index.html
echo Stäng det här fönstret när du är klar.
echo.
start "" "http://localhost:8765/index.html"
python -m http.server 8765
pause
