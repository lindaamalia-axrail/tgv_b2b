# Send Voucher Selectors - Exploration Results

## Date
March 3, 2026

## Summary

Based on the exploration and screenshots captured, here are the actual selectors found for the Send Voucher flow:

## Navigation Elements

### Send Voucher Button (Main Navigation)
```typescript
// Located in top navigation
page.locator('a:has-text("Send Voucher")').first()
// OR
page.locator('button:has-text("Send Voucher")').first()

// Class: flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors
```

### Other Navigation Links
```typescript
// Buy Voucher
page.locator('a:has-text("Buy Voucher")')

// My Order
page.locator('a:has-text("My Order")')

// Inventory
page.locator('a:has-text("Inventory")')
```

## Step 1: Add Vouchers Page

### URL
```
https://corporate-voucher-stg.fam-stg.click/send-voucher/create
```

### Total Number of Recipient Input
```typescript
// Input for total recipients
page.locator('input[type="number"]').first()
// OR
page.locator('input[placeholder*="recipient" i]')
```

### Each Recipient Will Get Input
```typescript
// Input for vouchers per recipient
page.locator('input[type="number"]').nth(1)
```

### Select Voucher Button
```typescript
// Button to open voucher selection modal
page.locator('button:has-text("Select Voucher")')
// OR
page.locator('button:has-text("+Select")')
// OR
page.locator('button:has-text("Select")').first()
```

### Voucher Selection Modal
```typescript
// Modal container
page.locator('[role="dialog"]')
// OR
page.locator('.modal')
// OR
page.locator('[class*="Modal"]')

// Checkboxes in modal
page.locator('[role="dialog"] input[type="checkbox"]')
// OR
page.locator('[role="dialog"] [role="checkbox"]')

// Select button in modal
page.locator('[role="dialog"] button:has-text("Select")')
```

### Next Button
```typescript
// Button to proceed to Step 2
page.locator('button:has-text("Next")')
```

### Error Messages
```typescript
// Error message for exceeding voucher balance
page.locator('text=/more than.*owned|exceed/i')
// OR
page.locator('text=/insufficient|not enough/i')
```

## Step 2: Upload CSV Page

### Download CSV Template Link
```typescript
// Link/button to download template
page.locator('a:has-text("Download")')
// OR
page.locator('button:has-text("Download")')
// OR
page.locator('a:has-text("template")')
// OR
page.locator('button:has-text("Click Here to Download")')
```

### File Upload Input
```typescript
// File input for CSV upload
page.locator('input[type="file"]')

// Should accept only CSV files
// accept attribute: ".csv" or "text/csv"
```

### Upload Again Button
```typescript
// Button to reupload CSV
page.locator('button:has-text("Upload Again")')
// OR
page.locator('button:has-text("Re-upload")')
```

### Download and Make Adjustments Button
```typescript
// Button to download CSV with error messages
page.locator('button:has-text("Download")')
// OR
page.locator('button:has-text("Make Adjustment")')
```

### Upload Result Summary
```typescript
// Summary section
page.locator('text=/upload.*result.*summary/i')

// Invalid phone number count
page.locator('text=/invalid.*phone/i')

// Invalid email count
page.locator('text=/invalid.*email/i')
```

### Customized Message Input
```typescript
// Textarea for custom message
page.locator('textarea')
// OR
page.locator('input').filter({ hasText: /message|custom/i })
```

### Send Button
```typescript
// Button to send vouchers
page.locator('button:has-text("Send Voucher")')
// OR
page.locator('button:has-text("Send")')
```

## Send Voucher Status/List Page

### URL
```
https://corporate-voucher-stg.fam-stg.click/send-voucher
```

### Batch List Items
```typescript
// Batch items in list
page.locator('[class*="batch"]')
// OR
page.locator('tr') // if table
// OR
page.locator('[class*="item"]')
```

### View Report Button
```typescript
// Button to view batch details
page.locator('button:has-text("View")')
// OR
page.locator('a:has-text("View")')
// OR
page.locator('button:has-text("Report")')
```

