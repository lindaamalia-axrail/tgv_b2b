# 🎬 How to Run Tests - Visual Guide

## 🚀 First Time Setup

### Step 1: Open Terminal
- **Mac**: Press `Cmd + Space`, type "Terminal"
- **Windows**: Press `Win + R`, type "cmd"

### Step 2: Navigate to Project
```bash
cd /Users/lindanrsn/Documents/tgv-b2b/playwright-tests
```

### Step 3: Run Setup
**Mac/Linux:**
```bash
./setup.sh
```

**Windows:**
```bash
setup.bat
```

This will:
- ✅ Install all dependencies
- ✅ Install Playwright browsers
- ✅ Run a verification test
- ✅ Show you're ready to go!

---

## 🎯 Running Tests

### Run ALL Tests
```bash
npm test
```
**What it does**: Runs all 50 implemented tests
**Time**: ~5-10 minutes
**Output**: Terminal output + HTML report

### Run Tests with Visible Browser
```bash
npm run test:headed
```
**What it does**: Opens browser so you can see what's happening
**Best for**: Understanding test flow, debugging
**Time**: Slower (you can watch each step)

### Run in Debug Mode
```bash
npm run test:debug
```
**What it does**: Opens Playwright Inspector
**Best for**: Step-by-step debugging, finding issues
**Features**: 
- Pause/resume execution
- Step through each action
- Inspect elements
- View console logs

### Run Specific Test File
```bash
# Login tests only
npx playwright test tests/public-web/01-login-authentication.spec.ts

# Buy voucher tests only
npx playwright test tests/public-web/02-buy-vouchers.spec.ts

# Admin login tests only
npx playwright test tests/admin-portal/01-admin-login.spec.ts
```

### Run Specific Test by Name
```bash
# Run only tests with "login" in the name
npx playwright test --grep "login"

# Run only tests with "TC001" in the name
npx playwright test --grep "TC001"

# Run only positive tests
npx playwright test --grep "Positive"
```

### Run Tests for Specific Platform
```bash
# Public web tests only
npm run test:public

# Admin portal tests only
npm run test:admin
```

---

## 📊 Viewing Test Results

### View HTML Report
```bash
npm run test:report
```
**What it does**: Opens beautiful HTML report in browser
**Shows**:
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- ⏭️ Skipped tests (yellow)
- Screenshots of failures
- Video recordings
- Execution time

### View Results in Terminal
After running tests, you'll see:
```
Running 50 tests using 1 worker

  ✓ TC001: Public Browse Functionality (2.5s)
  ✓ TC002: View voucher detail pages (1.8s)
  ✓ TC003: Display voucher information (2.1s)
  ...

  50 passed (2.3m)
```

---

## 🔍 Debugging Failed Tests

### Step 1: Run in Headed Mode
```bash
npm run test:headed
```
Watch the browser to see where it fails

### Step 2: Use Debug Mode
```bash
npm run test:debug
```
Step through the test line by line

### Step 3: Check Screenshots
Failed tests automatically save screenshots:
```
test-results/
  └── test-name/
      ├── test-failed-1.png
      └── video.webm
```

### Step 4: Check Logs
Look at terminal output for error messages:
```
Error: Timeout 30000ms exceeded.
  waiting for locator('button:has-text("Submit")')
```

---

## 🎨 Test Execution Examples

### Example 1: Quick Smoke Test
```bash
# Run only critical tests
npx playwright test --grep "@smoke"
```

### Example 2: Full Regression
```bash
# Run all tests with retries
npm test
```

### Example 3: Debug Specific Failure
```bash
# Run one test in debug mode
npx playwright test tests/public-web/01-login-authentication.spec.ts --grep "TC001" --debug
```

### Example 4: Run on Different Browser
```bash
# Run on Firefox
npx playwright test --project=firefox

# Run on WebKit (Safari)
npx playwright test --project=webkit
```

---

## 📈 Understanding Test Output

### Terminal Output
```
Running 17 tests using 1 worker

  ✓ [chromium] › 01-login-authentication.spec.ts:10:3 › TC001 (2.5s)
  ✓ [chromium] › 01-login-authentication.spec.ts:20:3 › TC002 (1.8s)
  ✗ [chromium] › 01-login-authentication.spec.ts:30:3 › TC003 (5.2s)

  1 failed
    [chromium] › 01-login-authentication.spec.ts:30:3 › TC003
  16 passed (45.3s)
```

**Legend:**
- ✓ = Test passed
- ✗ = Test failed
- ⏭ = Test skipped
- (2.5s) = Execution time

### HTML Report
Open with: `npm run test:report`

**Shows:**
- Test summary with pass/fail counts
- Detailed test results
- Screenshots for each step
- Video recordings of failures
- Console logs
- Network requests
- Execution timeline

---

## 🛠️ Common Commands Cheat Sheet

```bash
# Setup (first time only)
./setup.sh                          # Mac/Linux
setup.bat                           # Windows

# Run tests
npm test                            # All tests
npm run test:headed                 # With visible browser
npm run test:debug                  # Debug mode

# Run specific tests
npx playwright test tests/public-web/01-login-authentication.spec.ts
npx playwright test --grep "login"

# View results
npm run test:report                 # HTML report

# Generate new test
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/

# Update browsers
npx playwright install

# Clear test results
rm -rf test-results playwright-report
```

---

## 🎯 Quick Troubleshooting

### Problem: "Command not found: npm"
**Solution**: Install Node.js from https://nodejs.org

### Problem: "Browser not found"
**Solution**: 
```bash
npx playwright install
```

### Problem: Tests timing out
**Solution**: Check internet connection, site might be slow
```bash
# Increase timeout
npx playwright test --timeout=60000
```

### Problem: Element not found
**Solution**: Use debug mode to inspect
```bash
npm run test:debug
```

### Problem: Tests pass locally but fail in CI
**Solution**: Check environment differences, add waits
```typescript
await page.waitForLoadState('networkidle');
```

---

## 📞 Need Help?

1. **Check documentation**:
   - README.md
   - QUICK_START.md
   - IMPLEMENTATION_GUIDE.md

2. **Use debug mode**:
   ```bash
   npm run test:debug
   ```

3. **Check Playwright docs**:
   https://playwright.dev

4. **Contact QA team**

---

## 🎉 Success Indicators

You'll know tests are working when you see:
- ✅ Green checkmarks in terminal
- ✅ "X passed" message
- ✅ HTML report shows all green
- ✅ No error screenshots in test-results/

---

**Happy Testing! 🎭**

Remember: 
- Start with `npm run test:headed` to see what's happening
- Use `npm run test:debug` when something fails
- Check `npm run test:report` for detailed results
