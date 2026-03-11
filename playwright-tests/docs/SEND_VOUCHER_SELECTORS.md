# Send Voucher - Actual Selectors

## Navigation
- **Send Voucher Link**: `a:has-text("Send Voucher")` or `a[href="/send-voucher"]`
- **Create Send Voucher**: `a[href="/send-voucher/create"]`

## Send Voucher List Page (`/send-voucher`)
- **Search Input**: `input[placeholder="Search by Batch"]`
- **Filter Date Button**: `button:has-text("Filter Date")`
- **Download Report Button**: `button:has-text("Download Report")`

## Send Voucher Create Page (`/send-voucher/create`)

### Step 1: Select Voucher and Recipients
- **Back Button**: `button:has-text("Back")`
- **Select Voucher Button**: `button:has-text("Select Voucher"), button:has-text("+Select Voucher")`
- **Recipient Count Input**: `input[type="text"][placeholder="0"]` or `input[type="number"]`
- **Next Button**: `button:has-text("Next")`
- **Next Button (disabled)**: `button:has-text("Next"):disabled` or `button:has-text("Next")[disabled]`
- **Next Button (enabled)**: `button:has-text("Next"):not([disabled])`

### Labels
- **Total Number of Recipient**: `label:has-text("Total Number of Recipient")`
- **Select Voucher**: `label:has-text("Select Voucher")`

### Select Voucher Modal
- **Modal Close Button**: `button:has-text("Cancel"), button:has-text("Close")`
- **Select Button**: `button:has-text("Select")`
- **Voucher Checkboxes**: `input[type="checkbox"], [role="checkbox"]`
- **Voucher Items**: `div:has(input[type="checkbox"])`

### Step 2: Upload Recipients (after clicking Next)
- **File Input**: `input[type="file"]`
- **Download Template Link**: `a:has-text("Download"), a:has-text("template")`
- **Submit/Send Button**: `button:has-text("Submit"), button:has-text("Send")`
- **Back Button**: `button:has-text("Back")`

## My Order Page (`/my-orders`)
- **Search Input**: `input[placeholder="Search by Booking Number, Order Number"]`
- **Order Items**: `div:has(button)` (generic, need more specific selector)

## Common Patterns
1. All navigation uses `a:has-text("...")` or `a[href="..."]`
2. All buttons use `button:has-text("...")`
3. Input fields use `input[type="..."]` or `input[placeholder="..."]`
4. Modals use standard button patterns for close/cancel
5. File uploads use `input[type="file"]`

## Test Credentials
- **Email**: `lindaamalia@axrail.com`
- **Password**: `Rahasia567_`

## URLs
- **Send Voucher List**: `https://corporate-voucher-stg.fam-stg.click/send-voucher`
- **Send Voucher Create**: `https://corporate-voucher-stg.fam-stg.click/send-voucher/create`
- **My Orders**: `https://corporate-voucher-stg.fam-stg.click/my-orders`

## Notes
- The "Send Voucher" page shows history of sent vouchers
- The actual send flow is at `/send-voucher/create`
- Next button is disabled until recipient count is filled
- Select Voucher opens a modal to choose vouchers
- Step 2 allows CSV upload for recipient information
