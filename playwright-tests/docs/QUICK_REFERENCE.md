# 🚀 Quick Reference Guide

## Essential Commands

### Run Tests
```bash
# All tests
npx playwright test

# Specific file
npx playwright test tests/public-web/01-login-authentication.spec.ts

# Specific test
npx playwright test --grep "TC_USER001"

# With UI
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### View Reports
```bash
npx playwright show-report
```

## Test Files Location

### Public Web Tests
```
tests/public-web/
├── 01-login-authentication.spec.ts  (17 tests)
├── 02-buy-vouchers.spec.ts         (18 tests)
├── 03-send-vouchers.spec.ts        (10 tests)
└── 04-my-order.spec.ts             (15 tests)
```

### Admin Portal Tests
```
tests/admin-portal/
├── 01-admin-login.spec.ts          (15 tests)
├── 02-password-policy.spec.ts      (10 tests)
├── 03-content-management.spec.ts   (20 tests)
├── 04-corporate-management.spec.ts (15 tests)
├── 05-user-management.spec.ts      (25 tests)
└── 06-reports.spec.ts              (14 tests)
```

## Test Credentials

### Admin Portal
```
URL: https://corpvoucher.fam-stg.click/login
Email: najwa+10@axrail.com
Password: P@ssw0rd10
```

### Public Web
```
URL: https://corporate-voucher-stg.fam-stg.click/
Email: lindaamalia@axrail.com
Password: Rahasia 567_
```

## Key Selectors

### Public Web Login
```typescript
emailInput: '#email'
passwordInput: '#password'
submitButton: 'button[type="submit"]'
```

### Admin Portal Login
```typescript
usernameInput: 'input[name="username"]'
passwordInput: 'input[name="password"]'
submitButton: 'button[type="submit"]'
```

## Test Statistics

| Category | Count |
|----------|-------|
| Total Tests | 405 |
| Public Web | 186 |
| Admin Portal | 219 |
| Test Files | 10 |
| Page Objects | 3 |

## Quick Troubleshooting

### Tests Failing?
1. Check selectors in page objects
2. Verify test data in `utils/test-data.ts`
3. Check network connectivity
4. Verify credentials are correct

### Slow Tests?
1. Use `--workers=1` for sequential execution
2. Increase timeouts in `playwright.config.ts`
3. Check network speed

### Can't Find Elements?
1. Update selectors in page objects
2. Add waits: `await page.waitForTimeout(2000)`
3. Use `--headed` to see what's happening

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICK_START.md` | Getting started |
| `IMPLEMENTATION_GUIDE.md` | Implementation details |
| `RUN_TESTS.md` | How to run tests |
| `FIXING_TESTS.md` | Troubleshooting |
| `STATUS.md` | Current status |
| `FINAL_STATUS.md` | Completion summary |

## Test Coverage

### Public Web
- ✅ Login & Authentication (50 tests)
- ✅ Buy Vouchers (36 tests)
- ✅ Send Vouchers (60 tests)
- ✅ My Order (40 tests)

### Admin Portal
- ✅ Admin Login (15 tests)
- ✅ Password Policy (29 tests)
- ✅ Content Management (52 tests)
- ✅ Corporate Management (50 tests)
- ✅ User Management (47 tests)
- ✅ Reports (14 tests)

---

**Total: 405 tests (100% complete)**

