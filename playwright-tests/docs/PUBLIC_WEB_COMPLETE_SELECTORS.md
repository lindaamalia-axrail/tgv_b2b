# Public Web - Complete Actual Selectors

## Login Page
- **Email Input**: `input[id="email"]`
- **Password Input**: `input[id="password"]`
- **Sign In Button**: `button:has-text("Sign In")`
- **Sign Up Link**: `a:has-text("Sign Up")`

## Navigation
- **Buy Voucher**: `a:has-text("Buy Voucher")`
- **Send Voucher**: `a:has-text("Send Voucher")`
- **My Order**: `a:has-text("My Order")`
- **Inventory**: `a:has-text("Inventory")`
- **Cart**: `a[href*="cart"]`
- **User Profile**: `a[href="/profile"]`

## Buy Voucher Page / Home Page
- **Voucher Cards**: `a[href*="/products/"]`
- **Out of Stock Indicator**: `text=/Restock Soon/i`

## Voucher Detail Page
- **Title**: `h1`
- **Image**: `img[alt*="voucher" i]`
- **Price**: `text=/RM\\s*\\d+/`
- **Description**: `p`
- **Quantity Input**: `input[type="number"]`
- **Add to Cart Button**: `button:has-text("Add to Cart")`
- **Buy Now Button**: `button:has-text("Buy Now")`
- **Remind Me Button** (for out of stock): `button:has-text("Remind Me")`
- **Success Message** (after add to cart): `text=/added.*cart/i`

## Cart Page
- **URL**: `/cart`
- **Cart Item Container**: `div:has(img):has(input[type="number"])`
- **Quantity Input**: `input[type="number"]`
- **Quantity Increase/Decrease**: Buttons with SVG icons (no text)
- **Checkbox** (select item): `input[type="checkbox"]` or `[role="checkbox"]`
- **Select All**: `text=Select All`
- **Checkout Button**: `button:has-text("Checkout")`
- **Continue Shopping Button**: `button:has-text("Continue Shopping")`
- **Get Quotation Button**: `button:has-text("Get Quotation")`
- **Ask for Assistance Button**: `button:has-text("Ask for Assistance")`
- **Empty Cart Message**: `text=/empty/i` or `text=/no items/i`
- **Total Price**: `text=/Total.*RM/i`

## Checkout Page
- **URL Pattern**: `/checkout?cartType=buynow&productSeoUrl=...`
- **Proceed to Payment Button**: `button:has-text("Proceed to Payment")`

## My Order Page
- **URL**: `/my-orders`
- **Search Input**: `input[placeholder*="Search" i]`
- **Order Items**: (empty in test - need actual orders)
- **View Receipt Button**: `button:has-text("View Receipt")` or `button:has-text("Download Receipt")`

## Send Voucher Page
- **URL**: `/send-voucher`
- **Search Input**: `input[placeholder="Search by Batch"]`
- **Filter Date Button**: `button:has-text("Filter Date")`
- **Download Report Button**: `button:has-text("Download Report")`

## Common Patterns
1. All navigation uses `a:has-text("...")` or `a[href="..."]`
2. All buttons use `button:has-text("...")`
3. Quantity controls use `input[type="number"]`
4. Checkboxes use `input[type="checkbox"]` or `[role="checkbox"]`
5. Success messages use `text=/pattern/i` for case-insensitive matching
6. Price elements use `text=/RM\\s*\\d+/` regex pattern

## Test Credentials
- **Email**: `lindaamalia@axrail.com`
- **Password**: `Rahasia567_`

## Notes
- The site uses Tailwind CSS
- Voucher cards are `<a>` tags with href `/products/{slug}`
- Cart items are complex div structures with images and quantity inputs
- Quantity +/- buttons use SVG icons without text
- Some pages may be empty (My Orders, Inventory) if no data exists
