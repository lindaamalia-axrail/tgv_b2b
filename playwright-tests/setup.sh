#!/bin/bash

echo "🎭 TGV Corporate Voucher - Playwright Test Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✅ Playwright browsers installed successfully"
echo ""

# Create screenshots directory
mkdir -p screenshots

echo "📁 Created screenshots directory"
echo ""

# Run a quick test to verify setup
echo "🧪 Running verification test..."
npx playwright test tests/public-web/01-login-authentication.spec.ts --grep "TC001" --reporter=list

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "🚀 Quick Start Commands:"
    echo "  npm test                    # Run all tests"
    echo "  npm run test:headed         # Run with visible browser"
    echo "  npm run test:debug          # Debug mode"
    echo "  npm run test:report         # View test report"
    echo ""
    echo "📖 Documentation:"
    echo "  README.md                   # Full documentation"
    echo "  QUICK_START.md              # Quick start guide"
    echo "  IMPLEMENTATION_GUIDE.md     # Implementation details"
    echo "  PROJECT_SUMMARY.md          # Project overview"
    echo ""
else
    echo ""
    echo "⚠️  Setup completed but verification test failed"
    echo "   This might be due to network issues or site availability"
    echo "   Try running: npm test"
    echo ""
fi
