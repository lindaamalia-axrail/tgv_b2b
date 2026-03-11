import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

const URL = 'https://corporate-voucher-stg.fam-stg.click/';
const LOGIN_URL = 'https://corporate-voucher-stg.fam-stg.click/login';
const EXISTING_USER = {
  email: 'lindaamalia@axrail.com',
  password: 'Rahasia567_'
};

interface SelectorInfo {
  testCase: string;
  step: string;
  selector: string;
  actualSelector: string;
  elementType: string;
  text?: string;
  attributes?: Record<string, string>;
}

const selectors: SelectorInfo[] = [];

async function captureElement(page: Page, testCase: string, step: string, description: string, locator: any) {
  try {
    const element = await locator.first();
    if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
      const tagName = await element.evaluate((el: Element) => el.tagName.toLowerCase());
      const text = await element.textContent().catch(() => '');
      const attributes: Record<string, string> = {};
      
      // Get common attributes
      const attrNames = ['id', 'class', 'name', 'type', 'placeholder', 'href', 'role', 'aria-label'];
      for (const attr of attrNames) {
        const value = await element.getAttribute(attr);
        if (value) attributes[attr] = value;
      }

      selectors.push({
        testCase,
        step,
        selector: description,
        actualSelector: await getActualSelector(element),
        elementType: tagName,
        text: text?.trim().substring(0, 100),
        attributes
      });

      console.log(`✓ ${testCase} - ${step}: ${description}`);
      return true;
    }
  } catch (error) {
    console.log(`✗ ${testCase} - ${step}: ${description} - ${error}`);
  }
  return false;
}

async function getActualSelector(element: any): Promise<string> {
  try {
    const id = await element.getAttribute('id');
    if (id) return `#${id}`;

    const className = await element.getAttribute('class');
    const tagName = await element.evaluate((el: Element) => el.tagName.toLowerCase());
    
    if (className) {
      const classes = className.split(' ').filter((c: string) => c && !c.includes('hover') && !c.includes('focus'));
      if (classes.length > 0) {
        return `${tagName}.${classes[0]}`;
      }
    }

    const name = await element.getAttribute('name');
    if (name) return `${tagName}[name="${name}"]`;

    const type = await element.getAttribute('type');
    if (type) return `${tagName}[type="${type}"]`;

    return tagName;
  } catch {
    return 'unknown';
  }
}

