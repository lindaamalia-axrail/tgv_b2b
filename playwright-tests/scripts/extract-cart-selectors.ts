import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';
import * as fs from 'fs';

async function extractCartSelectors() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const selectors: any = {};

  try {
    // LOGIN
    console.log('Logging in...');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Sign In")');
    await page.fill('input[id="email"]', PUBLIC_WEB.EXISTING_USER.email);
    await page.fill('input[id="password"]', PUBLIC_WEB.EXISTING_USER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Add item to cart
    console.log('\nAdding item to cart...');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    await page.locator('a[href*="/products/"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Add to Cart")');
    await page.waitForTimeout(2000);

    // Go to cart
    console.log('\nNavigating to cart...');
    await page.click('a[href*="cart"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/cart-with-items.png', fullPage: true });

    console.log('Current URL:', page.url());

    // Extract cart page HTML structure
    console.log('\n=== CART PAGE ANALYSIS ===');
    
    // Get all elements that might be cart items
    const allDivs = await page.locator('div').evaluateAll((divs) =>
      divs.map((div, index) => ({
        index,
        className: div.className,
        hasImage: div.querySelector('img') !== null,
        hasPrice: div.textContent?.includes('RM'),
        hasQuantity: div.querySelector('input[type="number"]') !== null,
        textContent: div.textContent?.substring(0, 100)
      })).filter(d => d.hasImage && d.hasPrice)
    );
    
    console.log('Potential cart item divs:', allDivs.slice(0, 5));

    // Find cart item container
    const cartItemSelectors = [
      '[class*="cart"]',
      '[class*="item"]',
      '[class*="product"]',
      'div:has(img):has(input[type="number"])',
      'div:has(img):has-text("RM")'
    ];

    let cartItemSelector = null;
    for (const selector of cartItemSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0 && count < 20) {  // Reasonable number of items
        console.log(`Found ${count} elements with selector: ${selector}`);
        cartItemSelector = selector;
        break;
      }
    }

    selectors.cart = {
      url: page.url(),
      cartItemSelector,
      emptyCartMessage: 'text=/empty/i, text=/no items/i'
    };

    // Find quantity controls in cart
    const quantityInput = await page.locator('input[type="number"]').first();
    if (await quantityInput.isVisible()) {
      console.log('✓ Found quantity input');
      selectors.cart.quantityInput = 'input[type="number"]';
      
      // Find + and - buttons near the quantity input
      const parent = await quantityInput.evaluateHandle(el => el.parentElement);
      const buttons = await parent.$$('button');
      console.log(`Found ${buttons.length} buttons near quantity input`);
      
      // Try to find increase/decrease buttons
      for (const btn of buttons) {
        const text = await btn.textContent();
        console.log(`Button text: "${text}"`);
      }
    }

    // Find all buttons on cart page
    const cartButtons = await page.locator('button').evaluateAll((btns) =>
      btns.map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        ariaLabel: btn.getAttribute('aria-label')
      })).filter(b => b.text && b.text.length > 0 && b.text.length < 50)
    );
    
    console.log('\nAll buttons on cart page:');
    cartButtons.forEach(b => console.log(`  - "${b.text}"`));
    
    selectors.cart.buttons = cartButtons;

    // Find checkboxes
    const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').count();
    console.log(`\nFound ${checkboxes} checkboxes`);
    selectors.cart.checkbox = checkboxes > 0 ? 'input[type="checkbox"], [role="checkbox"]' : null;

    // Find remove/delete buttons
    const removeSelectors = [
      'button:has-text("Remove")',
      'button:has-text("Delete")',
      'button:has(svg[data-testid*="Delete"])',
      'button:has(svg[data-testid*="Trash"])',
      '[aria-label*="remove" i]',
      '[aria-label*="delete" i]'
    ];

    for (const selector of removeSelectors) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        console.log(`✓ Found remove button: ${selector}`);
        selectors.cart.removeBtn = selector;
        break;
      }
    }

    // Find checkout button
    const checkoutBtn = cartButtons.find(b => 
      b.text?.toLowerCase().includes('checkout') || 
      b.text?.toLowerCase().includes('proceed')
    );
    if (checkoutBtn) {
      selectors.cart.checkoutBtn = `button:has-text("${checkoutBtn.text}")`;
    }

    // Get page HTML for manual inspection
    const html = await page.content();
    fs.writeFileSync('playwright-tests/cart-page.html', html);
    console.log('\n✓ Saved cart HTML to: cart-page.html');

    // Save results
    const output = JSON.stringify(selectors, null, 2);
    fs.writeFileSync('playwright-tests/cart-selectors.json', output);
    
    console.log('\n=== RESULTS ===');
    console.log(output);
    console.log('\n✓ Saved to: cart-selectors.json');

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

extractCartSelectors();
