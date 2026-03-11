import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreReportsComprehensive() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const log: string[] = [];
  const selectors: any = {
    sendVouchers: {},
    inventory: {},
    cart: {},
    common: {}
  };

  try {
    log.push('=== COMPREHENSIVE REPORTS EXPLORATION ===\n');

    // Login
    log.push('--- LOGIN ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[type="password"]', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    log.push('✓ Logged in successfully\n');

    // ===== SEND VOUCHERS PAGE =====
    log.push('--- SEND VOUCHERS PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/send-vouchers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get page HTML structure
    const sendVouchersHTML = await page.content();
    fs.writeFileSync('playwright-tests/send-vouchers-page.html', sendVouchersHTML);
    log.push('✓ Saved send-vouchers-page.html');
    
    // Check for empty state
    const emptyState = await page.locator('text=/no data/i, text=/empty/i, text=/no batch/i, text=/no voucher/i').count();
    log.push(`Empty state messages: ${emptyState}`);
    
    // Look for all possible batch containers
    const allDivs = await page.locator('div').count();
    log.push(`Total divs on page: ${allDivs}`);
    
    // Check for specific structures
    const tables = await page.locator('table').count();
    log.push(`Tables: ${tables}`);
    
    if (tables > 0) {
      const headers = await page.locator('table thead th').allTextContents();
      log.push(`Table headers: ${headers.join(', ')}`);
      
      const rows = await page.locator('table tbody tr').count();
      log.push(`Table rows: ${rows}`);
      
      if (rows > 0) {
        selectors.sendVouchers.batchRow = 'table tbody tr';
        selectors.sendVouchers.batchCheckbox = 'table tbody tr input[type="checkbox"]';
        
        // Get first row text
        const firstRowText = await page.locator('table tbody tr').first().textContent();
        log.push(`First row: ${firstRowText?.substring(0, 100)}`);
      }
    }
    
    // Look for buttons
    const allButtons = await page.locator('button').allTextContents();
    log.push(`\nAll buttons: ${allButtons.join(', ')}`);
    
    // Check for Download Report button
    const downloadBtn = await page.locator('button:has-text("Download")').count();
    log.push(`Download buttons: ${downloadBtn}`);
    
    if (downloadBtn > 0) {
      selectors.sendVouchers.downloadReportButton = 'button:has-text("Download")';
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/send-vouchers-full.png', fullPage: true });
    log.push('📸 Screenshot: send-vouchers-full.png\n');

    // ===== INVENTORY PAGE =====
    log.push('--- INVENTORY PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get page HTML
    const inventoryHTML = await page.content();
    fs.writeFileSync('playwright-tests/inventory-page.html', inventoryHTML);
    log.push('✓ Saved inventory-page.html');
    
    // Check for empty state
    const invEmptyState = await page.locator('text=/no data/i, text=/empty/i, text=/no voucher/i, text=/no inventory/i').count();
    log.push(`Empty state messages: ${invEmptyState}`);
    
    // Check structure
    const invTables = await page.locator('table').count();
    log.push(`Tables: ${invTables}`);
    
    if (invTables > 0) {
      const invHeaders = await page.locator('table thead th').allTextContents();
      log.push(`Table headers: ${invHeaders.join(', ')}`);
      
      const invRows = await page.locator('table tbody tr').count();
      log.push(`Table rows: ${invRows}`);
      
      if (invRows > 0) {
        selectors.inventory.voucherRow = 'table tbody tr';
        selectors.inventory.voucherCheckbox = 'table tbody tr input[type="checkbox"]';
      }
    }
    
    // Check for cards
    const invCards = await page.locator('[class*="card"]').count();
    log.push(`Card elements: ${invCards}`);
    
    // Look for checkboxes anywhere
    const allCheckboxes = await page.locator('input[type="checkbox"]').count();
    log.push(`All checkboxes: ${allCheckboxes}`);
    
    if (allCheckboxes > 0) {
      selectors.inventory.checkbox = 'input[type="checkbox"]';
    }
    
    // Look for buttons
    const invButtons = await page.locator('button').allTextContents();
    log.push(`\nAll buttons: ${invButtons.join(', ')}`);
    
    const invDownloadBtn = await page.locator('button:has-text("Download")').count();
    log.push(`Download buttons: ${invDownloadBtn}`);
    
    if (invDownloadBtn > 0) {
      const isEnabled = await page.locator('button:has-text("Download")').first().isEnabled();
      log.push(`Download button enabled: ${isEnabled}`);
      selectors.inventory.downloadReportButton = 'button:has-text("Download")';
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/inventory-full.png', fullPage: true });
    log.push('📸 Screenshot: inventory-full.png\n');

    // ===== CART PAGE =====
    log.push('--- CART PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get page HTML
    const cartHTML = await page.content();
    fs.writeFileSync('playwright-tests/cart-page.html', cartHTML);
    log.push('✓ Saved cart-page.html');
    
    // Check for empty state
    const cartEmptyState = await page.locator('text=/no data/i, text=/empty/i, text=/no item/i, text=/cart is empty/i').count();
    log.push(`Empty state messages: ${cartEmptyState}`);
    
    // Check structure
    const cartTables = await page.locator('table').count();
    log.push(`Tables: ${cartTables}`);
    
    // Check for cards/items
    const cartItems = await page.locator('[class*="cart"], [class*="item"]').count();
    log.push(`Cart items: ${cartItems}`);
    
    if (cartItems > 0) {
      selectors.cart.itemCard = '[class*="cart"], [class*="item"]';
      
      // Get first item text
      const firstItemText = await page.locator('[class*="cart"], [class*="item"]').first().textContent();
      log.push(`First item: ${firstItemText?.substring(0, 100)}`);
    }
    
    // Look for checkboxes
    const cartCheckboxes = await page.locator('input[type="checkbox"]').count();
    log.push(`Checkboxes: ${cartCheckboxes}`);
    
    if (cartCheckboxes > 0) {
      selectors.cart.checkbox = 'input[type="checkbox"]';
    }
    
    // Look for buttons
    const cartButtons = await page.locator('button').allTextContents();
    log.push(`\nAll buttons: ${cartButtons.join(', ')}`);
    
    // Get Quotation button
    const quotationBtn = await page.locator('button:has-text("Quotation")').count();
    log.push(`Quotation buttons: ${quotationBtn}`);
    
    if (quotationBtn > 0) {
      const quotationText = await page.locator('button:has-text("Quotation")').first().textContent();
      log.push(`Quotation button text: "${quotationText?.trim()}"`);
      selectors.cart.getQuotationButton = 'button:has-text("Quotation")';
    }
    
    // Test clicking Get Quotation without selection
    log.push('\n--- Testing Get Quotation without selection ---');
    
    // Uncheck all
    const checkedBoxes = await page.locator('input[type="checkbox"]:checked').all();
    log.push(`Currently checked: ${checkedBoxes.length}`);
    
    for (const box of checkedBoxes) {
      await box.uncheck();
    }
    await page.waitForTimeout(1000);
    
    // Click Get Quotation
    if (quotationBtn > 0) {
      await page.locator('button:has-text("Quotation")').first().click();
      await page.waitForTimeout(2000);
      
      // Look for error/toast message
      const toastSelectors = [
        '[role="alert"]',
        '[class*="toast"]',
        '[class*="alert"]',
        '[class*="message"]',
        '[class*="error"]',
        '[class*="notification"]'
      ];
      
      for (const selector of toastSelectors) {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          const text = await page.locator(selector).first().textContent();
          const isVisible = await page.locator(selector).first().isVisible();
          log.push(`${selector}: ${elements} found, visible: ${isVisible}, text: "${text?.trim()}"`);
          
          if (isVisible && text?.toLowerCase().includes('select')) {
            selectors.cart.errorToast = selector;
          }
        }
      }
      
      // Take screenshot of error
      await page.screenshot({ path: 'playwright-tests/screenshots/cart-error.png', fullPage: true });
      log.push('📸 Screenshot: cart-error.png');
    }
    
    // Test with selection
    log.push('\n--- Testing Get Quotation with selection ---');
    const firstCheckbox = await page.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check();
      await page.waitForTimeout(1000);
      log.push('✓ Checked first item');
      
      await page.screenshot({ path: 'playwright-tests/screenshots/cart-selected.png', fullPage: true });
      log.push('📸 Screenshot: cart-selected.png');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/cart-full.png', fullPage: true });
    log.push('📸 Screenshot: cart-full.png\n');

    // Save selectors
    log.push('\n=== SELECTORS FOUND ===');
    log.push(JSON.stringify(selectors, null, 2));
    
    fs.writeFileSync(
      'playwright-tests/reports-comprehensive-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    log.push('\n✓ Selectors saved to reports-comprehensive-selectors.json');

  } catch (error) {
    log.push(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    // Save log
    fs.writeFileSync('playwright-tests/reports-comprehensive-exploration.log', log.join('\n'));
    console.log(log.join('\n'));
    
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreReportsComprehensive();
