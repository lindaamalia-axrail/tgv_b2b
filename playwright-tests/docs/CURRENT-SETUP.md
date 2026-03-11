# Current Test Setup

## Authentication Approach

Due to the admin account requiring password reset after login, we're using the **login before each test** approach.

## How It Works

Each test file has a `beforeEach` hook that:
1. Creates a new LoginPage instance
2. Navigates to the login page
3. Logs in with credentials from `utils/test-data.ts`
4. Waits for page to load

## Test Files

All test files now login before each test:

**Admin Portal:**
- `tests/admin-portal/01-admin-login.spec.ts` - Tests login functionality
- `tests/admin-portal/02-password-policy.spec.ts` - Tests password policies
- `tests/admin-portal/03-content-management.spec.ts` - Tests content management (20 tests)
- `tests/admin-portal/04-corporate-management.spec.ts` - Tests corporate management (15 tests)
- `tests/admin-portal/05-user-management.spec.ts` - Tests user management (25 tests)
- `tests/admin-portal/06-reports.spec.ts` - Tests reports (14 tests)

**Public Web:**
- `tests/public-web/01-login-authentication.spec.ts` - Tests login functionality
- `tests/public-web/02-buy-vouchers.spec.ts` - Tests voucher purchase (17 tests)
- `tests/public-web/03-send-vouchers.spec.ts` - Tests sending vouchers (10 tests)
- `tests/public-web/04-my-order.spec.ts` - Tests order management (15 tests)

## Running Tests

### Run all tests:
```bash
npx playwright test
```

### Run specific test file:
```bash
npx playwright test tests/admin-portal/03-content-management.spec.ts
```

### Run in headed mode (visible browser):
```bash
npx playwright test tests/admin-portal/03-content-management.spec.ts --headed
```

### Run specific test:
```bash
npx playwright test tests/admin-portal/03-content-management.spec.ts -g "TC_CMS001"
```

## Credentials

Credentials are stored in `utils/test-data.ts`:

**Admin Portal:**
- Email: `najwa+10@axrail.com`
- Password: `Rahasia123@`

**Public Web:**
- Email: `lindaamalia@axrail.com`
- Password: `Rahasia 567_`

## Future Optimization

Once the admin account password reset is completed, we can optimize to use saved authentication state:
1. Login once in a setup project
2. Save session cookies/tokens
3. Reuse saved state across all tests
4. This will make tests run much faster

For now, the current approach works reliably even with the password reset requirement.
