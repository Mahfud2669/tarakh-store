#!/bin/bash

echo "🔧 Fixing Next.js HTTP 500 errors..."

# Clean up
echo "📁 Cleaning up..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install missing types
echo "🔤 Installing TypeScript types..."
npm install -D @types/node@^20.10.0 @types/react@^18.2.45 @types/react-dom@^18.2.18 typescript@^5.3.3

# Build and start
echo "🚀 Starting development server..."
npm run dev
