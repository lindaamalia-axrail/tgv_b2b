import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function exploreMyOrderFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const BASE_URL = 'https://corporate-voucher-stg.fam-stg.click/';
  const LOGIN_URL = 'https://corporate-voucher-stg.fam-stg.click/login';
  const EMAIL = 'lindaamalia@axrail.com';
  const PASSWORD = 'Rahasia567_';

  const selectors: any = {
    buyVouchers: {},
    checkout: {},
    myOrder: {},
    orderDetail: {},
    inventory: {},
    receipt: {}
  };

  const log: string[] = [];

  function addLog(message: string) {
    console.log(message);
    log.push(message);
  }

  try {
    addLog('=== Starting My Order Flow Exploration ===\n');

    // Login first
    addLog('Step 1: Login to Public Web');
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Fill login form
    addLog('Filling login credentials...');
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    await page.fill('input[type="password"], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    addLog(`✓ Logged in successfully`);

    // Explore Buy Vouchers Page
    addLog('\n=== Exploring Buy Vouchers Page ===');
    await page.goto(`${BASE_URL}buy-vouchers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/my-order-01-buy-vouchers.png', fullPage: true });

    // Find voucher cards
    const voucherSelectors = [
      'a[href*="/buy-vouchers/"]',
      '.voucher-card',
      '[data-testid="voucher-card"]',
      '.product-card',
      'div[class*="voucher"]',
      'div[class*="product"]'
    ];

    for (const selector of voucherSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        addLog(`✓ Found ${count} vouchers with selector: ${selector}`);
        selectors.buyVouchers.voucherCard = selector;
        
        // Try to click first voucher
        try {
          await page.locator(selector).first().click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: './screenshots/my-order-02-voucher-detail.png', fullPage: true });
          addLog(`✓ Clicked first voucher successfully`);
          
          // Find Buy Now button
          const buyNowSelectors = [
            'button:has-text("BUY NOW")',
            'button:has-text("Buy Now")',
            'button:has-text("Add to Cart")',
            'button[class*="buy"]',
            'button[type="submit"]'
          ];

          for (const btnSelector of buyNowSelectors) {
            try {
              if (await page.locator(btnSelector).isVisible({ timeout: 2000 })) {
                addLog(`✓ Found Buy Now button: ${btnSelector}`);
                selectors.buyVouchers.buyNowButton = btnSelector;
                break;
              }
            } catch (e) {
              // Continue
            }
          }
        } catch (e) {
          addLog(`⚠ Could not click voucher: ${e}`);
        }
        break;
      }
    }

    // Explore My Order Page
    addLog('\n=== Exploring My Order Page ===');
    await page.goto(`${BASE_URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/my-order-04-my-orders.png', fullPage: true });
    addLog(`Current URL: ${page.url()}`);

    // Find order cards
    const orderCardSelectors = [
      'div[class*="order-card"]',
      'div[class*="order"]',
      '[data-testid="order-card"]',
      '.order-item',
      'a[href*="/my-orders/"]'
    ];

    for (const selector of orderCardSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        addLog(`✓ Found ${count} orders with selector: ${selector}`);
        selectors.myOrder.orderCard = selector;
        break;
      }
    }

    // Find order status
    const orderStatusSelectors = [
      '.order-status',
      '[data-testid="order-status"]',
      'span[class*="status"]',
      'div[class*="status"]',
      '.status'
    ];

    for (const selector of orderStatusSelectors) {
      try {
        if (await page.locator(selector).first().isVisible({ timeout: 1000 })) {
          const statusText = await page.locator(selector).first().textContent();
          addLog(`✓ Found order status: ${selector} - "${statusText}"`);
          selectors.myOrder.orderStatus = selector;
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Find filter date button
    const filterDateSelectors = [
      'button:has-text("Filter Date")',
      'button:has-text("Filter")',
      '[data-testid="filter-date"]',
      'button[class*="filter"]'
    ];

    for (const selector of filterDateSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          addLog(`✓ Found filter date button: ${selector}`);
          selectors.myOrder.filterDateButton = selector;
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Find search input
    const searchInputSelectors = [
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[type="search"]',
      'input[class*="search"]'
    ];

    for (const selector of searchInputSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          addLog(`✓ Found search input: ${selector}`);
          selectors.myOrder.searchInput = selector;
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Find Request e-invoice button
    const requestInvoiceSelectors = [
      'button:has-text("Request e-invoice")',
      'button:has-text("Request Invoice")',
      'button:has-text("E-Invoice")',
      'button[class*="invoice"]'
    ];

    for (const selector of requestInvoiceSelectors) {
      try {
        if (await page.locator(selector).isVisible({ timeout: 1000 })) {
          addLog(`✓ Found request e-invoice button: ${selector}`);
          selectors.myOrder.requestInvoiceButton = selector;
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Click on first order to see detail
    if (selectors.myOrder.orderCard) {
      addLog('\n=== Exploring Order Detail Page ===');
      try {
        await page.locator(selectors.myOrder.orderCard).first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './screenshots/my-order-05-order-detail.png', fullPage: true });
        addLog(`Current URL: ${page.url()}`);

        // Find order number
        const orderNumberSelectors = [
          '[data-testid="order-number"]',
          '.order-number',
          'span[class*="order-number"]',
          'div[class*="order-number"]',
          'text=/Order.*#/'
        ];

        for (const selector of orderNumberSelectors) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              const orderNo = await page.locator(selector).textContent();
              addLog(`✓ Found order number: ${selector} - "${orderNo}"`);
              selectors.orderDetail.orderNumber = selector;
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        // Find booking number
        const bookingNumberSelectors = [
          '[data-testid="booking-number"]',
          '.booking-number',
          'span[class*="booking"]',
          'div[class*="booking"]',
          'text=/Booking/'
        ];

        for (const selector of bookingNumberSelectors) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              const bookingNo = await page.locator(selector).textContent();
              addLog(`✓ Found booking number: ${selector} - "${bookingNo}"`);
              selectors.orderDetail.bookingNumber = selector;
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        // Find timestamp
        const timestampSelectors = [
          '[data-testid="order-timestamp"]',
          '.order-timestamp',
          '.timestamp',
          'span[class*="time"]',
          'span[class*="date"]'
        ];

        for (const selector of timestampSelectors) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              const timestamp = await page.locator(selector).textContent();
              addLog(`✓ Found timestamp: ${selector} - "${timestamp}"`);
              selectors.orderDetail.timestamp = selector;
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        // Find View Receipt button
        const viewReceiptSelectors = [
          'button:has-text("View Receipt")',
          'button:has-text("View E-Receipt")',
          'button:has-text("Receipt")',
          'button[class*="receipt"]'
        ];

        for (const selector of viewReceiptSelectors) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              addLog(`✓ Found view receipt button: ${selector}`);
              selectors.orderDetail.viewReceiptButton = selector;
              break;
            }
          } catch (e) {
            // Continue
          }
        }

        // Find Download Report button
        const downloadReportSelectors = [
          'button:has-text("Download Report")',
          'button:has-text("Download")',
          'button[class*="download"]'
        ];

        for (const selector of downloadReportSelectors) {
          try {
            if (await page.locator(selector).isVisible({ timeout: 1000 })) {
              addLog(`✓ Found download report button: ${selector}`);
              selectors.orderDetail.downloadReportButton = selector;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      } catch (e) {
        addLog(`⚠ Could not click order: ${e}`);
      }
    } else {
      addLog('⚠ No orders found to explore detail page');
    }

    // Explore Inventory Page
    addLog('\n=== Exploring Inventory Page ===');
    await page.goto(`${BASE_URL}inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/my-order-06-inventory.png', fullPage: true });

    // Find voucher items in inventory
    const voucherItemSelectors = [
      '.voucher-item',
      '[data-testid="voucher-item"]',
      '.inventory-item',
      'div[class*="voucher"]',
      'div[class*="inventory"]'
    ];

    for (const selector of voucherItemSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        addLog(`✓ Found ${count} voucher items with selector: ${selector}`);
        selectors.inventory.voucherItem = selector;
        break;
      }
    }

    // Save selectors to JSON file
    const selectorsJson = JSON.stringify(selectors, null, 2);
    fs.writeFileSync('./my-order-selectors.json', selectorsJson);
    addLog('\n✓ Selectors saved to my-order-selectors.json');

    // Save log to file
    fs.writeFileSync('./my-order-exploration-log.txt', log.join('\n'));
    addLog('✓ Log saved to my-order-exploration-log.txt');

    addLog('\n=== Exploration Complete ===');
    addLog('\nFound Selectors:');
    addLog(selectorsJson);

  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
    await page.screenshot({ path: './screenshots/my-order-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreMyOrderFlow();
