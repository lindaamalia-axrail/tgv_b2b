# Authentication Setup

## Overview

The test suite uses Playwright's authentication state feature to login once and reuse the session across all tests. This makes tests run much faster and more efficiently.

## How It Works

### 1. Setup Project
- Located in `tests/setup/auth.setup.ts`
- Runs automatically before all other tests
- Performs login for both Admin Portal and Public Web
- Saves authentication state to `.auth/admin.json` and `.auth/public.json`

### 2. Test Projects
The configuration defines 5 projects:

**Setup Project:**
- `setup` - Runs authentication setup

**Admin Portal Projects:**
- `admin-login` - Tests login functionality (no saved auth)
- `admin-portal` - All other admin tests (uses saved auth from `.auth/admin.json`)

**Public Web Projects:**
- `public-login` - Tests login functionality (no saved auth)
- `public-web` - All other public tests (uses saved auth from `.auth/public.json`)

### 3. Test Files

**Files that login fresh every time:**
- `tests/admin-portal/01-admin-login.spec.ts`
- `tests/admin-portal/02-password-policy.spec.ts`
- `tests/public-web/01-login-authentication.spec.ts`

**Files that use saved authentication (login only once):**
- `tests/admin-portal/03-content-management.spec.ts`
- `tests/admin-portal/04-corporate-management.spec.ts`
- `tests/admin-portal/05-user-management.spec.ts`
- `tests/admin-portal/06-reports.spec.ts`
- `tests/public-web/02-buy-vouchers.spec.ts`
- `tests/public-web/03-send-vouchers.spec.ts`
- `tests/public-web/04-my-order.spec.ts`

## Running Tests

### Run all tests (setup runs automatically):
```bash
npx playwright test
```

### Run specific project:
```bash
npx playwright test --project=admin-portal
npx playwright test --project=public-web
```

### Run specific test file:
```bash
npx playwright test tests/admin-portal/03-content-management.spec.ts
```

The setup project will run first automatically, then your tests will use the saved authentication.

### Run only setup:
```bash
npx playwright test --project=setup
```

## Benefits

1. **Faster execution** - Login happens once, not before every test
2. **More reliable** - Reduces network calls and potential login failures
3. **Better test isolation** - Each test still gets a fresh browser context
4. **Easier maintenance** - Login logic centralized in one place

## Authentication Files

The `.auth/` directory contains:
- `admin.json` - Admin portal session cookies/tokens
- `public.json` - Public web session cookies/tokens

These files are:
- Generated automatically by the setup project
- Ignored by git (in `.gitignore`)
- Recreated on each test run

## Troubleshooting

If tests fail with authentication errors:

1. Delete the auth files and run setup again:
```bash
rm -rf .auth
npx playwright test --project=setup
```

2. Check if credentials are correct in `utils/test-data.ts`

3. Verify the setup project completed successfully:
```bash
npx playwright test --project=setup --reporter=list
```
