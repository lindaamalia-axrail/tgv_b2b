import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function exploreBuyVouchersDetailed() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const selectors: any = {
    navigation: {},
    voucherList: {},
    voucherDetail: {},
    cart: {},
    checkout: {}
  };

  try {
    console.log('=== Starting Detailed Buy Vouchers Exploration ===\n');

    // ===== LOGIN =====
    console.log('📍 Step 1: Login');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotsDir, 'buy-01-login-page.png'), fullPage: true });

    await page.fill('input[type="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[type="password"]', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, 'buy-02-homepage.png'), fullPage: true });
    console.log('✓ Logged in successfully\n');

    // ===== NAVIGATION TO BUY VOUCHER =====
    console.log('📍 Step 2: Navigate to Buy Voucher');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForLoadState('networkidle');
    
    // Try to find Buy Voucher link
    const navLinks = await page.locator('nav a, header a').all();
    for (const link of navLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  Nav link: "${text}" -> ${href}`);
      if (text?.toLowerCase().includes('buy')) {
        selectors.navigation.buyVoucher = `text=${text}`;
        await link.click();
        break;
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'buy-03-voucher-list.png'), fullPage: true });
    console.log('✓ Navigated to voucher list\n');

    // ===== VOUCHER LIST PAGE =====
    console.log('📍 Step 3: Analyze Voucher List Page');
    
    // Find all voucher cards
    const voucherLinks = await page.locator('a[href*="/products/"], a[href*="/voucher/"]').all();
    console.log(`  Found ${voucherLinks.length} voucher items`);
    
    if (voucherLinks.length > 0) {
      selectors.voucherList.voucherCard = 'a[href*="/products/"]';
      const firstVoucher = voucherLinks[0];
      const voucherHref = await firstVoucher.getAttribute('href');
      console.log(`  First voucher href: ${voucherHref}`);
      
      // Get voucher card structure
      const voucherHTML = await firstVoucher.innerHTML();
      console.log(`  Voucher card structure preview: ${voucherHTML.substring(0, 200)}...`);
      
      await firstVoucher.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'buy-04-voucher-detail.png'), fullPage: true });
      console.log('✓ Opened voucher detail page\n');
    }

    // ===== VOUCHER DETAIL PAGE =====
    console.log('📍 Step 4: Analyze Voucher Detail Page');
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`  Found ${buttons.length} buttons on detail page`);
    
    for (const button of buttons) {
      const text = await button.textContent();
      const classes = await button.getAttribute('class');
      console.log(`  Button: "${text?.trim()}" | classes: ${classes}`);
      
      if (text?.toLowerCase().includes('buy now')) {
        selectors.voucherDetail.buyNowButton = 'button:has-text("Buy Now")';
      } else if (text?.toLowerCase().includes('add to cart')) {
        selectors.voucherDetail.addToCartButton = 'button:has-text("Add to Cart")';
      }
    }
    
    // Find quantity input
    const quantityInputs = await page.locator('input[type="number"]').all();
    console.log(`  Found ${quantityInputs.length} quantity inputs`);
    if (quantityInputs.length > 0) {
      selectors.voucherDetail.quantityInput = 'input[type="number"]';
      const value = await quantityInputs[0].inputValue();
      console.log(`  Default quantity: ${value}`);
    }
    
    // Find voucher info
    const voucherName = await page.locator('h1, h2').first().textContent();
    console.log(`  Voucher name: ${voucherName}`);
    
    const priceElements = await page.locator('text=/RM\\s*\\d+/').all();
    console.log(`  Found ${priceElements.length} price elements`);
    
    console.log('✓ Analyzed voucher detail page\n');

    // ===== TEST BUY NOW =====
    console.log('📍 Step 5: Test Buy Now Flow');
    const buyNowButton = page.locator('button:has-text("Buy Now")');
    if (await buyNowButton.isVisible()) {
      await buyNowButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, 'buy-05-after-buy-now.png'), fullPage: true });
      
      // Check if we're on checkout page
      const currentURL = page.url();
      console.log(`  Current URL: ${currentURL}`);
      
      const checkoutButton = page.locator('button:has-text("Proceed to Payment"), button:has-text("Place Order")');
      if (await checkoutButton.isVisible()) {
        selectors.checkout.proceedButton = 'button:has-text("Proceed to Payment")';
        console.log('✓ Reached checkout page\n');
      }
    }

    // ===== TEST ADD TO CART =====
    console.log('📍 Step 6: Test Add to Cart Flow');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.click('text=Buy Voucher');
    await page.waitForLoadState('networkidle');
    await page.locator('a[href*="/products/"]').nth(1).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.locator('button:has-text("Add to Cart")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, 'buy-06-after-add-to-cart.png'), fullPage: true });
      console.log('✓ Added to cart\n');
    }

    // ===== NAVIGATE TO CART =====
    console.log('📍 Step 7: Navigate to Cart');
    
    // Find cart icon/link
    const cartLinks = await page.locator('a[href*="cart"], button:has-text("Cart")').all();
    console.log(`  Found ${cartLinks.length} cart links`);
    
    for (const link of cartLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  Cart link: "${text}" -> ${href}`);
    }
    
    const cartLink = page.locator('a[href*="cart"]').first();
    if (await cartLink.isVisible()) {
      selectors.cart.cartLink = 'a[href*="cart"]';
      await cartLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, 'buy-07-cart-page.png'), fullPage: true });
      console.log('✓ Navigated to cart page\n');
    }

    // ===== CART PAGE ANALYSIS =====
    console.log('📍 Step 8: Analyze Cart Page');
    
    // Find cart items
    const cartItems = await page.locator('input[type="number"]').all();
    console.log(`  Found ${cartItems.length} items in cart`);
    
    // Find checkboxes
    const checkboxes = await page.locator('[role="checkbox"], input[type="checkbox"]').all();
    console.log(`  Found ${checkboxes.length} checkboxes`);
    
    if (checkboxes.length > 0) {
      selectors.cart.itemCheckbox = '[role="checkbox"]';
      await checkboxes[0].click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, 'buy-08-cart-item-selected.png'), fullPage: true });
      console.log('  ✓ Selected first item');
    }
    
    // Find checkout button
    const checkoutButtons = await page.locator('button').all();
    for (const button of checkoutButtons) {
      const text = await button.textContent();
      const isDisabled = await button.isDisabled();
      if (text?.toLowerCase().includes('checkout')) {
        console.log(`  Checkout button: "${text}" | disabled: ${isDisabled}`);
        selectors.cart.checkoutButton = 'button:has-text("Checkout")';
        
        if (!isDisabled) {
          await button.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(screenshotsDir, 'buy-09-checkout-from-cart.png'), fullPage: true });
          console.log('  ✓ Clicked checkout button');
        }
      }
    }
    
    console.log('✓ Analyzed cart page\n');

    // ===== SAVE SELECTORS =====
    console.log('📍 Step 9: Saving Selectors');
    const selectorsJSON = JSON.stringify(selectors, null, 2);
    fs.writeFileSync(
      path.join(__dirname, '..', 'buy-vouchers-selectors.json'),
      selectorsJSON
    );
    console.log('✓ Selectors saved to buy-vouchers-selectors.json\n');

    console.log('=== SUMMARY OF SELECTORS ===');
    console.log(selectorsJSON);

  } catch (error) {
    console.error('❌ Error during exploration:', error);
    await page.screenshot({ path: path.join(screenshotsDir, 'buy-error.png'), fullPage: true });
  } finally {
    console.log('\n⏳ Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('✅ Exploration complete!');
  }
}

exploreBuyVouchersDetailed();
