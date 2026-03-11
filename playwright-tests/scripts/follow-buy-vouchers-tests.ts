import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';
import * as fs from 'fs';

async function followBuyVouchersTests() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const selectors: any = {
    testScenarios: {}
  };

  try {
    // LOGIN
    console.log('=== LOGGING IN ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Sign In")');
    await page.fill('input[id="email"]', PUBLIC_WEB.EXISTING_USER.email);
    await page.fill('input[id="password"]', PUBLIC_WEB.EXISTING_USER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // TC018: Direct Buy Now functionality
    console.log('\n=== TC018: Direct Buy Now functionality ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-tests/screenshots/tc018-1-buy-page.png', fullPage: true });
    
    // Find voucher card
    const voucherCard = await findElement(page, [
      'a[href*="/products/"]',
      '.voucher-card',
      '[class*="border-2"]'
    ]);
    selectors.testScenarios.TC018 = { voucherCard };
    
    if (voucherCard) {
      await page.locator(voucherCard).first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'playwright-tests/screenshots/tc018-2-detail.png', fullPage: true });
      
      // Find Buy Now button
      const buyNowBtn = await findElement(page, [
        'button:has-text("Buy Now")',
        'button:has-text("BUY NOW")',
        'button:has-text("Buy")'
      ]);
      selectors.testScenarios.TC018.buyNowBtn = buyNowBtn;
      
      if (buyNowBtn) {
        await page.click(buyNowBtn);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'playwright-tests/screenshots/tc018-3-checkout.png', fullPage: true });
        
        console.log('Current URL:', page.url());
        selectors.testScenarios.TC018.checkoutUrl = page.url();
        
        // Find Proceed to Payment button
        const proceedBtn = await findElement(page, [
          'button:has-text("Proceed to Payment")',
          'button:has-text("Proceed")',
          'button:has-text("Pay Now")'
        ]);
        selectors.testScenarios.TC018.proceedBtn = proceedBtn;
      }
    }

    // TC019: Add to Cart functionality
    console.log('\n=== TC019: Add to Cart functionality ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    
    if (voucherCard) {
      await page.locator(voucherCard).first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'playwright-tests/screenshots/tc019-1-detail.png', fullPage: true });
      
      // Find Add to Cart button
      const addToCartBtn = await findElement(page, [
        'button:has-text("Add to Cart")',
        'button:has-text("ADD TO CART")',
        'button:has-text("Add To Cart")'
      ]);
      selectors.testScenarios.TC019 = { addToCartBtn };
      
      if (addToCartBtn) {
        await page.click(addToCartBtn);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-tests/screenshots/tc019-2-after-add.png', fullPage: true });
        
        // Find success message
        const successMsg = await findElement(page, [
          'text=/added.*cart/i',
          'text=/success/i',
          '.notification',
          '.toast',
          '.alert'
        ]);
        selectors.testScenarios.TC019.successMsg = successMsg;
        
        // Find cart icon/link
        const cartLink = await findElement(page, [
          'a[href*="cart"]',
          '.cart-icon',
          'button:has-text("Cart")',
          '[aria-label*="cart" i]'
        ]);
        selectors.testScenarios.TC019.cartLink = cartLink;
        
        if (cartLink) {
          await page.click(cartLink);
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'playwright-tests/screenshots/tc019-3-cart.png', fullPage: true });
          
          // Find cart items
          const cartItem = await findElement(page, [
            '.cart-item',
            '[class*="cart-item"]',
            'tr',
            '[role="listitem"]'
          ]);
          selectors.testScenarios.TC019.cartItem = cartItem;
          
          // Find checkout button
          const checkoutBtn = await findElement(page, [
            'button:has-text("Checkout")',
            'button:has-text("Proceed to Checkout")',
            'button:has-text("Proceed")'
          ]);
          selectors.testScenarios.TC019.checkoutBtn = checkoutBtn;
          
          // Find quantity controls
          const increaseQty = await findElement(page, [
            'button:has-text("+")',
            '.increase-qty',
            '[aria-label*="increase" i]'
          ]);
          const decreaseQty = await findElement(page, [
            'button:has-text("-")',
            '.decrease-qty',
            '[aria-label*="decrease" i]'
          ]);
          const quantityValue = await findElement(page, [
            '.quantity-value',
            'input[type="number"]',
            '[class*="quantity"]'
          ]);
          selectors.testScenarios.TC019.quantityControls = {
            increase: increaseQty,
            decrease: decreaseQty,
            value: quantityValue
          };
          
          // Find remove button
          const removeBtn = await findElement(page, [
            'button:has-text("Remove")',
            '.remove-item',
            '.trash-icon',
            'button:has(svg[data-testid*="Delete"])'
          ]);
          selectors.testScenarios.TC019.removeBtn = removeBtn;
          
          // Find checkbox for selecting items
          const checkbox = await findElement(page, [
            'input[type="checkbox"]',
            '[role="checkbox"]'
          ]);
          selectors.testScenarios.TC019.checkbox = checkbox;
        }
      }
    }

    // TC029: Validate voucher information on detail page
    console.log('\n=== TC029: Validate voucher information on detail page ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    
    if (voucherCard) {
      await page.locator(voucherCard).first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'playwright-tests/screenshots/tc029-detail-full.png', fullPage: true });
      
      // Find all detail page elements
      const title = await findElement(page, [
        'h1',
        'h2',
        '.voucher-title',
        '.product-title',
        '[class*="title"]'
      ]);
      
      const image = await findElement(page, [
        'img[alt*="voucher" i]',
        '.voucher-image img',
        'img'
      ]);
      
      const price = await findElement(page, [
        '.voucher-price',
        '.price',
        '[class*="price"]',
        'text=/RM\\s*\\d+/'
      ]);
      
      const description = await findElement(page, [
        '.voucher-description',
        '.description',
        'p'
      ]);
      
      const quantitySelector = await findElement(page, [
        '.quantity-selector',
        'input[type="number"]',
        '[class*="quantity"]'
      ]);
      
      selectors.testScenarios.TC029 = {
        title,
        image,
        price,
        description,
        quantitySelector
      };
    }

    // TC025: Out of stock voucher
    console.log('\n=== TC025: Out of stock voucher ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    
    // Find out of stock indicator
    const outOfStockIndicator = await findElement(page, [
      'text=/Restock Soon/i',
      'text=/Out of Stock/i',
      '.out-of-stock',
      '[class*="out-of-stock"]'
    ]);
    selectors.testScenarios.TC025 = { outOfStockIndicator };
    
    if (outOfStockIndicator) {
      // Try to find and click an out of stock voucher
      const outOfStockVouchers = await page.locator('text=/Restock Soon/i').count();
      if (outOfStockVouchers > 0) {
        // Find the parent link of the out of stock text
        const outOfStockLink = page.locator('a:has-text("Restock Soon")').first();
        if (await outOfStockLink.isVisible()) {
          await outOfStockLink.click();
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'playwright-tests/screenshots/tc025-out-of-stock.png', fullPage: true });
          
          // Find Remind Me button
          const remindMeBtn = await findElement(page, [
            'button:has-text("Remind Me")',
            'button:has-text("Notify Me")',
            'button:has-text("Notify")'
          ]);
          selectors.testScenarios.TC025.remindMeBtn = remindMeBtn;
        }
      }
    }

    // TC028: View/Download receipt
    console.log('\n=== TC028: View/Download receipt ===');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("My Order")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-tests/screenshots/tc028-my-orders.png', fullPage: true });
    
    // Find order items
    const orderItem = await findElement(page, [
      '.order-item',
      '[class*="order-item"]',
      'tr',
      '[role="row"]'
    ]);
    
    const viewReceiptBtn = await findElement(page, [
      'button:has-text("View Receipt")',
      'button:has-text("Download Receipt")',
      'button:has-text("Receipt")',
      'a:has-text("Receipt")'
    ]);
    
    selectors.testScenarios.TC028 = {
      orderItem,
      viewReceiptBtn
    };

    // Save results
    const output = JSON.stringify(selectors, null, 2);
    fs.writeFileSync('playwright-tests/buy-vouchers-selectors.json', output);
    
    console.log('\n=== RESULTS ===');
    console.log(output);
    console.log('\n✓ Saved to: buy-vouchers-selectors.json');
    console.log('✓ Screenshots saved in: screenshots/');

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

async function findElement(page: any, selectors: string[]): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`  ✓ Found: ${selector}`);
        return selector;
      }
    } catch (e) {
      // Continue
    }
  }
  console.log(`  ✗ Not found: ${selectors[0]}`);
  return null;
}

followBuyVouchersTests();
