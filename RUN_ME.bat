@echo off
chcp 65001 > nul
color 0A
title Landlosen Dev Server
echo Starting Landlosen...
echo.

if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
)

echo.
echo Opening standard browser...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo Starting dev server...
npm run dev
