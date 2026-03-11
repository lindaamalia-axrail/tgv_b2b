# Buy Vouchers Test Cleanup Summary

## Issue
The `02-buy-vouchers.spec.ts` file had 29 test scenarios, but the Excel file shows only 21 scenarios for the "Voucher Detail Page" module under "Buy" section.

## Duplicates Removed

### Removed Tests (8 duplicates):
1. **TC001 (old)** - "Voucher detail page shows two purchase paths" - Redundant as it's covered by TC001 (Buy Now) and TC002 (Add to Cart) separately
2. **TC020 (old)** - "Direct purchase bypasses cart" - Duplicate of TC001 (Direct Buy Now)
3. **TC021 (old)** - "Cart maintains state across navigation" - Duplicate of TC004 (Cart maintains state)
4. **TC022 (old)** - "Proceed to checkout from cart" - Duplicate of TC005 (Proceed to checkout)
5. **TC034 (old)** - "Checkout multiple vouchers" - Duplicate of TC007 (Handle multi-item cart purchase)
6. **TC036 (old)** - "Direct Buy Now option is available" - Duplicate of TC001 (Direct Buy Now)
7. **TC037 (old)** - "Add to Cart option is available" - Duplicate of TC002 (Add to Cart)
8. **TC038-TC046 (old)** - Various duplicates of existing scenarios

## Final Test Count: 36 Scenarios

### Voucher Detail Page Module (TC001-TC021):
1. TC001: Direct Buy Now directs to checkout with selected product
2. TC002: Add to Cart adds voucher and confirms successful addition
3. TC003: Checkout pre-populated with selected voucher details and quantity
4. TC004: Cart maintains state with added vouchers across navigation
5. TC005: Proceed to checkout from cart with selected items
6. TC006: Single checkout process for both purchase paths (Buy Now and Add to Cart)
7. TC007: Handle multi-item cart purchase (checkout multiple vouchers)
8. TC008: Process payment transactions securely
9. TC009: Complete purchase transactions successfully
10. TC010: Provide purchase confirmation upon successful transaction
11. TC011: Update inventory/voucher availability after successful purchase
12. TC012: Generate purchase receipts or confirmation details
13. TC013: Out of stock voucher shows Remind Me button
14. TC014: eGHL gateway timeout redirects to order detail with payment failed status
15. TC015: Checkout timeout redirects to cart page
16. TC016: Validate voucher information on detail page (image, name, price, details)
17. TC017: Remove voucher from cart
18. TC018: Increase quantity in cart
19. TC019: Check maximum quantity limit for purchase
20. TC020: Cancel payment in eGHL gateway redirects to order detail with cancelled status
21. TC021: Checkout with quantity greater than 1 (bulk purchase)

### Cart Page Module (TC022-TC023):
22. TC022: Cart page - checkout voucher with quantity = 10
23. TC023: Cart page - checkout multiple vouchers

### Checkout Page Module (TC024-TC028):
24. TC024: Checkout page - process payment transactions securely
25. TC025: Checkout page - complete purchase transactions successfully
26. TC026: Checkout page - provide purchase confirmation upon successful transaction
27. TC027: Checkout page - update inventory after successful purchase
28. TC028: Checkout page - generate purchase receipts or confirmation details

### Corporate Voucher Module (TC029):
29. TC029: Corporate Voucher page - cancel payment in eGHL payment gateway

### My Cart Page Module (TC030-TC036):
30. TC030: My Cart Page - system shall maintain the cart state even if user navigates to other pages
31. TC031: My Cart Page - system shall allow users to proceed to checkout from their cart
32. TC032: My Cart Page - system shall provide a single checkout process regardless of purchase path (Buy Now or Add to Cart)
33. TC033: My Cart Page - Buy Now
34. TC034: My Cart Page - remove voucher from cart
35. TC035: My Cart Page - increase/decrease quantity in cart
36. TC036: My Cart Page - set voucher quantity to 10 in cart

## Verification
- Excel file filtered for "Voucher Detail Page" module: **21 scenarios** ✓
- Excel file "Cart Page" module: **2 scenarios** ✓
- Excel file "Checkout Page" module: **5 scenarios** ✓
- Excel file "Corporate Voucher" module: **1 scenario** ✓
- Excel file "My Cart Page" module: **7 scenarios** ✓
- Updated spec file test count: **36 scenarios** ✓
- No syntax errors: **Verified** ✓

## Date
- Initial cleanup: 2026-03-02
- Added Cart Page scenarios: 2026-03-02
- Added Checkout Page scenarios: 2026-03-02
- Added Corporate Voucher scenario: 2026-03-02
- Added My Cart Page scenarios: 2026-03-02
