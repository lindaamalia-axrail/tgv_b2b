# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd playwright-tests
npm install
npx playwright install chromium
```

### 2. Run Your First Test
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/public-web/01-login-authentication.spec.ts

# Run in headed mode (see the browser)
npm run test:headed

# Run in debug mode
npm run test:debug
```

### 3. View Test Results
```bash
# Open HTML report
npm run test:report
```

## Project Structure

```
playwright-tests/
├── tests/                          # Test files
│   ├── admin-portal/              # Admin portal tests
│   │   └── 01-admin-login.spec.ts
│   └── public-web/                # Public web tests
│       ├── 01-login-authentication.spec.ts
│       └── 02-buy-vouchers.spec.ts
├── pages/                          # Page Object Models
│   ├── admin-portal/
│   │   └── LoginPage.ts
│   └── public-web/
│       ├── LoginPage.ts
│       └── SignUpPage.ts
├── utils/                          # Utilities
│   ├── test-data.ts               # Test data & credentials
│   └── helpers.ts                 # Helper functions
├── playwright.config.ts            # Playwright configuration
└── package.json                    # Dependencies
```

## Test Credentials

### Admin Portal
- URL: https://corpvoucher.fam-stg.click/login
- Email: najwa+10@axrail.com
- Password: P@ssw0rd10

### Public Web
- URL: https://corporate-voucher-stg.fam-stg.click/
- Email: lindaamalia@axrail.com
- Password: Rahasia 567_

## Common Commands

```bash
# Run all tests
npm test

# Run tests for specific platform
npm run test:admin      # Admin portal only
npm run test:public     # Public web only

# Run with UI
npm run test:headed

# Debug mode
npm run test:debug

# Run specific test
npx playwright test tests/public-web/01-login-authentication.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Generate code (record actions)
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/

# View last test report
npm run test:report
```

## Writing Your First Test

### 1. Create a new test file
```typescript
// tests/public-web/my-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Test Suite', () => {
  test('My first test', async ({ page }) => {
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await expect(page).toHaveTitle(/TGV/);
  });
});
```

### 2. Run your test
```bash
npx playwright test tests/public-web/my-test.spec.ts
```

### 3. Debug if needed
```bash
npx playwright test tests/public-web/my-test.spec.ts --debug
```

## Using Page Objects

```typescript
import { PublicLoginPage } from '../../pages/public-web/LoginPage';
import { PUBLIC_WEB } from '../../utils/test-data';

test('Login test', async ({ page }) => {
  const loginPage = new PublicLoginPage(page);
  
  await loginPage.navigate();
  await loginPage.login(
    PUBLIC_WEB.EXISTING_USER.email,
    PUBLIC_WEB.EXISTING_USER.password
  );
  await loginPage.verifyLoginSuccess();
});
```

## Useful Playwright Features

### 1. Auto-waiting
Playwright automatically waits for elements to be ready:
```typescript
await page.click('button'); // Waits for button to be visible and enabled
```

### 2. Multiple assertions
```typescript
await expect(page.locator('.title')).toBeVisible();
await expect(page.locator('.title')).toHaveText('Welcome');
await expect(page).toHaveURL(/dashboard/);
```

### 3. Screenshots on failure
Automatically captured in `test-results/` folder

### 4. Video recording
Videos saved for failed tests in `test-results/`

### 5. Trace viewer
```bash
npx playwright show-trace test-results/trace.zip
```

## Troubleshooting

### Tests failing?
1. Check if browser is installed: `npx playwright install`
2. Run in headed mode to see what's happening: `npm run test:headed`
3. Use debug mode: `npm run test:debug`
4. Check test-results folder for screenshots/videos

### Slow tests?
1. Reduce timeout in playwright.config.ts
2. Use `page.waitForLoadState('domcontentloaded')` instead of 'networkidle'
3. Run tests in parallel (configure workers in config)

### Element not found?
1. Use Playwright Inspector: `npm run test:debug`
2. Try different selectors: text, role, test-id
3. Add explicit waits: `await page.waitForSelector('.element')`

## Next Steps

1. ✅ Run existing tests to verify setup
2. 📖 Read IMPLEMENTATION_GUIDE.md for detailed instructions
3. 🔨 Start implementing remaining tests
4. 📊 Monitor test results and fix failures
5. 🚀 Integrate with CI/CD pipeline

## Need Help?

- 📚 [Playwright Documentation](https://playwright.dev)
- 💬 Check IMPLEMENTATION_GUIDE.md
- 🐛 Use `--debug` flag for troubleshooting
- 📧 Contact QA team

---

Happy Testing! 🎭
