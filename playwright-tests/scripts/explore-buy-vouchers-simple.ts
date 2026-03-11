import { chromium } from '@playwright/test';

/**
 * Simple exploration script for Buy Vouchers flow
 * Navigates directly to Buy Voucher page
 */
async function exploreBuyVouchers() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
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

    // Navigate to Buy Voucher
    console.log('2. Navigating to Buy Voucher...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForTimeout(2000);
    
    // Click Buy Voucher in navigation
    await page.click('text=Buy Voucher');
    await page.waitForLoadState('networkidle');
    console.log('✓ On Buy Voucher page\n');

    // Find AUTOMATION TEST VOUCHER without Restock Soon
    console.log('3. Looking for AUTOMATION TEST VOUCHER...');
    const allVouchers = page.locator('a[href*="/products/"]');
    const voucherCount = await allVouchers.count();
    console.log(`Found ${voucherCount} vouchers\n`);
    
    let selectedVoucherIndex = -1;
    for (let i = 0; i < Math.min(voucherCount, 10); i++) {
      const voucher = allVouchers.nth(i);
      const voucherText = await voucher.textContent();
      console.log(`Voucher ${i}: ${voucherText?.substring(0, 50)}...`);
      
      // Check if it contains AUTOMATION and doesn't have Restock Soon
      if (voucherText?.includes('AUTOMATION') && !voucherText?.includes('Restock Soon')) {
        console.log(`✓ Found AUTOMATION TEST VOUCHER at index ${i}\n`);
        selectedVoucherIndex = i;
        break;
      }
    }

    // If not found, use first voucher
    if (selectedVoucherIndex === -1) {
      console.log('AUTOMATION TEST VOUCHER not found, using first available voucher\n');
      selectedVoucherIndex = 0;
    }

    // Click on the selected voucher
    await allVouchers.nth(selectedVoucherIndex).click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Opened voucher detail page\n');

    // Explore Voucher Detail Page
    console.log('=== VOUCHER DETAIL PAGE ===\n');
    
    // Get page snapshot
    const snapshot = await page.content();
    
    // Title
    const title = page.locator('h1').first();
    if (await title.isVisible()) {
      console.log('Title:', await title.textContent());
    }
    
    // Price
    const priceSelectors = [
      'text=/RM\\s*\\d+/',
      '[class*="price"]',
      '[data-testid*="price"]'
    ];
    
    for (const selector of priceSelectors) {
      const priceElem = page.locator(selector).first();
      if (await priceElem.isVisible().catch(() => false)) {
        console.log('Price:', await priceElem.textContent());
        break;
      }
    }
    
    // Quantity input
    const qtyInput = page.locator('input[type="number"]');
    console.log('Quantity input visible:', await qtyInput.isVisible());
    
    // Buttons
    console.log('\nButtons on page:');
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const btnText = await buttons.nth(i).textContent();
      console.log(`  Button ${i}: "${btnText?.trim()}"`);
    }
    
    // Look for specific buttons
    const buyNowBtn = page.locator('button').filter({ hasText: /buy now/i });
    const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
    const remindMeBtn = page.locator('button').filter({ hasText: /remind me/i });
    
    console.log('\nKey buttons:');
    console.log('Buy Now button visible:', await buyNowBtn.isVisible().catch(() => false));
    console.log('Add to Cart button visible:', await addToCartBtn.isVisible().catch(() => false));
    console.log('Remind Me button visible:', await remindMeBtn.isVisible().catch(() => false));
    
    // Test Add to Cart flow
    if (await addToCartBtn.isVisible()) {
      console.log('\n=== Testing Add to Cart ===\n');
      
      // Set quantity
      await qtyInput.fill('2');
      console.log('✓ Set quantity to 2');
      
      // Click Add to Cart
      await addToCartBtn.click();
      await page.waitForTimeout(3000);
      console.log('✓ Clicked Add to Cart');
      
      // Navigate to cart
      console.log('\n4. Navigating to cart...');
      const cartLink = page.locator('a[href*="cart"]').first();
      await cartLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✓ On cart page\n');
      
      // Explore Cart Page
      console.log('=== CART PAGE ===\n');
      
      // Cart items
      const cartQtyInputs = page.locator('input[type="number"]');
      console.log('Cart items:', await cartQtyInputs.count());
      
      // Checkboxes
      const checkboxes = page.locator('[type="checkbox"], [role="checkbox"]');
      console.log('Checkboxes:', await checkboxes.count());
      
      // Select first item
      if (await checkboxes.count() > 0) {
        await checkboxes.first().click();
        await page.waitForTimeout(1000);
        console.log('✓ Selected first item');
      }
      
      // Buttons in cart
      console.log('\nButtons in cart:');
      const cartButtons = page.locator('button');
      const cartButtonCount = await cartButtons.count();
      for (let i = 0; i < Math.min(cartButtonCount, 15); i++) {
        const btnText = await cartButtons.nth(i).textContent();
        if (btnText?.trim()) {
          console.log(`  Button ${i}: "${btnText.trim()}"`);
        }
      }
      
      // Checkout button
      const checkoutBtn = page.locator('button').filter({ hasText: /checkout/i });
      console.log('\nCheckout button visible:', await checkoutBtn.isVisible());
      console.log('Checkout button enabled:', await checkoutBtn.isEnabled().catch(() => false));
      
      // Click Checkout if enabled
      if (await checkoutBtn.isEnabled().catch(() => false)) {
        console.log('\n=== Testing Checkout ===\n');
        await checkoutBtn.click();
        await page.waitForLoadState('networkidle');
        console.log('✓ On checkout page');
        console.log('URL:', page.url());
        
        // Explore Checkout Page
        console.log('\n=== CHECKOUT PAGE ===\n');
        
        // Buttons in checkout
        const checkoutButtons = page.locator('button');
        const checkoutButtonCount = await checkoutButtons.count();
        console.log('Buttons in checkout:');
        for (let i = 0; i < Math.min(checkoutButtonCount, 10); i++) {
          const btnText = await checkoutButtons.nth(i).textContent();
          if (btnText?.trim()) {
            console.log(`  Button ${i}: "${btnText.trim()}"`);
          }
        }
        
        // Proceed to Payment button
        const proceedBtn = page.locator('button').filter({ hasText: /proceed.*payment/i });
        console.log('\nProceed to Payment button visible:', await proceedBtn.isVisible());
        
        // Take screenshot
        await page.screenshot({ path: 'playwright-tests/buy-vouchers-checkout-page.png', fullPage: true });
        console.log('✓ Screenshot saved: buy-vouchers-checkout-page.png');
      }
    }
    
    console.log('\n=== Exploration Complete ===');
    
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error during exploration:', error);
    await page.screenshot({ path: 'playwright-tests/buy-vouchers-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreBuyVouchers();
