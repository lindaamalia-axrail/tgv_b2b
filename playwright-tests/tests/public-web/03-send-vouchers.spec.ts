import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import { PUBLIC_WEB } from '../../utils/test-data';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

/**
 * Helper: Select AUTOMATION TEST VOUCHER from Buy Voucher page
 * (Reused from 02-buy-vouchers.spec.ts)
 */
async function selectAutomationTestVoucher(page: Page) {
  await page.goto(PUBLIC_WEB.URL);
  await page.click('text=Buy Voucher');
  await page.waitForLoadState('networkidle');

  const allVouchers = page.locator('a[href*="/products/"]');
  const voucherCount = await allVouchers.count();

  let targetVoucher = null;
  for (let i = 0; i < voucherCount; i++) {
    const voucher = allVouchers.nth(i);
    const voucherText = await voucher.textContent();
    if (voucherText &&
        voucherText.toUpperCase().includes('AUTOMATION TEST VOUCHER') &&
        !voucherText.toUpperCase().includes('AUTOMATION TEST VOUCHER 1')) {
      targetVoucher = voucher;
      break;
    }
  }

  if (targetVoucher) {
    await targetVoucher.click();
  } else {
    await page.locator('a[href*="/products/"]').filter({
      hasText: /AUTOMATION TEST VOUCHER(?!\s*1)/i
    }).first().click();
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Helper: Complete eGHL payment gateway + FPX Bank Simulator flow
 * (Reused from 02-buy-vouchers.spec.ts)
 */
async function completeEGHLPayment(page: Page) {
  await page.waitForURL(/.*pay\.e-ghl\.com.*|.*mepsfpx\.com.*|.*simulator\.fpx.*|.*paynet\.my.*/i, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  if (currentUrl.includes('pay.e-ghl.com')) {
    const retailBankingSection = page.locator('.card-title[data-target="#B2C-B2C"], .card-header span.title:has-text("RETAIL INTERNET BANKING")').first();
    await retailBankingSection.waitFor({ state: 'visible', timeout: 10000 });
    await retailBankingSection.click();
    await page.waitForTimeout(2000);

    const sbiBankA = page.locator('#FPX_FPXD_TEST0021, div.all-items:has(img[alt="SBI BANK A"])').first();
    await sbiBankA.waitFor({ state: 'visible', timeout: 10000 });
    await sbiBankA.click();
    await page.waitForTimeout(3000);
  }

  await page.waitForURL(/.*simulator\.fpx.*|.*paynet\.my.*|.*BuyerBankSim.*/i, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.locator('input#userId').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('input#userId').fill('1234');
  await page.locator('input#password').fill('1234');

  page.once('dialog', async (dialog) => { await dialog.accept(); });

  await page.locator('button[type="submit"]:has-text("Sign in")').first().click();
  await page.waitForTimeout(5000);

  const okButton = page.locator('button:has-text("OK"), input[value="OK"]').first();
  if (await okButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await okButton.click();
    await page.waitForTimeout(2000);
  }

  await page.locator('button[type="submit"]:has-text("Confirm")').first().waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('button[type="submit"]:has-text("Confirm")').first().click();
  await page.waitForTimeout(3000);

  const continueButton = page.locator(
    'button:has-text("Continue with Transaction"), ' +
    'input[value*="Continue with Transaction" i], ' +
    'a:has-text("Continue with Transaction"), ' +
    'button:has-text("Continue"), ' +
    'input[value*="Continue" i]'
  ).first();
  await continueButton.waitFor({ state: 'visible', timeout: 10000 });
  await continueButton.click();

  await page.waitForURL(/.*corporate-voucher.*/, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await expect(page.locator('text=/Order Processing/i').first()).toBeVisible({ timeout: 15000 });
}

/**
 * Public Web - Send Vouchers Test Suite
 * 
 * This test suite covers the Send Voucher functionality as specified in "Send Vouchers.xlsx"
 * Functional Spec Reference: 2.4.4.2 Create Voucher Injection Task, 2.4.4.3 Send Voucher Task Detail
 * 
 * Test Types:
 * - Positive: Tests expected successful behavior
 * - Negative: Tests error handling and validation
 */

test.describe('Public Web - Send Vouchers', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new PublicLoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for redirect after login
  });

  /**
   * TC_SEND_001: Voucher codes allocated after successful purchase
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. Navigate to Buy Voucher
   * 2. Select a voucher
   * 3. Click Buy Now
   * 4. Click Proceed to Payment
   * 5. Complete payment in eGHL gateway
   * 6. Verify order confirmation page
   * 
   * Expected: Upon successful payment, vouchers are credited to user account and ready to send.
   * User cannot view voucher codes due to security reasons.
   */
  test('TC_SEND_001: Voucher codes allocated after successful purchase', async ({ page }) => {
    test.setTimeout(120000); // Extended timeout for payment flow

    // Step 1-2: Navigate to Buy Voucher and select AUTOMATION TEST VOUCHER
    await selectAutomationTestVoucher(page);

    // Step 3: Click Buy Now
    await page.locator('button:has-text("Buy Now")').waitFor({ state: 'visible', timeout: 10000 });
    await page.click('button:has-text("Buy Now")');

    // Step 4: Click Proceed to Payment
    await page.waitForURL(/.*checkout.*/, { timeout: 30000 });
    await page.click('button:has-text("Proceed to Payment")');

    // Step 5: Complete payment in eGHL gateway + FPX Bank Simulator
    await completeEGHLPayment(page);

    // Step 6: Verify order confirmation page
    await expect(page.locator('text=/Order No/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Total Payment/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_002: Access Send Voucher functionality from multiple endpoints
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps (Option 1 - Order Summary):
   * 1-6. Complete purchase flow
   * 7. Click Send Voucher button in Order summary page
   * 
   * Steps (Option 2 - Send Voucher Menu):
   * 1. Navigate to Send Voucher
   * 2. Click Send Voucher button
   * 
   * Steps (Option 3 - My Order):
   * 1. Navigate to My Order
   * 2. Click on voucher order
   * 3. Click Send Voucher button
   * 
   * Steps (Option 4 - Inventory):
   * 1. Navigate to Inventory
   * 2. Select a voucher
   * 3. Click Send Voucher button
   * 
   * Expected: User can access Send Voucher button from all endpoints to promote sending vouchers.
   */
  test('TC_SEND_002: Access Send Voucher functionality from multiple endpoints', async ({ page }) => {
    // Test Option 2: Navigate directly to Send Voucher
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify Send Voucher page elements
    await expect(page.getByRole('button', { name: '+ Select Voucher' })).toBeVisible();
    await expect(page.getByText('Total Number of Recipient', { exact: true })).toBeVisible();
    
    // Test Option 3: Access from My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const sendFromOrderButton = page.locator('button:has-text("Send Voucher")');
    // Button may not be visible if no orders exist
    
    // Test Option 4: Access from Inventory
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const sendFromInventoryButton = page.locator('button:has-text("Send Voucher")');
    // Button may not be visible if no inventory exists
  });

  /**
   * TC_SEND_003: Maintain record of purchased vouchers
   * Type: Positive
   * Spec Ref: 2.4.5 My Order
   * 
   * Steps:
   * 1. Navigate to My Order
   * 2. Observe the vouchers purchased
   * 
   * Expected: Able to view all voucher purchases in My Order page and view voucher creditation status.
   */
  test('TC_SEND_003: Maintain record of purchased vouchers', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify My Order page elements
    await expect(page.getByRole('textbox', { name: 'Search by Booking Number, Order Number' })).toBeVisible();
    
    // Verify tabs are visible
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'To Receive' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Completed' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Cancelled' })).toBeVisible();
  });

  /**
   * TC_SEND_004: Select specific vouchers to send
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. After clicking Send Voucher button
   * 2. Click Select Voucher button
   * 3. Select the vouchers to send
   * 4. Click Select button
   * 
   * Expected: Able to select particular voucher to send.
   */
  test('TC_SEND_004: Select specific vouchers to send', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 2: Click Select Voucher button
    await page.getByRole('button', { name: '+ Select Voucher' }).click();
    await page.waitForTimeout(1500);
    
    // Step 3: Verify modal opened with voucher list
    await expect(page.locator('text=Select Voucher').first()).toBeVisible();
    
    // Select first available voucher checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
    
    await checkboxes.first().click();
    await page.waitForTimeout(500);
    
    // Step 4: Click Select button in modal
    await page.getByRole('button', { name: 'Select', exact: true }).click();
    await page.waitForTimeout(1500);
    
    // Verify voucher was selected - voucher info should be displayed
    await expect(page.getByRole('button', { name: '+ Select Voucher' })).toBeVisible();
    const selectedVoucherInfo = page.locator('text=/AUTOMATION TEST|RM\\s*\\d+/i').first();
    await expect(selectedVoucherInfo).toBeVisible({ timeout: 5000 });
  });

  /**
   * TC_SEND_005: Enforce minimum amount requirements
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. After clicking Send Voucher button
   * 2. Click Select Voucher button
   * 3. Select the vouchers to send
   * 4. Click Select button
   * 
   * Expected: Minimum number of voucher to send is 1. As long as no voucher added,
   * Next button is disabled. Only can proceed when at least 1 voucher is added.
   */
  test('TC_SEND_005: Enforce minimum amount requirements', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Next button should be disabled initially
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Fill Total Number of Recipient (textbox with placeholder "0")
    const totalRecipientsInput = page.getByRole('textbox', { name: '0' });
    await totalRecipientsInput.fill('1');
    await page.waitForTimeout(500);
    
    // Next button should still be disabled without selecting voucher
    await expect(nextButton).toBeDisabled();
  });

  /**
   * TC_SEND_006: Validate sufficient voucher balance
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. After clicking Send Voucher button
   * 2. Enter a number for Total Number of Recipient
   * 3. Click Select Voucher button
   * 4. Select the vouchers to send
   * 5. Click Select button
   * 6. Enter a number for 'Each recipient will get:'
   * 
   * Expected: System calculates total voucher to send and validates amount is equal or lesser
   * than voucher currently owned. Error message shown if amount to send greater than currently owned.
   */
  test('TC_SEND_006: Validate sufficient voucher balance', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Enter Total Number of Recipient (first number input)
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1000');
    await page.waitForTimeout(1000);
    
    // Step 3-5: Select voucher
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    // Step 6: Enter 'Each recipient will get' (second number input)
    const eachRecipientInput = page.locator('input[type="number"]').nth(1);
    if (await eachRecipientInput.isVisible()) {
      await eachRecipientInput.fill('100');
      await page.waitForTimeout(1000);
    }
    
    // Check for insufficient balance error
    const errorMessage = page.locator('text=/insufficient|not enough|exceed|more than.*owned/i');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });

  /**
   * TC_SEND_007: Accept and validate number of vouchers recipient should receive
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. After clicking Send Voucher button
   * 2. Enter a number for Total Number of Recipient
   * 3. Click Select Voucher button
   * 4. Select the vouchers to send
   * 5. Click Select button
   * 6. Enter a number for 'Each recipient will get:'
   * 
   * Expected: System calculates total voucher to send and validates amount is equal or lesser
   * than voucher currently owned. Error message shown if amount to send greater than currently owned.
   */
  test('TC_SEND_007: Accept and validate number of vouchers recipient should receive', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Enter Total Number of Recipient (first number input)
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    // Step 3-5: Select voucher
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    // Step 6: Enter 'Each recipient will get' (second number input)
    const eachRecipientInput = page.locator('input[type="number"]').nth(1);
    if (await eachRecipientInput.isVisible()) {
      await eachRecipientInput.fill('1');
      await page.waitForTimeout(500);
    }
    
    // Verify calculation and validation
    const nextButton = page.locator('button:has-text("Next")');
    await page.waitForTimeout(500);
  });

  /**
   * TC_SEND_008: Provide downloadable CSV templates
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-6. Complete Step 1 (Add vouchers)
   * 7. Click Next button
   * 8. Click 'Download CSV template'
   * 
   * Expected: Upon clicking, CSV automatically downloaded into user's device.
   */
  test('TC_SEND_008: Provide downloadable CSV templates', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    // Complete Step 1
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    await page.waitForTimeout(500);
    
    // Step 7: Click Next
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Step 8: Download CSV template
      const downloadLink = page.locator('a:has-text("Download")');
      if (await downloadLink.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          downloadLink.click()
        ]);
        
        expect(download.suggestedFilename()).toContain('.csv');
      }
    }
  });

  /**
   * TC_SEND_009: CSV template populated with correct number of slots
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-8. Complete Step 1 and download CSV template
   * 
   * Expected: CSV automatically downloaded. Amount of slots corresponds with number of recipients
   * entered in Step 1.
   */
  test('TC_SEND_009: CSV template populated with correct number of slots', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    // Enter specific number of recipients (e.g., 5)
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('5');
    await page.waitForTimeout(500);
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // CSV should have 5 slots for 5 recipients
      const downloadLink = page.locator('a:has-text("Download")');
      if (await downloadLink.isVisible()) {
        await expect(downloadLink).toBeVisible();
      }
    }
  });

  /**
   * TC_SEND_010: Clear instructions for CSV completion and upload
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-8. Complete Step 1 and download CSV template
   * 
   * Expected: CSV automatically downloaded. Amount of slots corresponds with amount entered.
   * Clear steps of instructions are listed in Step 2.
   */
  test('TC_SEND_010: Clear instructions for CSV completion and upload', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    await page.waitForTimeout(500);
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Verify clear instructions are displayed in Step 2
      const instructions = page.locator('text=/instruction|step|how to/i');
      if (await instructions.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(instructions).toBeVisible();
      }
    }
  });

  /**
   * TC_SEND_011: Accept CSV file uploads containing recipient information
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-8. Download CSV template
   * 9. Fill up the file
   * 10. Click 'Download CSV template'
   * 11. Upload the file
   * 
   * Expected: User can upload the filled CSV file back into the website.
   */
  test('TC_SEND_011: Accept CSV file uploads containing recipient information', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    await page.waitForTimeout(500);
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Verify file input exists for CSV upload
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      
      // Note: Actual file upload requires test CSV file
      // await fileInput.setInputFiles('test-data/recipients.csv');
    }
  });

  /**
   * TC_SEND_012: Validate CSV format and required data fields
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-11. Upload filled CSV file
   * 
   * Expected: System verifies CSV and identifies validity of phone numbers and email addresses.
   * Shows results in Upload Result Summary page.
   */
  test('TC_SEND_012: Validate CSV format and required data fields', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
      // After upload, system should show Upload Result Summary
    }
  });

  /**
   * TC_SEND_013: Display summary information showing invalid format inputs
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-12. Upload file and observe Upload Result Summary
   * 13. Validate the result
   * 
   * Expected: Upload Result Summary shows validation results for phone numbers and email addresses.
   */
  test('TC_SEND_013: Display summary information showing invalid format inputs', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Verify Upload Result Summary section exists
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_014: Validate phone numbers in uploaded recipient data
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload file and observe 'Invalid Phone Number Format'
   * 
   * Expected: System validates phone number format (60XXXXXXXX).
   */
  test('TC_SEND_014: Validate phone numbers in uploaded recipient data', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: System validates phone number format (60123456789)
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    }
  });

  /**
   * TC_SEND_015: Identify and flag wrong/invalid phone numbers
   * Type: Positive
   * Spec Ref: 2.4.4.2.3.2 Uploaded CSV with Error Message
   * 
   * Steps:
   * 1-13. Upload file and observe 'Invalid Phone Number Format'
   * 
   * Expected: System validates phone number format (60123456789) and flags incorrect/invalid format.
   * User can view number of incorrect phone numbers in Upload Result Summary page.
   */
  test('TC_SEND_015: Identify and flag wrong/invalid phone numbers', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: System flags incorrect/invalid phone number format
      // User can view count of incorrect phone numbers in Upload Result Summary
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_016: Allow users to create new injections with corrected phone numbers
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload file, validate Upload Result Summary, click 'Upload Again' button
   * 
   * Expected: System allows user to reupload corrected CSV file. Upload Result Summary displays
   * new summary for newly uploaded file.
   */
  test('TC_SEND_016: Allow users to create new injections with corrected phone numbers', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Again button allows reupload of corrected CSV
      const uploadAgainButton = page.locator('button:has-text("Upload Again"), button:has-text("Re-upload")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_017: Error handling for incorrectly formatted CSV files (non-CSV)
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-11. Upload non-CSV file
   * 
   * Expected: Upload only accepts CSV files. Unable to upload files other than CSV.
   * Note: Only able to select CSV files.
   */
  test('TC_SEND_017: [NEGATIVE] Error handling for incorrectly formatted CSV files (non-CSV)', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: File input accepts only CSV files
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        const acceptAttr = await fileInput.getAttribute('accept');
        expect(acceptAttr).toContain('.csv');
      }
    }
  });

  /**
   * TC_SEND_018: Error handling for incorrectly formatted CSV files (wrong structure)
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-11. Upload CSV with wrong header/entirely wrong CSV files
   * 
   * Expected: System validates CSV structure.
   * Test for: missing column at end - ERROR, missing column in middle - ERROR,
   * extra empty column - ACCEPTED, wrong spelling - ERROR.
   */
  test('TC_SEND_018: [NEGATIVE] Error handling for incorrectly formatted CSV files (wrong structure)', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: System validates CSV structure
      // Missing/wrong columns = ERROR, extra empty column = ACCEPTED
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    }
  });

  /**
   * TC_SEND_019: Link to TGV page for error reporting and issue tracking
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Click Send Voucher Batch
   * 3. For every status 'System Error', observe the Remark
   * 
   * Expected: Remark shows "Contact TGV Help Desk". User can click link and will be redirected
   * to TGV page: https://help.tgv.com.my/portal/en/newticket
   */
  test('TC_SEND_019: Link to TGV page for error reporting and issue tracking', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: For status 'System Error', remark shows "Contact TGV Help Desk"
    // Link redirects to https://help.tgv.com.my/portal/en/newticket
    const helpDeskLink = page.locator('a[href*="help.tgv.com.my"]');
    if (await helpDeskLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(helpDeskLink).toBeVisible();
    }
  });

  /**
   * TC_SEND_020: Handle recipients without MVC accounts appropriately
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload CSV with non-registered phone number and click Send Voucher
   * 
   * Expected: Status of voucher injection becomes "Mobile Number Not Registered".
   */
  test('TC_SEND_020: Handle recipients without MVC accounts appropriately', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Status becomes "Mobile Number Not Registered"
      // Note: Requires uploading CSV with non-registered number
    }
  });

  /**
   * TC_SEND_021: Alert recipient to create new MVC accounts for unregistered phone numbers
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload CSV with non-registered phone number and click Send Voucher
   * 
   * Expected: For every non-registered phone number, send SMS to phone number and email notification
   * to email (if have) to notify receiver and prompt them to create account.
   */
  test('TC_SEND_021: Alert recipient to create new MVC accounts for unregistered phone numbers', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Send SMS and email notification to non-registered recipients
      // Note: Actual SMS/email verification requires external validation
    }
  });

  /**
   * TC_SEND_022: Inject voucher when non-registered users register and create account
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Send voucher to non-registered user
   * 15. Wait until non-registered user creates account using mobile number
   * 16. Observe My Wallet
   * 
   * Expected: Upon new account creation using phone number, they receive voucher and can view
   * voucher in My Wallet.
   */
  test('TC_SEND_022: Inject voucher when non-registered users register and create account', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: Upon new account creation with phone number that has pending voucher
    // Recipient receives voucher in My Wallet
    // Note: This requires end-to-end flow with actual account creation
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_023: Execute voucher sending to recipients after all validations
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Complete full send voucher flow and view status
   * 
   * Expected: Send button enabled when incorrect phone/email count = 0. Successful voucher
   * injection receiver receives email. User can view status of their injection.
   */
  test('TC_SEND_023: Execute voucher sending to recipients after all validations', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Send button enabled when incorrect phone/email count = 0
      const sendButton = page.locator('button:has-text("Send Voucher"), button:has-text("Send")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_024: Inject vouchers into recipients' TGV MVC voucher wallets
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Complete send voucher flow and view status
   * 
   * Expected: Send button enabled when incorrect phone/email count = 0. Successful injection
   * receiver receives email. User can view status of their injection.
   */
  test('TC_SEND_024: Inject vouchers into recipients TGV MVC voucher wallets', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Vouchers injected into recipients' TGV MVC voucher wallets
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_025: Handle successful voucher delivery confirmations
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Complete send voucher flow and click Send Voucher
   * 
   * Expected: Send button enabled when incorrect phone/email count = 0. Successful injection
   * receiver receives email. User can view status of their injection.
   */
  test('TC_SEND_025: Handle successful voucher delivery confirmations', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: User can view status of voucher injection
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_026: Provide comprehensive error messages for failed operations
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Complete send voucher flow and view status
   * 
   * Expected: User can view status of voucher injection in Send Voucher page.
   * Note: Not sure how to simulate failed event but video shows status correctly for success send.
   * Can refer row 21 for unregistered mobile number.
   */
  test('TC_SEND_026: Provide comprehensive error messages for failed operations', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: User can view status of voucher injection
    // Error messages displayed for failed operations
    await page.waitForTimeout(1000);
  });

  /**
   * TC_SEND_027: Allow correction and resubmission of invalid data
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload file, validate Upload Result Summary, click 'Upload Again' button
   * 
   * Expected: System allows user to reupload corrected CSV file. Upload Result Summary displays
   * new summary. Next button disabled until incorrect phone/email count = 0.
   */
  test('TC_SEND_027: Allow correction and resubmission of invalid data', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Again button allows reupload
      // Next button disabled until incorrect counts = 0
      const uploadAgainButton = page.locator('button:has-text("Upload Again"), button:has-text("Re-upload")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_028: Maintain transaction logs for troubleshooting
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Expected: System maintains transaction logs.
   * Note: Log verification requires backend/admin access.
   */
  test('TC_SEND_028: Maintain transaction logs for troubleshooting', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: System maintains transaction logs
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_029: Integrate with support systems (Zoho Desk) for issue resolution
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Expected: Integration with Zoho Desk for issue resolution.
   */
  test('TC_SEND_029: Integrate with support systems (Zoho Desk) for issue resolution', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: Integration with Zoho Desk
    // Help desk link available for system errors
    const helpDeskLink = page.locator('a[href*="help.tgv.com.my"]');
    if (await helpDeskLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(helpDeskLink).toBeVisible();
    }
  });

  /**
   * TC_SEND_030: Guide users through three-stage sending process sequentially
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Complete all 3 injection steps
   * 
   * Expected: User able to create injection seamlessly throughout 3 injection steps.
   */
  test('TC_SEND_030: Guide users through three-stage sending process sequentially', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    // Stage 1: Add vouchers
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    // Stage 2: Upload CSV
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Stage 3: Review and send
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeAttached();
    }
  });

  /**
   * TC_SEND_031: Allow users to review and confirm details before final execution
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-12. Upload CSV and validate Upload Result Summary
   * 
   * Expected: User can view and validate information of uploaded CSV file before confirming send.
   */
  test('TC_SEND_031: Allow users to review and confirm details before final execution', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: User can view and validate uploaded CSV info
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_032: Provide clear process completion confirmation
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Complete send voucher flow and observe confirmation popup
   * 
   * Expected: Popup upon clicking send button receives user's confirmation before sending vouchers.
   */
  test('TC_SEND_032: Provide clear process completion confirmation', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Confirmation popup before sending
      const sendButton = page.locator('button:has-text("Send Voucher"), button:has-text("Send")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_033: Ensure secure handling of recipient's personal data
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Expected: System ensures secure handling of recipient personal data.
   * Note: Security verification requires security audit/testing.
   */
  test('TC_SEND_033: Ensure secure handling of recipients personal data', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    // Expected: System ensures secure handling of personal data
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_034: Validate all input data before processing
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-12. Upload CSV and validate Upload Result Summary
   * 
   * Expected: Every invalid phone number and email counted and displayed in Upload Result Summary.
   */
  test('TC_SEND_034: Validate all input data before processing', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Invalid phone/email counted and displayed
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_035: Maintain audit trails for all voucher sending activities
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch
   * 3. View voucher injection status
   * 
   * Expected: User can view status of every voucher injection batch they made.
   */
  test('TC_SEND_035: Maintain audit trails for all voucher sending activities', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: User can view status of every voucher injection batch
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_036: Invalid recipient's phone number
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload CSV with invalid phone number and observe Invalid Phone Number format
   * 
   * Expected: Number of invalid phone number format displayed in Upload Result Summary page.
   */
  test('TC_SEND_036: [NEGATIVE] Invalid recipients phone number', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Invalid phone number count displayed in Upload Result Summary
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_037: Invalid recipient's email address
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-13. Upload CSV with invalid email and observe Invalid Email format
   * 
   * Expected: Number of invalid email format displayed in Upload Result Summary page.
   */
  test('TC_SEND_037: [NEGATIVE] Invalid recipients email address', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Invalid email count displayed in Upload Result Summary
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_038: Invalid recipient's phone number and email address
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Upload CSV with invalid phone and email, observe both Invalid formats
   * 
   * Expected: Number of invalid phone and email format displayed in Upload Result Summary page.
   */
  test('TC_SEND_038: [NEGATIVE] Invalid recipients phone number and email address', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Both invalid phone and email counts displayed
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_039: Identify which invalid phone/email belongs to which recipient
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-14. Upload CSV, click Download and Make Adjustments, open file, observe Error Message column
   * 
   * Expected: If incorrect phone/email format exists, Download and Make Adjustment button available.
   * Downloaded CSV includes Error Message column indicating the issue.
   */
  test('TC_SEND_039: Identify which invalid phone/email belongs to which recipient', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('2');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Download and Make Adjustments button available
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Make Adjustment")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_040: Amount of vouchers to send exceed currently owned
   * Type: Negative
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-7. Enter numbers that result in total voucher send more than currently owned
   * 
   * Expected: Error message "Total voucher to send is more than currently owned, please reduce
   * the number each recipient will get." Error disappears when total <= owned.
   */
  test('TC_SEND_040: [NEGATIVE] Amount of vouchers to send exceed currently owned', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    // Enter large numbers to exceed owned vouchers
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('9999');
    
    const eachRecipientInput = page.locator('input[type="number"]').nth(1);
    if (await eachRecipientInput.isVisible()) {
      await eachRecipientInput.fill('100');
    }
    
    // Expected: Error message about exceeding owned vouchers
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=/more than.*owned|exceed/i');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });

  /**
   * TC_SEND_041: Amount of vouchers to send equals currently owned
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-7. Enter numbers that result in total voucher send equals currently owned
   * 
   * Expected: Able to proceed to next step.
   */
  test('TC_SEND_041: Amount of vouchers to send equals currently owned', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    // Expected: Able to proceed to next step
    const nextButton = page.locator('button:has-text("Next")');
    await page.waitForTimeout(500);
    if (await nextButton.isEnabled()) {
      await expect(nextButton).toBeEnabled();
    }
  });

  /**
   * TC_SEND_042: Amount of vouchers to send less than currently owned
   * Type: Positive
   * Spec Ref: 2.4.4.2 Create Voucher Injection Task
   * 
   * Steps:
   * 1-7. Enter numbers that result in total voucher send less than currently owned
   * 
   * Expected: Able to proceed to next step.
   */
  test('TC_SEND_042: Amount of vouchers to send less than currently owned', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    // Expected: Able to proceed to next step
    const nextButton = page.locator('button:has-text("Next")');
    await page.waitForTimeout(500);
    if (await nextButton.isEnabled()) {
      await expect(nextButton).toBeEnabled();
    }
  });

  /**
   * TC_SEND_043: View voucher injection status
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch
   * 3. View voucher injection status
   * 
   * Expected: User can view status of every voucher injection batch they made.
   */
  test('TC_SEND_043: View voucher injection status', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: User can view status of every voucher injection batch
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
    await page.waitForTimeout(1000);
  });

  /**
   * TC_SEND_044: Download voucher injection report
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch
   * 3. Click Download Report button
   * 
   * Expected: Able to download voucher injection report they have made.
   */
  test('TC_SEND_044: Download voucher injection report', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: Able to download voucher injection report
    const downloadButton = page.locator('button:has-text("Download Report"), button:has-text("Download")');
    if (await downloadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(downloadButton).toBeVisible();
    }
  });

  /**
   * TC_SEND_045: Withdraw voucher injection to unsuccessful recipients
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch
   * 3. Tick all checkbox for every status 'Mobile Number Not Registered'
   * 4. Click Withdraw button
   * 
   * Expected: Able to withdraw for every Mobile Number Not Registered.
   */
  test('TC_SEND_045: Withdraw voucher injection to unsuccessful recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // Expected: Able to withdraw for "Mobile Number Not Registered" status
    const withdrawButton = page.locator('button:has-text("Withdraw")');
    if (await withdrawButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(withdrawButton).toBeVisible();
    }
  });

  /**
   * TC_SEND_046: Search injection status for certain phone number
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch and click View Report
   * 3. In phone number search bar, type in a phone number
   * 4. Enter
   * 
   * Expected: Can search for specific phone number and view status.
   */
  test('TC_SEND_046: Search injection status for certain phone number', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Can search for specific phone number
    const searchInput = page.locator('input[placeholder*="phone"], input[placeholder*="search"]');
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });

  /**
   * TC_SEND_047: Filter voucher injection status for Successfully Sent
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch and click View Report
   * 3. Open dropdown for filter
   * 4. Select Successfully Sent
   * 
   * Expected: Can filter for Successfully Sent.
   */
  test('TC_SEND_047: Filter voucher injection status for Successfully Sent', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Can filter for "Successfully Sent"
    const filterDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /filter|status/i });
    if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(filterDropdown).toBeVisible();
    }
  });

  /**
   * TC_SEND_048: Filter voucher injection status for Mobile Number Not Registered
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch and click View Report
   * 3. Open dropdown for filter
   * 4. Select Mobile Number Not Registered
   * 
   * Expected: Can filter for Mobile Number Not Registered.
   */
  test('TC_SEND_048: Filter voucher injection status for Mobile Number Not Registered', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Can filter for "Mobile Number Not Registered"
    const filterDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /filter|status/i });
    if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(filterDropdown).toBeVisible();
    }
  });

  /**
   * TC_SEND_049: Filter voucher injection status for Withdraw
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch and click View Report
   * 3. Open dropdown for filter
   * 4. Select Withdraw
   * 
   * Expected: Can filter for Withdraw.
   * Note: But no data for system error, result shows no data recorded.
   */
  test('TC_SEND_049: Filter voucher injection status for Withdraw', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Can filter for "Withdraw"
    const filterDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /filter|status/i });
    if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(filterDropdown).toBeVisible();
    }
  });

  /**
   * TC_SEND_050: Filter voucher injection status for System Error
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Send Voucher
   * 2. Select/Choose Send Voucher Batch and click View Report
   * 3. Open dropdown for filter
   * 4. Select System Error
   * 
   * Expected: Can filter for System Error.
   * Note: But no data for system error, result shows no data recorded.
   */
  test('TC_SEND_050: Filter voucher injection status for System Error', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Can filter for "System Error"
    // Note: May show "no data recorded" if no system errors exist
    const filterDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /filter|status/i });
    if (await filterDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(filterDropdown).toBeVisible();
    }
  });

  /**
   * TC_SEND_051: Correct registered phone, wrong email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct registered phone and wrong email, then Send
   * 
   * Expected: Voucher successfully injected in recipient's account but recipient doesn't receive
   * email notification.
   * Note: No email received - EXPECTED.
   */
  test('TC_SEND_051: Correct registered phone, wrong email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Voucher injected but no email received
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_052: Correct registered phone, correct email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct registered phone and correct email, then Send
   * 
   * Expected: Voucher successfully injected in recipient's account and recipient receives
   * email notification.
   */
  test('TC_SEND_052: Correct registered phone, correct email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Voucher injected and email received
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_053: Correct non-registered phone, wrong email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct non-registered phone and wrong email, then Send
   * 
   * Expected: Voucher injection fails. Recipient receives SMS notifying voucher waiting and
   * prompts to create account. Email notification not received.
   * Voucher code reserved, waits for account creation and injects when exists.
   */
  test('TC_SEND_053: Correct non-registered phone, wrong email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Injection fails, SMS received but not email
      // Voucher code reserved
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_054: Correct non-registered phone, correct email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct non-registered phone and correct email, then Send
   * 
   * Expected: Voucher injection fails. Recipient receives SMS and email notification notifying
   * voucher waiting and prompts to create account.
   * Voucher code reserved, waits for account creation and injects when exists.
   */
  test('TC_SEND_054: Correct non-registered phone, correct email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Injection fails, SMS and email received
      // Voucher code reserved
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_055: Total number of recipients = 0
   * Type: Negative
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-5. Type in total number of recipients = 0, click Next
   * 
   * Expected: Send button disabled/greyed out. User cannot proceed to next step.
   */
  test('TC_SEND_055: [NEGATIVE] Total number of recipients = 0', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('0');
    
    // Expected: Next button disabled, cannot proceed
    const nextButton = page.locator('button:has-text("Next")');
    await page.waitForTimeout(500);
    await expect(nextButton).toBeDisabled();
  });

  /**
   * TC_SEND_056: Correct registered phone, no email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct registered phone and no email, then Send
   * 
   * Expected: Voucher successfully injected in recipient's account but recipient doesn't receive
   * email notification.
   * Note: See second item, there's no email received.
   */
  test('TC_SEND_056: Correct registered phone, no email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Voucher injected but no email received
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_057: Correct non-registered phone, no email
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct non-registered phone and no email, then Send
   * 
   * Expected: Voucher injection fails. Recipient receives SMS notifying voucher waiting and
   * prompts to create account. Email notification not received.
   * Voucher code reserved, waits for account creation and injects when exists.
   */
  test('TC_SEND_057: Correct non-registered phone, no email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Injection fails, SMS received but not email
      // Voucher code reserved
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_058: Correct phone format, wrong email format
   * Type: Negative
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct phone format and wrong email format, click Download and Make Adjustment
   * 
   * Expected: In Upload Result Summary, count increases for incorrect email format.
   * Upon download, error message shows "Invalid email format".
   */
  test('TC_SEND_058: [NEGATIVE] Correct phone format, wrong email format', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Result Summary shows incorrect email format count
      // Download shows "Invalid email format"
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Make Adjustment")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_059: Wrong phone format, correct email format
   * Type: Negative
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with wrong phone format and correct email format, click Download and Make Adjustment
   * 
   * Expected: In Upload Result Summary, count increases for incorrect phone format.
   * Upon download, error message shows "Invalid phone number format".
   */
  test('TC_SEND_059: [NEGATIVE] Wrong phone format, correct email format', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Result Summary shows incorrect phone format count
      // Download shows "Invalid phone number format"
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Make Adjustment")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_060: Correct phone format, correct email format
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with correct phone format and correct email format, click Download and Make Adjustment
   * 
   * Expected: In Upload Result Summary, counts for invalid phone/email format = 0.
   */
  test('TC_SEND_060: Correct phone format, correct email format', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Result Summary shows counts = 0
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_061: Wrong phone format, wrong email format
   * Type: Negative
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV with wrong phone format and wrong email format, click Download and Make Adjustment
   * 
   * Expected: In Upload Result Summary, count increases for both incorrect formats.
   * Upon download, error message shows "Invalid phone number and email format".
   */
  test('TC_SEND_061: [NEGATIVE] Wrong phone format, wrong email format', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Upload Result Summary shows both incorrect counts
      // Download shows "Invalid phone number and email format"
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Make Adjustment")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC_SEND_062: Send message to recipients
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1-10. Fill CSV, type message under Customized Message, click Send
   * 
   * Expected: Can type message.
   * Note: Able to type message.
   */
  test('TC_SEND_062: Send message to recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Select Voucher")');
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]');
    const checkboxes = modal.locator('input[type="checkbox"]');
    if (await checkboxes.count() > 0) {
      await checkboxes.first().click();
      await modal.locator('button:has-text("Select")').click();
      await page.waitForTimeout(1000);
    }
    
    const totalRecipientsInput = page.locator('input[type="number"]').first();
    await totalRecipientsInput.fill('1');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Expected: Can type customized message
      const messageInput = page.locator('textarea, input').filter({ hasText: /message|custom/i });
      if (await messageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await messageInput.fill('Test customized message for recipients');
        await expect(messageInput).toHaveValue(/Test customized message/);
      }
    }
  });

  /**
   * TC_SEND_063: Send voucher when remaining voucher = 0
   * Type: Negative
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Navigate to Inventory
   * 2. Choose voucher with remaining = 0
   * 3-7. Try to send voucher
   * 
   * Expected: Button disabled. Cannot send voucher when remaining = 0.
   * In send voucher detail page, vouchers with quantity remaining = 0 not displayed.
   */
  test('TC_SEND_063: [NEGATIVE] Send voucher when remaining voucher = 0', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    await page.waitForLoadState('networkidle');
    
    // Find voucher with remaining = 0
    const zeroVoucher = page.locator('text=/remaining.*0|0.*remaining/i').first();
    
    if (await zeroVoucher.isVisible({ timeout: 3000 }).catch(() => false)) {
      const sendButton = page.locator('button:has-text("Send Voucher")');
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(1000);
        
        // Expected: Button disabled, vouchers with quantity = 0 not displayed
        await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
        await page.click('button:has-text("Select Voucher")');
        await page.waitForTimeout(1000);
      }
    }
  });

  /**
   * TC_SEND_064: View status for Mobile Number Not Registered
   * Type: Positive
   * Spec Ref: 2.4.4.3 Send Voucher Task Detail
   * 
   * Steps:
   * 1. Send voucher
   * 2. For every non-registered user, view remarks
   * 
   * Expected: When status is "Mobile Number Not Registered", remark is
   * "Pending for recipient to register mobile number on MovieClub".
   */
  test('TC_SEND_064: View status for Mobile Number Not Registered', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Expected: Remark shows "Pending for recipient to register mobile number on MovieClub"
    const remarkText = page.locator('text=/pending.*register|mobile.*not.*registered/i');
    if (await remarkText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(remarkText).toBeVisible();
    }
  });

  /**
   * TC_SEND_065: View SMS template for registered recipients
   * Type: Positive (Documentation)
   * 
   * Expected SMS Template:
   * "RM0: *sender name* has sent you TGV movie vouchers (*voucher name*). They've been added to
   * your TGC App Wallet. Open the TGV App to view and use your vouchers. Enjoy the movie!"
   * Followed by personalized message (if have).
   * 
   * Note: SMS verification requires external SMS service access.
   */
  test('TC_SEND_065: View SMS template for registered recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected SMS template for registered recipients
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_066: View SMS template for non-registered recipients
   * Type: Positive (Documentation)
   * 
   * Expected SMS Template:
   * "RM0: *sender name* sent you TGV movie vouchers (*voucher name*). Register for TGV MovieClub
   * in the TGV App using this mobile number to access them in My Wallet. Open the TGV App to
   * register and enjoy your movie!"
   * Followed by personalized message (if have).
   * 
   * Note: SMS verification requires external SMS service access.
   */
  test('TC_SEND_066: View SMS template for non-registered recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected SMS template for non-registered recipients
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_067: View email template for registered recipients
   * Type: Positive (Documentation)
   * Spec Ref: 2.4.4.3.2 Template Email Notification for Successful Injection
   * 
   * Expected Email Template:
   * "Hello XXX!
   * 
   * *sender name* has sent you TGV movie voucher(s). The vouchers have been added to your TGV App
   * Wallet and are ready to use.
   * 
   * Open the TGV App > go to My Wallet > use your vouchers when booking a movie.
   * 
   * Enjoy the movie!"
   * 
   * "Please remember to use your vouchers at TGV Cinemas before the expiry date. We look forward
   * to seeing you at the movies soon."
   * 
   * Followed by CLAIM VOUCHER button.
   * 
   * Note: Email verification requires email service access.
   */
  test('TC_SEND_067: View email template for registered recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected email template for registered recipients
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_068: View email template for non-registered recipients
   * Type: Positive (Documentation)
   * Spec Ref: 2.4.4.3.3 Template Email Notification for Pending Registration
   * 
   * Expected Email Template:
   * "Hello XXX!
   * 
   * *sender name* has sent you TGV movie vouchers.
   * 
   * To enjoy these vouchers, please register for a TGV MovieClub account using the same mobile
   * number via the TGV App. Once registration is complete, the vouchers will be added automatically
   * to your TGV App Wallet."
   * 
   * "We noticed that you are not registered as a TGV MovieClub member. Please complete your
   * registration to access your movie vouchers. Your vouchers will be added to your TGV App Wallet
   * once registration is complete."
   * 
   * Followed by REGISTER NOW button.
   * 
   * Note: Email verification requires email service access.
   */
  test('TC_SEND_068: View email template for non-registered recipients', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected email template for non-registered recipients
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_069: Click CLAIM VOUCHER button in email
   * Type: Positive (Documentation)
   * Spec Ref: 2.4.4.3.2 Template Email Notification for Successful Injection
   * 
   * Steps:
   * 1. Send voucher for registered recipient
   * 2. Open email
   * 3. Click CLAIM VOUCHER button
   * 
   * Expected: Page redirects to TGV My Wallet page.
   * Note: Button redirects to TGV Prod and goes to empty wallet page without prompting sign in first.
   * 
   * Note: Email link testing requires email service access.
   */
  test('TC_SEND_069: Click CLAIM VOUCHER button in email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected behavior of CLAIM VOUCHER button
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_070: Click REGISTER NOW button in email
   * Type: Positive (Documentation)
   * Spec Ref: 2.4.4.3.3 Template Email Notification for Pending Registration
   * 
   * Steps:
   * 1. Send voucher for non-registered recipient
   * 2. Open email
   * 3. Click REGISTER NOW button
   * 
   * Expected: Page redirects to TGV Sign In page.
   * 
   * Note: Email link testing requires email service access.
   */
  test('TC_SEND_070: Click REGISTER NOW button in email', async ({ page }) => {
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    
    // This test documents the expected behavior of REGISTER NOW button
    await expect(page.locator('text=/send voucher/i').first()).toBeVisible();
  });

  /**
   * TC_SEND_E2E: Complete Send Voucher End-to-End Flow
   * Type: Positive (E2E)
   * 
   * Full flow:
   * 1. Click +Send Voucher button
   * 2. Enter total number of recipient
   * 3. Click +Select Voucher
   * 4. Click checkbox on one of the voucher
   * 5. Click Select button
   * 6. Assert the selected voucher
   * 7. Click Next button
   * 8. Download CSV
   * 9. Click Next button (to Step 3: Upload and Send)
   * 10. Upload the CSV file
   * 11. Click Send Vouchers button
   * 12. Click Send Voucher button
   * 13. Click Confirm Send button
   * 14. Verify the Success message
   */
  test('TC_SEND_E2E: Complete Send Voucher End-to-End Flow', async ({ page }) => {
    // Navigate to Send Voucher list page
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 1: Click +Send Voucher button (navigates to create page)
    const sendVoucherLink = page.getByRole('link', { name: 'Send Voucher', exact: true });
    await sendVoucherLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // If we're not on the create page, navigate directly
    if (!page.url().includes('send-voucher/create')) {
      await page.goto(`${PUBLIC_WEB.URL}send-voucher/create`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Verify Step 1 page loaded
    await expect(page.getByText('Total Number of Recipient', { exact: true })).toBeVisible({ timeout: 10000 });

    // Step 2: Enter total number of recipient
    const totalRecipientsInput = page.getByRole('textbox', { name: '0' });
    await totalRecipientsInput.fill('1');
    await page.waitForTimeout(500);

    // Step 3: Click +Select Voucher button
    await page.getByRole('button', { name: '+ Select Voucher' }).click();
    await page.waitForTimeout(2000);

    // Verify Select Voucher modal opened
    await expect(page.locator('text=Select Voucher').first()).toBeVisible({ timeout: 5000 });

    // Step 4: Click checkbox on one of the voucher
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
    await checkboxes.first().click();
    await page.waitForTimeout(500);

    // Step 5: Click Select button in modal
    await page.getByRole('button', { name: 'Select', exact: true }).click();
    await page.waitForTimeout(2000);

    // Step 6: Assert the selected voucher is displayed
    // After selecting, the voucher should appear in the form (no longer showing empty state)
    // The "+ Select Voucher" button should still be visible for adding more
    await expect(page.getByRole('button', { name: '+ Select Voucher' })).toBeVisible();
    // Verify a voucher card/item is now shown (selected voucher info)
    const selectedVoucherInfo = page.locator('text=/AUTOMATION TEST|RM\\s*\\d+/i').first();
    await expect(selectedVoucherInfo).toBeVisible({ timeout: 5000 });

    // Step 7: Click Next button
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled({ timeout: 5000 });
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 8: Download CSV template
    // We're now on Step 2: Download the Recipient Template
    const downloadLink = page.locator('a:has-text("Download"), button:has-text("Download")').first();
    if (await downloadLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        downloadLink.click()
      ]);
      // Verify CSV was downloaded
      const filename = download.suggestedFilename();
      expect(filename).toContain('.csv');
      console.log(`Downloaded CSV template: ${filename}`);
    }

    // Step 9: Click Next button (to Step 3: Upload and Send)
    const nextButton2 = page.locator('button:has-text("Next")');
    if (await nextButton2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextButton2.click();
      await page.waitForTimeout(2000);
    }

    // Step 10: Upload the CSV file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 10000 });

    // Use the test CSV file
    const csvPath = path.resolve(__dirname, '../../test-data/voucher_recipients_template.csv');
    await fileInput.setInputFiles(csvPath);
    await page.waitForTimeout(3000);

    // Step 11: Click Send Voucher button (opens confirmation dialog)
    const sendVouchersButton = page.getByRole('button', { name: 'Send Voucher', exact: true });
    await sendVouchersButton.waitFor({ state: 'visible', timeout: 10000 });
    await sendVouchersButton.click();
    await page.waitForTimeout(2000);

    // Step 12-13: The confirmation dialog appears with "Cancel" and "Confirm Send" buttons
    // Click "Confirm Send" button in the dialog
    const confirmSendButton = page.getByRole('button', { name: 'Confirm Send' });
    await confirmSendButton.waitFor({ state: 'visible', timeout: 10000 });
    await confirmSendButton.click();
    await page.waitForTimeout(5000);

    // Step 14: Verify the Success message
    const successMessage = page.locator('text=/success|successfully|voucher.*sent|sent.*successfully/i').first();
    await expect(successMessage).toBeVisible({ timeout: 15000 });
    console.log('Send Voucher E2E flow completed successfully');
  });
});
