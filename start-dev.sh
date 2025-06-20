#!/bin/bash

# HomeWiz Frontend Development Server Startup Script
echo "🏠 Starting HomeWiz Frontend Development Server"
echo "================================================"

# Load NVM and use Node.js v20.19.0
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo "📦 Switching to Node.js v20.19.0..."
nvm use v20.19.0

echo "🔍 Verifying Node.js version..."
node --version
npm --version

echo "🧹 Cleaning build cache..."
rm -rf .next

echo "🚀 Starting Next.js development server..."
npx next dev
