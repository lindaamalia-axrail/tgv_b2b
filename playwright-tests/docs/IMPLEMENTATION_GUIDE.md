# TGV Corporate Voucher - Test Implementation Guide

## Overview

This guide will help you complete the implementation of all 405 automated test cases for the TGV Corporate Voucher platform.

## Current Status

### ✅ Completed (35 tests)
- Public Web Login & Authentication (17 tests)
- Public Web Buy Vouchers (18 tests)  
- Admin Portal Login (15 tests)

### 🔄 Remaining (370 tests)
- Password Policy (29 tests)
- Send Vouchers (60 tests)
- My Order (36 tests)
- Content Management (52 tests)
- Corporate Management (50 tests)
- User Management (62 tests)
- Reports (14 tests)
- Additional Buy tests (34 tests)
- Additional Login tests (33 tests)

## Step-by-Step Implementation Plan

### Phase 1: Core User Flows (Week 1)
1. **Complete Buy Module** (34 remaining tests)
   - File: `tests/public-web/02-buy-vouchers.spec.ts`
   - Focus: Cart operations, checkout flow, payment integration

2. **Send Vouchers Module** (60 tests)
   - File: `tests/public-web/03-send-vouchers.spec.ts`
   - Focus: CSV upload, recipient validation, voucher injection

3. **My Order Module** (36 tests)
   - File: `tests/public-web/04-my-order.spec.ts`
   - Focus: Order history, status tracking, receipts

### Phase 2: Admin Portal (Week 2)
4. **Voucher Management** (54 tests)
   - File: `tests/admin-portal/02-voucher-management.spec.ts`
   - Focus: CRUD operations, categories, stock management

5. **Corporate Management** (50 tests)
   - File: `tests/admin-portal/03-corporate-management.spec.ts`
   - Focus: Customer management, search, export

6. **User Management** (62 tests)
   - File: `tests/admin-portal/04-user-management.spec.ts`
   - Focus: Users, roles, permissions, audit logs

### Phase 3: Content & Reports (Week 3)
7. **Content Management** (52 tests)
   - File: `tests/admin-portal/05-content-management.spec.ts`
   - Focus: Homepage carousel, categories, highlights

8. **Reports** (14 tests)
   - File: `tests/admin-portal/06-reports.spec.ts`
   - Focus: Sales reports, remind me reports, exports

9. **Password Policy** (29 tests)
   - File: `tests/public-web/05-password-policy.spec.ts`
   - Focus: Password validation, expiry, reset

## Test Implementation Template

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { PageObjectName } from '../../pages/path/PageObjectName';
import { TestHelpers } from '../../utils/helpers';
import { TEST_DATA } from '../../utils/test-data';

