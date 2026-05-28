@echo off
title Barnens ordbok - lokal server
cd /d "%~dp0\www"
echo.
echo Startar Barnens ordbok ...
echo Oppnar webblasaren pa http://localhost:8765/index.html
echo Stang det har fonstret nar du ar klar.
echo.
start "" "http://localhost:8765/index.html"
python -m http.server 8765
pause
