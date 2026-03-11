import { test, expect } from '@playwright/test';
import { PUBLIC_WEB } from '../../utils/test-data';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

test.describe('Public Web - Reports', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new PublicLoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await page.waitForLoadState('networkidle');
  });

  test('TC_REPORT001: [Send Voucher page] Download send voucher report for a specific batch', async ({ page }) => {
    // Navigate to Send Voucher page
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if there are batches available
    const emptyState = await page.locator('text="No voucher batches found"').count();
    
    if (emptyState > 0) {
      console.log('⚠️  No voucher batches available. Skipping test.');
      test.skip();
      return;
    }
    
    // Select a batch (click on table row)
    const batchRow = page.locator('table tbody tr').first();
    await batchRow.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click View Report button
    await page.click('button:has-text("View Report")');
    await page.waitForTimeout(1000);
    
    // Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Report")');
    const download = await downloadPromise;
    
    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    
    // View the downloaded csv file report
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('TC_REPORT002: [Send Voucher page] Download send voucher report for multiple batches', async ({ page }) => {
    // Navigate to Send Voucher page
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if there are batches available
    const emptyState = await page.locator('text="No voucher batches found"').count();
    
    if (emptyState > 0) {
      console.log('⚠️  No voucher batches available. Skipping test.');
      test.skip();
      return;
    }
    
    // Tick the batches checkboxes from the batch listings (Choose at least 1 batch)
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(500);
      
      if (checkboxCount > 1) {
        await checkboxes.nth(1).check();
        await page.waitForTimeout(500);
      }
    }
    
    // Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Report")');
    const download = await downloadPromise;
    
    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    
    // View the downloaded csv file
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('TC_REPORT003: [Inventory page] Download inventory report', async ({ page }) => {
    // Navigate to Inventory page
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if there are inventory items available
    const emptyState = await page.locator('text="No inventory items found"').count();
    
    if (emptyState > 0) {
      console.log('⚠️  No inventory items available. Skipping test.');
      test.skip();
      return;
    }
    
    // Tick the voucher checkboxes from the inventory listings (Choose at least 1 voucher)
    const checkboxes = page.locator('table tbody tr input[type="checkbox"], input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      await checkboxes.first().check();
      await page.waitForTimeout(1000);
    }
    
    // Click the Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Report")');
    const download = await downloadPromise;
    
    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    
    // View the downloaded csv file
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('TC_REPORT004: [Cart page] Download quotation without selecting any cart items', async ({ page }) => {
    // Navigate to cart page
    await page.goto(`${PUBLIC_WEB.URL}cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if cart is empty
    const emptyCart = await page.locator('text="Your cart is empty"').count();
    
    if (emptyCart > 0) {
      console.log('⚠️  Cart is empty. Adding an item first...');
      
      // Add an item to cart
      await page.goto(`${PUBLIC_WEB.URL}buy`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const voucher = page.locator('a[href*="/products/"]').first();
      await voucher.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.click('button:has-text("Add to Cart")');
      await page.waitForTimeout(2000);
      
      // Go back to cart
      await page.goto(`${PUBLIC_WEB.URL}cart`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Uncheck all items if any are checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    const count = await checkedBoxes.count();
    
    for (let i = 0; i < count; i++) {
      await checkedBoxes.first().uncheck();
      await page.waitForTimeout(300);
    }
    
    // Click the Get Quotation button
    await page.click('button:has-text("Get Quotation")');
    await page.waitForTimeout(1500);
    
    // Expected Result: Report failed to download. Error message "Please select an item to generate a quotation"
    const errorMessage = page.locator('status, [role="status"], [role="alert"]').filter({ hasText: 'Please select an item to generate a quotation' });
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('TC_REPORT005: [Cart page] Download quotation and select multiple vouchers', async ({ page }) => {
    // Navigate to cart page
    await page.goto(`${PUBLIC_WEB.URL}cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if cart is empty
    const emptyCart = await page.locator('text="Your cart is empty"').count();
    
    if (emptyCart > 0) {
      console.log('⚠️  Cart is empty. Adding items first...');
      
      // Add items to cart
      await page.goto(`${PUBLIC_WEB.URL}buy`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Add first item
      const firstVoucher = page.locator('a[href*="/products/"]').first();
      await firstVoucher.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.click('button:has-text("Add to Cart")');
      await page.waitForTimeout(2000);
      
      // Try to add second item
      await page.goto(`${PUBLIC_WEB.URL}buy`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const secondVoucher = page.locator('a[href*="/products/"]').nth(1);
      if (await secondVoucher.count() > 0) {
        await secondVoucher.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Add to Cart")');
        await page.waitForTimeout(2000);
      }
      
      // Go back to cart
      await page.goto(`${PUBLIC_WEB.URL}cart`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Tick the item checkboxes from the cart list (Choose at least 1 item)
    // Skip the "Select All" checkbox by using nth(1) for first item
    const itemCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await itemCheckboxes.count();
    
    if (checkboxCount > 1) {
      // Check first item (skip Select All which is at index 0)
      await itemCheckboxes.nth(1).check();
      await page.waitForTimeout(500);
      
      // Check second item if available
      if (checkboxCount > 2) {
        await itemCheckboxes.nth(2).check();
        await page.waitForTimeout(500);
      }
    }
    
    // Click the Get Quotation button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Get Quotation")');
    const download = await downloadPromise;
    
    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.pdf$|\.csv$/);
    
    // Observe
    const path = await download.path();
    expect(path).toBeTruthy();
  });
});