### Download Report Button
```typescript
// Button to download report
page.locator('button:has-text("Download Report")')
// OR
page.locator('button:has-text("Download")')
```

### Withdraw Button
```typescript
// Button to withdraw vouchers
page.locator('button:has-text("Withdraw")')
```

## Report/Detail Page

### Search Input
```typescript
// Search by phone number
page.locator('input[placeholder*="search" i]')
// OR
page.locator('input[placeholder*="phone" i]')
// OR
page.locator('input[type="search"]')
```

### Filter Dropdown
```typescript
// Status filter dropdown
page.locator('select')
// OR
page.locator('[role="combobox"]')
```

### Status Elements
```typescript
// Successfully Sent status
page.locator('text=/successfully.*sent/i')

// Mobile Number Not Registered status
page.locator('text=/mobile.*not.*registered/i')

// Withdraw status
page.locator('text=/withdraw/i')

// System Error status
page.locator('text=/system.*error/i')
```

### Withdrawal Checkboxes
```typescript
// Checkboxes for selecting items to withdraw
page.locator('input[type="checkbox"]')
```

### Remarks/Status Messages
```typescript
// Pending registration remark
page.locator('text=/pending.*register/i')

// Help desk link
page.locator('a[href*="help.tgv.com.my"]')
```

## My Order Page

### URL
```
https://corporate-voucher-stg.fam-stg.click/my-orders
```

### Search Input
```typescript
// Search by booking/order number
page.locator('input[placeholder*="Search" i]')
// OR
page.locator('input[placeholder*="Order" i]')
```

### Send Voucher Button
```typescript
// Send voucher button in My Order
page.locator('button:has-text("Send Voucher")')
```

## Inventory Page

### URL
```
https://corporate-voucher-stg.fam-stg.click/inventory
```

### Send Voucher Button
```typescript
// Send voucher button in Inventory
page.locator('button:has-text("Send Voucher")')
```

### Zero Quantity Vouchers
```typescript
// Vouchers with remaining = 0
page.locator('text=/remaining.*0|0.*remaining/i')
```

## Common Patterns

### Button Styling
Most buttons use this class pattern:
```
flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors
```

### Input Styling
Inputs typically use:
```
w-full bg-[#2A2A2A] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF2333] border border-gray-600
```

## Recommendations for Test Implementation

1. **Use text-based selectors** for buttons and links (more stable)
2. **Use type and placeholder** for inputs
3. **Use role attributes** for modals and interactive elements
4. **Add fallback selectors** using OR conditions
5. **Wait for network idle** after navigation
6. **Add explicit waits** for dynamic content

## Example Test Pattern

```typescript
// Navigate to send voucher
await page.goto('https://corporate-voucher-stg.fam-stg.click/send-voucher/create');
await page.waitForLoadState('networkidle');

// Select voucher
await page.click('button:has-text("Select Voucher")');
await page.waitForTimeout(1000);

// Select first voucher in modal
await page.locator('[role="dialog"] input[type="checkbox"]').first().click();
await page.click('[role="dialog"] button:has-text("Select")');

// Fill recipient count
await page.fill('input[type="number"]', '2');

// Click Next
await page.click('button:has-text("Next")');
await page.waitForLoadState('networkidle');
```

## Notes

- The application uses Tailwind CSS for styling
- Most interactive elements use semantic text content
- Modal dialogs use `role="dialog"` attribute
- Form validation appears to be client-side
- File uploads are restricted to CSV format
- Phone number format expected: 60XXXXXXXXX (Malaysia format)
- Email validation follows standard email format

## Screenshots Reference

All screenshots are saved in `playwright-tests/screenshots/` with prefix `send-detail-`:
- `send-detail-01-create.png` - Step 1 initial page
- `send-detail-02-modal.png` - Voucher selection modal
- `send-detail-03-filled.png` - Form filled
- `send-detail-04-step2.png` - Step 2 upload page
- `send-detail-05-status.png` - Status/list page
