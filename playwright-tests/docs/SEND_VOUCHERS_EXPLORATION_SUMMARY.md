# Send Vouchers Exploration - Complete Summary

## Exploration Date
March 4, 2026

## Test Environment
- **URL**: https://corporate-voucher-stg.fam-stg.click/
- **Login URL**: https://corporate-voucher-stg.fam-stg.click/login
- **Test User**: lindaamalia@axrail.com
- **Password**: Rahasia567_

## Current Status
✅ Successfully explored all Send Voucher pages
✅ Documented actual selectors
✅ Updated test file with correct selectors
⚠️ User account has NO vouchers in inventory (empty state)

## Pages Explored

### 1. Login Page
- Email input: `page.getByRole('textbox', { name: 'Email Address' })`
- Password input: `page.getByRole('textbox', { name: 'Password' })`
- Login button: `page.getByRole('button', { name: 'Sign In' })`

### 2. Send Voucher Create Page (/send-voucher/create)
**Main Elements:**
- Page title: `heading:has-text("Send Voucher")`
- Total Recipients input: `input[type="number"]` (first)
- Select Voucher button: `page.getByRole('button', { name: '+ Select Voucher' })`
- Next button: `button:has-text("Next")`

**How To Send Voucher Section:**
- Step 1: "Set Up Your Voucher Send"
- Step 2: "Download the Recipient Template"
- Step 3: "Upload and Send"

### 3. Select Voucher Modal
**Elements:**
- Modal title: `heading:has-text("Select Voucher")`
- Description: "Select vouchers to send (Maximum 3 unique vouchers per batch) - 0/3 selected"
- Search input: `page.getByRole('textbox', { name: 'Search voucher' })`
- Select button: `page.getByRole('button', { name: 'Select' })`
- Close button: X icon button

**When Vouchers Available (from screenshots):**
- "All Vouchers" heading
- Voucher cards with:
  - Voucher image
  - Voucher name (e.g., "AUTOMATION TEST VOUCHER")
  - Price (e.g., "RM 20.00")
  - Checkbox for selection

### 4. Send Voucher List Page (/send-voucher)
**Elements:**
- Search input: `page.getByRole('textbox', { name: 'Search by Batch' })`
- Filter Date button: `page.getByRole('button', { name: 'Filter Date' })`
- Download Report button: `button:has-text("Download Report")`
- Send Voucher button: `page.getByRole('link', { name: 'Send Voucher' })`

**Empty State:**
- "No voucher batches found"
- "Create your first voucher batch to get started"

### 5. My Orders Page (/my-orders)
**Elements:**
- Search input: `page.getByRole('textbox', { name: 'Search by Booking Number, Order Number' })`
- Filter Date button: `button:has-text("Filter Date")`
- Request e-Invoice button: `page.getByRole('button', { name: 'Request e-Invoice' })`

**Tabs:**
- All: `page.getByRole('tab', { name: 'All' })`
- To Receive: `tab:has-text("To Receive")`
- Completed: `tab:has-text("Completed")`
- Cancelled: `tab:has-text("Cancelled")`

**Empty State:**
- "No transactions found"
- "No orders match your filters"

### 6. Inventory Page (/inventory)
**Elements:**
- Search input: `page.getByRole('textbox', { name: 'Search by Voucher Name' })`
- Download Report button: `button:has-text("Download Report")`

**Empty State:**
- "No inventory items found"
- "Try adjusting your search or filters"

## Key Findings

### 1. Empty Inventory Issue
The test user account has NO vouchers in inventory, which means:
- Cannot complete full send voucher flow
- Cannot test voucher selection
- Cannot test CSV upload and sending

### 2. Correct Selectors Identified
All selectors have been documented using:
- Playwright's `getByRole()` method (preferred)
- CSS selectors as fallback
- Text-based locators for specific elements

### 3. Wait Times Required
Added appropriate wait times:
- After login: 2000ms (for redirect)
- After opening modal: 1500ms
- After search: 1000ms
- After selection: 500ms
- After clicking Select: 1500ms

### 4. Button States
- Next button is disabled by default
- Requires both:
  1. Total Number of Recipients filled
  2. At least one voucher selected

## Test File Updates

### Updated Tests
- ✅ TC_SEND_002: Access Send Voucher from multiple endpoints
- ✅ TC_SEND_003: My Orders page structure
- ✅ TC_SEND_004: Select Voucher modal with empty state handling
- ✅ TC_SEND_005: Next button disabled state

### Tests Requiring Data
The following tests cannot be fully executed without vouchers:
- TC_SEND_001: Buy voucher flow (requires payment)
- TC_SEND_004-TC_SEND_042: All voucher selection and sending tests
- TC_SEND_043: View voucher injection status

## How to Get Vouchers for Testing

### Option 1: Purchase Vouchers
1. Login to the public web
2. Navigate to Buy Voucher
3. Select a voucher product
4. Complete purchase (requires payment gateway)

### Option 2: Use Different Account
Use an account that already has vouchers in inventory

### Option 3: Admin Portal
Use admin portal to credit vouchers to the test account

## Recommendations

### 1. For Complete Testing
- Set up test account with vouchers in inventory
- Or use mock/test payment gateway
- Or create test data setup script

### 2. For Selector Verification
When vouchers are available, inspect the DOM to get:
- Voucher card container class names
- Checkbox selectors
- Voucher name/price element selectors

### 3. For Test Stability
- Use `getByRole()` selectors (more stable)
- Add appropriate wait times
- Handle empty states gracefully
- Add retry logic for flaky elements

## Files Created/Updated

### Documentation
1. `send-vouchers-actual-selectors.json` - JSON format selectors
2. `SEND_VOUCHERS_ACTUAL_SELECTORS.md` - Detailed selector documentation
3. `SEND_VOUCHERS_SELECTORS_WITH_DATA.md` - Selectors when data is available
4. `SEND_VOUCHERS_EXPLORATION_SUMMARY.md` - This file

### Test Files
1. `tests/public-web/03-send-vouchers.spec.ts` - Updated with correct selectors

### Scripts
1. `scripts/explore-send-vouchers-actual.ts` - Exploration script

## Next Steps

1. **Get Test Data**: Populate test account with vouchers
2. **Complete Exploration**: Re-run exploration with vouchers available
3. **Update Selectors**: Get actual voucher card selectors
4. **Complete Tests**: Implement full send voucher flow tests
5. **Add CSV Tests**: Test CSV upload and validation
6. **Test Error Cases**: Test insufficient balance, invalid data, etc.

## Running the Tests

```bash
# Run all send voucher tests
cd playwright-tests
npx playwright test tests/public-web/03-send-vouchers.spec.ts

# Run with UI mode
npx playwright test tests/public-web/03-send-vouchers.spec.ts --ui

# Run specific test
npx playwright test tests/public-web/03-send-vouchers.spec.ts -g "TC_SEND_004"

# Run in headed mode (see browser)
npx playwright test tests/public-web/03-send-vouchers.spec.ts --headed
```

## Known Limitations

1. **No Vouchers**: Cannot test full flow without inventory
2. **No Orders**: Cannot test send from My Orders
3. **No Batches**: Cannot test batch history
4. **Payment Gateway**: Cannot complete purchase flow
5. **CSV Upload**: Cannot test without completing Step 1

## Conclusion

The exploration successfully identified all UI elements and their correct selectors. The test file has been updated with accurate selectors using Playwright's recommended `getByRole()` methods. However, full end-to-end testing requires vouchers in the test account's inventory.

The documentation provides both current state (empty) selectors and expected selectors when data is available, based on the screenshots provided.
