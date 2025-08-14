@echo off
echo 🔧 Installing bcryptjs...

npm install bcryptjs
npm install -D @types/bcryptjs

echo ✅ bcryptjs installed successfully!
echo 🚀 Starting development server...
npm run dev
pause
