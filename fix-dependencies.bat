@echo off
echo 🔧 Installing missing dependencies...

REM Install bcryptjs and its types
npm install bcryptjs
npm install -D @types/bcryptjs

REM Install crypto
npm install crypto-js
npm install -D @types/crypto-js

REM Clean and rebuild
echo 🧹 Cleaning cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 🚀 Starting development server...
npm run dev
pause
