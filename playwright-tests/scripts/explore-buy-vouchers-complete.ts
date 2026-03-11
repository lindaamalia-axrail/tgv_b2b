import { chromium } from '@playwright/test';

/**
 * Comprehensive exploration script for Buy Vouchers flow
 * Based on Buy Voucher Public Web.xlsx test scenarios
 */
async function exploreBuyVouchersFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Starting Buy Vouchers Exploration ===\n');

    // Login first
    console.log('1. Logging in...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.fill('#email', 'lindaamalia@axrail.com');
    await page.fill('#password', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in successfully\n');

    // Navigate to homepage
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForTimeout(2000);

    // Step 1: Search for AUTOMATION TEST VOUCHER
    console.log('2. Searching for AUTOMATION TEST VOUCHER...');
    
    // Click search icon
    const searchIcon = page.locator('button[aria-label*="search" i], button:has(svg):has-text(""), [data-testid*="search"]').first();
    await searchIcon.click();
    await page.waitForTimeout(1000);
    
    // Type in search box
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    await searchInput.fill('AUTOMATION TEST VOUCHER');
    await page.waitForTimeout(2000);
    
    // Look for vouchers without "Restock Soon" label
    console.log('3. Finding vouchers without "Restock Soon" label...');
    const allVouchers = page.locator('a[href*="/products/"]');
    const voucherCount = await allVouchers.count();
    console.log(`Found ${voucherCount} vouchers`);
    
    let selectedVoucher = null;
    for (let i = 0; i < voucherCount; i++) {
      const voucher = allVouchers.nth(i);
      const voucherText = await voucher.textContent();
      
      // Check if it doesn't have "Restock Soon"
      const hasRestockSoon = voucherText?.includes('Restock Soon') || voucherText?.includes('Out of Stock');
      
      if (!hasRestockSoon) {
        console.log(`✓ Found available voucher at index ${i}`);
        selectedVoucher = voucher;
        break;
      }
    }

    if (!selectedVoucher) {
      console.log('No available vouchers found, using first voucher');
      selectedVoucher = allVouchers.first();
    }

    // Click on the voucher
    await selectedVoucher.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Opened voucher detail page\n');

    // Explore Voucher Detail Page
    console.log('=== VOUCHER DETAIL PAGE SELECTORS ===\n');
    
    // Voucher title
    const title = page.locator('h1, h2').first();
    console.log('Title selector:', await title.textContent());
    
    // Voucher image
    const image = page.locator('img[alt*="voucher" i], img[alt*="product" i], img').first();
    console.log('Image found:', await image.isVisible());
    
    // Price
    const price = page.locator('text=/RM\\s*\\d+/').first();
    console.log('Price:', await price.textContent());
    
    // Quantity input
    const qtyInput = page.locator('input[type="number"]');
    console.log('Quantity input found:', await qtyInput.isVisible());
    
    // Buy Now button
    const buyNowBtn = page.locator('button:has-text("Buy Now"), button:has-text("BUY NOW")');
    console.log('Buy Now button found:', await buyNowBtn.isVisible());
    console.log('Buy Now button text:', await buyNowBtn.textContent());
    
    // Add to Cart button
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("ADD TO CART")');
    console.log('Add to Cart button found:', await addToCartBtn.isVisible());
    console.log('Add to Cart button text:', await addToCartBtn.textContent());
    
    // Bulk Purchase button
    const bulkPurchaseBtn = page.locator('button:has-text("bulk" i), a:has-text("bulk" i)');
    if (await bulkPurchaseBtn.isVisible()) {
      console.log('Bulk Purchase button found:', await bulkPurchaseBtn.textContent());
    }
    
    console.log('\n=== Testing Add to Cart Flow ===\n');
    
    // Set quantity to 2
    await qtyInput.fill('2');
    console.log('✓ Set quantity to 2');
    
    // Click Add to Cart
    await addToCartBtn.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Add to Cart');
    
    // Navigate to cart
    console.log('\n4. Navigating to cart...');
    const cartIcon = page.locator('a[href*="cart"], button[aria-label*="cart" i]');
    await cartIcon.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Opened cart page\n');
    
    // Explore Cart Page
    console.log('=== CART PAGE SELECTORS ===\n');
    
    // Cart items
    const cartItems = page.locator('input[type="number"]');
    const cartItemCount = await cartItems.count();
    console.log(`Cart items count: ${cartItemCount}`);
    
    // Checkboxes
    const checkboxes = page.locator('[role="checkbox"], input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Checkboxes count: ${checkboxCount}`);
    
    if (checkboxCount > 0) {
      console.log('✓ Selecting first item...');
      await checkboxes.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Delete button
    const deleteBtn = page.locator('button:has(svg[data-testid*="delete" i]), button[aria-label*="delete" i], button[aria-label*="remove" i]');
    console.log('Delete button found:', await deleteBtn.isVisible());
    
    // Checkout button
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("CHECKOUT")');
    console.log('Checkout button found:', await checkoutBtn.isVisible());
    console.log('Checkout button enabled:', await checkoutBtn.isEnabled());
    
    // Total price
    const totalPrice = page.locator('text=/total/i, text=/RM\\s*\\d+/').last();
    console.log('Total price:', await totalPrice.textContent());
    
    // Continue Shopping button
    const continueShoppingBtn = page.locator('button:has-text("Continue Shopping"), a:has-text("Continue Shopping")');
    if (await continueShoppingBtn.isVisible()) {
      console.log('Continue Shopping button found');
    }
    
    console.log('\n=== Testing Checkout Flow ===\n');
    
    // Click Checkout
    if (await checkoutBtn.isEnabled()) {
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');
      console.log('✓ Clicked Checkout\n');
      
      // Explore Checkout Page
      console.log('=== CHECKOUT PAGE SELECTORS ===\n');
      
      // Voucher details in checkout
      const checkoutItems = page.locator('text=/voucher/i, text=/movie/i').first();
      console.log('Checkout items found:', await checkoutItems.isVisible());
      
      // Quantity display
      const qtyDisplay = page.locator('text=/quantity/i, text=/qty/i');
      if (await qtyDisplay.isVisible()) {
        console.log('Quantity display:', await qtyDisplay.textContent());
      }
      
      // Subtotal
      const subtotal = page.locator('text=/subtotal/i');
      if (await subtotal.isVisible()) {
        console.log('Subtotal:', await subtotal.textContent());
      }
      
      // Total
      const total = page.locator('text=/total/i').last();
      console.log('Total:', await total.textContent());
      
      // Proceed to Payment button
      const proceedBtn = page.locator('button:has-text("Proceed to Payment"), button:has-text("PROCEED TO PAYMENT")');
      console.log('Proceed to Payment button found:', await proceedBtn.isVisible());
      console.log('Proceed to Payment button text:', await proceedBtn.textContent());
      
      // Take screenshot
      await page.screenshot({ path: 'playwright-tests/buy-vouchers-checkout.png', fullPage: true });
      console.log('✓ Screenshot saved: buy-vouchers-checkout.png');
    }
    
    console.log('\n=== Testing Buy Now Flow ===\n');
    
    // Go back to voucher detail
    await page.goBack();
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Or navigate to a new voucher
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.click('text=Buy Voucher');
    await page.waitForTimeout(1000);
    
    // Click on first available voucher
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Set quantity
    const qtyInput2 = page.locator('input[type="number"]');
    await qtyInput2.fill('1');
    
    // Click Buy Now
    const buyNowBtn2 = page.locator('button:has-text("Buy Now"), button:has-text("BUY NOW")');
    await buyNowBtn2.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Clicked Buy Now - should go directly to checkout');
    
    // Verify we're on checkout page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    console.log('Is checkout page:', currentUrl.includes('checkout'));
    
    // Take final screenshot
    await page.screenshot({ path: 'playwright-tests/buy-vouchers-buy-now.png', fullPage: true });
    console.log('✓ Screenshot saved: buy-vouchers-buy-now.png');
    
    console.log('\n=== Exploration Complete ===');
    console.log('Check screenshots for visual confirmation');
    
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await browser.close();
  }
}

exploreBuyVouchersFlow();
