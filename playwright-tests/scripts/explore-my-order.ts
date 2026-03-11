import { chromium } from 'playwright';

async function exploreMyOrder() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    console.log('=== Step 1: Login ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForTimeout(2000);
    
    await page.fill('#email', 'lindaamalia@axrail.com');
    await page.fill('#password', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('\n=== Step 2: Navigate to My Order page ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/my-order');
    await page.waitForTimeout(3000);
    
    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/my-order-01-page.png', fullPage: true });
    
    console.log('\n=== Step 3: Check for order cards/items ===');
    const orderCards = await page.locator('div, article, section').filter({ hasText: /order|booking|receipt/i }).count();
    console.log(`Found ${orderCards} potential order containers`);
    
    // Try different selectors for order items
    const selectors = [
      'div[class*="order"]',
      'div[class*="card"]',
      'article',
      'div[class*="item"]',
      'div[class*="list"]',
      'table tbody tr',
      '[data-testid*="order"]'
    ];
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`  ✓ ${selector}: ${count} elements`);
        
        // Get first element details
        const first = page.locator(selector).first();
        const text = await first.textContent();
        const className = await first.getAttribute('class');
        console.log(`    First element class: "${className}"`);
        console.log(`    First element text preview: "${text?.substring(0, 100)}..."`);
      }
    }
    
    console.log('\n=== Step 4: Check for search/filter elements ===');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"]');
    const searchCount = await searchInput.count();
    console.log(`Search inputs found: ${searchCount}`);
    
    if (searchCount > 0) {
      const placeholder = await searchInput.first().getAttribute('placeholder');
      const name = await searchInput.first().getAttribute('name');
      console.log(`  Search input - placeholder: "${placeholder}", name: "${name}"`);
    }
    
    // Check for filter buttons
    const filterButtons = page.locator('button:has-text("Filter"), button:has-text("filter"), button[class*="filter"]');
    const filterCount = await filterButtons.count();
    console.log(`Filter buttons found: ${filterCount}`);
    
    // Check for date inputs
    const dateInputs = page.locator('input[type="date"]');
    const dateCount = await dateInputs.count();
    console.log(`Date inputs found: ${dateCount}`);
    
    console.log('\n=== Step 5: Check for order status elements ===');
    const statusElements = page.locator('[class*="status"], [class*="Status"]');
    const statusCount = await statusElements.count();
    console.log(`Status elements found: ${statusCount}`);
    
    if (statusCount > 0) {
      for (let i = 0; i < Math.min(3, statusCount); i++) {
        const text = await statusElements.nth(i).textContent();
        const className = await statusElements.nth(i).getAttribute('class');
        console.log(`  Status ${i + 1}: "${text}" (class: "${className}")`);
      }
    }
    
    console.log('\n=== Step 6: Check for booking number elements ===');
    const bookingElements = page.locator('[class*="booking"]');
    const bookingCount = await bookingElements.count();
    console.log(`Booking-related elements found: ${bookingCount}`);
    
    console.log('\n=== Step 7: Check for receipt/view buttons ===');
    const receiptButtons = page.locator('button:has-text("Receipt"), button:has-text("View"), a:has-text("Receipt"), a:has-text("View")');
    const receiptCount = await receiptButtons.count();
    console.log(`Receipt/View buttons found: ${receiptCount}`);
    
    if (receiptCount > 0) {
      const buttonText = await receiptButtons.first().textContent();
      console.log(`  First button text: "${buttonText}"`);
    }
    
    console.log('\n=== Step 8: Try clicking first order (if exists) ===');
    const firstOrder = page.locator('div[class*="order"], div[class*="card"], article').first();
    const firstOrderExists = await firstOrder.count() > 0;
    
    if (firstOrderExists) {
      console.log('Clicking first order...');
      await firstOrder.click();
      await page.waitForTimeout(2000);
      
      console.log('URL after click:', page.url());
      await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/my-order-02-detail.png', fullPage: true });
      
      // Check for order detail elements
      console.log('\n=== Step 9: Check order detail page ===');
      const detailElements = page.locator('text=/order number/i, text=/booking number/i, text=/total/i, text=/status/i');
      const detailCount = await detailElements.count();
      console.log(`Order detail elements found: ${detailCount}`);
    }
    
    console.log('\n=== Step 10: Navigate to Buy page to test checkout flow ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/buy');
    await page.waitForTimeout(2000);
    
    const voucherCards = page.locator('a[href*="/products/"]');
    const voucherCount = await voucherCards.count();
    console.log(`Voucher cards found: ${voucherCount}`);
    
    if (voucherCount > 0) {
      console.log('Clicking first voucher...');
      await voucherCards.first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/my-order-03-voucher-detail.png', fullPage: true });
      
      // Check for Buy Now button
      const buyNowButton = page.locator('button:has-text("Buy Now"), button:has-text("Add to Cart")');
      const buyNowCount = await buyNowButton.count();
      console.log(`Buy Now/Add to Cart buttons found: ${buyNowCount}`);
      
      if (buyNowCount > 0) {
        const buttonText = await buyNowButton.first().textContent();
        console.log(`  Button text: "${buttonText}"`);
      }
      
      // Check for quantity input
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"]');
      const quantityCount = await quantityInput.count();
      console.log(`Quantity inputs found: ${quantityCount}`);
    }
    
    console.log('\n=== Keeping browser open for 30 seconds for manual inspection ===');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/my-order-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreMyOrder();
