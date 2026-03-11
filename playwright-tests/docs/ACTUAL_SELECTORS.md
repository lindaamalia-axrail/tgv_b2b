# Actual Selectors from Admin Portal

Based on the screenshot provided, here are the actual selectors and navigation paths:

## Navigation
- **Base URL**: `https://corpvoucher.fam-stg.click`
- **Content Management Path**: `/content-management/homepage`
- **Hamburger Menu**: Visible on the left sidebar (collapsed menu icon)

## Homepage Carousel Page

### Page Elements
- **Page Title**: "Homepage" with breadcrumb "Content Management > Homepage"
- **Tabs**: 
  - "Homepage Carousel" (active tab with dark background)
  - "Product Category"
  - "Highlights"

### Table Structure
**Table Headers**:
- HomePage Carousel Title
- Start Date  
- End Date
- Last Update
- Status

### Action Buttons
- **Top Right Buttons**:
  - "Manage Display Sequence" (button with icon)
  - "Add Homepage Carousel" (button with + icon)

- **Row Actions** (for each carousel item):
  - Edit button (pencil icon)
  - Delete button (trash icon)

### Sample Data Visible
1. Corporate selling - 1 Feb 2026 to 31 Jul 2026 (Active - green toggle)
2. Banner 1 - 27 Feb 2025 to 31 Mar 2025 (Inactive - gray toggle)
3. Popcado Card - 22 Jan 2025 to 30 Apr 2025 (Active - green toggle)
4. test audit log - 26 Nov 2025 to 27 Nov 2025 (Inactive)
5. Air Freshener - 01 Nov 2025 to 31 Jan 2026 (Inactive)
6. test again - 11 Nov 2025 to 30 Nov 2025 (Inactive)
7. TGV MAYBANK AMEX PROMO - 16 Nov 2025 to 30 Nov 2025 (Inactive)
8. Test Banner 2 - 6 Nov 2025 to 30 Nov 2025 (Inactive)
9. Test - 6 Nov 2025 to 30 Nov 2025 (Inactive)

### Status Toggle
- Active items have green toggle switches
- Inactive items have gray toggle switches

### Pagination
- Shows "Rows per page: 10" dropdown
- Shows "1-10 of 10" with navigation arrows

## Recommended Selectors

```typescript
// Navigation
const contentManagementMenu = 'a[href*="content-management"], text=Content Management';
const homepageTab = 'button:has-text("Homepage Carousel"), a:has-text("Homepage Carousel")';

// Buttons
const addButton = 'button:has-text("Add Homepage Carousel")';
const manageSequenceButton = 'button:has-text("Manage Display Sequence")';

// Table
const table = 'table';
const tableHeaders = {
  title: 'th:has-text("HomePage Carousel Title")',
  startDate: 'th:has-text("Start Date")',
  endDate: 'th:has-text("End Date")',
  lastUpdate: 'th:has-text("Last Update")',
  status: 'th:has-text("Status")'
};

// Row actions
const editButton = 'button[aria-label="edit"], button:has(svg[data-testid="EditIcon"])';
const deleteButton = 'button[aria-label="delete"], button:has(svg[data-testid="DeleteIcon"])';

// Status toggle
const statusToggle = 'input[type="checkbox"][role="switch"]';
```