async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = `playwright-tests/screenshots/send-vouchers/${name}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
}

async function login(page: Page) {
  console.log('\n=== LOGIN ===');
  await page.goto(LOGIN_URL);
  await page.waitForLoadState('networkidle');
  
  // Capture login form elements
  await captureElement(page, 'LOGIN', 'email_input', 'Email input field', page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]'));
  await captureElement(page, 'LOGIN', 'password_input', 'Password input field', page.locator('input[type="password"]'));
  await captureElement(page, 'LOGIN', 'login_button', 'Login button', page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]'));
  
  // Perform login
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();
  const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').first();
  
  await emailInput.fill(EXISTING_USER.email);
  await passwordInput.fill(EXISTING_USER.password);
  await loginButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('✓ Login successful');
}

async function exploreSendVoucherCreate(page: Page) {
  console.log('\n=== TC_SEND_004 to TC_SEND_007: Send Voucher Create Page ===');
  await page.goto(`${URL}send-voucher/create`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await takeScreenshot(page, '01-send-voucher-create-page');
  
  // Step 1: Capture main page elements
  await captureElement(page, 'TC_SEND_004', 'select_voucher_button', 'Select Voucher button', page.locator('button:has-text("Select Voucher")'));
  await captureElement(page, 'TC_SEND_004', 'total_recipients_label', 'Total Number of Recipient label', page.locator('label:has-text("Total Number of Recipient"), text="Total Number of Recipient"'));
  await captureElement(page, 'TC_SEND_004', 'total_recipients_input', 'Total Number of Recipient input', page.locator('input[type="number"]').first());
  await captureElement(page, 'TC_SEND_005', 'next_button_disabled', 'Next button (initially disabled)', page.locator('button:has-text("Next")'));
  
  // Step 2: Click Select Voucher button
  const selectVoucherBtn = page.locator('button:has-text("Select Voucher")').first();
  if (await selectVoucherBtn.isVisible()) {
    await selectVoucherBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, '02-select-voucher-modal');
    
    // Capture modal elements
    await captureElement(page, 'TC_SEND_004', 'voucher_modal', 'Voucher selection modal', page.locator('[role="dialog"], .modal, [class*="modal"]'));
    await captureElement(page, 'TC_SEND_004', 'voucher_checkbox', 'Voucher checkbox in modal', page.locator('[role="dialog"] input[type="checkbox"], .modal input[type="checkbox"]'));
    await captureElement(page, 'TC_SEND_004', 'modal_select_button', 'Select button in modal', page.locator('[role="dialog"] button:has-text("Select"), .modal button:has-text("Select")'));
    
    // Select a voucher
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const checkboxes = modal.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      await checkboxes.first().click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '03-voucher-selected');
      
      // Click Select button
      const selectBtn = modal.locator('button:has-text("Select")').first();
      await selectBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '04-after-voucher-selected');
    }
  }
  
  // Step 3: Capture "Each recipient will get" field
  await captureElement(page, 'TC_SEND_006', 'each_recipient_label', 'Each recipient will get label', page.locator('label:has-text("Each recipient"), text*="Each recipient"'));
  await captureElement(page, 'TC_SEND_006', 'each_recipient_input', 'Each recipient will get input', page.locator('input[type="number"]').nth(1));
  
  // Step 4: Fill in recipient count
  const totalRecipientsInput = page.locator('input[type="number"]').first();
  await totalRecipientsInput.fill('2');
  await page.waitForTimeout(1000);
  await takeScreenshot(page, '05-recipients-filled');
  
  // Step 5: Check Next button state
  await captureElement(page, 'TC_SEND_005', 'next_button_enabled', 'Next button (enabled)', page.locator('button:has-text("Next")'));
  
  // Step 6: Test insufficient balance
  await totalRecipientsInput.fill('1000');
  await page.waitForTimeout(1000);
  
  const eachRecipientInput = page.locator('input[type="number"]').nth(1);
  if (await eachRecipientInput.isVisible()) {
    await eachRecipientInput.fill('100');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, '06-insufficient-balance-error');
    
    await captureElement(page, 'TC_SEND_006', 'insufficient_balance_error', 'Insufficient balance error message', page.locator('text=/insufficient|not enough|exceed|more than.*owned/i, [class*="error"], .error-message'));
  }
  
  // Reset to valid values
  await totalRecipientsInput.fill('2');
  await page.waitForTimeout(500);
}

async function exploreSendVoucherStep2(page: Page) {
  console.log('\n=== TC_SEND_008 to TC_SEND_018: Send Voucher Step 2 (Upload CSV) ===');
  
  // Navigate to create page
  await page.goto(`${URL}send-voucher/create`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  // Complete Step 1
  const selectVoucherBtn = page.locator('button:has-text("Select Voucher")').first();
  if (await selectVoucherBtn.isVisible()) {
    await selectVoucherBtn.click();
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await page.waitForTimeout(500);
      await modal.locator('button:has-text("Select")').first().click();
      await page.waitForTimeout(1000);
    }
  }
  
  const totalRecipientsInput = page.locator('input[type="number"]').first();
  await totalRecipientsInput.fill('2');
  await page.waitForTimeout(500);
  
  // Click Next
  const nextButton = page.locator('button:has-text("Next")').first();
  if (await nextButton.isEnabled()) {
    await nextButton.click();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '07-step2-upload-csv');
    
    // Capture Step 2 elements
    await captureElement(page, 'TC_SEND_008', 'download_csv_template', 'Download CSV template link/button', page.locator('a:has-text("Download"), button:has-text("Download"), a:has-text("template"), button:has-text("template")'));
    await captureElement(page, 'TC_SEND_010', 'instructions', 'Instructions text', page.locator('text=/instruction|step|how to/i, [class*="instruction"]'));
    await captureElement(page, 'TC_SEND_011', 'file_input', 'CSV file upload input', page.locator('input[type="file"]'));
    await captureElement(page, 'TC_SEND_012', 'upload_result_summary', 'Upload Result Summary section', page.locator('text=/upload.*result|result.*summary/i, [class*="upload-result"], [class*="summary"]'));
    await captureElement(page, 'TC_SEND_013', 'invalid_phone_count', 'Invalid phone number count', page.locator('text=/invalid.*phone|phone.*invalid/i'));
    await captureElement(page, 'TC_SEND_013', 'invalid_email_count', 'Invalid email count', page.locator('text=/invalid.*email|email.*invalid/i'));
    await captureElement(page, 'TC_SEND_016', 'upload_again_button', 'Upload Again button', page.locator('button:has-text("Upload Again"), button:has-text("Re-upload")'));
    await captureElement(page, 'TC_SEND_017', 'file_input_accept', 'File input accept attribute', page.locator('input[type="file"]'));
    await captureElement(page, 'TC_SEND_039', 'download_make_adjustments', 'Download and Make Adjustments button', page.locator('button:has-text("Download"), button:has-text("Make Adjustment"), button:has-text("Adjustment")'));
    
    // Check file input accept attribute
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      const acceptAttr = await fileInput.getAttribute('accept');
      console.log(`File input accept attribute: ${acceptAttr}`);
    }
  }
}

async function exploreSendVoucherList(page: Page) {
  console.log('\n=== TC_SEND_002, TC_SEND_019, TC_SEND_043: Send Voucher List Page ===');
  await page.goto(`${URL}send-voucher`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await takeScreenshot(page, '08-send-voucher-list');
  
  // Capture list page elements
  await captureElement(page, 'TC_SEND_002', 'send_voucher_page_title', 'Send Voucher page title', page.locator('h1, h2, [class*="title"], text=/send voucher/i').first());
  await captureElement(page, 'TC_SEND_043', 'voucher_batch_list', 'Voucher batch list/table', page.locator('table, [class*="table"], [class*="list"], [role="table"]'));
  await captureElement(page, 'TC_SEND_043', 'batch_status', 'Batch status column/field', page.locator('text=/status/i, [class*="status"]'));
  await captureElement(page, 'TC_SEND_019', 'system_error_remark', 'System Error remark', page.locator('text=/system error|contact.*help desk/i'));
  await captureElement(page, 'TC_SEND_019', 'help_desk_link', 'TGV Help Desk link', page.locator('a[href*="help.tgv.com.my"]'));
  await captureElement(page, 'TC_SEND_020', 'not_registered_status', 'Mobile Number Not Registered status', page.locator('text=/not registered|mobile.*not registered/i'));
  
  // Look for create button
  await captureElement(page, 'TC_SEND_002', 'create_send_voucher_button', 'Create/New Send Voucher button', page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Send Voucher"), a:has-text("Create")'));
}

async function exploreMyOrdersAccess(page: Page) {
  console.log('\n=== TC_SEND_002, TC_SEND_003: My Orders Access ===');
  await page.goto(`${URL}my-orders`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await takeScreenshot(page, '09-my-orders-page');
  
  // Capture My Orders elements
  await captureElement(page, 'TC_SEND_003', 'search_input', 'Search by Booking/Order Number input', page.locator('input[placeholder*="Search"], input[placeholder*="Booking"], input[placeholder*="Order"]'));
  await captureElement(page, 'TC_SEND_002', 'send_voucher_from_order', 'Send Voucher button from My Order', page.locator('button:has-text("Send Voucher")'));
  await captureElement(page, 'TC_SEND_003', 'order_list', 'Order list/items', page.locator('[class*="order"], [class*="voucher"], table, [role="table"]'));
}

async function exploreInventoryAccess(page: Page) {
  console.log('\n=== TC_SEND_002: Inventory Access ===');
  await page.goto(`${URL}inventory`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await takeScreenshot(page, '10-inventory-page');
  
  // Capture Inventory elements
  await captureElement(page, 'TC_SEND_002', 'inventory_page_title', 'Inventory page title', page.locator('h1, h2, [class*="title"]').first());
  await captureElement(page, 'TC_SEND_002', 'send_voucher_from_inventory', 'Send Voucher button from Inventory', page.locator('button:has-text("Send Voucher")'));
  await captureElement(page, 'TC_SEND_002', 'voucher_items', 'Voucher items in inventory', page.locator('[class*="voucher"], [class*="item"], table, [role="table"]'));
}

async function exploreBuyVoucherAccess(page: Page) {
  console.log('\n=== TC_SEND_001: Buy Voucher Flow ===');
  await page.goto(`${URL}buy`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await takeScreenshot(page, '11-buy-voucher-page');
  
  // Capture Buy Voucher elements
  await captureElement(page, 'TC_SEND_001', 'voucher_product_link', 'Voucher product link', page.locator('a[href*="/products/"]'));
  
  // Click first voucher
  const firstVoucher = page.locator('a[href*="/products/"]').first();
  if (await firstVoucher.isVisible()) {
    await firstVoucher.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, '12-voucher-detail-page');
    
    await captureElement(page, 'TC_SEND_001', 'buy_now_button', 'Buy Now button', page.locator('button:has-text("Buy Now")'));
    
    // Click Buy Now
    const buyNowBtn = page.locator('button:has-text("Buy Now")').first();
    if (await buyNowBtn.isVisible()) {
      await buyNowBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await takeScreenshot(page, '13-checkout-page');
      
      await captureElement(page, 'TC_SEND_001', 'proceed_to_payment_button', 'Proceed to Payment button', page.locator('button:has-text("Proceed to Payment")'));
    }
  }
}

async function main() {
  console.log('Starting Send Vouchers exploration...\n');
  
  // Create screenshots directory
  if (!fs.existsSync('playwright-tests/screenshots/send-vouchers')) {
    fs.mkdirSync('playwright-tests/screenshots/send-vouchers', { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Login first
    await login(page);
    
    // Explore different sections
    await exploreSendVoucherCreate(page);
    await exploreSendVoucherStep2(page);
    await exploreSendVoucherList(page);
    await exploreMyOrdersAccess(page);
    await exploreInventoryAccess(page);
    await exploreBuyVoucherAccess(page);
    
    // Save selectors to JSON
    const outputPath = 'playwright-tests/send-vouchers-actual-selectors.json';
    fs.writeFileSync(outputPath, JSON.stringify(selectors, null, 2));
    console.log(`\n✓ Selectors saved to ${outputPath}`);
    
    // Generate summary report
    const summary = generateSummary();
    const summaryPath = 'playwright-tests/send-vouchers-exploration-summary.txt';
    fs.writeFileSync(summaryPath, summary);
    console.log(`✓ Summary saved to ${summaryPath}`);
    
  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await browser.close();
  }
}

function generateSummary(): string {
  let summary = '=== SEND VOUCHERS EXPLORATION SUMMARY ===\n\n';
  summary += `Total selectors captured: ${selectors.length}\n\n`;
  
  const byTestCase = selectors.reduce((acc, sel) => {
    if (!acc[sel.testCase]) acc[sel.testCase] = [];
    acc[sel.testCase].push(sel);
    return acc;
  }, {} as Record<string, SelectorInfo[]>);
  
  for (const [testCase, sels] of Object.entries(byTestCase)) {
    summary += `\n${testCase} (${sels.length} selectors):\n`;
    for (const sel of sels) {
      summary += `  - ${sel.step}: ${sel.selector}\n`;
      summary += `    Selector: ${sel.actualSelector}\n`;
      summary += `    Type: ${sel.elementType}\n`;
      if (sel.text) summary += `    Text: ${sel.text}\n`;
      if (sel.attributes && Object.keys(sel.attributes).length > 0) {
        summary += `    Attributes: ${JSON.stringify(sel.attributes)}\n`;
      }
      summary += '\n';
    }
  }
  
  return summary;
}

main();
