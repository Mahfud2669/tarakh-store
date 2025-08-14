@echo off
echo 🧹 Cleaning project dependencies...

REM Remove problematic files
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules

echo 📦 Installing fresh dependencies...
npm install

echo 🔧 Installing bcryptjs specifically...
npm install bcryptjs --save
npm install @types/bcryptjs --save-dev

echo ✅ Dependencies installed successfully!
echo 🚀 Starting development server...
npm run dev
pause
