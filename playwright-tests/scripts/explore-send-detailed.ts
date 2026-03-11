import { chromium } from 'playwright';
import * as fs from 'fs';

/**
 * Detailed Send Voucher Exploration
 * Captures all selectors with detailed analysis
 */

async function exploreDetailed() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const selectors: any = {};
  const baseUrl = 'https://corporate-voucher-stg.fam-stg.click';

  try {
    console.log('🚀 Starting Detailed Send Voucher Exploration\n');

    // Login
    console.log('📝 Logging in...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login")').first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForTimeout(1500);
      await page.fill('input[type="email"]', 'lindaamalia@axrail.com');
      await page.fill('input[type="password"]', 'Rahasia567_');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    console.log('✅ Logged in\n');

    // ========================================
    // STEP 1: CREATE PAGE
    // ========================================
    console.log('📝 Exploring Send Voucher Create Page...');
    await page.goto(`${baseUrl}/send-voucher/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-01-create.png', fullPage: true });

    // Get all form inputs
    const inputs = await page.locator('input').all();
    selectors.step1_inputs = [];
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const className = await input.getAttribute('class');
      
      // Get label
      let label = '';
      try {
        const labelEl = await page.locator(`label[for="${id}"]`).textContent({ timeout: 1000 });
        label = labelEl || '';
      } catch {}
      
      selectors.step1_inputs.push({
        type, name, placeholder, id, className, label: label.trim()
      });
    }

    // Get all buttons
    const buttons = await page.locator('button').all();
    selectors.step1_buttons = [];
    for (const btn of buttons) {
      const text = await btn.textContent();
      const type = await btn.getAttribute('type');
      const className = await btn.getAttribute('class');
      const disabled = await btn.isDisabled();
      
      selectors.step1_buttons.push({
        text: text?.trim(),
        type,
        className,
        disabled
      });
    }

    // Click Select Voucher button
    console.log('📝 Opening Select Voucher modal...');
    const selectBtn = page.locator('button:has-text("Select")').first();
    if (await selectBtn.isVisible()) {
      await selectBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-02-modal.png', fullPage: true });

      // Get modal structure
      const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
      if (await modal.isVisible()) {
        selectors.modal = {
          role: await modal.getAttribute('role'),
          className: await modal.getAttribute('class')
        };

        // Get checkboxes in modal
        const checkboxes = await modal.locator('input[type="checkbox"], [role="checkbox"]').all();
        selectors.modal_checkboxes = [];
        for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
          const cb = checkboxes[i];
          selectors.modal_checkboxes.push({
            type: await cb.getAttribute('type'),
            className: await cb.getAttribute('class'),
            name: await cb.getAttribute('name')
          });
        }

        // Select first checkbox
        if (checkboxes.length > 0) {
          await checkboxes[0].click();
          await page.waitForTimeout(1000);
        }

        // Click Select in modal
        const modalSelectBtn = modal.locator('button:has-text("Select")').first();
        if (await modalSelectBtn.isVisible()) {
          await modalSelectBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // Fill recipient count
    console.log('📝 Filling recipient count...');
    const recipientInput = page.locator('input[type="number"]').first();
    if (await recipientInput.isVisible()) {
      await recipientInput.fill('2');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-03-filled.png', fullPage: true });
    }

    // Try to click Next
    const nextBtn = page.locator('button:has-text("Next")').first();
    const isEnabled = await nextBtn.isEnabled().catch(() => false);
    console.log(`Next button enabled: ${isEnabled}`);
    
    if (isEnabled) {
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-04-step2.png', fullPage: true });

      // ========================================
      // STEP 2: UPLOAD CSV
      // ========================================
      console.log('📝 Exploring Step 2...');

      // Get all elements on step 2
      const step2Inputs = await page.locator('input').all();
      selectors.step2_inputs = [];
      for (const input of step2Inputs) {
        const type = await input.getAttribute('type');
        const accept = await input.getAttribute('accept');
        const className = await input.getAttribute('class');
        
        selectors.step2_inputs.push({ type, accept, className });
      }

      const step2Buttons = await page.locator('button, a').all();
      selectors.step2_buttons = [];
      for (const btn of step2Buttons) {
        const text = await btn.textContent();
        const href = await btn.getAttribute('href');
        const className = await btn.getAttribute('class');
        
        if (text && text.trim().length > 0) {
          selectors.step2_buttons.push({
            text: text.trim(),
            href,
            className
          });
        }
      }
    }

    // ========================================
    // STATUS PAGE
    // ========================================
    console.log('📝 Exploring Status Page...');
    await page.goto(`${baseUrl}/send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-05-status.png', fullPage: true });

    // Get page structure
    const statusButtons = await page.locator('button, a').all();
    selectors.status_buttons = [];
    for (const btn of statusButtons) {
      const text = await btn.textContent();
      const className = await btn.getAttribute('class');
      
      if (text && text.trim().length > 0 && text.trim().length < 50) {
        selectors.status_buttons.push({
          text: text.trim(),
          className
        });
      }
    }

    // Save results
    console.log('\n💾 Saving results...');
    fs.writeFileSync(
      'playwright-tests/send-voucher-selectors-detailed.json',
      JSON.stringify(selectors, null, 2)
    );
    
    console.log('✅ Exploration complete!');
    console.log('📄 Results saved to: send-voucher-selectors-detailed.json');

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/send-detail-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreDetailed().catch(console.error);
