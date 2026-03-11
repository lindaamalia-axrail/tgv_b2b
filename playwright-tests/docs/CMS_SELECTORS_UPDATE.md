# Content Management Selectors Update

## Summary
Explored the Admin Portal Content Management section and updated the test file `03-content-management.spec.ts` with actual working selectors found during exploration.

## Exploration Date
March 5, 2026

## Admin Portal Details
- URL: https://corpvoucher.fam-stg.click/login
- Test Account: lindaamalia+1@axrail.com

## Key Findings

### Navigation Structure
The Content Management section is organized differently than initially assumed:
- **Homepage** contains 3 tabs:
  - HomePage Carousel
  - Product Category (not a separate "Category" page)
  - Highlights
- **Popular Search** is a separate page

### Actual Selectors Found

#### Navigation
- Hamburger Menu: `.MuiIconButton-root:has(svg)` or `getByRole('button').nth(1)`
- Content Management Button: `button:has-text('Content Management')` or `getByRole('button', { name: /Content Management/i })`
- Homepage Link: `getByRole('link', { name: 'Homepage' })`
- Popular Search Link: `getByRole('link', { name: 'Popular Search' })`

#### Tables
- All tables use: `[role="grid"]` (not `table` or `[role="table"]`)
- Column headers use: `columnheader:has-text("Header Name")` (not `th:has-text()`)

#### Homepage Carousel
- Tab: `getByRole('tab', { name: 'HomePage Carousel' })`
- Add Button: `getByRole('button', { name: 'Add HomePage Carousel' })`
- Manage Display Sequence: `button:has-text('Manage Display Sequence')`
- Headers:
  - "HomePage Carousel Title"
  - "Start Date"
  - "End Date"
  - "Last Update"
  - "Status"

#### Product Category (Tab, not separate page)
- Tab: `getByRole('tab', { name: 'Product Category' })`
- Add Button: `getByRole('button', { name: 'Add Product Category' })`
- Headers:
  - "Category Name" (not "Title")
  - "Start Date"
  - "End Date"
  - "Last Update"
  - "Status"

#### Highlights (Tab)
- Tab: `getByRole('tab', { name: 'Highlights' })`
- Add Button: `getByRole('button', { name: 'Add Highlight' })`
- Highlights Name Input: Special textbox at top of page
- Save Button for Name: `button:has-text('Save')`
- Headers:
  - "Highlight Title" (not "Name")
  - "Start Date"
  - "End Date"
  - "Last Update"
  - "Position"

#### Popular Search
- Add Button: `getByRole('button', { name: 'Add' })`
- Manage Display Sequence: `button:has-text('Manage Display Sequence')`
- Headers:
  - "Title" (not "Keyword")
  - "Status"
  - "Last Update" (not "Sequence" in main view)
  - "Actions"

### Form Fields
- File Upload: `input[type="file"]`
- Text Inputs: Use `getByRole('textbox')` with appropriate filters
- Textareas: `locator('textarea')`
- Comboboxes: `getByRole('combobox')`
- Checkboxes: `getByRole('checkbox')` or `locator('checkbox')`
- Save Button: `getByRole('button', { name: /Save/i })` or `button:has-text('Save Changes')`
- Cancel Button: `getByRole('button', { name: 'Cancel' })`

### Row Actions
- Edit buttons: Inline buttons with images
- Delete buttons: Inline buttons with images
- Status toggles: Checkboxes in the Status column
- Position dropdowns (Highlights): Comboboxes

## Changes Made to Test File

### Helper Functions Updated
1. `navigateToHomepageCarousel()` - Updated to use correct selectors
2. `navigateToCategory()` - Changed to navigate to Product Category tab instead of separate page
3. `navigateToPopularSearch()` - Updated to use correct selectors
4. `navigateToHighlights()` - NEW helper function added

### Test Cases Updated
- TC_CMS001: Updated table and header selectors
- TC_CMS002: Updated form field selectors
- TC_CMS003: Updated save button and URL check
- TC_CMS014: Updated to use Product Category tab, corrected header names
- TC_CMS015: Updated form selectors
- TC_CMS023: Updated to use new helper, corrected header names
- TC_CMS024: Updated form selectors
- TC_CMS037: Updated table and header selectors
- TC_CMS038: Updated form selectors

### Remaining Test Cases
The following test cases still need manual review and updates:
- TC_CMS004-TC_CMS013 (Homepage Carousel tests)
- TC_CMS016-TC_CMS022 (Category tests)
- TC_CMS025-TC_CMS036 (Highlights tests)
- TC_CMS039-TC_CMS044 (Popular Search tests)

These tests follow similar patterns and should be updated using the same selector patterns documented above.

## Screenshots Captured
1. `cms-homepage-carousel.png` - Homepage Carousel listing
2. `cms-homepage-carousel-add-form.png` - Add carousel form
3. `cms-product-category.png` - Product Category tab
4. `cms-highlights.png` - Highlights tab
5. `cms-popular-search.png` - Popular Search page

## Selector Reference File
Created `cms-actual-selectors.json` with comprehensive selector mappings for all sections.

## Next Steps
1. Run the updated tests to verify they work correctly
2. Update remaining test cases following the same patterns
3. Add proper test data files (carousel-image.jpg, highlight-image.jpg, etc.)
4. Consider adding more specific waits instead of fixed timeouts
5. Add error handling for edge cases
