# TGV Corporate Voucher - Automated Test Suite

This repository contains automated end-to-end tests for the TGV Corporate Voucher platform using Playwright.

## Test Coverage

Total Test Cases: **405**

### Test Modules:
1. **Login and Authentication** (48 tests) - ✅ Created
2. **Password Policy** (29 tests) - 🔄 Template provided
3. **Buy Vouchers** (54 tests) - ✅ Partially created
4. **Send Vouchers** (60 tests) - 🔄 Template provided
5. **My Order** (36 tests) - 🔄 Template provided
6. **Content Management** (52 tests) - 🔄 Template provided
7. **Corporate Management** (50 tests) - 🔄 Template provided
8. **User Management** (62 tests) - 🔄 Template provided
9. **Reports** (14 tests) - 🔄 Template provided

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
cd playwright-tests
npm install
npx playwright install
```

### Configuration

Test credentials and URLs are configured in `utils/test-data.ts`:

**Admin Portal:**
- URL: https://corpvoucher.fam-stg.click/login
- Email: najwa+10@axrail.com
- Password: P@ssw0rd10

**Public Web:**
- URL: https://corporate-voucher-stg.fam-stg.click/
- Email: lindaamalia@axrail.com
- Password: Rahasia 567_

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suite
```bash
npm run test:admin    # Admin portal tests
npm run test:public   # Public web tests
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/public-web/01-login-authentication.spec.ts
```

### Run tests with specific tag
```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

## Test Structure

```
playwright-tests/
├── tests/
│   ├── admin-portal/
│   │   ├── 01-login.spec.ts
│   │   ├── 02-voucher-management.spec.ts
│   │   ├── 03-corporate-management.spec.ts
│   │   ├── 04-user-management.spec.ts
│   │   ├── 05-content-management.spec.ts
│   │   └── 06-reports.spec.ts
│   └── public-web/
│       ├── 01-login-authentication.spec.ts
│       ├── 02-buy-vouchers.spec.ts
│       ├── 03-send-vouchers.spec.ts
│       ├── 04-my-order.spec.ts
│       └── 05-inventory.spec.ts
├── pages/
│   ├── admin-portal/
│   │   ├── LoginPage.ts
│   │   ├── VoucherPage.ts
│   │   └── ...
│   └── public-web/
│       ├── LoginPage.ts
│       ├── SignUpPage.ts
│       └── ...
├── utils/
│   ├── test-data.ts
│   └── helpers.ts
├── playwright.config.ts
└── package.json
```

## Page Object Model

Tests use the Page Object Model pattern for better maintainability:

```typescript
// Example usage
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

test('Login test', async ({ page }) => {
  const loginPage = new PublicLoginPage(page);
  await loginPage.navigate();
  await loginPage.login(email, password);
  await loginPage.verifyLoginSuccess();
});
```

## Test Data Management

Test data is centralized in `utils/test-data.ts`:

```typescript
import { PUBLIC_WEB, SIGNUP_DATA } from '../../utils/test-data';

// Use in tests
await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
```

## Helper Functions

Common test utilities are available in `utils/helpers.ts`:

```typescript
import { TestHelpers } from '../../utils/helpers';

const helpers = new TestHelpers(page);
await helpers.waitForPageLoad();
await helpers.getOTPFromYopmail(email);
await helpers.takeScreenshot('test-name');
```

## Reporting

After test execution, view the HTML report:

```bash
npm run test:report
```

Reports are generated in:
- HTML: `playwright-report/index.html`
- JSON: `test-results/results.json`
- JUnit: `test-results/results.xml`

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Playwright tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm test
```

## Best Practices

1. **Use Page Objects**: Encapsulate page interactions in page object classes
2. **Data-driven tests**: Use test data files for different test scenarios
3. **Wait strategies**: Use proper wait strategies instead of hard waits
4. **Assertions**: Use Playwright's built-in assertions for better error messages
5. **Screenshots**: Automatically captured on failure
6. **Parallel execution**: Configure workers based on your needs

## Troubleshooting

### Browser not launching
```bash
npx playwright install
```

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120000, // 2 minutes
```

### Flaky tests
- Add proper waits: `await page.waitForLoadState('networkidle')`
- Use `waitForSelector` instead of `waitForTimeout`
- Check for element visibility before interaction

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use Page Object Model
3. Add appropriate test tags (@smoke, @regression)
4. Update this README with new test coverage

## Support

For issues or questions, contact the QA team.
