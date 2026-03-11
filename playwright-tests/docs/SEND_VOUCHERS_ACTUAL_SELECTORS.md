# Send Vouchers - Actual Selectors Documentation

This document contains the actual selectors found during exploration of the Send Vouchers functionality on the public web.

## Exploration Details

- **URL**: https://corporate-voucher-stg.fam-stg.click/
- **Login URL**: https://corporate-voucher-stg.fam-stg.click/login
- **Test User**: lindaamalia@axrail.com
- **Date**: Explored on March 4, 2026

## Page: Login

### Selectors
- **Email Input**: 
  - `input[type="email"]`
  - `page.getByRole('textbox', { name: 'Email Address' })`
  
- **Password Input**: 
  - `input[type="password"]`
  - `page.getByRole('textbox', { name: 'Password' })`
  
- **Login Button**: 
  - `button:has-text("Sign In")`
  - `page.getByRole('button', { name: 'Sign In' })`

## Page: Send Voucher Create (/send-voucher/create)

### Main Elements
- **Page Title**: `heading:has-text("Send Voucher")`
- **Page Description**: `text=Send vouchers to your recipients by uploading their details in a CSV file`
- **Back Button**: `button:has-text("Back")`

### How To Send Voucher Section
- **Section Title**: `heading:has-text("How To Send Voucher")`
- **Step 1 Title**: `heading:has-text("Step 1: Set Up Your Voucher Send")`
- **Step 2 Title**: `heading:has-text("Step 2: Download the Recipient Template")`
- **Step 3 Title**: `heading:has-text("Step 3: Upload and Send")`

### Step 1: Set Up Your Voucher Send
- **Total Recipients Label**: `text=Total Number of Recipient`
- **Total Recipients Input**: 
  - `input[type="number"]` (first occurrence)
  - `textbox[placeholder="0"]`
  
- **Select Voucher Label**: `text=Select Voucher`
- **Select Voucher Button**: 
  - `button:has-text("+ Select Voucher")`
  - `page.getByRole('button', { name: '+ Select Voucher' })`
  
- **Next Button**: 
  - `button:has-text("Next")`
  - When disabled: `button:has-text("Next")[disabled]`

## Modal: Select Voucher

### Selectors
- **Modal Title**: `heading:has-text("Select Voucher")`
- **Modal Description**: `text=Select vouchers to send (Maximum 3 unique vouchers per batch)`
- **Close Button**: Button with image (X icon)
- **Search Input**: 
  - `textbox[placeholder="Search voucher"]`
  - `page.getByRole('textbox', { name: 'Search voucher' })`
  
- **Select Button**: 
  - `button:has-text("Select")`
  - `page.getByRole('button', { name: 'Select' })`
  
- **Voucher Checkbox**: `input[type="checkbox"]`
- **No Vouchers Message**: `text=No inventory items found`

## Page: Send Voucher List (/send-voucher)

### Main Elements
- **Search Input**: 
  - `textbox[placeholder="Search by Batch"]`
  - `page.getByRole('textbox', { name: 'Search by Batch' })`
  
- **Filter Date Button**: 
  - `button:has-text("Filter Date")`
  - `page.getByRole('button', { name: 'Filter Date' })`
  
- **Download Report Button**: `button:has-text("Download Report")`
- **Send Voucher Button**: 
  - `link:has-text("Send Voucher")`
  - `page.getByRole('link', { name: 'Send Voucher' })`

### Empty State
- **No Batches Message**: `text=No voucher batches found`
- **No Batches Description**: `text=Create your first voucher batch to get started`
- **Loading Message**: `text=Loading voucher batches...`

## Page: My Orders (/my-orders)

### Main Elements
- **Search Input**: 
  - `textbox[placeholder="Search by Booking Number, Order Number"]`
  - `page.getByRole('textbox', { name: 'Search by Booking Number, Order Number' })`
  
- **Filter Date Button**: `button:has-text("Filter Date")`
- **Request e-Invoice Button**: 
  - `button:has-text("Request e-Invoice")`
  - `page.getByRole('button', { name: 'Request e-Invoice' })`

