import { chromium } from 'playwright';

async function exploreBuyVouchers() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Starting Buy Vouchers Exploration ===\n');

    // Login first
    console.log('Step 1: Navigating to login page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-01-login-page.png' });

    console.log('Step 2: Logging in...');
    await page.fill('input[type="email"], input[name="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Rahasia567_');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-02-after-login.png' });

    console.log('\n=== TC001: Direct Buy Now ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForLoadState('networkidle');
    
    // Find Buy Voucher link
    console.log('Looking for "Buy Voucher" navigation...');
    const buyVoucherSelectors = [
      'text=Buy Voucher',
      'a:has-text("Buy Voucher")',
      'nav a:has-text("Buy")',
      '[href*="buy"]',
      '[href*="voucher"]'
    ];
    
    for (const selector of buyVoucherSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found Buy Voucher with selector: ${selector}`);
        await page.click(selector);
        break;
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-03-voucher-list.png' });

    // Find voucher cards/items
    console.log('\nLooking for voucher items...');
    const voucherSelectors = [
      'a[href*="/products/"]',
      'a[href*="/voucher/"]',
      '[class*="card"]',
      '[class*="voucher"]',
      '[class*="product"]'
    ];
    
    let voucherFound = false;
    for (const selector of voucherSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found ${count} vouchers with selector: ${selector}`);
        await page.locator(selector).first().click();
        voucherFound = true;
        break;
      }
    }
    
    if (!voucherFound) {
      console.log('⚠ No vouchers found, taking screenshot for manual inspection');
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-04-voucher-detail.png' });

    // Find Buy Now button
    console.log('\nLooking for "Buy Now" button...');
    const buyNowSelectors = [
      'button:has-text("Buy Now")',
      'button:has-text("BUY NOW")',
      '[class*="buy-now"]',
      'button[class*="primary"]:has-text("Buy")'
    ];
    
    for (const selector of buyNowSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found Buy Now button with selector: ${selector}`);
        await page.click(selector);
        break;
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-05-checkout-page.png' });

    // Check if we're on checkout page
    console.log('\nVerifying checkout page...');
    const checkoutSelectors = [
      'button:has-text("Proceed to Payment")',
      'button:has-text("Place Order")',
      'text=/checkout/i',
      '[class*="checkout"]'
    ];
    
    for (const selector of checkoutSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found checkout element with selector: ${selector}`);
      }
    }

    console.log('\n=== TC002: Add to Cart ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.click('text=Buy Voucher');
    await page.waitForLoadState('networkidle');
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find Add to Cart button
    console.log('\nLooking for "Add to Cart" button...');
    const addToCartSelectors = [
      'button:has-text("Add to Cart")',
      'button:has-text("ADD TO CART")',
      '[class*="add-to-cart"]',
      'button[class*="secondary"]:has-text("Cart")'
    ];
    
    for (const selector of addToCartSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found Add to Cart button with selector: ${selector}`);
        await page.click(selector);
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-06-after-add-to-cart.png' });

    // Find cart icon/link
    console.log('\nLooking for cart navigation...');
    const cartSelectors = [
      'a[href*="cart"]',
      '[class*="cart-icon"]',
      'button:has-text("Cart")',
      'svg[class*="cart"]',
      '[aria-label*="cart"]'
    ];
    
    for (const selector of cartSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found cart with selector: ${selector}`);
        await page.click(selector);
        break;
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-07-cart-page.png' });

    // Find quantity input
    console.log('\nLooking for quantity input...');
    const quantitySelectors = [
      'input[type="number"]',
      'input[name="quantity"]',
      '[class*="quantity"] input'
    ];
    
    for (const selector of quantitySelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found ${count} quantity inputs with selector: ${selector}`);
        break;
      }
    }

    // Find checkboxes for selecting items
    console.log('\nLooking for item selection checkboxes...');
    const checkboxSelectors = [
      '[role="checkbox"]',
      'input[type="checkbox"]',
      '[class*="checkbox"]'
    ];
    
    for (const selector of checkboxSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found ${count} checkboxes with selector: ${selector}`);
        // Try to click first checkbox
        await page.locator(selector).first().click().catch(() => {});
        await page.waitForTimeout(500);
        break;
      }
    }
    
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-08-cart-with-selection.png' });

    // Find Checkout button
    console.log('\nLooking for Checkout button...');
    const checkoutButtonSelectors = [
      'button:has-text("Checkout")',
      'button:has-text("CHECKOUT")',
      'button:has-text("Proceed")',
      '[class*="checkout-button"]'
    ];
    
    for (const selector of checkoutButtonSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        console.log(`✓ Found Checkout button with selector: ${selector}`);
        const isDisabled = await page.locator(selector).isDisabled().catch(() => true);
        console.log(`  - Button disabled: ${isDisabled}`);
        if (!isDisabled) {
          await page.click(selector);
        }
        break;
      }
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-09-final-state.png' });

    console.log('\n=== Exploration Complete ===');
    console.log('Screenshots saved to playwright-tests/screenshots/');
    console.log('\nKey Selectors Found:');
    console.log('- Buy Voucher navigation: text=Buy Voucher');
    console.log('- Voucher items: a[href*="/products/"]');
    console.log('- Buy Now button: button:has-text("Buy Now")');
    console.log('- Add to Cart button: button:has-text("Add to Cart")');
    console.log('- Cart link: a[href*="cart"]');
    console.log('- Quantity input: input[type="number"]');
    console.log('- Checkboxes: [role="checkbox"]');
    console.log('- Checkout button: button:has-text("Checkout")');

  } catch (error) {
    console.error('Error during exploration:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/buy-error.png' });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreBuyVouchers();
