import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreSendCreate() {
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {};

  try {
    console.log('1. Logging in...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.fill('input[id="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[id="password"]', 'Rahasia567_');
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('2. Navigating to Send Voucher Create page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/send-voucher/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('3. Taking screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-create-01-initial.png', fullPage: true });

    // Save HTML
    const content = await page.content();
    fs.writeFileSync('playwright-tests/send-create-page.html', content);

    console.log('4. Extracting page elements...');
    
    // Extract buttons
    const buttons = await page.locator('button').all();
    console.log(`\nButtons (${buttons.length}):`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      const isDisabled = await buttons[i].isDisabled();
      if (isVisible) {
        console.log(`  [${i}] "${text?.trim()}" (disabled: ${isDisabled})`);
      }
    }

    // Extract inputs
    const inputs = await page.locator('input').all();
    console.log(`\nInputs (${inputs.length}):`);
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      const isVisible = await inputs[i].isVisible();
      if (isVisible) {
        console.log(`  [${i}] type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
      }
    }

    // Extract labels
    const labels = await page.locator('label').all();
    console.log(`\nLabels (${labels.length}):`);
    for (let i = 0; i < Math.min(labels.length, 20); i++) {
      const text = await labels[i].textContent();
      const isVisible = await labels[i].isVisible();
      if (isVisible && text?.trim()) {
        console.log(`  [${i}] "${text?.trim()}"`);
      }
    }

    // Try clicking "Select Voucher" button if exists
    const selectVoucherBtn = page.locator('button:has-text("Select Voucher")');
    if (await selectVoucherBtn.isVisible()) {
      console.log('\n5. Clicking "Select Voucher" button...');
      await selectVoucherBtn.click();
      await page.waitForTimeout(2000);

      console.log('6. Taking Select Voucher modal screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/send-create-02-select-modal.png', fullPage: true });

      // Extract modal elements
      console.log('7. Extracting modal elements...');
      const modalButtons = await page.locator('button').all();
      console.log(`\nModal Buttons (${modalButtons.length}):`);
      for (let i = 0; i < modalButtons.length; i++) {
        const text = await modalButtons[i].textContent();
        const isVisible = await modalButtons[i].isVisible();
        if (isVisible) {
          console.log(`  [${i}] "${text?.trim()}"`);
        }
      }

      // Look for voucher items
      const voucherItems = await page.locator('div:has(input[type="checkbox"]), div:has([role="checkbox"])').all();
      console.log(`\nVoucher items with checkboxes: ${voucherItems.length}`);

      // Close modal
      const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Close")');
      if (await cancelBtn.isVisible()) {
        console.log('8. Closing modal...');
        await cancelBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Try filling recipient count
    const recipientInput = page.locator('input[type="number"]').first();
    if (await recipientInput.isVisible()) {
      console.log('\n9. Filling recipient count...');
      await recipientInput.fill('2');
      await page.waitForTimeout(1000);

      console.log('10. Taking screenshot after filling...');
      await page.screenshot({ path: 'playwright-tests/screenshots/send-create-03-filled.png', fullPage: true });

      // Check Next button
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        const isEnabled = await nextBtn.isEnabled();
        console.log(`Next button enabled: ${isEnabled}`);

        if (isEnabled) {
          console.log('11. Clicking Next button...');
          await nextBtn.click();
          await page.waitForTimeout(2000);

          console.log('12. Taking next step screenshot...');
          await page.screenshot({ path: 'playwright-tests/screenshots/send-create-04-step2.png', fullPage: true });

          // Extract step 2 elements
          console.log('13. Extracting step 2 elements...');
          
          const step2Buttons = await page.locator('button').all();
          console.log(`\nStep 2 Buttons (${step2Buttons.length}):`);
          for (let i = 0; i < step2Buttons.length; i++) {
            const text = await step2Buttons[i].textContent();
            const isVisible = await step2Buttons[i].isVisible();
            if (isVisible) {
              console.log(`  [${i}] "${text?.trim()}"`);
            }
          }

          // Look for file input
          const fileInput = page.locator('input[type="file"]');
          if (await fileInput.count() > 0) {
            console.log('\nFound file input for CSV upload');
          }

          // Look for download template link
          const downloadLinks = await page.locator('a').all();
          console.log(`\nLinks (${downloadLinks.length}):`);
          for (let i = 0; i < downloadLinks.length; i++) {
            const text = await downloadLinks[i].textContent();
            const href = await downloadLinks[i].getAttribute('href');
            const isVisible = await downloadLinks[i].isVisible();
            if (isVisible && text?.trim()) {
              console.log(`  [${i}] "${text?.trim()}" -> ${href}`);
            }
          }
        }
      }
    }

    // Save selectors
    fs.writeFileSync('playwright-tests/send-create-selectors.json', JSON.stringify(selectors, null, 2));

    console.log('\n=== EXPLORATION COMPLETE ===');

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/send-create-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

exploreSendCreate();
