@echo off
echo 🎭 TGV Corporate Voucher - Playwright Test Setup
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Install Playwright browsers
echo 🌐 Installing Playwright browsers...
call npx playwright install chromium

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install Playwright browsers
    exit /b 1
)

echo ✅ Playwright browsers installed successfully
echo.

REM Create screenshots directory
if not exist "screenshots" mkdir screenshots
echo 📁 Created screenshots directory
echo.

REM Run a quick test to verify setup
echo 🧪 Running verification test...
call npx playwright test tests/public-web/01-login-authentication.spec.ts --grep "TC001" --reporter=list

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo 🚀 Quick Start Commands:
    echo   npm test                    # Run all tests
    echo   npm run test:headed         # Run with visible browser
    echo   npm run test:debug          # Debug mode
    echo   npm run test:report         # View test report
    echo.
    echo 📖 Documentation:
    echo   README.md                   # Full documentation
    echo   QUICK_START.md              # Quick start guide
    echo   IMPLEMENTATION_GUIDE.md     # Implementation details
    echo   PROJECT_SUMMARY.md          # Project overview
    echo.
) else (
    echo.
    echo ⚠️  Setup completed but verification test failed
    echo    This might be due to network issues or site availability
    echo    Try running: npm test
    echo.
)

pause
