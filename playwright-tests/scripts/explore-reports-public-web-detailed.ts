import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreReportsPublicWeb() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
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
    log.push('=== EXPLORING REPORTS PUBLIC WEB ===\n');

    // Login
    log.push('--- LOGIN ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[type="password"]', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('✓ Logged in successfully\n');

    // ===== TC_REPORT001 & TC_REPORT002: Send Voucher Reports =====
    log.push('--- EXPLORING SEND VOUCHERS PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/send-vouchers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('\n📋 Send Vouchers Page Structure:');
    
    // Check for batch listings
    const batchCards = await page.locator('div[class*="card"], tr, div[class*="batch"], div[class*="item"]').all();
    log.push(`Found ${batchCards.length} potential batch elements`);
    
    // Try to find batch rows/cards
    const tableRows = await page.locator('table tbody tr').count();
    log.push(`Table rows: ${tableRows}`);
    
    if (tableRows > 0) {
      selectors.sendVouchers.batchRow = 'table tbody tr';
      log.push('✓ Using table rows for batches');
      
      // Check for checkboxes in table
      const checkboxes = await page.locator('table tbody tr input[type="checkbox"]').count();
      log.push(`Checkboxes in table: ${checkboxes}`);
      if (checkboxes > 0) {
        selectors.sendVouchers.batchCheckbox = 'table tbody tr input[type="checkbox"]';
      }
      
      // Try clicking first row to see details
      if (tableRows > 0) {
        log.push('\nClicking first batch row...');
        await page.locator('table tbody tr').first().click();
        await page.waitForTimeout(2000);
        
        // Look for View Report button
        const viewReportBtn = await page.locator('button:has-text("View Report"), button:has-text("Report"), a:has-text("View Report")').count();
        log.push(`View Report buttons found: ${viewReportBtn}`);
        
        if (viewReportBtn > 0) {
          selectors.sendVouchers.viewReportButton = 'button:has-text("View Report")';
          log.push('✓ Found View Report button');
        }
      }
    } else {
      // Check for card-based layout
      const cards = await page.locator('div[class*="card"]').count();
      log.push(`Card elements: ${cards}`);
      if (cards > 0) {
        selectors.sendVouchers.batchCard = 'div[class*="card"]';
      }
    }
    
    // Look for Download Report button on main page
    const downloadBtns = await page.locator('button:has-text("Download Report"), button:has-text("Download")').all();
    log.push(`\nDownload buttons on page: ${downloadBtns.length}`);
    
    for (let i = 0; i < downloadBtns.length; i++) {
      const btnText = await downloadBtns[i].textContent();
      const isVisible = await downloadBtns[i].isVisible();
      log.push(`  Button ${i + 1}: "${btnText?.trim()}" - Visible: ${isVisible}`);
    }
    
    if (downloadBtns.length > 0) {
      selectors.sendVouchers.downloadReportButton = 'button:has-text("Download Report")';
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/send-vouchers-reports.png', fullPage: true });
    log.push('📸 Screenshot saved: send-vouchers-reports.png\n');

    // ===== TC_REPORT003: Inventory Reports =====
    log.push('--- EXPLORING INVENTORY PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('\n📋 Inventory Page Structure:');
    
    // Check for voucher listings
    const inventoryRows = await page.locator('table tbody tr').count();
    log.push(`Inventory table rows: ${inventoryRows}`);
    
    if (inventoryRows > 0) {
      selectors.inventory.voucherRow = 'table tbody tr';
      
      // Check for checkboxes
      const invCheckboxes = await page.locator('table tbody tr input[type="checkbox"]').count();
      log.push(`Checkboxes in inventory: ${invCheckboxes}`);
      
      if (invCheckboxes > 0) {
        selectors.inventory.voucherCheckbox = 'table tbody tr input[type="checkbox"]';
        
        // Try checking a checkbox
        log.push('\nChecking first voucher checkbox...');
        await page.locator('table tbody tr input[type="checkbox"]').first().check();
        await page.waitForTimeout(1000);
      }
    } else {
      // Check for card layout
      const invCards = await page.locator('div[class*="card"], div[class*="voucher"]').count();
      log.push(`Inventory cards: ${invCards}`);
      if (invCards > 0) {
        selectors.inventory.voucherCard = 'div[class*="card"]';
      }
    }
    
    // Look for Download Report button
    const invDownloadBtns = await page.locator('button:has-text("Download Report"), button:has-text("Download")').all();
    log.push(`\nDownload buttons on inventory: ${invDownloadBtns.length}`);
    
    for (let i = 0; i < invDownloadBtns.length; i++) {
      const btnText = await invDownloadBtns[i].textContent();
      const isVisible = await invDownloadBtns[i].isVisible();
      const isEnabled = await invDownloadBtns[i].isEnabled();
      log.push(`  Button ${i + 1}: "${btnText?.trim()}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
    }
    
    if (invDownloadBtns.length > 0) {
      selectors.inventory.downloadReportButton = 'button:has-text("Download Report")';
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/inventory-reports.png', fullPage: true });
    log.push('📸 Screenshot saved: inventory-reports.png\n');

    // ===== TC_REPORT004 & TC_REPORT005: Cart Quotation =====
    log.push('--- EXPLORING CART PAGE ---');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/cart');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('\n📋 Cart Page Structure:');
    
    // Check if cart has items
    const emptyCart = await page.locator('text=/empty/i, text=/no items/i').count();
    log.push(`Empty cart message: ${emptyCart > 0 ? 'Yes' : 'No'}`);
    
    if (emptyCart > 0) {
      log.push('⚠️  Cart is empty. Need to add items first.');
      
      // Add item to cart
      log.push('\nAdding item to cart...');
      await page.goto('https://corporate-voucher-stg.fam-stg.click/buy');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const vouchers = await page.locator('div[class*="card"], article, div[class*="voucher"]').count();
      log.push(`Vouchers available: ${vouchers}`);
      
      if (vouchers > 0) {
        await page.locator('div[class*="card"], article').first().click();
        await page.waitForTimeout(1000);
        
        // Click Add to Cart or Buy
        const addToCartBtn = await page.locator('button:has-text("Add to Cart"), button:has-text("Buy")').first();
        if (await addToCartBtn.isVisible()) {
          await addToCartBtn.click();
          await page.waitForTimeout(2000);
          log.push('✓ Added item to cart');
        }
      }
      
      // Go back to cart
      await page.goto('https://corporate-voucher-stg.fam-stg.click/cart');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Check cart items
    const cartRows = await page.locator('table tbody tr').count();
    log.push(`Cart table rows: ${cartRows}`);
    
    if (cartRows > 0) {
      selectors.cart.itemRow = 'table tbody tr';
      
      // Check for checkboxes
      const cartCheckboxes = await page.locator('table tbody tr input[type="checkbox"], input[type="checkbox"]').count();
      log.push(`Checkboxes in cart: ${cartCheckboxes}`);
      
      if (cartCheckboxes > 0) {
        selectors.cart.itemCheckbox = 'input[type="checkbox"]';
      }
    } else {
      // Check for card layout
      const cartCards = await page.locator('div[class*="cart"], div[class*="item"], div[class*="card"]').count();
      log.push(`Cart cards: ${cartCards}`);
      if (cartCards > 0) {
        selectors.cart.itemCard = 'div[class*="cart"], div[class*="item"]';
      }
    }
    
    // Look for Get Quotation button
    const quotationBtns = await page.locator('button:has-text("Get Quotation"), button:has-text("Quotation"), button:has-text("Download Quotation")').all();
    log.push(`\nGet Quotation buttons: ${quotationBtns.length}`);
    
    for (let i = 0; i < quotationBtns.length; i++) {
      const btnText = await quotationBtns[i].textContent();
      const isVisible = await quotationBtns[i].isVisible();
      const isEnabled = await quotationBtns[i].isEnabled();
      log.push(`  Button ${i + 1}: "${btnText?.trim()}" - Visible: ${isVisible}, Enabled: ${isEnabled}`);
    }
    
    if (quotationBtns.length > 0) {
      selectors.cart.getQuotationButton = 'button:has-text("Get Quotation")';
    }
    
    // Test clicking without selection (TC_REPORT004)
    log.push('\n--- Testing Get Quotation without selection ---');
    
    // Uncheck all checkboxes
    const allCheckboxes = await page.locator('input[type="checkbox"]:checked').all();
    log.push(`Checked checkboxes: ${allCheckboxes.length}`);
    
    for (const checkbox of allCheckboxes) {
      await checkbox.uncheck();
    }
    await page.waitForTimeout(1000);
    
    // Click Get Quotation
    if (quotationBtns.length > 0) {
      await quotationBtns[0].click();
      await page.waitForTimeout(2000);
      
      // Look for error message
      const errorSelectors = [
        'text=/please select/i',
        'text=/select an item/i',
        'text=/no item/i',
        'div[role="alert"]',
        '.error',
        '.toast',
        '[class*="error"]',
        '[class*="alert"]',
        '[class*="message"]'
      ];
      
      const errorMessages: any[] = [];
      for (const selector of errorSelectors) {
        const elements = await page.locator(selector).all();
        errorMessages.push(...elements);
      }
      log.push(`Error messages found: ${errorMessages.length}`);
      
      for (let i = 0; i < errorMessages.length; i++) {
        const msgText = await errorMessages[i].textContent();
        const isVisible = await errorMessages[i].isVisible();
        log.push(`  Message ${i + 1}: "${msgText?.trim()}" - Visible: ${isVisible}`);
        
        if (isVisible && msgText?.toLowerCase().includes('select')) {
          selectors.cart.errorMessage = await errorMessages[i].evaluate((el: any) => {
            // Try to get a good selector
            if (el.className) return `.${el.className.split(' ')[0]}`;
            if (el.getAttribute('role')) return `[role="${el.getAttribute('role')}"]`;
            return 'div[role="alert"]';
          });
        }
      }
    }
    
    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/cart-quotation.png', fullPage: true });
    log.push('📸 Screenshot saved: cart-quotation.png\n');
    
    // Test with selection (TC_REPORT005)
    log.push('\n--- Testing Get Quotation with selection ---');
    const firstCheckbox = await page.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.check();
      await page.waitForTimeout(1000);
      log.push('✓ Checked first item');
      
      // Take screenshot with selection
      await page.screenshot({ path: 'playwright-tests/screenshots/cart-quotation-selected.png', fullPage: true });
      log.push('📸 Screenshot saved: cart-quotation-selected.png');
    }

    // Save selectors to JSON
    log.push('\n=== SELECTORS FOUND ===');
    log.push(JSON.stringify(selectors, null, 2));
    
    fs.writeFileSync(
      'playwright-tests/reports-public-web-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    log.push('\n✓ Selectors saved to reports-public-web-selectors.json');

  } catch (error) {
    log.push(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    // Save log
    fs.writeFileSync('playwright-tests/reports-public-web-exploration.log', log.join('\n'));
    console.log(log.join('\n'));
    
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreReportsPublicWeb();
