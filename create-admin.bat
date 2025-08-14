@echo off
echo 🔧 Creating new admin account...

echo 📦 Installing bcryptjs if needed...
npm install bcryptjs

echo 🔐 Generating password hash...
node scripts/create-admin-hash.js

echo.
echo ➕ Creating admin account in database...
node scripts/create-admin-account.js

echo.
echo ✅ Admin account creation completed!
echo.
echo 🔑 Login credentials:
echo Email: mahfud@yopmail.com
echo Password: password123
echo.
pause
