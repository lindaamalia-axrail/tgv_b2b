# Authentication Solution - Login Once Per Test File

## Summary

Successfully implemented "login once per test file" approach for the Content Management tests using localStorage token injection.

## Implementation

### File: `tests/admin-portal/03-content-management.spec.ts`

**Key Features:**
1. **Login ONCE** in `test.beforeAll()` hook
2. **Shared authenticated page** across all 20 tests
3. **Serial execution** with `test.describe.configure({ mode: 'serial' })`
4. **Helper functions** for navigation to avoid code duplication

### Authentication Method

```typescript
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  authenticatedPage = await context.newPage();
  
  // Navigate to the site
  await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/'));
  
  // Inject localStorage tokens
  await authenticatedPage.evaluate((tokens) => {
    for (const [key, value] of Object.entries(tokens)) {
      window.localStorage.setItem(key, value);
    }
  }, ADMIN_LOCALSTORAGE_TOKENS);
  
  // Reload to apply the tokens
  await authenticatedPage.reload();
  await authenticatedPage.waitForTimeout(2000);
});
```

## Actual Selectors Discovered

### Navigation
- **Hamburger Menu**: `.MuiIconButton-root:has(svg)`
- **Content Management**: `text=Content Management`
- **Homepage**: `text=Homepage`
- **Category**: `text=Category`
- **Popular Search**: `text=Popular Search`

### Homepage Carousel Page
- **URL**: `https://corpvoucher.fam-stg.click/content-management/homepage/homepage-carousel`
- **Table Type**: MUI Table (NOT standard HTML `<table>`)
- **Table Selector**: `[role="table"]` or `.MuiTable-root`
- **Header Selector**: `[role="columnheader"]` or `.MuiTableCell-head`
- **Row Selector**: `[role="row"]:not(:first-child)` or `.MuiTableRow-root:not(:first-child)`

### Table Headers
- HomePage Carousel Title
- Start Date
- End Date
- Last Update
- Status

### Tabs
- HomePage Carousel
- Product Category
- Highlights

### Buttons
- "Add HomePage Carousel"
- "Manage Display Sequence"

## Helper Functions

Three navigation helper functions to avoid code duplication:

1. `navigateToHomepageCarousel()` - Opens hamburger → Content Management → Homepage
2. `navigateToCategory()` - Opens hamburger → Content Management → Category  
3. `navigateToPopularSearch()` - Opens hamburger → Content Management → Popular Search

## Benefits

1. **Performance**: Login happens once, not 20 times
2. **Reliability**: Consistent authentication state across tests
3. **Maintainability**: Helper functions reduce code duplication
4. **Debugging**: Easier to debug with serial execution

## Configuration Changes

Removed setup project dependency from `playwright.config.ts`:
- No longer runs `auth.setup.ts`
- Tests use localStorage injection directly
- Faster test execution

## Token Management

Tokens are stored in `utils/auth-helper.ts` as `ADMIN_LOCALSTORAGE_TOKENS`.

**Note**: Cognito tokens expire after ~1 hour. To refresh:
1. Login manually to admin portal
2. Open browser console
3. Run: `JSON.stringify(localStorage, null, 2)`
4. Copy output and update `ADMIN_LOCALSTORAGE_TOKENS` in `utils/auth-helper.ts`

## Next Steps

The public web tests (`02-buy-vouchers.spec.ts`) are currently failing because they use placeholder selectors. These need to be updated with actual selectors from the public website, similar to what we did for the admin portal.
