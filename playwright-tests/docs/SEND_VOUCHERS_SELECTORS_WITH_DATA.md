# Send Vouchers - Selectors When Data is Available

Based on the screenshots provided showing vouchers in the Select Voucher modal.

## Select Voucher Modal - With Vouchers Available

### Modal Structure
```
Select Voucher Modal
├── Heading: "Select Voucher"
├── Description: "Select vouchers to send (Maximum 3 unique vouchers per batch) - 0/3 selected"
├── Search Input: "Search voucher"
├── Voucher List Section
│   ├── Section Title: "All Vouchers"
│   └── Voucher Cards (multiple)
│       ├── Voucher Image
│       ├── Voucher Name (e.g., "AUTOMATION TEST VOUCHER")
│       ├── Price (e.g., "RM 20.00")
│       └── Checkbox for selection
└── Select Button
```

### Selectors for Voucher Items

#### Voucher List Section
- **"All Vouchers" Heading**: 
  - `heading:has-text("All Vouchers")`
  - `text="All Vouchers"`

#### Individual Voucher Card
- **Voucher Card Container**: 
  - `[class*="voucher"]` (generic)
  - `[class*="card"]` (generic)
  - May need to inspect actual class names

- **Voucher Name Text**:
  - `text="AUTOMATION TEST VOUCHER"` (specific voucher)
  - `text=/AUTOMATION TEST/i` (case-insensitive search)

- **Voucher Price**:
  - `text="RM 20.00"` (specific price)
  - `text=/RM \d+\.\d+/` (any price pattern)

- **Voucher Checkbox**:
  - `input[type="checkbox"]` (within voucher card)
  - May need parent locator: `locator('text="AUTOMATION TEST VOUCHER"').locator('..').locator('input[type="checkbox"]')`

#### Search Functionality
- **Search Input**: 
  - `page.getByRole('textbox', { name: 'Search voucher' })`
  - `textbox[placeholder="Search voucher"]`

- **Search by Voucher Name**:
  ```typescript
  await page.getByRole('textbox', { name: 'Search voucher' }).fill('AUTOMATION TEST');
  await page.waitForTimeout(1000); // Wait for search results
  ```

#### Selection Actions

**Select a specific voucher by name:**
```typescript
// Method 1: Using text locator
await page.locator('text="AUTOMATION TEST VOUCHER"').click();

// Method 2: Using checkbox near the voucher name
const voucherCard = page.locator('text="AUTOMATION TEST VOUCHER"').locator('..');
await voucherCard.locator('input[type="checkbox"]').click();

// Method 3: Using getByRole if checkbox has label
await page.getByRole('checkbox', { name: /AUTOMATION TEST/i }).click();
```

**Select first available voucher:**
```typescript
const firstCheckbox = page.locator('input[type="checkbox"]').first();
await firstCheckbox.click();
```

**Select multiple vouchers:**
```typescript
const checkboxes = page.locator('input[type="checkbox"]');
const count = await checkboxes.count();

// Select up to 3 vouchers (maximum allowed)
const maxToSelect = Math.min(count, 3);
for (let i = 0; i < maxToSelect; i++) {
  await checkboxes.nth(i).click();
  await page.waitForTimeout(300);
}
```

**Verify voucher is selected:**
```typescript
const selectedCount = page.locator('text=/\\d+\\/3 selected/');
await expect(selectedCount).toBeVisible();
```

**Click Select button to confirm:**
```typescript
await page.getByRole('button', { name: 'Select' }).click();
await page.waitForTimeout(1000);
```

## Complete Flow Example

```typescript
test('Select voucher and proceed', async ({ page }) => {
  // Navigate to send voucher create page
  await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Click Select Voucher button
  await page.getByRole('button', { name: '+ Select Voucher' }).click();
  await page.waitForTimeout(1500);
  
  // Verify modal opened
  await expect(page.locator('heading:has-text("Select Voucher")')).toBeVisible();
  
  // Option 1: Search for specific voucher
  await page.getByRole('textbox', { name: 'Search voucher' }).fill('AUTOMATION TEST');
  await page.waitForTimeout(1000);
  
  // Select the voucher (adjust selector based on actual structure)
  const voucherCheckbox = page.locator('input[type="checkbox"]').first();
  if (await voucherCheckbox.isVisible()) {
    await voucherCheckbox.click();
    await page.waitForTimeout(500);
  }
  
  // Click Select button
  await page.getByRole('button', { name: 'Select' }).click();
  await page.waitForTimeout(1500);
  
  // Verify voucher was added
  await expect(page.getByRole('button', { name: '+ Select Voucher' })).toBeVisible();
  
  // Fill Total Number of Recipients
  await page.locator('input[type="number"]').first().fill('2');
  await page.waitForTimeout(500);
  
  // Verify Next button is enabled
  const nextButton = page.locator('button:has-text("Next")');
  await expect(nextButton).toBeEnabled();
});
```

## Notes

1. **Dynamic Class Names**: The actual CSS classes for voucher cards may be dynamically generated. Use browser DevTools to inspect the actual class names when vouchers are loaded.

2. **Wait Times**: Always add appropriate wait times after:
   - Opening the modal (1-2 seconds)
   - Searching (1 second)
   - Selecting vouchers (300-500ms)
   - Clicking Select button (1-1.5 seconds)

3. **Empty State Handling**: Tests should check if vouchers are available:
   ```typescript
   const noItemsMessage = page.locator('text="No inventory items found"');
   if (await noItemsMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
     console.log('No vouchers available in inventory');
     return; // Skip test or handle appropriately
   }
   ```

4. **Selection Limit**: Maximum 3 unique vouchers can be selected per batch. The UI shows "X/3 selected".

5. **Voucher Card Structure**: Based on the screenshot, each voucher card likely contains:
   - An image (gift voucher graphic)
   - Voucher name
   - Price in RM
   - A checkbox or clickable area for selection

## Recommended Approach

Since the exact DOM structure isn't visible in the accessibility tree, the best approach is:

1. **Use browser DevTools** to inspect the voucher card elements when they're loaded
2. **Look for**:
   - Parent container class (e.g., `.voucher-card`, `.inventory-item`)
   - Checkbox input elements
   - Text elements containing voucher names
3. **Update selectors** based on actual DOM structure
4. **Use data-testid** attributes if available (recommended for stable tests)

## To Get Actual Selectors

Run this script when vouchers are available:

```typescript
const voucherCards = await page.locator('[class*="voucher"], [class*="card"]').all();
for (const card of voucherCards) {
  const html = await card.innerHTML();
  console.log('Voucher card HTML:', html);
}
```

This will help identify the exact structure and class names used.
