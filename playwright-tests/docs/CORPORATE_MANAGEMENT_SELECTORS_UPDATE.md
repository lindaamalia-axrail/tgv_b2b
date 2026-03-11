# Corporate Management Spec - Selectors Update Summary

## Overview
Updated the `04-corporate-management.spec.ts` file with correct selectors discovered through exploration of the actual Admin Portal application.

## Exploration Process
- Created exploration script: `explore-corporate-management.ts`
- Logged in with credentials: `lindaamalia+1@axrail.com`
- Navigated to Corporate Management page
- Identified all UI elements and their selectors

## Selector Updates

### Main Page Selectors

| Element | Old Selector | New Selector | Notes |
|---------|-------------|-------------|-------|
| Edit Button | `button[aria-label="Edit"]` | `[role="row"] [role="cell"]:last-child button` | Located in the Actions column of the table |
| Checkbox | `input[type="checkbox"]` | `input[type="checkbox"]` | No change needed |
| Company Name Search | `input[name="companyName"]` | `input[placeholder*="Company Name"]` | Uses placeholder attribute |
| Email Search | `input[name="email"]` | `input[placeholder*="Email"]` | Uses placeholder attribute |
| Phone Number Search | `input[name="phoneNumber"]` | `input[placeholder*="Phone Number"]` | Uses placeholder attribute |
| Export Button | `button:has-text("Export")` | `button:has-text("Export")` | No change needed |

### Modal/Edit Form Selectors

| Element | Old Selector | New Selector | Notes |
|---------|-------------|-------------|-------|
| Full Name Field | `input[name="companyName"]` | `input[name="fullName"]` | Correct field name in modal |
| Email Field | `input[name="email"]` | `input[name="primaryEmail"]` | Correct field name in modal |
| Mobile Number Field | `input[name="phoneNumber"]` | `input[name="mobileNo"]` | Correct field name in modal |
| Save Button | `button:has-text("Save")` | `button:has-text("Save")` | No change needed |

### Purchase History Selectors

| Element | Selector | Notes |
|---------|----------|-------|
| Filter Date Button | `button:has-text("Filter Date")` | Opens date filter modal |
| Start Date Input | `input[name="startDate"]` | In filter modal |
| End Date Input | `input[name="endDate"]` | In filter modal |
| Update Button | `button:has-text("Update")` | Applies filter |
| Cancel Button | `button:has-text("Cancel")` | Closes filter without applying |
| Search Input | `input[placeholder*="Search by Booking Number, Order ID"]` | For searching purchase history |
| Transaction Search | `input[placeholder*="Transaction"]` | For searching by transaction number |

### Inventory Selectors

| Element | Selector | Notes |
|---------|----------|-------|
| Inventory Tab | `button:has-text("Inventory")` | Switches to inventory section |
| Download Button | `button:has-text("Download")` | Opens download options |
| Search Input | `input[placeholder*="Search"]` | For searching by voucher name |
| Export Selected | `text=Export Selected` | Option in export menu |

### Sorting Selectors

| Element | Selector | Notes |
|---------|----------|-------|
| Table Headers | `th` | Column headers for sorting |
| Sort Icons | `svg[data-testid="ArrowUpwardIcon"]` | Indicates sort direction |

## Test Cases Updated

Total test cases: **48**

### Categories:
1. **Download Tests** (3): Export all, by search, by selection
2. **Search Tests** (7): Single and combined filters
3. **Edit Tests** (8): Email, phone, combinations
4. **Purchase History Tests** (5): Filter, search, sort
5. **Inventory Tests** (3): Search, download, sort
6. **Sorting Tests** (15): Purchase history, inventory, corporate users

## Key Changes

### 1. Edit Button Selector
- **Old**: `button[aria-label="Edit"]` - Was finding sort buttons
- **New**: `[role="row"] [role="cell"]:last-child button` - Correctly targets action buttons in last column

### 2. Modal Field Names
- The modal uses different field names than the search filters
- `fullName` instead of `companyName`
- `primaryEmail` instead of `email`
- `mobileNo` instead of `phoneNumber`

### 3. Added Wait Timeouts
- Added `await page.waitForTimeout(1000)` after clicking edit buttons
- Ensures modal is fully loaded before interacting with form fields

### 4. Search Filter Selectors
- Changed from `name` attribute to `placeholder` attribute
- More reliable as placeholders are visible and consistent

## Discovered Elements

### Modal Inputs Found:
- `fullName` - Full name field
- `idNumber` - ID number
- `sstNumber` - SST number
- `tin` - TIN field
- `address` - Address field
- `postal` - Postal code
- `primaryEmail` - Primary email
- `mobileNo` - Mobile number

### Table Headers Found:
1. Company Name
2. Company Email
3. Company Phone No.
4. Created Date
5. Last Update
6. Last Login
7. Actions

## Testing Recommendations

1. **Run tests with actual data**: Ensure test data exists in the system
2. **Use unique values**: For email and phone tests, use unique values to avoid conflicts
3. **Wait for modals**: Always wait after clicking edit buttons
4. **Verify downloads**: Download tests may need additional handling for file verification

## Files Modified

- `playwright-tests/tests/admin-portal/04-corporate-management.spec.ts` - Updated with correct selectors
- `playwright-tests/scripts/explore-corporate-management.ts` - Exploration script used to discover selectors
- `playwright-tests/corporate-management-selectors.json` - Discovered selectors reference

## Next Steps

1. Run the test suite to verify all tests pass
2. Update any additional test files that reference these selectors
3. Document any additional selectors discovered during test execution
4. Consider creating a page object model for better maintainability
