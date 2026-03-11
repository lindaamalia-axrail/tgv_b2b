import { chromium } from 'playwright';

async function exploreCartCheckout() {
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
    
    console.log('\n=== Step 2: Navigate to Buy page ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/buy');
    await page.waitForTimeout(2000);
    
    const voucherCards = page.locator('a[href*="/products/"]');
    const voucherCount = await voucherCards.count();
    console.log(`Voucher cards found: ${voucherCount}`);
    
    if (voucherCount > 0) {
      console.log('\n=== Step 3: Click first voucher ===');
      await voucherCards.first().click();
      await page.waitForTimeout(2000);
      
      console.log('Current URL:', page.url());
      
      // Check for Add to Cart button
      const addToCartButton = page.locator('button:has-text("Add to Cart")');
      const addToCartCount = await addToCartButton.count();
      console.log(`Add to Cart buttons found: ${addToCartCount}`);
      
      if (addToCartCount > 0) {
        console.log('\n=== Step 4: Add to cart ===');
        await addToCartButton.first().click();
        await page.waitForTimeout(2000);
        
        console.log('After add to cart - URL:', page.url());
      }
      
      console.log('\n=== Step 5: Navigate to Cart ===');
      await page.goto('https://corporate-voucher-stg.fam-stg.click/cart');
      await page.waitForTimeout(2000);
      
      console.log('Cart URL:', page.url());
      
      // Check cart items
      const cartItems = page.locator('div:has(img):has(input[type="number"])');
      const cartItemCount = await cartItems.count();
      console.log(`Cart items found: ${cartItemCount}`);
      
      // Check for checkout button
      const checkoutButton = page.locator('button:has-text("Checkout")');
      const checkoutCount = await checkoutButton.count();
      console.log(`Checkout buttons found: ${checkoutCount}`);
      
      if (checkoutCount > 0) {
        const isDisabled = await checkoutButton.first().isDisabled();
        const isVisible = await checkoutButton.first().isVisible();
        console.log(`  Checkout button disabled: ${isDisabled}`);
        console.log(`  Checkout button visible: ${isVisible}`);
        
        // Check button attributes
        const buttonClass = await checkoutButton.first().getAttribute('class');
        const buttonType = await checkoutButton.first().getAttribute('type');
        const buttonDisabled = await checkoutButton.first().getAttribute('disabled');
        console.log(`  Button class: "${buttonClass}"`);
        console.log(`  Button type: "${buttonType}"`);
        console.log(`  Button disabled attr: "${buttonDisabled}"`);
        
        // Check for terms/conditions checkbox
        const termsCheckbox = page.locator('input[type="checkbox"]');
        const termsCount = await termsCheckbox.count();
        console.log(`\nCheckboxes found: ${termsCount}`);
        
        if (termsCount > 0) {
          for (let i = 0; i < termsCount; i++) {
            const label = await page.locator('label').nth(i).textContent();
            const isChecked = await termsCheckbox.nth(i).isChecked();
            console.log(`  Checkbox ${i + 1}: "${label}" - Checked: ${isChecked}`);
          }
          
          console.log('\n=== Step 6: Try checking terms checkbox ===');
          await termsCheckbox.first().check();
          await page.waitForTimeout(1000);
          
          const isStillDisabled = await checkoutButton.first().isDisabled();
          console.log(`  Checkout button still disabled after checking: ${isStillDisabled}`);
        }
        
        // Check for any validation messages
        const errorMessages = page.locator('[class*="error"], [class*="invalid"], .text-red-500, .text-danger');
        const errorCount = await errorMessages.count();
        console.log(`\nError/validation messages found: ${errorCount}`);
        
        if (errorCount > 0) {
          for (let i = 0; i < Math.min(errorCount, 5); i++) {
            const text = await errorMessages.nth(i).textContent();
            console.log(`  Error ${i + 1}: "${text}"`);
          }
        }
        
        // Try to click checkout anyway
        if (!isDisabled) {
          console.log('\n=== Step 7: Click Checkout ===');
          await checkoutButton.first().click();
          await page.waitForTimeout(3000);
          
          console.log('URL after checkout:', page.url());
        } else {
          console.log('\n⚠️ Checkout button is disabled - cannot proceed');
          
          // Take screenshot for debugging
          await page.screenshot({ 
            path: 'playwright-tests/playwright-tests/screenshots/cart-checkout-disabled.png', 
            fullPage: true 
          });
        }
      }
    }
    
    console.log('\n=== Keeping browser open for 30 seconds for manual inspection ===');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ 
      path: 'playwright-tests/playwright-tests/screenshots/cart-checkout-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

exploreCartCheckout();
