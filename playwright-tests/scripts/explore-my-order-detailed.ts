import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreDetailed() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const BASE_URL = 'https://corporate-voucher-stg.fam-stg.click/';
  const LOGIN_URL = 'https://corporate-voucher-stg.fam-stg.click/login';
  const EMAIL = 'lindaamalia@axrail.com';
  const PASSWORD = 'Rahasia567_';

  const selectors: any = {};
  const log: string[] = [];

  function addLog(message: string) {
    console.log(message);
    log.push(message);
  }

  try {
    // Login
    addLog('=== Login ===');
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    addLog('✓ Logged in\n');

    // Explore My Orders page in detail
    addLog('=== My Orders Page ===');
    await page.goto(`${BASE_URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get page HTML structure
    const bodyHTML = await page.locator('body').innerHTML();
    fs.writeFileSync('./my-orders-page.html', bodyHTML);
    addLog('✓ Saved page HTML to my-orders-page.html');

    // Take screenshot
    await page.screenshot({ path: './screenshots/my-orders-full.png', fullPage: true });
    
    // Find all clickable elements
    addLog('\n--- Searching for Order Cards ---');
    const possibleOrderSelectors = [
      'div[class*="order"]',
      'div[class*="card"]',
      'a[href*="order"]',
      '[role="button"]',
      'div[class*="item"]'
    ];

    for (const selector of possibleOrderSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        addLog(`Found ${elements.length} elements with: ${selector}`);
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          const text = await elements[i].textContent();
          const classes = await elements[i].getAttribute('class');
          addLog(`  [${i}] classes: ${classes}`);
          addLog(`  [${i}] text: ${text?.substring(0, 100)}...`);
        }
      }
    }

    // Try to click first order
    addLog('\n--- Attempting to click first order ---');
    const orderCard = page.locator('div[class*="order"]').first();
    if (await orderCard.isVisible()) {
      await orderCard.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: './screenshots/order-detail-full.png', fullPage: true });
      
      const detailHTML = await page.locator('body').innerHTML();
      fs.writeFileSync('./order-detail-page.html', detailHTML);
      addLog('✓ Clicked order and saved detail page HTML');
      addLog(`Current URL: ${page.url()}`);
    }

    // Search for specific elements on order detail page
    addLog('\n--- Searching for Order Detail Elements ---');
    const detailSelectors = {
      orderNumber: ['text=/Order.*#/', 'text=/TGV/', 'span:has-text("TGV")', 'div:has-text("Order")'],
      bookingNumber: ['text=/Booking/', 'text=/BK/', 'span:has-text("Booking")', 'div:has-text("Booking")'],
      status: ['text=/Status/', 'text=/Confirmed/', 'text=/Processing/', 'span[class*="status"]'],
      viewReceipt: ['button:has-text("Receipt")', 'button:has-text("View")', 'a:has-text("Receipt")'],
      timestamp: ['text=/2024/', 'text=/Jan/', 'text=/Feb/', 'span[class*="date"]', 'span[class*="time"]']
    };

    for (const [key, selectorList] of Object.entries(detailSelectors)) {
      addLog(`\nSearching for ${key}:`);
      for (const selector of selectorList) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent();
            const classes = await element.getAttribute('class');
            addLog(`  ✓ Found with: ${selector}`);
            addLog(`    Text: ${text}`);
            addLog(`    Classes: ${classes}`);
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }

    // Go back to My Orders
    await page.goto(`${BASE_URL}my-orders`);
    await page.waitForTimeout(2000);

    // Test search and filter
    addLog('\n--- Testing Search and Filter ---');
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      addLog('✓ Search input found');
      const placeholder = await searchInput.getAttribute('placeholder');
      addLog(`  Placeholder: ${placeholder}`);
    }

    const filterButton = page.locator('button:has-text("Filter Date")');
    if (await filterButton.isVisible()) {
      addLog('✓ Filter Date button found');
      await filterButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './screenshots/filter-date-modal.png', fullPage: true });
      
      // Look for date inputs
      const dateInputs = await page.locator('input[type="date"], input[name*="date"]').all();
      addLog(`  Found ${dateInputs.length} date inputs`);
    }

    // Save all findings
    fs.writeFileSync('./my-order-exploration-detailed.txt', log.join('\n'));
    addLog('\n✓ Exploration complete!');

  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
    await page.screenshot({ path: './screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreDetailed();
