import { chromium } from '@playwright/test';

async function exploreCart() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.fill('#email', 'lindaamalia@axrail.com');
    await page.fill('#password', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✓ Logged in\n');

    // Go to Buy Voucher
    await page.goto('https://corporate-voucher-stg.fam-stg.click/buy-voucher');
    await page.waitForTimeout(2000);
    
    // Click first voucher
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    console.log('✓ On voucher detail page\n');
    
    // Set quantity and add to cart
    await page.locator('input[type="number"]').fill('1');
    await page.waitForTimeout(500);
    
    const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i });
    await addToCartBtn.click();
    console.log('✓ Clicked Add to Cart');
    
    // Wait for cart update
    await page.waitForTimeout(3000);
    
    // Try different ways to navigate to cart
    console.log('\nTrying to find cart...');
    
    // Method 1: Direct URL
    await page.goto('https://corporate-voucher-stg.fam-stg.click/cart');
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/cart-page-full.png', fullPage: true });
    console.log('✓ Screenshot saved\n');
    
    // Check page content
    const pageText = await page.textContent('body');
    console.log('Page contains "cart":', pageText?.toLowerCase().includes('cart'));
    console.log('Page contains "checkout":', pageText?.toLowerCase().includes('checkout'));
    console.log('Page contains "empty":', pageText?.toLowerCase().includes('empty'));
    
    // Look for all elements
    console.log('\nAll visible text on page:');
    const allText = page.locator('text=/./');
    const textCount = await allText.count();
    console.log(`Found ${textCount} text elements`);
    
    // Look for cart-specific elements
    console.log('\nLooking for cart elements...');
    
    const cartTitle = page.locator('h1, h2, h3').filter({ hasText: /cart|my cart/i });
    if (await cartTitle.isVisible().catch(() => false)) {
      console.log('Cart title:', await cartTitle.textContent());
    }
    
    // Look for empty cart message
    const emptyMsg = page.locator('text=/empty|no items|no products/i');
    if (await emptyMsg.isVisible().catch(() => false)) {
      console.log('Empty cart message:', await emptyMsg.textContent());
    }
    
    // Look for any items
    const items = page.locator('[class*="cart"], [class*="item"], [data-testid*="cart"]');
    console.log('Potential cart items:', await items.count());
    
    // Check for quantity inputs
    const qtyInputs = page.locator('input[type="number"]');
    console.log('Quantity inputs:', await qtyInputs.count());
    
    // Check for checkboxes
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    console.log('Checkboxes:', await checkboxes.count());
    
    // Look for product images
    const images = page.locator('img');
    console.log('Images:', await images.count());
    
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

exploreCart();
