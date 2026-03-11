# Buy Vouchers - Actual Selectors

## Exploration Date
2026-03-02

## Test Environment
- URL: https://corporate-voucher-stg.fam-stg.click/
- Login: lindaamalia@axrail.com / Rahasia567_

## Verified Selectors

### Navigation
- **Buy Voucher Link**: `text=Buy Voucher` or navigation link with "Buy" text
- **Cart Icon/Link**: `a[href*="cart"]`

### Voucher List Page
- **Voucher Cards**: `a[href*="/products/"]`
- **Total Found**: 9 vouchers during exploration
- **Example href**: `/products/create-voucher-2-tengok`

### Voucher Detail Page
- **Quantity Input**: `input[type="number"]`
- **Buy Now Button**: `button:has-text("Buy Now")` (when in stock)
- **Add to Cart Button**: `button:has-text("Add to Cart")` (when in stock)
- **Remind Me Button**: `button:has-text("Remind Me")` (when out of stock)
- **Back Button**: `button:has-text("Back")`
- **Details Section**: `button:has-text("Details")`
- **Terms and Conditions**: `button:has-text("Terms and Conditions")`
- **Price Display**: `text=/RM\\s*\\d+/`
- **Voucher Name**: `h1, h2` (first occurrence)

### Cart Page
- **Cart Items**: `input[type="number"]` (quantity inputs)
- **Item Checkboxes**: `[role="checkbox"]`
- **Checkout Button**: `button:has-text("Checkout")` 
  - Shows count: `button:has-text("Checkout (5)")`
  - Disabled when no items selected
- **Total Price Display**: `text=/total/i`

### Checkout Page
- **Proceed to Payment Button**: `button:has-text("Proceed to Payment")`
- **Place Order Button**: `button:has-text("Place Order")`

## Important Notes

1. **Out of Stock Vouchers**:
   - Show "Remind Me" button instead of "Buy Now" / "Add to Cart"
   - Quantity input shows 0 and may be disabled
   - Need to select in-stock vouchers for testing purchase flows

2. **Cart Behavior**:
   - Items must be selected via checkbox before checkout
   - Checkout button shows item count: "Checkout (5)"
   - Checkout button is disabled when no items selected

3. **Navigation Flow**:
   - Homepage → Buy Voucher → Voucher List → Voucher Detail
   - Voucher Detail → Buy Now → Checkout (direct)
   - Voucher Detail → Add to Cart → Cart → Checkout

4. **Selector Strategy**:
   - Use `text=` for button labels (most reliable)
   - Use `[href*=""]` for navigation links
   - Use `[role="checkbox"]` for item selection
   - Use `input[type="number"]` for quantity fields

## Screenshots Reference
All screenshots saved in `playwright-tests/screenshots/`:
- `buy-01-login-page.png` - Login page
- `buy-02-homepage.png` - After login homepage
- `buy-03-voucher-list.png` - Voucher listing page
- `buy-04-voucher-detail.png` - Voucher detail page (out of stock example)
- `buy-06-after-add-to-cart.png` - After adding to cart
- `buy-07-cart-page.png` - Cart page with items
- `buy-08-cart-item-selected.png` - Cart with item selected
- `buy-09-checkout-from-cart.png` - Checkout page from cart

## Recommendations for Test Updates

1. **Use nth() selector** for selecting specific vouchers:
   ```typescript
   await page.locator('a[href*="/products/"]').nth(1).click(); // Select 2nd voucher
   ```

2. **Check for out-of-stock** before testing purchase:
   ```typescript
   const remindMeButton = page.locator('button:has-text("Remind Me")');
   if (await remindMeButton.isVisible()) {
     // Voucher is out of stock, skip or go back
   }
   ```

3. **Wait for checkout button to be enabled**:
   ```typescript
   await page.waitForSelector('button:has-text("Checkout"):not([disabled])');
   ```

4. **Select multiple items in cart**:
   ```typescript
   const checkboxes = page.locator('[role="checkbox"]');
   for (let i = 0; i < 2; i++) {
     await checkboxes.nth(i).click();
     await page.waitForTimeout(300);
   }
   ```
