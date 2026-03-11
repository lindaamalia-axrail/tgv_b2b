# Public Web Portal - Actual Selectors

## Authentication
- **Email Input**: `input[id="email"]`
- **Password Input**: `input[id="password"]`
- **Sign In Button**: `button:has-text("Sign In")`
- **Sign Up Link**: `a:has-text("Sign Up")`

## Navigation (After Login)
- **User Profile Button**: `a[href="/profile"]` (shows initials "LA")
- **User Name Link**: `a:has-text("Linda Axrail")` or `a[href="/profile"]`
- **Buy Voucher**: `a[href="/buy"]` or `a:has-text("Buy Voucher")`
- **Send Voucher**: `a[href="/send-voucher"]` or `a:has-text("Send Voucher")`
- **My Order**: `a[href="/my-orders"]` or `a:has-text("My Order")`
- **Inventory**: `a[href="/inventory"]` or `a:has-text("Inventory")`
- **Cart**: `a[href*="cart"]`

## Home Page
- **Voucher Cards**: `a[href*="/products/"]`
- **Voucher Card Class**: Contains `border-2 border-red-600 rounded-md`
- **Voucher Card Selector**: `a[href*="/products/"].flex.flex-col`

## Buy Voucher Page
- **URL**: `/buy`
- **Voucher Cards**: Same as home page `a[href*="/products/"]`

## Voucher Detail Page
- **URL Pattern**: `/products/{voucher-slug}`
- **Add to Cart Button**: `button:has-text("Add to Cart")` or `button:has-text("Add To Cart")`
- **Buy Now Button**: `button:has-text("Buy Now")` or `button:has-text("Buy")`
- **Quantity Input**: `input[type="number"]`
- **Increase Quantity**: `button:has-text("+")`
- **Decrease Quantity**: `button:has-text("-")`
- **Back Button**: `button:has-text("Back")`

## Cart Page
- **URL**: `/cart`
- **Empty Cart Message**: `text=Your cart is empty`
- **Continue Shopping Button**: `button:has-text("Continue Shopping")`
- **Cart Items**: (when not empty) - need to add items first to see selectors
- **Checkout Button**: `button:has-text("Checkout")` or `button:has-text("Proceed")`

## My Order Page
- **URL**: `/my-orders`
- **Search Input**: `input[placeholder*="Search" i]`
- **Order Table**: (empty in test - need actual orders to see structure)

## Send Voucher Page
- **URL**: `/send-voucher`
- **Search Input**: `input[placeholder="Search by Batch"]`
- **Filter Date Button**: `button:has-text("Filter Date")`
- **Download Report Button**: `button:has-text("Download Report")`

## Common Patterns
- All navigation links use `a[href="..."]`
- Buttons use `button:has-text("...")`
- The site uses Tailwind CSS classes
- Voucher cards have consistent styling with red borders

## Test Data
- **Login Email**: `lindaamalia@axrail.com`
- **Login Password**: `Rahasia567_`
- **User Display Name**: `Linda Axrail`
- **User Initials**: `LA`
