#!/bin/bash

echo "🔧 Fixing Next.js asset loading issues..."

echo "1. Killing any existing Next.js processes..."
pkill -f "next" 2>/dev/null || true

echo "2. Clearing all caches..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "3. Building fresh assets..."
npm run build

echo "✅ Asset fix complete!"
echo ""
echo "Now run one of these commands:"
echo "  npm run dev:clean    (starts dev server with fresh cache)"
echo "  npm run dev          (starts normal dev server)"
echo ""
echo "Then hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)"