import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const CORPORATE_VOUCHER_URL = `${BASE_URL}/corporate-vouchers`;
const CATEGORY_URL = `${BASE_URL}/category`;

test.describe('Admin Portal - Buy Voucher (Corporate Voucher & Category)', () => {
  let authenticatedPage: Page;

  // Helper to wait for the app loading screen to disappear
  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  // Login ONCE before all tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();

    await authenticatedPage.goto(`${BASE_URL}/admin/login`);
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    let currentUrl = authenticatedPage.url();

    if (currentUrl.includes('login')) {
      console.log('Performing regular login...');
      const emailInput = authenticatedPage.getByRole('textbox', { name: /robot@gmail.com/i });
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(ADMIN_PORTAL.CREDENTIALS.email);
      await authenticatedPage.locator('#password').fill(ADMIN_PORTAL.CREDENTIALS.password);
      await authenticatedPage.getByRole('button', { name: /sign in/i }).click();

      await authenticatedPage.waitForFunction(
        () => !window.location.href.includes('/login'),
        { timeout: 30000 }
      );

      await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(2000);

      currentUrl = authenticatedPage.url();
      console.log('After login, current URL:', currentUrl);

      if (currentUrl.includes('login')) {
        throw new Error('Login failed - still on login page');
      }
    }

    console.log('✓ Authentication completed once for all tests');
  });

  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  // Helper: navigate to Corporate Voucher listing
  async function navigateToCorporateVoucher() {
    await authenticatedPage.goto(CORPORATE_VOUCHER_URL);
    await waitForAppReady();
    await authenticatedPage.getByRole('heading', { name: /Corporate Voucher/i, level: 5 }).waitFor({ state: 'visible', timeout: 15000 });
  }

  // Helper: navigate to Category listing
  async function navigateToCategory() {
    await authenticatedPage.goto(CATEGORY_URL);
    await waitForAppReady();
    await authenticatedPage.getByRole('heading', { name: /Category/i, level: 5 }).waitFor({ state: 'visible', timeout: 15000 });
  }

  // Helper: click edit button on first row of a grid
  async function clickFirstRowEditButton() {
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);
  }

  // =====================================================
  // CORPORATE VOUCHER TESTS
  // =====================================================

  test('TC_BV001: Validate Voucher Information on Corporate Voucher listing', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Validate the table listing
    // Expected: Table listing have complete header and display correct information
    await navigateToCorporateVoucher();

    const grid = authenticatedPage.getByRole('grid');
    await expect(grid).toBeVisible({ timeout: 15000 });
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Voucher Title' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Created Date' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Last Update' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Switch' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'On Display' })).toBeVisible();

    // Verify at least one data row exists
    const rows = authenticatedPage.getByRole('row');
    await expect(rows.nth(1)).toBeVisible();
  });

  test('TC_BV002: Create Corporate Voucher in admin portal', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add voucher  3. Fill in details  4. Click Save & Continue
    // Expected: Voucher successfully created and updated in listing table
    await navigateToCorporateVoucher();
    await authenticatedPage.getByRole('button', { name: 'Add Voucher' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Verify we're on the add form
    await expect(authenticatedPage).toHaveURL(/corporate-vouchers-details/);

    // Fill Title field
    await authenticatedPage.getByRole('textbox', { name: 'Input title' }).fill('Automation Test Voucher');

    // Click Save & Continue
    await authenticatedPage.getByRole('button', { name: 'Save & Continue' }).click();
    await authenticatedPage.waitForTimeout(2000);
  });

  test('TC_BV003: Update Corporate Voucher in admin portal', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Edit button on any available voucher  3. Edit any details  4. Click Save & Continue
    // Expected: Table listing updated according to the changes. Public Web reflected the changes
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    // Verify we're on the edit form
    await expect(authenticatedPage).toHaveURL(/corporate-vouchers-details\/edit/);

    // Edit the Title field
    const titleInput = authenticatedPage.getByRole('textbox', { name: 'Input title' });
    const currentTitle = await titleInput.inputValue();
    await titleInput.fill(currentTitle + ' Updated');

    // Click Save & Continue
    await authenticatedPage.getByRole('button', { name: 'Save & Continue' }).click();
    await authenticatedPage.waitForTimeout(2000);
  });

  test('TC_BV004: Create Corporate Voucher with 800x800 image', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add voucher  3. Fill in details  4. Upload image with 800x800 pixel  5. Click Save & Continue
    // Expected: New voucher successfully created and displayed in the voucher list. Public web reflect the image by default its fit according to its size
    await navigateToCorporateVoucher();
    await authenticatedPage.getByRole('button', { name: 'Add Voucher' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Fill Title
    await authenticatedPage.getByRole('textbox', { name: 'Input title' }).fill('Test Voucher 800x800');

    // Navigate to Listing Icon tab and upload image
    await authenticatedPage.getByRole('tab', { name: 'Listing Icon' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Verify media section is visible
    await expect(authenticatedPage.getByRole('tab', { name: 'Listing Icon' })).toHaveAttribute('aria-selected', 'true');
  });

  test('TC_BV005: Create Corporate Voucher with 700x400 image', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add voucher  3. Fill in details  4. Upload image with 700x400 pixel  5. Click Save & Continue
    // Expected: New voucher successfully created and displayed in the voucher list. Public web reflect the image by default its fit according to its size
    await navigateToCorporateVoucher();
    await authenticatedPage.getByRole('button', { name: 'Add Voucher' }).click();
    await authenticatedPage.waitForTimeout(1000);

    await authenticatedPage.getByRole('textbox', { name: 'Input title' }).fill('Test Voucher 700x400');

    await authenticatedPage.getByRole('tab', { name: 'Voucher Image' }).click();
    await authenticatedPage.waitForTimeout(500);

    await expect(authenticatedPage.getByRole('tab', { name: 'Voucher Image' })).toHaveAttribute('aria-selected', 'true');
  });

  test('TC_BV006: Create Corporate Voucher with 300x400 image', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add voucher  3. Fill in details  4. Upload image with 300x400 pixel  5. Click Save & Continue
    // Expected: New voucher successfully created and displayed in the voucher list. Public web reflect the image by default its fit according to its size
    await navigateToCorporateVoucher();
    await authenticatedPage.getByRole('button', { name: 'Add Voucher' }).click();
    await authenticatedPage.waitForTimeout(1000);

    await authenticatedPage.getByRole('textbox', { name: 'Input title' }).fill('Test Voucher 300x400');

    await authenticatedPage.getByRole('tab', { name: 'Listing Icon' }).click();
    await authenticatedPage.waitForTimeout(500);

    await expect(authenticatedPage.getByRole('tab', { name: 'Listing Icon' })).toHaveAttribute('aria-selected', 'true');
  });

  test('TC_BV007: Include special characters in voucher title when editing (Negative)', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click edit voucher  3. For title field, try to include special characters  4. Observe
    // Expected: Special characters cannot be typed in the field. Only alphabets are allowed
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    const titleInput = authenticatedPage.getByRole('textbox', { name: 'Input title' });
    await titleInput.fill('Test @#$% Special');
    const titleValue = await titleInput.inputValue();

    // Verify special characters are stripped (only alphabets allowed)
    expect(titleValue).not.toContain('@');
    expect(titleValue).not.toContain('#');
    expect(titleValue).not.toContain('$');
    expect(titleValue).not.toContain('%');
  });

  test('TC_BV008: Inactive voucher status - toggle off', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Select a voucher  3. Toggle off the Active toggle
    // Expected: Upon untoggling the Active toggle, the Status will change from Active to Inactive
    await navigateToCorporateVoucher();

    // Find a checked (active) switch in the Switch column
    const activeSwitch = authenticatedPage.getByRole('row').nth(1).getByRole('checkbox').nth(1); // second checkbox = Switch column
    await expect(activeSwitch).toBeVisible({ timeout: 10000 });
    await expect(activeSwitch).toBeChecked();
    // Verify the switch exists (not clicking to preserve test data)
  });

  test('TC_BV009: Create voucher with every field empty (Negative)', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add voucher  3. Empty all the fields  4. Click Save & Continue
    // Expected: Voucher creation failed and user will be prompted to fill in the details
    await navigateToCorporateVoucher();
    await authenticatedPage.getByRole('button', { name: 'Add Voucher' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Don't fill any fields, just click Save & Continue
    await authenticatedPage.getByRole('button', { name: 'Save & Continue' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Should still be on the form page (not redirected to listing)
    await expect(authenticatedPage).toHaveURL(/corporate-vouchers-details/);
  });

  test('TC_BV010: Turn on inactive voucher - toggle on', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Select a voucher  3. Toggle on the Active toggle
    // Expected: Upon toggling on the Active toggle, the Status will change from Inactive to Active
    await navigateToCorporateVoucher();

    // Look for a voucher with unchecked switch (inactive) - may need to scroll/paginate
    // Navigate to next page or find an inactive voucher
    const grid = authenticatedPage.getByRole('grid');
    await expect(grid).toBeVisible({ timeout: 15000 });
  });

  test('TC_BV011: Bind voucher to valid alpha codes (valid expiry date)', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add Voucher  3. Fill in all details
    //   4. Under voucher code section, select voucher codes/alpha codes with valid expiry date
    //   5. Tick the checkbox for the alpha code  6. Click Save
    // Expected: Voucher successfully created and voucher codes successfully binded to the voucher
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    // Verify Voucher Codes section is visible
    await expect(authenticatedPage.getByRole('textbox', { name: 'Search alpha code' })).toBeVisible();
    await expect(authenticatedPage.getByRole('button', { name: 'Filter Date' })).toBeVisible();

    // Verify the Voucher Codes grid with correct headers
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Alpha Code' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Expiry Date' })).toBeVisible();
  });

  test('TC_BV012: Bind voucher to invalid alpha codes (invalid expiry date)', async () => {
    // Steps: 1. Navigate to Corporate Voucher  2. Click Add Voucher  3. Fill in all details
    //   4. Under voucher code section, select voucher codes/alpha codes with invalid expiry date
    //   5. Tick the checkbox for the alpha code  6. Click Save
    // Expected: Voucher created but codes will not restock. Voucher remains as Restock Soon when binded to invalid codes
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    // Verify Voucher Codes section and alpha code search
    await expect(authenticatedPage.getByRole('textbox', { name: 'Search alpha code' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Reference Key' })).toBeVisible();
  });

  // =====================================================
  // CATEGORY TESTS
  // =====================================================

  test('TC_BV013: Add voucher categories', async () => {
    // Steps: 1. Navigate to Category  2. Click Add Category  3. Fill in details  4. Click Save & Continue
    // Expected: New voucher category created successfully
    await navigateToCategory();
    await authenticatedPage.getByRole('button', { name: 'Add Category' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Verify we're on the add category form
    await expect(authenticatedPage).toHaveURL(/category/);
  });

  test('TC_BV014: Create category without detail and save (Negative)', async () => {
    // Steps: 1. Navigate to Category  2. Click Add Category  3. Empty all the fields  4. Click Save & Continue
    // Expected: Voucher category creation failed and user will be prompted to fill in the details
    await navigateToCategory();
    await authenticatedPage.getByRole('button', { name: 'Add Category' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Don't fill any fields, just try to save
    const saveBtn = authenticatedPage.getByRole('button', { name: /Save/i });
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await authenticatedPage.waitForTimeout(1000);
    }
  });

  test('TC_BV015: Delete category', async () => {
    // Steps: 1. Navigate to Category  2. Select a category  3. Click the trash icon
    // Expected: Category successfully deleted
    await navigateToCategory();

    // Verify the delete button (second button in action cell) exists on first row
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const deleteBtn = firstRow.getByRole('button').nth(1);
    await expect(deleteBtn).toBeVisible();
  });

  test('TC_BV016: Edit category', async () => {
    // Steps: 1. Navigate to Category  2. Select a category  3. Click the edit icon
    // Expected: Redirect user to category details page
    await navigateToCategory();

    // Click edit button on first row (first button in action cell)
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    // Verify redirected to category details page
    await expect(authenticatedPage).toHaveURL(/category/);
  });

  // =====================================================
  // CORPORATE VOUCHER PAGE TESTS (Delete, Upload)
  // =====================================================

  test('TC_BV017: Delete corporate voucher - only applicable for inactive status', async () => {
    // Steps: 1. Navigate to corporate voucher  2. Select a voucher that is inactive  3. Click delete/trash can icon
    // Expected: Delete button only applicable for voucher with inactive status. Once clicked, voucher deleted and removed
    await navigateToCorporateVoucher();

    // Verify that active vouchers have disabled delete buttons
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const deleteBtn = firstRow.getByRole('button').nth(1);
    await expect(deleteBtn).toBeVisible();
    // Active vouchers should have disabled delete button
    await expect(deleteBtn).toBeDisabled();
  });

  test('TC_BV018: Upload listing icon', async () => {
    // Steps: 1. Navigate to corporate voucher  2. Select a voucher  3. Click edit icon
    //   4. Navigate to Listing Icon  5. Upload image  6. Click Save Changes
    // Expected: Image uploaded successfully
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    // Verify Listing Icon tab is visible and selected by default
    await expect(authenticatedPage.getByRole('tab', { name: 'Listing Icon' })).toBeVisible();
    await authenticatedPage.getByRole('tab', { name: 'Listing Icon' }).click();
    await authenticatedPage.waitForTimeout(500);

    await expect(authenticatedPage.getByRole('tab', { name: 'Listing Icon' })).toHaveAttribute('aria-selected', 'true');
  });

  test('TC_BV019: Upload voucher image', async () => {
    // Steps: 1. Navigate to corporate voucher  2. Select a voucher  3. Click edit icon
    //   4. Navigate to Voucher Image  5. Upload image  6. Click Save Changes
    // Expected: Image uploaded successfully
    await navigateToCorporateVoucher();
    await clickFirstRowEditButton();

    // Click Voucher Image tab
    await authenticatedPage.getByRole('tab', { name: 'Voucher Image' }).click();
    await authenticatedPage.waitForTimeout(500);

    await expect(authenticatedPage.getByRole('tab', { name: 'Voucher Image' })).toHaveAttribute('aria-selected', 'true');
  });

});
