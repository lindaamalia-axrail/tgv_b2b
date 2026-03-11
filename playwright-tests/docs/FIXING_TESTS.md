# 🔧 Fixing Tests - Getting Real Selectors

## ✅ Good News: TypeScript Errors Are Fixed!

The red files are now gone because we installed the dependencies. The tests are now failing because they need the **actual selectors** from your website.

## 🎯 How to Get Real Selectors

### Method 1: Use Playwright Codegen (RECOMMENDED)

This is the easiest way to get correct selectors:

```bash
cd playwright-tests
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/
```

**What happens:**
1. Browser opens with Playwright Inspector
2. Click on elements you want to test
3. Playwright generates the correct selector code
4. Copy the selectors into your test files

**Example:**
- Click "Buy Voucher" button → Get selector: `page.getByRole('link', { name: 'Buy Voucher' })`
- Click login button → Get selector: `page.getByRole('button', { name: 'Sign In' })`

### Method 2: Use Browser DevTools

1. Open the website in Chrome
2. Right-click on element → Inspect
3. In DevTools, right-click the HTML element
4. Copy → Copy selector

### Method 3: Run Test in Debug Mode

```bash
cd playwright-tests
npx playwright test tests/public-web/01-login-authentication.spec.ts --debug
```

**What happens:**
1. Test runs step by step
2. You can see which selector fails
3. Use the inspector to find the correct selector
4. Update your test

## 🛠️ Quick Fix for Current Tests

Let me show you how to fix the first test. Here's the current failing test:

```typescript
test('TC001: Public Browse Functionality', async ({ page }) => {
  await page.goto(PUBLIC_WEB.URL);
  await expect(page.locator('text=Buy Voucher, text=Homepage')).toBeVisible();
  // ❌ This selector is wrong
});
```

### Step-by-Step Fix:

1. **Run codegen to explore the site:**
```bash
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/
```

2. **Click on the "Buy Voucher" link/button**
   - Playwright will show you the correct selector

3. **Update the test with the real selector:**
```typescript
test('TC001: Public Browse Functionality', async ({ page }) => {
  await page.goto(PUBLIC_WEB.URL);
  
  // Option 1: Use role-based selector (most reliable)
  await expect(page.getByRole('link', { name: 'Buy Voucher' })).toBeVisible();
  
  // Option 2: Use text selector (simpler)
  await expect(page.getByText('Buy Voucher')).toBeVisible();
  
  // Option 3: Use CSS selector
  await expect(page.locator('a[href*="buy"]')).toBeVisible();
});
```

## 📝 Common Selector Patterns

### For Navigation Links
```typescript
// ❌ Wrong (too generic)
await page.click('text=Buy Voucher, text=Homepage');

// ✅ Right (specific)
await page.getByRole('link', { name: 'Buy Voucher' }).click();
// or
await page.click('a:has-text("Buy Voucher")');
```

### For Buttons
```typescript
// ❌ Wrong
await page.click('button');

// ✅ Right
await page.getByRole('button', { name: 'Sign In' }).click();
// or
await page.click('button:has-text("Sign In")');
```

### For Input Fields
```typescript
// ❌ Wrong
await page.fill('input', 'value');

// ✅ Right
await page.getByLabel('Email').fill('test@example.com');
// or
await page.fill('input[name="email"]', 'test@example.com');
// or
await page.fill('input[type="email"]', 'test@example.com');
```

### For Cards/Products
```typescript
// ❌ Wrong
await page.locator('.voucher-card').first().click();

// ✅ Right (after inspecting actual class names)
await page.locator('.product-card').first().click();
// or
await page.locator('[data-testid="voucher-card"]').first().click();
```

## 🎬 Step-by-Step: Fixing All Tests

### Step 1: Explore Public Web Homepage
```bash
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/
```

**Find and note down selectors for:**
- [ ] Buy Voucher link
- [ ] Homepage/Logo
- [ ] Sign In button
- [ ] Cart icon
- [ ] Voucher cards