### Tabs
- **All Tab**: 
  - `tab:has-text("All")`
  - `page.getByRole('tab', { name: 'All' })`
  
- **To Receive Tab**: `tab:has-text("To Receive")`
- **Completed Tab**: `tab:has-text("Completed")`
- **Cancelled Tab**: `tab:has-text("Cancelled")`

### Empty State
- **No Transactions Message**: `text=No transactions found`
- **No Orders Message**: `text=No orders match your filters`
- **Clear Filters Button**: `button:has-text("Clear filters to see all orders")`

## Page: Inventory (/inventory)

### Main Elements
- **Search Input**: 
  - `textbox[placeholder="Search by Voucher Name"]`
  - `page.getByRole('textbox', { name: 'Search by Voucher Name' })`
  
- **Download Report Button**: `button:has-text("Download Report")`

### Empty State
- **No Items Message**: `text=No inventory items found`
- **No Items Description**: `text=Try adjusting your search or filters`
- **Loading Message**: `text=Loading inventory items...`

## Navigation Links (Available on all pages)

- **Buy Voucher**: `link:has-text("Buy Voucher")`
- **Send Voucher**: `link:has-text("Send Voucher")`
- **My Order**: `link:has-text("My Order")`
- **Inventory**: `link:has-text("Inventory")`

## Step 2: Upload CSV (After clicking Next)

### Selectors
- **Download Template Link/Button**: 
  - `a:has-text("Download")`
  - `button:has-text("Download")`
  
- **Instructions Text**: `text=/instruction|step|how to/i`
- **File Input**: `input[type="file"]`
- **Upload Result Summary**: `text=/upload.*result|result.*summary/i`
- **Invalid Phone Count**: `text=/invalid.*phone|phone.*invalid/i`
- **Invalid Email Count**: `text=/invalid.*email|email.*invalid/i`
- **Upload Again Button**: 
  - `button:has-text("Upload Again")`
  - `button:has-text("Re-upload")`
  
- **Download Make Adjustments Button**: `button:has-text("Make Adjustment")`
- **Send Voucher Button**: `button:has-text("Send Voucher")`
- **Send Button**: `button:has-text("Send")`

## Error Messages

### Selectors
- **Insufficient Balance**: `text=/insufficient|not enough|exceed|more than.*owned/i`
- **Invalid Phone Format**: `text=/invalid.*phone|phone.*invalid/i`
- **Invalid Email Format**: `text=/invalid.*email|email.*invalid/i`
- **System Error**: `text=/system error|contact.*help desk/i`
- **Not Registered**: `text=/not registered|mobile.*not registered/i`

## Help Desk

- **Help Desk Link**: `a[href*="help.tgv.com.my"]`

## Notes

1. **Empty States**: The user account has no vouchers in inventory, no orders, and no send voucher batches, so many elements that would appear with data were not visible during exploration.

2. **Modal Behavior**: The Select Voucher modal opens correctly but shows no vouchers available for selection.

3. **Button States**: The Next button is disabled by default and requires both:
   - Total Number of Recipients to be filled
   - At least one voucher to be selected

4. **Role-based Selectors**: Playwright's `getByRole()` method is preferred for better accessibility and reliability. These are documented alongside CSS selectors.

5. **Wait Times**: Added `waitForTimeout(2000)` after login to ensure proper page load and redirect completion.

## Test Coverage

The exploration covered the following test cases:
- TC_SEND_001: Buy voucher flow (partial - up to checkout)
- TC_SEND_002: Access Send Voucher from multiple endpoints
- TC_SEND_003: My Orders page structure
- TC_SEND_004: Select Voucher modal
- TC_SEND_005: Next button disabled state
- TC_SEND_043: Send Voucher list page

## Recommendations

1. **Use Role-based Selectors**: Prefer `getByRole()` over CSS selectors for better test stability
2. **Add Wait Times**: Include appropriate waits after navigation and user actions
3. **Handle Empty States**: Tests should gracefully handle empty states (no data scenarios)
4. **Test with Data**: Full end-to-end testing requires:
   - Vouchers in inventory
   - Completed orders
   - Existing send voucher batches
