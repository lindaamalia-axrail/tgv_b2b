# User Management Test Update Guide

## Summary

The original `05-user-management.spec.ts` file was created with placeholder selectors. After exploring the actual application, we now have the correct selectors.

## Key Changes Needed

### 1. Update Base Configuration

**Before:**
```typescript
await page.goto('/admin/login');
await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || '');
```

**After:**
```typescript
const BASE_URL = 'https://corpvoucher.fam-stg.click';
await page.goto(`${BASE_URL}/login`);
await page.fill('input[name="username"]', CREDENTIALS.email);
```

### 2. Update Page URLs

**Before:**
- `/admin/user-management/users`
- `/admin/user-management/roles`
- `/admin/user-management/audit-log`

**After:**
- `/user-listing`
- `/role-listing`
- `/audit-log`

### 3. Replace Table Selectors

**Before:**
```typescript
await page.locator('table tbody tr').first()
const headers = await page.locator('table thead th').allTextContents();
```

**After:**
```typescript
await page.locator('.MuiDataGrid-row').first()
const headers = await page.locator('.MuiDataGrid-columnHeader').allTextContents();
```

### 4. Update Button Selectors

**Before:**
```typescript
await page.click('button:has-text("Edit"), [aria-label="Edit"]')
```

**After:**
```typescript
await page.locator('.MuiIconButton-root.css-nm0ua4').first().click()
```

### 5. Update Form Field Selectors

**Before:**
```typescript
await page.fill('input[name="displayName"], input[name="name"]', name);
await page.selectOption('select[name="role"]', { index: 1 });
```

**After:**
```typescript
await page.fill('input[name="name"]', name);
await page.click('input[placeholder="Choose role"]');
await page.waitForTimeout(500);
await page.click('[role="option"]');
```

### 6. Update Dialog/Modal Selectors

**Before:**
```typescript
await page.waitForSelector('form');
```

**After:**
```typescript
await expect(page.locator('[role="dialog"]')).toBeVisible();
```

### 7. Add Proper Waits

Add these after interactions:
```typescript
await page.waitForTimeout(1000); // After clicking buttons
await page.waitForTimeout(2000); // After save/submit
await page.waitForLoadState('networkidle'); // After navigation
```

### 8. Update Verification Selectors

**Before:**
```typescript
await expect(page.locator(`text=${newName}`)).toBeVisible();
```

**After:**
```typescript
await expect(page.locator(`.MuiDataGrid-cell:has-text("${newName}")`)).toBeVisible();
```

## Complete Updated File

The complete updated test file with all 64 scenarios and correct selectors has been created at:
`playwright-tests/tests/admin-portal/05-user-management-updated.spec.ts`

## Selector Reference

For a complete list of all selectors found, see:
`playwright-tests/docs/USER_MANAGEMENT_SELECTORS_FOUND.md`

## Next Steps

1. Review the updated test file
2. Replace the original `05-user-management.spec.ts` with the updated version
3. Run the tests to verify they work correctly
4. Adjust any selectors that may have changed or need refinement

## Testing Command

```bash
npx playwright test tests/admin-portal/05-user-management.spec.ts --headed
```

## Notes

- The application uses Material-UI components, not standard HTML elements
- Autocomplete fields require clicking to open options, then selecting from `[role="option"]`
- All forms open in dialogs (`[role="dialog"]`)
- Data is displayed in Material-UI DataGrid (`.MuiDataGrid-root`)
- Dynamic IDs are generated, so use `name` attributes or placeholders for form fields
