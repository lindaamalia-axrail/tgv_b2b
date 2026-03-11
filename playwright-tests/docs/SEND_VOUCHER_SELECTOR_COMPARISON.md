# Send Voucher Selector Comparison

## Current vs Actual Selectors

### Navigation

| Element | Current Selector | Actual Selector | Status |
|---------|-----------------|-----------------|--------|
| Send Voucher Link | Generic text search | `a:has-text("Send Voucher")` | ⚠️ Works but could be more specific |
| My Order Link | Generic text search | `a:has-text("My Order")` | ⚠️ Works but could be more specific |

### Step 1: Add Vouchers

| Element | Current Selector | Actual Selector | Status |
|---------|-----------------|-----------------|--------|
| Total Recipients Input | `input[type="text"][placeholder="0"], input[type="number"]` | `input[type="number"]` | ⚠️ Too generic, should use `.first()` |
| Each Recipient Input | `input[type="number"]` | `input[type="number"]` | ❌ Same as above, needs `.nth(1)` |
| Select Voucher Button | `button:has-text("Select Voucher"), button:has-text("+Select Voucher")` | `button:has-text("Select Voucher")` | ✅ OK |
| Modal | `[role="dialog"], .modal, [class*="modal"]` | `[role="dialog"]` | ✅ OK |
| Checkboxes in Modal | `input[type="checkbox"], [role="checkbox"]` | `[role="dialog"] input[type="checkbox"]` | ⚠️ Should scope to modal |
| Modal Select Button | `button:has-text("Select")` | `[role="dialog"] button:has-text("Select")` | ⚠️ Should scope to modal |
| Next Button | `button:has-text("Next")` | `button:has-text("Next")` | ✅ OK |

### Step 2: Upload CSV

| Element | Current Selector | Actual Selector | Status |
|---------|-----------------|-----------------|--------|
| Download Template | `a:has-text("Download"), a:has-text("template")` | `a:has-text("Download")` | ✅ OK |
| File Input | `input[type="file"]` | `input[type="file"]` | ✅ OK |
| Upload Again Button | `button:has-text("Upload Again"), button:has-text("Re-upload")` | `button:has-text("Upload Again")` | ✅ OK |
| Send Button | `button:has-text("Send Voucher"), button:has-text("Send")` | `button:has-text("Send")` | ✅ OK |

### Status Page

| Element | Current Selector | Actual Selector | Status |
|---------|-----------------|-----------------|--------|
| View Report Button | `button:has-text("Report"), a:has-text("Report")` | `button:has-text("View")` | ⚠️ Incorrect text |
| Download Report | `button:has-text("Download Report"), button:has-text("Download")` | `button:has-text("Download Report")` | ✅ OK |
| Withdraw Button | `button:has-text("Withdraw")` | `button:has-text("Withdraw")` | ✅ OK |

## Recommendations

### High Priority Fixes:

1. **Differentiate between input fields**:
   ```typescript
   // Current (ambiguous):
   const recipientInput = page.locator('input[type="number"]').first();
   
   // Better:
   const totalRecipientsInput = page.locator('input[type="number"]').first();
   const eachRecipientInput = page.locator('input[type="number"]').nth(1);
   ```

2. **Scope modal selectors**:
   ```typescript
   // Current:
   const checkboxes = page.locator('input[type="checkbox"]');
   
   // Better:
   const modal = page.locator('[role="dialog"]');
   const checkboxes = modal.locator('input[type="checkbox"]');
   ```

3. **Add explicit waits**:
   ```typescript
   // Add after modal interactions:
   await page.waitForTimeout(1000);
   
   // Add after navigation:
   await page.waitForLoadState('networkidle');
   ```

### Medium Priority Improvements:

1. **Use more specific selectors where available**
2. **Add data-testid attributes** (if possible to modify the app)
3. **Create Page Object Model** for better maintainability

### Low Priority:

1. **Add retry logic** for flaky selectors
2. **Add better error messages** in assertions
3. **Group related selectors** in constants

## Verdict

**Status: ⚠️ PARTIALLY CORRECT**

The current selectors will **mostly work** but have these issues:

- ❌ **Input field ambiguity** - Can't reliably differentiate between "Total Recipients" and "Each Recipient" inputs
- ⚠️ **Modal scope** - Checkboxes and buttons should be scoped to modal to avoid conflicts
- ⚠️ **Generic selectors** - May break if UI changes or multiple elements match
- ✅ **Basic functionality** - Most selectors will find elements, but may find wrong ones

## Recommended Action

**Update the test file** with more specific selectors to ensure:
1. Tests target the correct elements
2. Tests are more reliable and less flaky
3. Tests are easier to maintain
4. Better error messages when elements not found
