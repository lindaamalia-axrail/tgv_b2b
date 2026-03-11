# User Management - Actual Selectors Found

## Exploration Summary

Explored the User Management module on the admin portal and identified the actual selectors being used.

## Base Information

- **Base URL**: `https://corpvoucher.fam-stg.click`
- **Login Credentials**: 
  - Username field: `input[name="username"]`
  - Password field: `input[name="password"]`
  - Submit button: `button[type="submit"]`

## Page URLs

1. **All Users Page**: `/user-listing`
2. **Roles Page**: `/role-listing`
3. **Audit Log Page**: `/audit-log`

## All Users Page Selectors

### Main Elements
- **Search Input**: `input[placeholder="Search"]`
- **Add User Button**: `button:has-text("Add User")`
- **Add New Button** (for D&P): `button:has-text("Add New")`
- **Data Grid**: `.MuiDataGrid-root`
- **Data Grid Rows**: `.MuiDataGrid-row`
- **Data Grid Cells**: `.MuiDataGrid-cell`
- **Column Headers**: `.MuiDataGrid-columnHeader`
- **Edit/Action Buttons**: `.MuiIconButton-root.css-nm0ua4`
- **Sort Buttons**: `button[aria-label="Sort"]`
- **Pagination Previous**: `button[aria-label="Go to previous page"]`
- **Pagination Next**: `button[aria-label="Go to next page"]`

### Add/Edit User Form Fields
- **Dialog/Modal**: `[role="dialog"]`
- **Name Input**: `input[name="name"]` with placeholder "Input name"
- **Email Input**: `input[type="email"]`
- **Role Autocomplete**: `input[placeholder="Choose role"]`
- **Department Autocomplete**: `input[placeholder="Choose department"]`
- **Position Autocomplete**: `input[placeholder="Choose position"]`
- **Save Button**: `[role="dialog"] button:has-text("Save")`
- **Cancel Button**: `button:has-text("Cancel")`
- **Reset Password Button**: `button:has-text("Reset Password")`

### Tabs
- **All Users Tab**: `text=All User`
- **D&P Tab**: `text=Department, text=D&P`

## Roles Page Selectors

### Main Elements
- **Add Role Button**: `button:has-text("Add Role")`
- **Search Input**: `input[placeholder="Search"]`
- **Data Grid**: `.MuiDataGrid-root`
- **Data Grid Rows**: `.MuiDataGrid-row`
- **Data Grid Cells**: `.MuiDataGrid-cell`
- **Column Headers**: `.MuiDataGrid-columnHeader`
- **Action Buttons**: `.MuiIconButton-root`

### Add/Edit Role Form
- **Dialog/Modal**: `[role="dialog"]`
- **Role Name Input**: `input[name="name"]` or `input[name="roleName"]`
- **Permission Checkboxes**: `input[type="checkbox"]`
- **Module Toggles**: `.MuiSwitch-root` or `input[type="checkbox"]`
- **Save Button**: `[role="dialog"] button:has-text("Save")`
- **Cancel Button**: `button:has-text("Cancel")`

## Audit Log Page Selectors

### Main Elements
- **Data Grid**: `.MuiDataGrid-root`
- **Data Grid Rows**: `.MuiDataGrid-row`
- **Column Headers**: `.MuiDataGrid-columnHeader`

### Filters
- **Module Filter**: `input[placeholder="Module"]`
- **Username Filter**: `input[placeholder="Username"]`
- **Timestamp Filter**: `input[type="button"][placeholder="Timestamp"]`
- **Filter Options**: `[role="option"]`

## Common Elements

### Dialogs/Modals
- **Dialog Container**: `[role="dialog"]` or `.MuiDialog-root`
- **Backdrop**: `.MuiBackdrop-root`
- **Close Button**: `button[aria-label="close"]`

### Notifications
- **Success Alert**: `.MuiAlert-standardSuccess`
- **Error Alert**: `.MuiAlert-standardError`
- **Snackbar**: `.MuiSnackbar-root`
- **Alert Message**: `.MuiAlert-message`

### Form Elements
- **Autocomplete**: `.MuiAutocomplete-root`
- **Autocomplete Options**: `[role="option"]`
- **Menu Items**: `[role="menuitem"]` or `.MuiMenuItem-root`
- **Text Input**: `input[type="text"]`
- **Checkbox**: `input[type="checkbox"]`
- **Switch**: `.MuiSwitch-root`

## Key Findings

1. **No Traditional HTML Tables**: The application uses Material-UI DataGrid components instead of standard HTML tables
2. **Autocomplete Fields**: Role, Department, and Position use Material-UI Autocomplete components
3. **Dynamic IDs**: Form field IDs are dynamically generated (e.g., `:r28:`, `:r2b:`)
4. **Name Attributes**: Most reliable selector is `name` attribute for form fields
5. **Text-based Selectors**: Buttons are best selected using `has-text()` selectors
6. **Dialog Pattern**: All forms open in Material-UI Dialog components

## Testing Recommendations

1. Use `waitForTimeout()` after interactions to allow Material-UI animations to complete
2. Use `waitForLoadState('networkidle')` after navigation
3. For autocomplete fields:
   - Click the input to open options
   - Wait for options to appear
   - Click the desired option using `[role="option"]`
4. Check for success/error notifications using `.MuiAlert-root` or `.MuiSnackbar-root`
5. Use `.MuiDataGrid-cell` with `:has-text()` to verify data in the grid

## Example Test Pattern

```typescript
// Navigate to page
await page.goto(`${BASE_URL}/user-listing`);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Open add form
await page.click('button:has-text("Add User")');
await page.waitForTimeout(1000);
await expect(page.locator('[role="dialog"]')).toBeVisible();

// Fill form
await page.fill('input[name="name"]', 'Test User');
await page.fill('input[type="email"]', 'test@example.com');

// Select from autocomplete
await page.click('input[placeholder="Choose role"]');
await page.waitForTimeout(500);
await page.click('[role="option"]').catch(() => {});

// Save
await page.click('[role="dialog"] button:has-text("Save")');
await page.waitForTimeout(2000);

// Verify
await expect(page.locator('.MuiDataGrid-cell:has-text("Test User")')).toBeVisible();
```
