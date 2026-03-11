import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreSendVouchers() {
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigating to login page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');

    console.log('2. Logging in...');
    await page.fill('input[id="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[id="password"]', 'Rahasia567_');
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('3. Taking homepage screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-01-home.png', fullPage: true });

    console.log('4. Clicking Send Voucher navigation...');
    await page.click('a:has-text("Send Voucher")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('5. Taking Send Voucher page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-02-page.png', fullPage: true });

    // Get page content
    const content = await page.content();
    fs.writeFileSync('playwright-tests/send-voucher-page.html', content);
    console.log('6. Saved page HTML');

    // Extract all buttons
    console.log('7. Extracting buttons...');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      if (isVisible) {
        console.log(`  [${i}] "${text?.trim()}"`);
      }
    }

    // Extract all links
    console.log('8. Extracting links...');
    const links = await page.locator('a').all();
    console.log(`Found ${links.length} links:`);
    for (let i = 0; i < Math.min(links.length, 20); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      const isVisible = await links[i].isVisible();
      if (isVisible && text?.trim()) {
        console.log(`  [${i}] "${text?.trim()}" -> ${href}`);
      }
    }

    // Extract all inputs
    console.log('9. Extracting inputs...');
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} inputs:`);
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      const isVisible = await inputs[i].isVisible();
      if (isVisible) {
        console.log(`  [${i}] type="${type}", name="${name}", placeholder="${placeholder}"`);
      }
    }

    // Look for table or list of sent vouchers
    console.log('10. Looking for voucher history...');
    const tables = await page.locator('table, [role="table"]').count();
    console.log(`Found ${tables} tables`);

    // Check if there's a "Send Voucher" button to start the flow
    const sendButton = page.locator('button:has-text("Send Voucher"), button:has-text("Send")');
    const sendButtonCount = await sendButton.count();
    console.log(`Found ${sendButtonCount} Send buttons`);

    if (sendButtonCount > 0) {
      console.log('11. Clicking Send Voucher button...');
      await sendButton.first().click();
      await page.waitForTimeout(2000);

      console.log('12. Taking modal screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/send-03-modal.png', fullPage: true });

      // Extract modal content
      const modalContent = await page.content();
      fs.writeFileSync('playwright-tests/send-voucher-modal.html', modalContent);
      console.log('13. Saved modal HTML');
    }

    console.log('\n=== EXPLORATION COMPLETE ===');
    console.log('Check screenshots folder and HTML files');

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/send-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

exploreSendVouchers();
