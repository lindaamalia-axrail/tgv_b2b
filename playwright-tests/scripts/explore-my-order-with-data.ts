import { chromium } from '@playwright/test';
import * as fs from 'fs';

const URL = 'https://corporate-voucher-stg.fam-stg.click/';
const LOGIN_URL = 'https://corporate-voucher-stg.fam-stg.click/login';
const EXISTING_USER = {
  email: 'lindaamalia@axrail.com',
  password: 'Rahasia567_'
};

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
    // Login
    addLog('=== LOGGING IN ===');
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    // Find and fill email
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(EXISTING_USER.email);
    selectors.login = { emailInput: await emailInput.evaluate(el => el.getAttribute('placeholder') || el.getAttribute('name')) };
    
    // Find and fill password
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill(EXISTING_USER.password);
    
    // Find and click login button
    const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    addLog('✓ Logged in successfully');

    // Navigate to Buy Vouchers page
    addLog('\n=== EXPLORING BUY VOUCHERS PAGE ===');
    await page.goto(`${URL}buy`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Save Buy Vouchers page HTML
    const buyPageHTML = await page.content();
    fs.writeFileSync('playwright-tests/buy-vouchers-page.html', buyPageHTML);
    addLog('✓ Saved buy-vouchers-page.html');
    
    // Find voucher cards
    const voucherCards = await page.locator('div[class*="card"], div[class*="voucher"], article, .product-card').all();
    addLog(`Found ${voucherCards.length} potential voucher cards`);
    
    if (voucherCards.length > 0) {
      const firstCard = voucherCards[0];
      const cardClasses = await firstCard.getAttribute('class');
      selectors.buyVouchers.voucherCard = cardClasses ? `.${cardClasses.split(' ')[0]}` : 'div[class*="card"]';
      addLog(`Voucher card selector: ${selectors.buyVouchers.voucherCard}`);
      
      // Find Buy Now button
      const buyNowButton = await firstCard.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Add")').first();
      if (await buyNowButton.isVisible()) {
        const buttonText = await buyNowButton.textContent();
        selectors.buyVouchers.buyNowButton = `button:has-text("${buttonText?.trim()}")`;
        addLog(`Buy Now button: ${selectors.buyVouchers.buyNowButton}`);
        
        // Click Buy Now
        await buyNowButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        addLog('✓ Clicked Buy Now button');
      }
    }
    
    // Check if we're on checkout page
    addLog('\n=== EXPLORING CHECKOUT PAGE ===');
    const currentURL = page.url();
    addLog(`Current URL: ${currentURL}`);
    
    if (currentURL.includes('checkout') || currentURL.includes('cart')) {
      const checkoutHTML = await page.content();
      fs.writeFileSync('playwright-tests/checkout-page.html', checkoutHTML);
      addLog('✓ Saved checkout-page.html');
      
      // Find selected voucher
      const selectedVoucher = await page.locator('div[class*="selected"], div[class*="item"], div[class*="product"]').first();
      if (await selectedVoucher.isVisible()) {
        const voucherClasses = await selectedVoucher.getAttribute('class');
        selectors.checkout.selectedVoucher = voucherClasses ? `.${voucherClasses.split(' ')[0]}` : 'div[class*="selected"]';
        addLog(`Selected voucher: ${selectors.checkout.selectedVoucher}`);
      }
      
      // Find Proceed to Payment button
      const proceedButton = await page.locator('button:has-text("Proceed"), button:has-text("Payment"), button:has-text("Checkout")').first();
      if (await proceedButton.isVisible()) {
        const buttonText = await proceedButton.textContent();
        selectors.checkout.proceedToPaymentButton = `button:has-text("${buttonText?.trim()}")`;
        addLog(`Proceed button: ${selectors.checkout.proceedToPaymentButton}`);
      }
    }
    
    // Navigate to My Order page
    addLog('\n=== EXPLORING MY ORDER PAGE ===');
    await page.goto(`${URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const myOrderHTML = await page.content();
    fs.writeFileSync('playwright-tests/my-orders-page-updated.html', myOrderHTML);
    addLog('✓ Saved my-orders-page-updated.html');
    
    // Find search input
    const searchInput = await page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      const placeholder = await searchInput.getAttribute('placeholder');
      selectors.myOrder.searchInput = `input[placeholder="${placeholder}"]`;
      addLog(`Search input: ${selectors.myOrder.searchInput}`);
    }
    
    // Find Filter Date button
    const filterButton = await page.locator('button:has-text("Filter"), button:has-text("Date")').first();
    if (await filterButton.isVisible()) {
      const buttonText = await filterButton.textContent();
      selectors.myOrder.filterDateButton = `button:has-text("${buttonText?.trim()}")`;
      addLog(`Filter button: ${selectors.myOrder.filterDateButton}`);
    }
    
    // Find Request e-Invoice button
    const invoiceButton = await page.locator('button:has-text("Invoice"), button:has-text("e-invoice")').first();
    if (await invoiceButton.isVisible()) {
      const buttonText = await invoiceButton.textContent();
      selectors.myOrder.requestInvoiceButton = `button:has-text("${buttonText?.trim()}")`;
      addLog(`Invoice button: ${selectors.myOrder.requestInvoiceButton}`);
    }
    
    // Find tabs
    const tabs = await page.locator('button[role="tab"]').all();
    addLog(`Found ${tabs.length} tabs`);
    if (tabs.length > 0) {
      const tabTexts = await Promise.all(tabs.map(tab => tab.textContent()));
      selectors.myOrder.tabs = tabTexts.map(text => `button[role="tab"]:has-text("${text?.trim()}")`);
      addLog(`Tabs: ${tabTexts.join(', ')}`);
    }
    
    // Find order cards
    const orderCards = await page.locator('div[class*="order"], div[class*="card"], article').all();
    addLog(`Found ${orderCards.length} potential order cards`);
    
    if (orderCards.length > 0) {
      const firstOrderCard = orderCards[0];
      const cardClasses = await firstOrderCard.getAttribute('class');
      selectors.myOrder.orderCard = cardClasses ? `.${cardClasses.split(' ')[0]}` : 'div[class*="order"]';
      addLog(`Order card selector: ${selectors.myOrder.orderCard}`);
      
      // Try to click the first order card
      try {
        await firstOrderCard.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        addLog('\n=== EXPLORING ORDER DETAIL PAGE ===');
        const orderDetailHTML = await page.content();
        fs.writeFileSync('playwright-tests/order-detail-page-updated.html', orderDetailHTML);
        addLog('✓ Saved order-detail-page-updated.html');
        
        // Find order number
        const orderNumber = await page.locator('text=/Order.*#/, text=/TGV/, [data-testid="order-number"]').first();
        if (await orderNumber.isVisible()) {
          const orderText = await orderNumber.textContent();
          addLog(`Order number found: ${orderText}`);
          selectors.orderDetail.orderNumber = 'text=/Order.*#/';
        }
        
        // Find booking number
        const bookingNumber = await page.locator('text=/Booking/, text=/BK/, [data-testid="booking-number"]').first();
        if (await bookingNumber.isVisible()) {
          const bookingText = await bookingNumber.textContent();
          addLog(`Booking number found: ${bookingText}`);
          selectors.orderDetail.bookingNumber = 'text=/Booking/';
        }
        
        // Find order status
        const orderStatus = await page.locator('text=/Status/, text=/Processing/, text=/Confirmed/, text=/Completed/').first();
        if (await orderStatus.isVisible()) {
          const statusText = await orderStatus.textContent();
          addLog(`Order status found: ${statusText}`);
          selectors.orderDetail.orderStatus = 'text=/Status/';
        }
        
        // Find View Receipt button
        const receiptButton = await page.locator('button:has-text("Receipt"), button:has-text("View Receipt")').first();
        if (await receiptButton.isVisible()) {
          const buttonText = await receiptButton.textContent();
          selectors.orderDetail.viewReceiptButton = `button:has-text("${buttonText?.trim()}")`;
          addLog(`Receipt button: ${selectors.orderDetail.viewReceiptButton}`);
        }
        
        // Find Download Report button
        const reportButton = await page.locator('button:has-text("Report"), button:has-text("Download")').first();
        if (await reportButton.isVisible()) {
          const buttonText = await reportButton.textContent();
          selectors.orderDetail.downloadReportButton = `button:has-text("${buttonText?.trim()}")`;
          addLog(`Report button: ${selectors.orderDetail.downloadReportButton}`);
        }
        
        // Find timestamp
        const timestamp = await page.locator('[data-testid="order-timestamp"], text=/\\d{2}:\\d{2}/, text=/\\d{4}-\\d{2}-\\d{2}/').first();
        if (await timestamp.isVisible()) {
          const timeText = await timestamp.textContent();
          addLog(`Timestamp found: ${timeText}`);
          selectors.orderDetail.timestamp = '[data-testid="order-timestamp"]';
        }
      } catch (error) {
        addLog(`Could not click order card: ${error}`);
      }
    } else {
      addLog('No order cards found - account may not have order history');
    }
    
    // Navigate to Inventory page
    addLog('\n=== EXPLORING INVENTORY PAGE ===');
    await page.goto(`${URL}inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const inventoryHTML = await page.content();
    fs.writeFileSync('playwright-tests/inventory-page.html', inventoryHTML);
    addLog('✓ Saved inventory-page.html');
    
    // Find voucher items in inventory
    const voucherItems = await page.locator('div[class*="voucher"], div[class*="item"], div[class*="card"]').all();
    addLog(`Found ${voucherItems.length} potential voucher items in inventory`);
    
    if (voucherItems.length > 0) {
      const firstItem = voucherItems[0];
      const itemClasses = await firstItem.getAttribute('class');
      selectors.inventory.voucherItem = itemClasses ? `.${itemClasses.split(' ')[0]}` : 'div[class*="voucher"]';
      addLog(`Voucher item selector: ${selectors.inventory.voucherItem}`);
    }
    
    // Save selectors to JSON
    fs.writeFileSync('playwright-tests/my-order-selectors-complete.json', JSON.stringify(selectors, null, 2));
    addLog('\n✓ Saved my-order-selectors-complete.json');
    
    // Save log
    fs.writeFileSync('playwright-tests/my-order-exploration-complete.txt', log.join('\n'));
    addLog('✓ Saved my-order-exploration-complete.txt');
    
  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
  } finally {
    await browser.close();
  }
}

exploreMyOrderFlow();