### Step 2: Explore Login Page
```bash
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/login
```

**Find and note down selectors for:**
- [ ] Email input field
- [ ] Password input field
- [ ] Sign In button
- [ ] Sign Up link
- [ ] Forgot Password link

### Step 3: Explore Sign Up Page
```bash
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/signup
```

**Find and note down selectors for:**
- [ ] Name input
- [ ] Email input
- [ ] Phone input
- [ ] Password input
- [ ] All form fields
- [ ] Submit button

### Step 4: Update Test Files

Once you have the real selectors, update the test files:

**File: `tests/public-web/01-login-authentication.spec.ts`**
```typescript
// Replace line 20
// OLD:
await expect(page.locator('text=Buy Voucher, text=Homepage')).toBeVisible();

// NEW (use the selector you found):
await expect(page.getByRole('link', { name: 'Buy Voucher' })).toBeVisible();
```

## 🚀 Quick Win: Test One Page at a Time

Don't try to fix all tests at once. Start with one:

### Fix Login Test First:

1. **Run codegen on login page:**
```bash
npx playwright codegen https://corporate-voucher-stg.fam-stg.click/login
```

2. **Interact with the page:**
   - Click email field → Copy selector
   - Click password field → Copy selector
   - Click Sign In button → Copy selector

3. **Update LoginPage.ts:**
```typescript
// pages/public-web/LoginPage.ts
export class PublicLoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://corporate-voucher-stg.fam-stg.click/login');
  }

  async login(email: string, password: string) {
    // Use the REAL selectors you found:
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

4. **Test it:**
```bash
npx playwright test tests/public-web/01-login-authentication.spec.ts --grep "TC013" --headed
```

## 📊 Progress Tracking

As you fix tests, check them off:

- [ ] Fix LoginPage.ts selectors
- [ ] Fix SignUpPage.ts selectors
- [ ] Fix test TC001 (Browse functionality)
- [ ] Fix test TC004 (User sign in)
- [ ] Fix test TC013 (Login with correct credentials)
- [ ] Continue with remaining tests...

## 💡 Pro Tips

### 1. Use Playwright's Built-in Selectors (Most Reliable)
```typescript
// Best: Role-based (accessible)
page.getByRole('button', { name: 'Submit' })
page.getByRole('link', { name: 'Buy Voucher' })

// Good: Label-based
page.getByLabel('Email')
page.getByLabel('Password')

// Good: Text-based
page.getByText('Welcome')

// OK: Test ID (if available)
page.getByTestId('submit-button')

// Last resort: CSS selector
page.locator('.btn-primary')
```

### 2. Test Selectors in Console
Open browser console on the website:
```javascript
// Test if selector works
document.querySelector('button:has-text("Sign In")')
```

### 3. Use Multiple Selectors as Fallback
```typescript
// Try multiple selectors
const submitButton = page.locator('button:has-text("Submit"), button[type="submit"], .submit-btn');
await submitButton.click();
```

## 🎯 Your Action Plan

1. ✅ **Dependencies installed** (DONE - no more red files!)
2. 🔄 **Get real selectors** (Use codegen)
3. 🔄 **Update page objects** (LoginPage.ts, SignUpPage.ts)
4. 🔄 **Update tests** (Fix selectors one by one)
5. 🔄 **Run and verify** (Test each fix)

## 🆘 Need Help?

If you're stuck:

1. **Share a screenshot** of the page you're testing
2. **Run codegen** and share what selector it generates
3. **Run in debug mode** to see where it fails:
   ```bash
   npx playwright test --debug
   ```

## ✨ Quick Command Reference

```bash
# Get selectors for any page
npx playwright codegen <URL>

# Debug a specific test
npx playwright test <test-file> --debug

# Run test with visible browser
npx playwright test <test-file> --headed

# Run single test
npx playwright test --grep "TC001"
```

---

**Remember:** The framework is perfect, we just need to update the selectors to match your actual website! 🎯
