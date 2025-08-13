@echo off
echo 🔧 Fixing Next.js HTTP 500 errors...
echo.

echo 📁 Cleaning up...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🔤 Installing TypeScript types...
npm install -D @types/node@^20.10.0 @types/react@^18.2.45 @types/react-dom@^18.2.18 typescript@^5.3.3

echo.
echo 🚀 Starting development server...
npm run dev
echo.
pause
