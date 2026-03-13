import { test, expect } from '@playwright/test';
import { PUBLIC_WEB } from '../../utils/test-data';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

test.describe('Public Web - Reports', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new PublicLoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('TC_REPORT001: [Send Voucher page] Download send voucher report for a specific batch', async ({ page }) => {
    // 1. Navigate to Send Voucher page
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Wait for batches to load - wait for table or empty state
    // The page shows "Loading voucher batches..." then either a table or empty state
    await page.waitForSelector('table, text="No voucher batches found"', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Check if there are batches available
    const batchRows = page.getByRole('row').filter({ has: page.getByRole('link', { name: 'View Report' }) });
    const batchCount = await batchRows.count();

    if (batchCount === 0) {
      console.log('⚠️  No voucher batches available. Skipping test.');
      test.skip();
      return;
    }

    // 2. Select a batch - click View Report link on first batch
    await batchRows.first().getByRole('link', { name: 'View Report' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Now on batch detail/progress page
    await expect(page.getByRole('heading', { name: 'Batch Details' })).toBeVisible();

    // 3. Click Download Report button (enabled on batch detail page)
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: 'Download Report' }).click();
    const download = await downloadPromise;

    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('TC_REPORT002: [Send Voucher page] Download send voucher report for multiple batches', async ({ page }) => {
    // 1. Navigate to Send Voucher page
    await page.goto(`${PUBLIC_WEB.URL}send-voucher`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Wait for batches to load
    await page.waitForSelector('table, text="No voucher batches found"', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Check if there are batches available
    const batchRows = page.getByRole('row').filter({ has: page.getByRole('link', { name: 'View Report' }) });
    const batchCount = await batchRows.count();

    if (batchCount === 0) {
      console.log('⚠️  No voucher batches available. Skipping test.');
      test.skip();
      return;
    }

    // 2. Tick the batches checkboxes (Choose at least 1 batch)
    // Check first batch checkbox
    await batchRows.first().getByRole('checkbox').check();
    await page.waitForTimeout(500);

    // Check second batch if available
    if (batchCount > 1) {
      await batchRows.nth(1).getByRole('checkbox').check();
      await page.waitForTimeout(500);
    }

    // Verify Download Report button is now enabled
    const downloadButton = page.getByRole('button', { name: 'Download Report' });
    await expect(downloadButton).toBeEnabled();

    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await downloadButton.click();
    const download = await downloadPromise;

    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('TC_REPORT003: [Inventory page] Download inventory report', async ({ page }) => {
    // 1. Navigate to Inventory page
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    await page.waitForLoadState('networkidle');

    // Wait for inventory to load
    const loading = page.getByText('Loading inventory items...');
    if (await loading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await loading.waitFor({ state: 'hidden', timeout: 30000 });
    }
    await page.waitForTimeout(2000);

    // Check if there are inventory items available
    // Inventory rows have checkboxes and voucher names
    const inventoryRows = page.locator('table').last().getByRole('row');
    const rowCount = await inventoryRows.count();

    if (rowCount === 0) {
      console.log('⚠️  No inventory items available. Skipping test.');
      test.skip();
      return;
    }

    // 2. Tick the voucher checkboxes from the inventory listings (Choose at least 1 voucher)
    await inventoryRows.first().getByRole('checkbox').check();
    await page.waitForTimeout(1000);

    // Verify Download Report button is now enabled
    const downloadButton = page.getByRole('button', { name: 'Download Report' });
    await expect(downloadButton).toBeEnabled();

    // 3. Click the Download Report button
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await downloadButton.click();
    const download = await downloadPromise;

    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('TC_REPORT004: [Cart page] Download quotation without selecting any cart items', async ({ page }) => {
    // 1. Navigate to cart page
    await page.goto(`${PUBLIC_WEB.URL}cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if cart has items - look for "Select All" checkbox which only appears when items exist
    const selectAll = page.getByRole('checkbox', { name: 'Select All' });
    const hasItems = await selectAll.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasItems) {
      // Cart is empty - add an item first
      console.log('⚠️  Cart is empty. Adding an item first...');
      await page.goto(`${PUBLIC_WEB.URL}buy`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Click on Automation Test Voucher
      const voucher = page.locator('a[href*="/products/"]').filter({
        hasText: /AUTOMATION TEST VOUCHER(?!\s*1)/i
      }).first();
      await voucher.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Click Add to Cart
      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await page.waitForTimeout(2000);

      // Go back to cart
      await page.goto(`${PUBLIC_WEB.URL}cart`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // 2. Uncheck all items - uncheck "Select All" if it's checked
    const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select All' });
    if (await selectAllCheckbox.isChecked()) {
      await selectAllCheckbox.uncheck();
      await page.waitForTimeout(500);
    }

    // 3. Click the Get Quotation button
    await page.getByRole('button', { name: 'Get Quotation' }).click();
    await page.waitForTimeout(1500);

    // Expected Result: Error message "Please select an item to generate a quotation"
    await expect(page.getByRole('status')).toContainText('Please select an item to generate a quotation');
  });

  test('TC_REPORT005: [Cart page] Download quotation and select multiple vouchers', async ({ page }) => {
    // 1. Navigate to cart page
    await page.goto(`${PUBLIC_WEB.URL}cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if cart has items
    const selectAll = page.getByRole('checkbox', { name: 'Select All' });
    const hasItems = await selectAll.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasItems) {
      // Cart is empty - add items first
      console.log('⚠️  Cart is empty. Adding items first...');
      await page.goto(`${PUBLIC_WEB.URL}buy`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const voucher = page.locator('a[href*="/products/"]').filter({
        hasText: /AUTOMATION TEST VOUCHER(?!\s*1)/i
      }).first();
      await voucher.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await page.waitForTimeout(2000);

      // Go back to cart
      await page.goto(`${PUBLIC_WEB.URL}cart`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // 2. Ensure items are selected - check "Select All"
    const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select All' });
    if (!(await selectAllCheckbox.isChecked())) {
      await selectAllCheckbox.check();
      await page.waitForTimeout(500);
    }

    // 3. Click the Get Quotation button
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.getByRole('button', { name: 'Get Quotation' }).click();
    const download = await downloadPromise;

    // Expected Result: Report downloaded successfully
    expect(download.suggestedFilename()).toMatch(/\.(pdf|csv|xlsx)$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });
});
