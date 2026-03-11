# Next Steps - Public Web Test Implementation

## ✅ Completed

1. **Admin Portal Tests**
   - Implemented "login once per test file" authentication using localStorage tokens
   - Extracted actual selectors from admin portal (MUI Table components)
   - Created helper functions for navigation
   - Fixed Content Management tests (03-content-management.spec.ts)
   - Documented all selectors in `docs/ACTUAL_SELECTORS.md`

2. **Public Web Exploration**
   - Successfully logged into public web portal
   - Extracted all actual selectors from:
     - Login page
     - Home page
     - Buy Voucher page
     - Voucher Detail page
     - Cart page
     - My Order page
     - Send Voucher page
   - Documented selectors in `docs/PUBLIC_WEB_SELECTORS.md`
   - Saved detailed selector data in `public-web-selectors-detailed.json`
   - Created screenshots of all pages

## 🔄 To Do

### 1. Update Public Web Test Files

Need to update these test files with actual selectors:

- `tests/public-web/01-login-authentication.spec.ts` ✅ (already has correct selectors)
- `tests/public-web/02-buy-vouchers.spec.ts` ❌ (needs update)
- `tests/public-web/03-send-vouchers.spec.ts` ❌ (needs update)
- `tests/public-web/04-my-order.spec.ts` ❌ (needs update)

### 2. Key Selector Updates Needed

**02-buy-vouchers.spec.ts:**
- Replace `.voucher-card` with `a[href*="/products/"]`
- Replace `.cart-icon` with `a[href*="cart"]`
- Replace `.cart-item` with actual cart item selector (need to add item to cart first)
- Update all button selectors to use `button:has-text("...")`

**03-send-vouchers.spec.ts:**
- Update form selectors based on actual page structure
- Use `input[placeholder="Search by Batch"]` for search
- Use `button:has-text("Filter Date")` and `button:has-text("Download Report")`

**04-my-order.spec.ts:**
- Update table selectors (need to check if it's standard table or MUI table)
- Use `input[placeholder*="Search" i]` for search
- Update order detail selectors

### 3. Implement "Login Once" for Public Web Tests

Apply the same pattern as admin portal:
```typescript
test.describe.configure({ mode: 'serial' });

test.describe('Public Web - ...', () => {
  let authenticatedPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Login once and reuse page
  });

  // All tests use authenticatedPage
});
```

### 4. Create Page Object Models

Create POM classes for public web pages:
- `pages/public-web/HomePage.ts`
- `pages/public-web/BuyVoucherPage.ts`
- `pages/public-web/VoucherDetailPage.ts`
- `pages/public-web/CartPage.ts`
- `pages/public-web/MyOrderPage.ts`
- `pages/public-web/SendVoucherPage.ts`

### 5. Add Missing Test Scenarios

Current: 59 tests in public web
Target: Need to add more tests to reach 405 total

## 📝 Notes

- Public web uses Tailwind CSS (not MUI like admin portal)
- Voucher cards are `<a>` tags with href `/products/{slug}`
- Cart was empty during exploration - need to test with items
- My Order page was empty - need actual orders to verify selectors
- All navigation uses simple `<a>` tags with href attributes

## 🚀 Quick Start

To continue implementation:

1. Update `02-buy-vouchers.spec.ts` with selectors from `PUBLIC_WEB_SELECTORS.md`
2. Test the updated file
3. Repeat for other public web test files
4. Add "login once" pattern to all public web tests
5. Create additional test scenarios to reach 405 total
