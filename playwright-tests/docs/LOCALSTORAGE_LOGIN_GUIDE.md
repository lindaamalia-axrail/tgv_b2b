# LocalStorage Authentication Guide

## Overview

This guide explains how to use localStorage injection for authentication in Playwright tests. This method bypasses the login UI by directly injecting authentication tokens into the browser's localStorage, resulting in much faster test execution.

## Benefits

- **Speed**: 5-10x faster than traditional form-based login
- **Reliability**: No dependency on UI elements or network delays
- **Simplicity**: Single function call to authenticate
- **Reusability**: Same tokens can be used across multiple tests

## How It Works

1. Navigate to the application domain
2. Inject Cognito authentication tokens into localStorage
3. Reload the page to apply authentication
4. User is now authenticated without filling forms

## Implementation

### 1. Updated Auth Helper

The `auth-helper.ts` file now includes:

```typescript
// Token storage
export const ADMIN_LOCALSTORAGE_TOKENS = {
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.accessToken': '...',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.idToken': '...',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.refreshToken': '...',
  // ... other tokens
};

// Main function to use
export async function loginViaLocalStorage(
  page: Page, 
  url: string, 
  tokens: Record<string, string> = ADMIN_LOCALSTORAGE_TOKENS
)
```

### 2. Usage in Tests

#### Basic Usage

```typescript
import { test } from '@playwright/test';
import { loginViaLocalStorage, ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';
import { ADMIN_PORTAL } from '../utils/test-data';

test('my test', async ({ page }) => {
  // Login via localStorage
  await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
  
  // Start testing - you're already authenticated!
  await page.goto('https://corpvoucher.fam-stg.click/admin/dashboard');
});
```

#### Using beforeEach Hook

```typescript
test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // All tests in this suite will be pre-authenticated
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
  });

  test('test 1', async ({ page }) => {
    // Already logged in
  });

  test('test 2', async ({ page }) => {
    // Already logged in
  });
});
```

### 3. Testing the Implementation

Run the test script:

```bash
cd playwright-tests
npx ts-node scripts/test-localstorage-login.ts
```

This will:
- Open a browser
- Inject the tokens
- Navigate to the admin portal
- Take a screenshot to verify success

## Token Management

### Getting Fresh Tokens

When tokens expire, you need to update them:

1. Login manually to the application
2. Open browser DevTools (F12)
3. Go to Application > Local Storage
4. Copy all `CognitoIdentityServiceProvider.*` keys and values
5. Update `ADMIN_LOCALSTORAGE_TOKENS` in `auth-helper.ts`

### Token Structure

The tokens include:
- `accessToken`: JWT for API authentication
- `idToken`: JWT with user identity information
- `refreshToken`: Encrypted token for getting new access tokens
- `userData`: User profile information
- `deviceKey`: Device-specific identifier
- `clockDrift`: Time synchronization value

## Comparison: Traditional vs LocalStorage Login

### Traditional Login (Form-based)
```typescript
await page.goto(ADMIN_PORTAL.URL);
await page.fill('input[name="username"]', email);
await page.fill('input[name="password"]', password);
await page.click('button[type="submit"]');
await page.waitForLoadState('networkidle');
// Time: ~3-5 seconds
```

### LocalStorage Login
```typescript
await loginViaLocalStorage(page, ADMIN_PORTAL.URL);
// Time: ~0.5-1 second
```

## Best Practices

1. **Use for Speed**: Use localStorage injection for most tests
2. **Test Login UI Separately**: Keep a few tests that verify the actual login form works
3. **Update Tokens Regularly**: Refresh tokens when they expire (typically every few hours)
4. **Environment-Specific**: Different environments may need different tokens
5. **Security**: Don't commit real production tokens to version control

## Troubleshooting

### Issue: Still redirected to login page

**Cause**: Tokens may be expired or invalid

**Solution**: Get fresh tokens from a manual login session

### Issue: localStorage not persisting

**Cause**: Must navigate to domain before injecting tokens

**Solution**: Ensure `page.goto(url)` is called before `injectAuthTokens()`

### Issue: Authentication works but API calls fail

**Cause**: Access token may be expired

**Solution**: Update the `accessToken` specifically

## Example Files

- `utils/auth-helper.ts` - Core implementation
- `scripts/test-localstorage-login.ts` - Test script
- `examples/login-with-localstorage.spec.ts` - Example test suite

## Migration Guide

To migrate existing tests:

### Before
```typescript
test('my test', async ({ page }) => {
  await page.goto(ADMIN_PORTAL.URL);
  await page.fill('input[name="username"]', ADMIN_PORTAL.CREDENTIALS.email);
  await page.fill('input[name="password"]', ADMIN_PORTAL.CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  // Test logic
});
```

### After
```typescript
test('my test', async ({ page }) => {
  await loginViaLocalStorage(page, ADMIN_PORTAL.URL);
  
  // Test logic - same as before
});
```

## Notes

- Tokens are user-specific (currently for `adminusertgv01@yopmail.com`)
- Tokens expire after a certain period (check `exp` claim in JWT)
- The refresh token can be used to get new access tokens programmatically
- This method works with AWS Cognito authentication

## Next Steps

1. Run the test script to verify it works
2. Update your existing test files to use localStorage login
3. Set up a process to refresh tokens when needed
4. Consider creating different token sets for different user roles
