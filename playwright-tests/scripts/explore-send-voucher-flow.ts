import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Exploration Script: Send Voucher Flow
 * 
 * This script explores the Send Voucher pages following the test specification steps
 * to capture actual selectors for all elements.
 */

async function exploreSendVoucherFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const selectors: any = {
    navigation: {},
    step1_addVouchers: {},
    step2_uploadCSV: {},
    step3_reviewSend: {},
    statusPage: {},
    reportPage: {}
  };

  const screenshots: string[] = [];

  try {
    console.log('🚀 Starting Send Voucher Flow Exploration...\n');

    // ============================================
    // LOGIN
    // ============================================
    console.log('📝 Step: Login to Public Web');
    const baseUrl = 'https://corporate-voucher-stg.fam-stg.click';
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'playwright-tests/screenshots/send-01-homepage.png', fullPage: true });
    screenshots.push('send-01-homepage.png');

    // Login
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="email"], input[name="email"]', 'lindaamalia@axrail.com');
      await page.fill('input[type="password"], input[name="password"]', 'Rahasia567_');
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    console.log('✅ Login successful\n');

    // ============================================
    // NAVIGATION TO SEND VOUCHER
    // ============================================
    console.log('📝 Exploring Navigation Options...');
    
    // Option 1: Direct navigation to Send Voucher
    await page.goto(`${baseUrl}/send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-02-send-voucher-list.png', fullPage: true });
    screenshots.push('send-02-send-voucher-list.png');

    // Capture navigation elements
    const navElements = await page.locator('nav, [role="navigation"], header').all();
    for (const nav of navElements) {
      const text = await nav.textContent();
      if (text?.toLowerCase().includes('send')) {
        selectors.navigation.sendVoucherLink = await nav.evaluate(el => {
          return {
            tag: el.tagName,
            class: el.className,
            id: el.id,
            href: (el as HTMLAnchorElement).href,
            text: el.textContent?.trim()
          };
        });
      }
    }

    // Check for "Create New" or "Send Voucher" button
    const createButtons = await page.locator('button:has-text("Send"), button:has-text("Create"), a:has-text("Send Voucher")').all();
    for (let i = 0; i < createButtons.length; i++) {
      const btn = createButtons[i];
      const isVisible = await btn.isVisible();
      if (isVisible) {
        const btnInfo = await btn.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim(),
          type: (el as HTMLButtonElement).type
        }));
        selectors.navigation[`createButton_${i}`] = btnInfo;
      }
    }

    console.log('✅ Navigation elements captured\n');

    // ============================================
    // STEP 1: ADD VOUCHERS PAGE
    // ============================================
    console.log('📝 Exploring Step 1: Add Vouchers...');
    
    await page.goto(`${baseUrl}/send-voucher/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-03-step1-add-vouchers.png', fullPage: true });
    screenshots.push('send-03-step1-add-vouchers.png');

    // Capture "Total Number of Recipient" input
    const recipientInputs = await page.locator('input[type="number"], input[type="text"]').all();
    for (let i = 0; i < recipientInputs.length; i++) {
      const input = recipientInputs[i];
      const label = await page.locator(`label`).filter({ has: input }).textContent().catch(() => '');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      
      if (label?.toLowerCase().includes('recipient') || placeholder?.toLowerCase().includes('recipient')) {
        selectors.step1_addVouchers.totalRecipientInput = await input.evaluate(el => ({
          tag: el.tagName,
          type: (el as HTMLInputElement).type,
          class: el.className,
          id: el.id,
          name: (el as HTMLInputElement).name,
          placeholder: (el as HTMLInputElement).placeholder
        }));
      }
      
      if (label?.toLowerCase().includes('each') || placeholder?.toLowerCase().includes('each')) {
        selectors.step1_addVouchers.eachRecipientInput = await input.evaluate(el => ({
          tag: el.tagName,
          type: (el as HTMLInputElement).type,
          class: el.className,
          id: el.id,
          name: (el as HTMLInputElement).name,
          placeholder: (el as HTMLInputElement).placeholder
        }));
      }
    }

    // Capture "Select Voucher" button
    const selectVoucherButtons = await page.locator('button:has-text("Select Voucher"), button:has-text("Select")').all();
    for (let i = 0; i < selectVoucherButtons.length; i++) {
      const btn = selectVoucherButtons[i];
      const isVisible = await btn.isVisible();
      if (isVisible) {
        const btnInfo = await btn.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim(),
          type: (el as HTMLButtonElement).type
        }));
        selectors.step1_addVouchers[`selectVoucherButton_${i}`] = btnInfo;
      }
    }

    // Click Select Voucher button to open modal
    const selectBtn = page.locator('button:has-text("Select Voucher"), button:has-text("+Select")').first();
    if (await selectBtn.isVisible()) {
      await selectBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-04-select-voucher-modal.png', fullPage: true });
      screenshots.push('send-04-select-voucher-modal.png');

      // Capture modal elements
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        selectors.step1_addVouchers.modal = await modal.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          role: el.getAttribute('role')
        }));

        // Capture voucher checkboxes
        const checkboxes = await modal.locator('input[type="checkbox"], [role="checkbox"]').all();
        selectors.step1_addVouchers.voucherCheckboxes = [];
        for (let i = 0; i < Math.min(checkboxes.length, 3); i++) {
          const checkbox = checkboxes[i];
          const checkboxInfo = await checkbox.evaluate(el => ({
            tag: el.tagName,
            type: (el as HTMLInputElement).type,
            class: el.className,
            id: el.id,
            name: (el as HTMLInputElement).name,
            role: el.getAttribute('role')
          }));
          selectors.step1_addVouchers.voucherCheckboxes.push(checkboxInfo);
        }

        // Select first voucher
        if (checkboxes.length > 0) {
          await checkboxes[0].click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: 'playwright-tests/screenshots/send-05-voucher-selected.png', fullPage: true });
          screenshots.push('send-05-voucher-selected.png');
        }

        // Capture "Select" button in modal
        const modalSelectBtn = modal.locator('button:has-text("Select")').first();
        if (await modalSelectBtn.isVisible()) {
          selectors.step1_addVouchers.modalSelectButton = await modalSelectBtn.evaluate(el => ({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            text: el.textContent?.trim(),
            type: (el as HTMLButtonElement).type
          }));
          
          await modalSelectBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // Fill in recipient numbers
    const recipientInput = page.locator('input[type="number"], input[type="text"]').first();
    if (await recipientInput.isVisible()) {
      await recipientInput.fill('2');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-06-recipients-filled.png', fullPage: true });
      screenshots.push('send-06-recipients-filled.png');
    }

    // Capture "Next" button
    const nextButtons = await page.locator('button:has-text("Next")').all();
    for (let i = 0; i < nextButtons.length; i++) {
      const btn = nextButtons[i];
      const isVisible = await btn.isVisible();
      if (isVisible) {
        const btnInfo = await btn.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim(),
          type: (el as HTMLButtonElement).type,
          disabled: (el as HTMLButtonElement).disabled
        }));
        selectors.step1_addVouchers[`nextButton_${i}`] = btnInfo;
      }
    }

    // Click Next to go to Step 2
    const nextBtn = page.locator('button:has-text("Next")').first();
    const isNextEnabled = await nextBtn.isEnabled({ timeout: 5000 }).catch(() => false);
    if (isNextEnabled) {
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️  Next button not enabled, skipping to Step 2 manually...');
      await page.goto(`${baseUrl}/send-voucher/create?step=2`).catch(() => {});
      await page.waitForTimeout(2000);
    }

    console.log('✅ Step 1 elements captured\n');

    // ============================================
    // STEP 2: UPLOAD CSV
    // ============================================
    console.log('📝 Exploring Step 2: Upload CSV...');
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-07-step2-upload-csv.png', fullPage: true });
    screenshots.push('send-07-step2-upload-csv.png');

    // Capture instructions
    const instructions = await page.locator('text=/instruction|step|how to/i').all();
    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];
      const text = await inst.textContent();
      if (text && text.length > 20) {
        selectors.step2_uploadCSV[`instruction_${i}`] = await inst.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim().substring(0, 100)
        }));
      }
    }

    // Capture "Download CSV template" link/button
    const downloadLinks = await page.locator('a:has-text("Download"), button:has-text("Download"), a:has-text("template"), button:has-text("template")').all();
    for (let i = 0; i < downloadLinks.length; i++) {
      const link = downloadLinks[i];
      const isVisible = await link.isVisible();
      if (isVisible) {
        const linkInfo = await link.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim(),
          href: (el as HTMLAnchorElement).href
        }));
        selectors.step2_uploadCSV[`downloadLink_${i}`] = linkInfo;
      }
    }

    // Capture file input
    const fileInputs = await page.locator('input[type="file"]').all();
    for (let i = 0; i < fileInputs.length; i++) {
      const input = fileInputs[i];
      const inputInfo = await input.evaluate(el => ({
        tag: el.tagName,
        type: (el as HTMLInputElement).type,
        class: el.className,
        id: el.id,
        name: (el as HTMLInputElement).name,
        accept: (el as HTMLInputElement).accept
      }));
      selectors.step2_uploadCSV[`fileInput_${i}`] = inputInfo;
    }

    // Capture "Upload Again" button (if visible)
    const uploadAgainBtn = page.locator('button:has-text("Upload Again"), button:has-text("Re-upload")').first();
    if (await uploadAgainBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      selectors.step2_uploadCSV.uploadAgainButton = await uploadAgainBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim()
      }));
    }

    // Capture "Download and Make Adjustments" button (if visible)
    const downloadAdjustBtn = page.locator('button:has-text("Download"), button:has-text("Adjustment")').first();
    if (await downloadAdjustBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      selectors.step2_uploadCSV.downloadAdjustmentButton = await downloadAdjustBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim()
      }));
    }

    // Capture Upload Result Summary elements
    const summaryElements = await page.locator('text=/upload.*result|summary|invalid.*phone|invalid.*email/i').all();
    for (let i = 0; i < Math.min(summaryElements.length, 5); i++) {
      const elem = summaryElements[i];
      const text = await elem.textContent();
      if (text && text.length > 5) {
        selectors.step2_uploadCSV[`summaryElement_${i}`] = await elem.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim().substring(0, 100)
        }));
      }
    }

    // Capture "Next" or "Send" button
    const step2NextBtn = page.locator('button:has-text("Next"), button:has-text("Send")').first();
    if (await step2NextBtn.isVisible()) {
      selectors.step2_uploadCSV.nextOrSendButton = await step2NextBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim(),
        disabled: (el as HTMLButtonElement).disabled
      }));
    }

    // Capture customized message input
    const messageInputs = await page.locator('textarea, input').all();
    for (const input of messageInputs) {
      const label = await page.locator('label').filter({ has: input }).textContent().catch(() => '');
      const placeholder = await input.getAttribute('placeholder');
      
      if (label?.toLowerCase().includes('message') || placeholder?.toLowerCase().includes('message')) {
        selectors.step2_uploadCSV.customMessageInput = await input.evaluate(el => ({
          tag: el.tagName,
          type: (el as HTMLInputElement).type,
          class: el.className,
          id: el.id,
          name: (el as HTMLInputElement).name,
          placeholder: (el as HTMLInputElement).placeholder
        }));
      }
    }

    console.log('✅ Step 2 elements captured\n');

    // ============================================
    // SEND VOUCHER STATUS PAGE
    // ============================================
    console.log('📝 Exploring Send Voucher Status Page...');
    
    await page.goto(`${baseUrl}/send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-08-status-page.png', fullPage: true });
    screenshots.push('send-08-status-page.png');

    // Capture batch list elements
    const batchItems = await page.locator('[class*="batch"], [class*="item"], tr, [class*="row"]').all();
    if (batchItems.length > 0) {
      const firstBatch = batchItems[0];
      selectors.statusPage.batchItem = await firstBatch.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id
      }));
    }

    // Capture "View Report" or "Download Report" buttons
    const reportButtons = await page.locator('button:has-text("Report"), a:has-text("Report"), button:has-text("View"), a:has-text("View")').all();
    for (let i = 0; i < Math.min(reportButtons.length, 3); i++) {
      const btn = reportButtons[i];
      const isVisible = await btn.isVisible();
      if (isVisible) {
        const btnInfo = await btn.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim()
        }));
        selectors.statusPage[`reportButton_${i}`] = btnInfo;
      }
    }

    // Capture "Withdraw" button
    const withdrawBtn = page.locator('button:has-text("Withdraw")').first();
    if (await withdrawBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      selectors.statusPage.withdrawButton = await withdrawBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim()
      }));
    }

    // Click on first batch to view details (if available)
    const viewDetailBtn = page.locator('button:has-text("View"), a:has-text("View")').first();
    if (await viewDetailBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewDetailBtn.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'playwright-tests/screenshots/send-09-batch-detail.png', fullPage: true });
      screenshots.push('send-09-batch-detail.png');

      // ============================================
      // REPORT/DETAIL PAGE
      // ============================================
      console.log('📝 Exploring Report/Detail Page...');

      // Capture search input
      const searchInputs = await page.locator('input[placeholder*="search"], input[placeholder*="phone"], input[type="search"]').all();
      for (let i = 0; i < searchInputs.length; i++) {
        const input = searchInputs[i];
        const isVisible = await input.isVisible();
        if (isVisible) {
          const inputInfo = await input.evaluate(el => ({
            tag: el.tagName,
            type: (el as HTMLInputElement).type,
            class: el.className,
            id: el.id,
            placeholder: (el as HTMLInputElement).placeholder
          }));
          selectors.reportPage[`searchInput_${i}`] = inputInfo;
        }
      }

      // Capture filter dropdown
      const filterDropdowns = await page.locator('select, [role="combobox"]').all();
      for (let i = 0; i < filterDropdowns.length; i++) {
        const dropdown = filterDropdowns[i];
        const isVisible = await dropdown.isVisible();
        if (isVisible) {
          const dropdownInfo = await dropdown.evaluate(el => ({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            name: (el as HTMLSelectElement).name
          }));
          selectors.reportPage[`filterDropdown_${i}`] = dropdownInfo;
        }
      }

      // Capture status columns
      const statusElements = await page.locator('text=/successfully.*sent|mobile.*not.*registered|withdraw|system.*error/i').all();
      for (let i = 0; i < Math.min(statusElements.length, 5); i++) {
        const elem = statusElements[i];
        const text = await elem.textContent();
        if (text) {
          selectors.reportPage[`statusElement_${i}`] = await elem.evaluate(el => ({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            text: el.textContent?.trim()
          }));
        }
      }

      // Capture checkboxes for withdrawal
      const withdrawCheckboxes = await page.locator('input[type="checkbox"]').all();
      if (withdrawCheckboxes.length > 0) {
        selectors.reportPage.withdrawCheckbox = await withdrawCheckboxes[0].evaluate(el => ({
          tag: el.tagName,
          type: (el as HTMLInputElement).type,
          class: el.className,
          id: el.id
        }));
      }

      // Capture "Download Report" button
      const downloadReportBtn = page.locator('button:has-text("Download Report"), button:has-text("Download")').first();
      if (await downloadReportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        selectors.reportPage.downloadReportButton = await downloadReportBtn.evaluate(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id,
          text: el.textContent?.trim()
        }));
      }

      console.log('✅ Report page elements captured\n');
    }

    // ============================================
    // CHECK MY ORDER PAGE
    // ============================================
    console.log('📝 Exploring My Order Page...');
    
    await page.goto(`${baseUrl}/my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-10-my-order.png', fullPage: true });
    screenshots.push('send-10-my-order.png');

    // Capture search input
    const myOrderSearch = page.locator('input[placeholder*="Search"], input[placeholder*="Order"]').first();
    if (await myOrderSearch.isVisible()) {
      selectors.navigation.myOrderSearchInput = await myOrderSearch.evaluate(el => ({
        tag: el.tagName,
        type: (el as HTMLInputElement).type,
        class: el.className,
        id: el.id,
        placeholder: (el as HTMLInputElement).placeholder
      }));
    }

    // Capture "Send Voucher" button in My Order
    const myOrderSendBtn = page.locator('button:has-text("Send Voucher")').first();
    if (await myOrderSendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      selectors.navigation.myOrderSendButton = await myOrderSendBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim()
      }));
    }

    console.log('✅ My Order elements captured\n');

    // ============================================
    // CHECK INVENTORY PAGE
    // ============================================
    console.log('📝 Exploring Inventory Page...');
    
    await page.goto(`${baseUrl}/inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/send-11-inventory.png', fullPage: true });
    screenshots.push('send-11-inventory.png');

    // Capture "Send Voucher" button in Inventory
    const inventorySendBtn = page.locator('button:has-text("Send Voucher")').first();
    if (await inventorySendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      selectors.navigation.inventorySendButton = await inventorySendBtn.evaluate(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        text: el.textContent?.trim()
      }));
    }

    console.log('✅ Inventory elements captured\n');

    // ============================================
    // SAVE RESULTS
    // ============================================
    console.log('💾 Saving selectors to file...');
    
    const outputDir = path.join(process.cwd(), 'playwright-tests');
    const selectorsFile = path.join(outputDir, 'send-voucher-selectors.json');
    
    fs.writeFileSync(selectorsFile, JSON.stringify(selectors, null, 2));
    console.log(`✅ Selectors saved to: ${selectorsFile}\n`);

    // Create summary document
    const summaryContent = `# Send Voucher Selectors - Exploration Results

## Exploration Date
${new Date().toISOString()}

## Screenshots Captured
${screenshots.map(s => `- ${s}`).join('\n')}

## Selectors Found

### Navigation
\`\`\`json
${JSON.stringify(selectors.navigation, null, 2)}
\`\`\`

### Step 1: Add Vouchers
\`\`\`json
${JSON.stringify(selectors.step1_addVouchers, null, 2)}
\`\`\`

### Step 2: Upload CSV
\`\`\`json
${JSON.stringify(selectors.step2_uploadCSV, null, 2)}
\`\`\`

### Status Page
\`\`\`json
${JSON.stringify(selectors.statusPage, null, 2)}
\`\`\`

### Report Page
\`\`\`json
${JSON.stringify(selectors.reportPage, null, 2)}
\`\`\`

## Usage

Use these selectors in your test files to ensure accurate element targeting.

Example:
\`\`\`typescript
// Select voucher button
await page.click('button:has-text("Select Voucher")');

// Fill recipient count
await page.fill('input[type="number"]', '2');

// Click Next
await page.click('button:has-text("Next")');
\`\`\`
`;

    const summaryFile = path.join(outputDir, 'docs', 'SEND_VOUCHER_SELECTORS.md');
    fs.writeFileSync(summaryFile, summaryContent);
    console.log(`✅ Summary saved to: ${summaryFile}\n`);

    console.log('🎉 Exploration Complete!');
    console.log(`📸 ${screenshots.length} screenshots captured`);
    console.log(`📝 Selectors saved to send-voucher-selectors.json`);

  } catch (error) {
    console.error('❌ Error during exploration:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/send-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the exploration
exploreSendVoucherFlow().catch(console.error);