test.describe('Module Name', () => {
  let pageObject: PageObjectName;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    pageObject = new PageObjectName(page);
    helpers = new TestHelpers(page);
    
    // Login if needed
    await pageObject.navigate();
    await pageObject.login(TEST_DATA.email, TEST_DATA.password);
  });

  test('TC_XXX: Test scenario description', async ({ page }) => {
    // Arrange
    // ... setup test data
    
    // Act
    // ... perform actions
    
    // Assert
    // ... verify results
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Page Object Template

```typescript
import { Page, expect } from '@playwright/test';

export class PageName {
  constructor(private page: Page) {}

  // Locators
  private get submitButton() {
    return this.page.locator('button[type="submit"]');
  }

  // Actions
  async navigate() {
    await this.page.goto('/path');
  }

  async fillForm(data: FormData) {
    await this.page.fill('input[name="field"]', data.field);
  }

  async submit() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Assertions
  async verifySuccess() {
    await expect(this.page.locator('text=Success')).toBeVisible();
  }
}
```

## Creating Tests from Excel Data

### Step 1: Extract Test Scenarios
From the Excel file, each row contains:
- Platform (Public Web / Admin Portal)
- Category
- Test Type (Positive / Negative)
- Module/Screen name
- Test Scenario
- Test Steps
- Expected Result

### Step 2: Map to Test Structure

```typescript
// Excel Row Example:
// Platform: Public Web
// Category: Send
// Test Type: Positive
// Module: Send voucher page
// Scenario: Upload CSV with valid data
// Steps: 1. Click upload 2. Select file 3. Click submit
// Expected: CSV uploaded successfully

// Becomes:
test('TC_SEND_001: Upload CSV with valid data', async ({ page }) => {
  // Step 1: Click upload
  await page.click('button:has-text("Upload")');
  
  // Step 2: Select file
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('input[type="file"]')
  ]);
  await fileChooser.setFiles('test-data/valid-recipients.csv');
  
  // Step 3: Click submit
  await page.click('button:has-text("Submit")');
  
  // Expected: CSV uploaded successfully
  await expect(page.locator('text=uploaded successfully')).toBeVisible();
});
```

### Step 3: Group Related Tests

Group tests by module and functionality:
- Login tests together
- CRUD operations together
- Form validation tests together

## Common Test Patterns

### 1. Login Flow
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
});
```

### 2. Form Submission
```typescript
test('Submit form', async ({ page }) => {
  await page.fill('input[name="field1"]', 'value1');
  await page.fill('input[name="field2"]', 'value2');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 3. Table Operations
```typescript
test('Search and filter table', async ({ page }) => {
  // Search
  await page.fill('input[placeholder="Search"]', 'search term');
  await page.press('input[placeholder="Search"]', 'Enter');
  
  // Verify results
  const rows = await page.locator('table tbody tr').count();
  expect(rows).toBeGreaterThan(0);
  
  // Click first row
  await page.locator('table tbody tr').first().click();
});
```

### 4. File Upload
```typescript
test('Upload file', async ({ page }) => {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('button:has-text("Upload")')
  ]);
  await fileChooser.setFiles('path/to/file.csv');
  await expect(page.locator('text=Upload successful')).toBeVisible();
});
```

### 5. File Download
```typescript
test('Download report', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Download")')
  ]);
  expect(download.suggestedFilename()).toContain('.csv');
});
```

### 6. Modal/Dialog Handling
```typescript
test('Handle confirmation dialog', async ({ page }) => {
  page.on('dialog', dialog => dialog.accept());
  await page.click('button:has-text("Delete")');
  await expect(page.locator('text=Deleted successfully')).toBeVisible();
});
```

### 7. Dropdown Selection
```typescript
test('Select from dropdown', async ({ page }) => {
  await page.selectOption('select[name="category"]', 'Movie Passes');
  await page.click('button:has-text("Filter")');
});
```

### 8. Date Picker
```typescript
test('Select date', async ({ page }) => {
  await page.fill('input[type="date"]', '2024-12-31');
  // Or click date picker
  await page.click('.date-picker-icon');
  await page.click('text=31');
});
```

## Testing Best Practices

### 1. Use Proper Waits
```typescript
// ❌ Bad
await page.waitForTimeout(5000);

// ✅ Good
await page.waitForLoadState('networkidle');
await page.waitForSelector('.element');
await expect(page.locator('.element')).toBeVisible();
```

### 2. Robust Selectors
```typescript
// ❌ Bad - fragile
await page.click('.btn-primary');

// ✅ Good - semantic
await page.click('button:has-text("Submit")');
await page.click('[data-testid="submit-button"]');
await page.click('button[aria-label="Submit form"]');
```

### 3. Test Data Management
```typescript
// ❌ Bad - hardcoded
await page.fill('input', 'test@example.com');

// ✅ Good - centralized
import { TEST_DATA } from '../../utils/test-data';
await page.fill('input', TEST_DATA.email);
```

### 4. Error Handling
```typescript
test('Handle errors gracefully', async ({ page }) => {
  try {
    await page.click('.optional-element', { timeout: 5000 });
  } catch (error) {
    console.log('Optional element not found, continuing...');
  }
  
  // Or use conditional
  if (await page.locator('.optional-element').isVisible()) {
    await page.click('.optional-element');
  }
});
```

### 5. Reusable Functions
```typescript
// Create helper functions
async function loginAsAdmin(page: Page) {
  await page.goto(ADMIN_URL);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

// Use in tests
test('Admin test', async ({ page }) => {
  await loginAsAdmin(page);
  // ... rest of test
});
```

## Debugging Tips

### 1. Run in Headed Mode
```bash
npm run test:headed
```

### 2. Use Debug Mode
```bash
npm run test:debug
```

### 3. Add Screenshots
```typescript
await page.screenshot({ path: 'debug.png', fullPage: true });
```

### 4. Console Logs
```typescript
console.log('Current URL:', page.url());
console.log('Element text:', await page.locator('.element').textContent());
```

### 5. Pause Execution
```typescript
await page.pause(); // Opens Playwright Inspector
```

## Next Steps

1. **Install dependencies**
   ```bash
   cd playwright-tests
   npm install
   npx playwright install
   ```

2. **Run existing tests**
   ```bash
   npm test
   ```

3. **Create remaining test files** using the templates above

4. **Implement tests module by module** following the phase plan

5. **Run and debug** each module before moving to the next

6. **Update README** with progress

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

## Support

For questions or issues:
1. Check Playwright documentation
2. Review existing test examples
3. Use Playwright Inspector for debugging
4. Contact QA team lead

---

**Remember**: Quality over quantity. It's better to have fewer well-written, maintainable tests than many fragile ones.
