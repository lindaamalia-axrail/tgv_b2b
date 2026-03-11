import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';
import * as fs from 'fs';

async function exploreWithScreenshots() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const selectors: any = {};

  try {
    // Login
    console.log('Logging in...');
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a:has-text("Sign In")');
    await page.fill('input[id="email"]', PUBLIC_WEB.EXISTING_USER.email);
    await page.fill('input[id="password"]', PUBLIC_WEB.EXISTING_USER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // HOME PAGE
    console.log('\n1. HOME PAGE');
    await page.screenshot({ path: 'playwright-tests/screenshots/01-home.png', fullPage: true });
    
    // Extract all clickable elements that might be vouchers
    const allLinks = await page.locator('a').evaluateAll((links) =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        className: link.className
      })).filter(l => l.text && l.text.length > 0 && l.text.length < 100)
    );
    
    console.log('All links:', JSON.stringify(allLinks.slice(0, 20), null, 2));
    
    // Find voucher links (they contain "RM" or have href with /voucher/ or /product/)
    const voucherLinks = allLinks.filter(l => 
      l.text?.includes('RM') || 
      l.href?.includes('/voucher/') || 
      l.href?.includes('/product/')
    );
    
    selectors.home = {
      url: page.url(),
      voucherLinks: voucherLinks.slice(0, 5),
      voucherSelector: voucherLinks.length > 0 ? `a[href*="${voucherLinks[0].href}"]` : null
    };

    // BUY VOUCHER PAGE
    console.log('\n2. BUY VOUCHER PAGE');
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/02-buy-voucher.png', fullPage: true });
    
    // Get all elements on this page
    const buyPageLinks = await page.locator('a').evaluateAll((links) =>
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        className: link.className
      })).filter(l => l.href?.includes('/voucher/') || l.href?.includes('/product/'))
    );
    
    selectors.buyVoucher = {
      url: page.url(),
      voucherLinks: buyPageLinks.slice(0, 5),
      voucherCardSelector: buyPageLinks.length > 0 ? 'a[href*="/voucher/"], a[href*="/product/"]' : null
    };

    // Click first voucher
    if (buyPageLinks.length > 0) {
      console.log('\n3. VOUCHER DETAIL PAGE');
      await page.locator('a[href*="/voucher/"], a[href*="/product/"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/03-voucher-detail.png', fullPage: true });
      
      // Extract all buttons and inputs
      const buttons = await page.locator('button').evaluateAll((btns) =>
        btns.map(btn => ({
          text: btn.textContent?.trim(),
          type: btn.getAttribute('type'),
          className: btn.className
        })).filter(b => b.text && b.text.length > 0)
      );
      
      const inputs = await page.locator('input').evaluateAll((inputs) =>
        inputs.map(input => ({
          type: input.getAttribute('type'),
          name: input.getAttribute('name'),
          id: input.getAttribute('id'),
          placeholder: input.getAttribute('placeholder')
        }))
      );
      
      selectors.voucherDetail = {
        url: page.url(),
        buttons: buttons,
        inputs: inputs,
        addToCartBtn: buttons.find(b => b.text?.toLowerCase().includes('cart'))?.text || null,
        buyNowBtn: buttons.find(b => b.text?.toLowerCase().includes('buy'))?.text || null
      };
      
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }

    // CART PAGE
    console.log('\n4. CART PAGE');
    await page.click('[href*="cart"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/04-cart.png', fullPage: true });
    
    selectors.cart = {
      url: page.url(),
      pageText: (await page.locator('body').textContent())?.substring(0, 500)
    };

    // MY ORDER PAGE
    console.log('\n5. MY ORDER PAGE');
    await page.click('a:has-text("My Order")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/05-my-order.png', fullPage: true });
    
    // Check for table or list
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasMuiTable = await page.locator('[role="table"]').isVisible().catch(() => false);
    
    selectors.myOrder = {
      url: page.url(),
      hasTable: hasTable,
      hasMuiTable: hasMuiTable,
      tableHeaders: hasTable ? await page.locator('table th').allTextContents() : 
                    hasMuiTable ? await page.locator('[role="columnheader"]').allTextContents() : []
    };

    // SEND VOUCHER PAGE
    console.log('\n6. SEND VOUCHER PAGE');
    await page.click('a:has-text("Send Voucher")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/06-send-voucher.png', fullPage: true });
    
    const sendPageInputs = await page.locator('input, textarea, select').evaluateAll((elements) =>
      elements.map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.getAttribute('id'),
        placeholder: el.getAttribute('placeholder')
      }))
    );
    
    const sendPageButtons = await page.locator('button').evaluateAll((btns) =>
      btns.map(btn => ({
        text: btn.textContent?.trim()
      })).filter(b => b.text && b.text.length > 0)
    );
    
    selectors.sendVoucher = {
      url: page.url(),
      inputs: sendPageInputs,
      buttons: sendPageButtons
    };

    // Save results
    const output = JSON.stringify(selectors, null, 2);
    fs.writeFileSync('playwright-tests/public-web-selectors-detailed.json', output);
    
    console.log('\n=== RESULTS ===');
    console.log(output);
    console.log('\n✓ Saved to: public-web-selectors-detailed.json');
    console.log('✓ Screenshots saved in: screenshots/');

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

exploreWithScreenshots();
