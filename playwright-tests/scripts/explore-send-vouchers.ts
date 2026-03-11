import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreSendVouchers() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    login: {},
    navigation: {},
    sendVoucherPage: {},
    sendVoucherModal: {},
    selectVoucherModal: {},
    recipientUpload: {},
    summary: {},
    buttons: {},
    inputs: {},
    messages: {}
  };

  const screenshots: string[] = [];

  try {
    console.log('1. Navigating to login page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Login
    console.log('2. Logging in...');
    const emailInput = page.locator('input[id="email"], input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[id="password"], input[type="password"], input[name="password"]').first();
    
    await emailInput.fill('lindaamalia@axrail.com');
    await passwordInput.fill('Rahasia567_');
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('3. Taking homepage screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-01-homepage.png', fullPage: true });
    screenshots.push('send-01-homepage.png');

    // Navigate to Send Voucher
    console.log('4. Navigating to Send Voucher page...');
    await page.click('text=Send Voucher');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('5. Taking Send Voucher page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-02-send-voucher-page.png', fullPage: true });
    screenshots.push('send-02-send-voucher-page.png');

    // Extract page elements
    console.log('6. Extracting Send Voucher page elements...');
    const pageContent = await page.content();
    
    // Look for main buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      if (text && isVisible) {
        console.log(`  Button ${i}: "${text.trim()}"`);
      }
    }

    // Look for Send Voucher button
    const sendVoucherButton = page.locator('button:has-text("Send Voucher")');
    if (await sendVoucherButton.isVisible()) {
      console.log('7. Found "Send Voucher" button, clicking...');
      selectors.buttons.sendVoucher = 'button:has-text("Send Voucher")';
      await sendVoucherButton.click();
      await page.waitForTimeout(2000);

      console.log('8. Taking modal screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/send-03-modal-opened.png', fullPage: true });
      screenshots.push('send-03-modal-opened.png');

      // Extract modal elements
      console.log('9. Extracting modal elements...');
      
      // Look for Select Voucher button
      const selectVoucherBtn = page.locator('button:has-text("Select Voucher")');
      if (await selectVoucherBtn.isVisible()) {
        console.log('  Found "Select Voucher" button');
        selectors.buttons.selectVoucher = 'button:has-text("Select Voucher")';
      }

      // Look for input fields
      const inputs = await page.locator('input').all();
      console.log(`  Found ${inputs.length} input fields`);
      
      for (let i = 0; i < inputs.length; i++) {
        const type = await inputs[i].getAttribute('type');
        const name = await inputs[i].getAttribute('name');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const id = await inputs[i].getAttribute('id');
        const isVisible = await inputs[i].isVisible();
        
        if (isVisible) {
          console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", id="${id}"`);
          
          if (name) {
            selectors.inputs[name] = `input[name="${name}"]`;
          } else if (placeholder) {
            selectors.inputs[placeholder] = `input[placeholder="${placeholder}"]`;
          }
        }
      }

      // Look for Next button
      const nextBtn = page.locator('button:has-text("Next")');
      if (await nextBtn.isVisible()) {
        console.log('  Found "Next" button');
        selectors.buttons.next = 'button:has-text("Next")';
        
        const isDisabled = await nextBtn.isDisabled();
        console.log(`  Next button disabled: ${isDisabled}`);
      }

      // Try to click Select Voucher if available
      if (await selectVoucherBtn.isVisible()) {
        console.log('10. Clicking "Select Voucher" button...');
        await selectVoucherBtn.click();
        await page.waitForTimeout(2000);

        console.log('11. Taking Select Voucher modal screenshot...');
        await page.screenshot({ path: 'playwright-tests/screenshots/send-04-select-voucher-modal.png', fullPage: true });
        screenshots.push('send-04-select-voucher-modal.png');

        // Extract voucher selection elements
        console.log('12. Extracting voucher selection elements...');
        
        // Look for checkboxes
        const checkboxes = await page.locator('input[type="checkbox"], [role="checkbox"]').all();
        console.log(`  Found ${checkboxes.length} checkboxes`);
        
        if (checkboxes.length > 0) {
          selectors.selectVoucherModal.checkbox = 'input[type="checkbox"], [role="checkbox"]';
        }

        // Look for voucher items
        const voucherItems = await page.locator('div:has(input[type="checkbox"])').all();
        console.log(`  Found ${voucherItems.length} voucher items`);

        // Look for Select button in modal
        const selectBtn = page.locator('button:has-text("Select")');
        if (await selectBtn.isVisible()) {
          console.log('  Found "Select" button in modal');
          selectors.buttons.selectInModal = 'button:has-text("Select")';
        }

        // Close modal
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await closeBtn.isVisible()) {
          console.log('13. Closing Select Voucher modal...');
          await closeBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Try filling in recipient count
      const recipientInput = page.locator('input[name="totalRecipients"], input[placeholder*="recipient" i]').first();
      if (await recipientInput.isVisible()) {
        console.log('14. Filling recipient count...');
        await recipientInput.fill('2');
        await page.waitForTimeout(1000);

        // Check if Next button is enabled
        const nextBtnEnabled = await nextBtn.isEnabled();
        console.log(`  Next button enabled: ${nextBtnEnabled}`);

        if (nextBtnEnabled) {
          console.log('15. Clicking Next button...');
          await nextBtn.click();
          await page.waitForTimeout(2000);

          console.log('16. Taking recipient upload page screenshot...');
          await page.screenshot({ path: 'playwright-tests/screenshots/send-05-recipient-upload.png', fullPage: true });
          screenshots.push('send-05-recipient-upload.png');

          // Extract upload page elements
          console.log('17. Extracting upload page elements...');
          
          // Look for file input
          const fileInput = page.locator('input[type="file"]');
          if (await fileInput.count() > 0) {
            console.log('  Found file input');
            selectors.recipientUpload.fileInput = 'input[type="file"]';
          }

          // Look for download template link
          const downloadLink = page.locator('a:has-text("Download"), a:has-text("template")');
          if (await downloadLink.isVisible()) {
            console.log('  Found download template link');
            const linkText = await downloadLink.textContent();
            console.log(`  Link text: "${linkText}"`);
            selectors.recipientUpload.downloadTemplate = 'a:has-text("Download"), a:has-text("template")';
          }

          // Look for Submit/Send button
          const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Send")');
          if (await submitBtn.isVisible()) {
            console.log('  Found Submit/Send button');
            selectors.buttons.submit = 'button:has-text("Submit"), button:has-text("Send")';
          }
        }
      }
    }

    // Navigate to My Order to check voucher history
    console.log('18. Navigating to My Order page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/my-orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('19. Taking My Order page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/send-06-my-orders.png', fullPage: true });
    screenshots.push('send-06-my-orders.png');

    // Extract My Order elements
    console.log('20. Extracting My Order page elements...');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search" i]');
    if (await searchInput.isVisible()) {
      console.log('  Found search input');
      const placeholder = await searchInput.getAttribute('placeholder');
      console.log(`  Placeholder: "${placeholder}"`);
      selectors.sendVoucherPage.searchInput = `input[placeholder*="Search" i]`;
    }

    // Look for order items
    const orderItems = await page.locator('div:has(button)').all();
    console.log(`  Found ${orderItems.length} potential order items`);

    // Save selectors to file
    console.log('\n21. Saving selectors to file...');
    fs.writeFileSync(
      'playwright-tests/send-voucher-selectors.json',
      JSON.stringify(selectors, null, 2)
    );

    console.log('\n=== EXPLORATION COMPLETE ===');
    console.log('Screenshots saved:');
    screenshots.forEach(s => console.log(`  - ${s}`));
    console.log('\nSelectors saved to: send-voucher-selectors.json');
    console.log('\nKey findings:');
    console.log('  Buttons:', Object.keys(selectors.buttons));
    console.log('  Inputs:', Object.keys(selectors.inputs));

  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreSendVouchers();
