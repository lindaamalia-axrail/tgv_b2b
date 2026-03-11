# My Order Page Selectors

## Exploration Findings

### My Order Page (`/my-order`)
- **URL**: `https://corporate-voucher-stg.fam-stg.click/my-order`
- **Status**: Page exists but may be empty if no orders have been placed

### Buy/Voucher Flow
- **Voucher Cards**: `a[href*="/products/"]`
- **Quantity Input**: `input[type="number"]`
- **Add to Cart Button**: `button:has-text("Add to Cart")`
- **Buy Now Button**: `button:has-text("Buy Now")`

### Cart Page (`/cart`)
- **Checkout Button**: `button:has-text("Checkout")`
  - Note: Button is disabled until cart has valid items

### Known Issues
1. Checkout button is disabled on cart page - need to investigate why
2. My Order page appears empty - may need to complete a purchase first to see order data
3. Need to explore the complete checkout flow to understand payment integration

### Next Steps
1. Complete a full purchase flow to generate order data
2. Explore My Order page with actual orders
3. Extract selectors for:
   - Order cards/items
   - Order status
   - Booking numbers
   - Search/filter functionality
   - Order details page
   - Receipt viewing

### Test Credentials
- Email: `lindaamalia@axrail.com`
- Password: `Rahasia567_`
