@echo off
title AgriSense
cd /d "%~dp0"
echo.
echo  Starting AgriSense...
echo  Your browser will open at http://localhost:3000
echo  Keep this window open. Press Ctrl+C to stop.
echo.
start "" http://localhost:3000
node server.js
echo.
echo  Server stopped. Press any key to close.
pause >nul
