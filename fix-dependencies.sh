#!/bin/bash

echo "🔧 Installing missing dependencies..."

# Install bcryptjs and its types
npm install bcryptjs
npm install -D @types/bcryptjs

# Install crypto (should be built-in but let's make sure)
npm install crypto-js
npm install -D @types/crypto-js

# Clean and rebuild
echo "🧹 Cleaning cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "🚀 Starting development server..."
npm run dev
