import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreMyOrderFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

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

    const BASE_URL = 'https://corporate-voucher-stg.fam-stg.click/';
    const LOGIN_URL = 'https://corporate-voucher-stg.fam-stg.click/login';
    const EMAIL = 'lindaamalia@axrail.com';
    const PASSWORD = 'Rahasia567_';

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

    addLog('\n=== Exploring Buy Vouchers Page ===');
    await page.goto(`${BASE_URL}buy-vouchers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: './screenshots/my-order-01-buy-vouchers.png', fullPage: true });

    // Find voucher cards
    const voucherSelectors = [
      '.voucher-card',
      '[data-testid="voucher-card"]',
      '.product-card',
      '.card',
      'div[class*="voucher"]',
      'div[class*="product"]',
      'div[class*="card"]',
      'a[href*="voucher"]',
      'div[role="button"]'
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
        } catch (e) {
          addLog(`⚠ Could not click voucher: ${e}`);
        }
        break;
      }
    }

      // Find Buy Now button
      const buyNowSelectors = [
        'button:has-text("Buy Now")',
        'button:has-text("Add to Cart")',
        'button:has-text("BUY NOW")',
        'button[class*="buy"]',
        'button[class*="add-cart"]',
        '.btn-buy',
        '.btn-add-cart',
        'button[type="submit"]'
      ];

      for (const selector of buyNowSelectors) {
        try {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            addLog(`✓ Found Buy Now button: ${selector}`);
            selectors.buyVouchers.buyNowButton = selector;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    addLog('\n=== Exploring Checkout Page ===');
    if (selectors.buyVouchers.buyNowButton) {
      try {
        await page.locator(selectors.buyVouchers.buyNowButton).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './screenshots/my-order-03-checkout.png', fullPage: true });

        addLog(`Current URL: ${page.url()}`);
      } catch (e) {
        addLog(`⚠ Could not navigate to checkout: ${e}`);
      }
    } else {
      addLog('⚠ Skipping checkout - Buy Now button not found');
      // Try to navigate directly to checkout
      try {
        await page.goto(`${BASE_URL}checkout`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './screenshots/my-order-03-checkout.png', fullPage: true });
      } catch (e) {
        addLog(`⚠ Could not navigate to checkout page: ${e}`);
      }
    }

      // Find selected voucher in checkout
      const selectedVoucherSelectors = [
        '.selected-voucher',
        '.checkout-item',
        '.cart-item',
        '[data-testid="checkout-item"]',
        'div[class*="selected"]',
        'div[class*="checkout"]'
      ];

      for (const selector of selectedVoucherSelectors) {
        if (await page.locator(selector).isVisible()) {
          addLog(`✓ Found selected voucher: ${selector}`);
          selectors.checkout.selectedVoucher = selector;
          break;
        }
      }

      // Find Proceed to Payment button
      const proceedPaymentSelectors = [
        'button:has-text("Proceed to Payment")',
        'button:has-text("Pay Now")',
        'button:has-text("Checkout")',
        'button[class*="proceed"]',
        'button[class*="payment"]',
        '.btn-proceed',
        '.btn-payment'
      ];

      for (const selector of proceedPaymentSelectors) {
        if (await page.locator(selector).isVisible()) {
          addLog(`✓ Found Proceed to Payment button: ${selector}`);
          selectors.checkout.proceedPaymentButton = selector;
          break;
        }
      }
    }

    addLog('\n=== Exploring My Order Page ===');
    await page.goto(`${BASE_URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshots/my-order-04-my-orders.png', fullPage: true });

    addLog(`Current URL: ${page.url()}`);

    // Find order cards
    const orderCardSelectors = [
      '.order-card',
      '[data-testid="order-card"]',
      '.order-item',
      'div[class*="order"]',
      '.card'
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
      '.status',
      'span[class*="status"]',
      'div[class*="status"]'
    ];

    for (const selector of orderStatusSelectors) {
      if (await page.locator(selector).first().isVisible()) {
        const statusText = await page.locator(selector).first().textContent();
        addLog(`✓ Found order status: ${selector} - "${statusText}"`);
        selectors.myOrder.orderStatus = selector;
        break;
      }
    }

    // Find filter date button
    const filterDateSelectors = [
      'button:has-text("Filter Date")',
      'button:has-text("Filter")',
      '[data-testid="filter-date"]',
      'button[class*="filter"]',
      '.btn-filter'
    ];

    for (const selector of filterDateSelectors) {
      if (await page.locator(selector).isVisible()) {
        addLog(`✓ Found filter date button: ${selector}`);
        selectors.myOrder.filterDateButton = selector;
        break;
      }
    }

    // Find search input
    const searchInputSelectors = [
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[type="search"]',
      'input[class*="search"]',
      '[data-testid="search-input"]'
    ];

    for (const selector of searchInputSelectors) {
      if (await page.locator(selector).isVisible()) {
        addLog(`✓ Found search input: ${selector}`);
        selectors.myOrder.searchInput = selector;
        break;
      }
    }

    // Find Request e-invoice button
    const requestInvoiceSelectors = [
      'button:has-text("Request e-invoice")',
      'button:has-text("Request Invoice")',
      'button:has-text("E-Invoice")',
      '[data-testid="request-invoice"]',
      'button[class*="invoice"]'
    ];

    for (const selector of requestInvoiceSelectors) {
      if (await page.locator(selector).isVisible()) {
        addLog(`✓ Found request e-invoice button: ${selector}`);
        selectors.myOrder.requestInvoiceButton = selector;
        break;
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
      } catch (e) {
        addLog(`⚠ Could not click order: ${e}`);
      }
    } else {
      addLog('⚠ No orders found to explore detail page');
    }

      // Find order number
      const orderNumberSelectors = [
        '[data-testid="order-number"]',
        '.order-number',
        'span[class*="order-number"]',
        'div[class*="order-number"]'
      ];

      for (const selector of orderNumberSelectors) {
        if (await page.locator(selector).isVisible()) {
          const orderNo = await page.locator(selector).textContent();
          addLog(`✓ Found order number: ${selector} - "${orderNo}"`);
          selectors.orderDetail.orderNumber = selector;
          break;
        }
      }

      // Find booking number
      const bookingNumberSelectors = [
        '[data-testid="booking-number"]',
        '.booking-number',
        'span[class*="booking"]',
        'div[class*="booking"]',
        'text=Booking Number'
      ];

      for (const selector of bookingNumberSelectors) {
        if (await page.locator(selector).isVisible()) {
          const bookingNo = await page.locator(selector).textContent();
          addLog(`✓ Found booking number: ${selector} - "${bookingNo}"`);
          selectors.orderDetail.bookingNumber = selector;
          break;
        }
      }

      // Find timestamp
      const timestampSelectors = [
        '[data-testid="order-timestamp"]',
        '.order-timestamp',
        '.timestamp',
        'span[class*="time"]',
        'div[class*="date"]'
      ];

      for (const selector of timestampSelectors) {
        if (await page.locator(selector).isVisible()) {
          const timestamp = await page.locator(selector).textContent();
          addLog(`✓ Found timestamp: ${selector} - "${timestamp}"`);
          selectors.orderDetail.timestamp = selector;
          break;
        }
      }

      // Find View Receipt button
      const viewReceiptSelectors = [
        'button:has-text("View Receipt")',
        'button:has-text("View E-Receipt")',
        'button:has-text("Receipt")',
        '[data-testid="view-receipt"]',
        'button[class*="receipt"]'
      ];

      for (const selector of viewReceiptSelectors) {
        if (await page.locator(selector).isVisible()) {
          addLog(`✓ Found view receipt button: ${selector}`);
          selectors.orderDetail.viewReceiptButton = selector;
          break;
        }
      }

      // Find Download Report button
      const downloadReportSelectors = [
        'button:has-text("Download Report")',
        'button:has-text("Download")',
        '[data-testid="download-report"]',
        'button[class*="download"]'
      ];

      for (const selector of downloadReportSelectors) {
        if (await page.locator(selector).isVisible()) {
          addLog(`✓ Found download report button: ${selector}`);
          selectors.orderDetail.downloadReportButton = selector;
          break;
        }
      }
    }

    addLog('\n=== Exploring Inventory Page ===');
    await page.goto(`${BASE_URL}inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/my-order-06-inventory.png', fullPage: true });

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
    await page.screenshot({ path: 'playwright-tests/screenshots/my-order-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreMyOrderFlow();
