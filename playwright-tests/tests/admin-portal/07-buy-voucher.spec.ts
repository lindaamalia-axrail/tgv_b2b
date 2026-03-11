import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';
import { ADMIN_LOCALSTORAGE_TOKENS } from '../../utils/auth-helper';

test.describe.configure({ mode: 'serial' });

test.describe('Admin Portal - Buy Voucher', () => {
  let authenticatedPage: Page;

  // Login ONCE before all tests in this file
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();
    
    // Navigate to the site
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/'));
    
    // Inject localStorage tokens
    await authenticatedPage.evaluate((tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        // @ts-ignore - window exists in browser context
        window.localStorage.setItem(key, value);
      }
    }, ADMIN_LOCALSTORAGE_TOKENS);
    
    // Reload to apply the tokens
    await authenticatedPage.reload();
    
    // Wait for auth to be applied
    await authenticatedPage.waitForTimeout(2000);
    
    console.log('✓ Authentication completed once for all tests in this file');
  });

  // Close the page after all tests
  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  // Helper function to navigate to Voucher Management
  async function navigateToVoucherManagement() {
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', ''));
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Click hamburger menu
    await authenticatedPage.click('.MuiIconButton-root:has(svg)');
    await authenticatedPage.waitForTimeout(1000);
    
    // Wait for sidebar to be visible
    await authenticatedPage.waitForSelector('text=Voucher Management', { state: 'visible', timeout: 5000 });
    
    // Click Voucher Management
    await authenticatedPage.click('text=Voucher Management');
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  test('TC_VD001: Validate voucher information on detail page', async () => {
    await navigateToVoucherManagement();
    
    // Click on first voucher to view details
    await authenticatedPage.locator('tr').filter({ hasText: /voucher/i }).first().click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Verify voucher detail page displays all required information
    await expect(authenticatedPage.locator('text=/voucher name|title/i').first()).toBeVisible();
    await expect(authenticatedPage.locator('text=/price|amount/i').first()).toBeVisible();
    await expect(authenticatedPage.locator('text=/description/i').first()).toBeVisible();
    await expect(authenticatedPage.locator('img').first()).toBeVisible();
  });

  test('TC_VD002: Create new voucher with valid details', async () => {
    await navigateToVoucherManagement();
    
    // Click Add/Create button
    await authenticatedPage.click('button:has-text("Add"), button:has-text("Create")');
    await authenticatedPage.waitForTimeout(500);
    
    // Fill in voucher details
    await authenticatedPage.fill('input[name="name"], input[name="title"]', 'Test Voucher');
    await authenticatedPage.fill('input[name="price"], input[name="amount"]', '100');
    await authenticatedPage.fill('textarea[name="description"]', 'Test voucher description');
    
    // Upload image
    const fileInput = authenticatedPage.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('test-data/voucher-image.jpg');
    }
    
    // Save
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Submit")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success message
    await expect(authenticatedPage.locator('text=/success|created/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD003: Create voucher with empty required fields', async () => {
    await navigateToVoucherManagement();
    
    // Click Add/Create button
    await authenticatedPage.click('button:has-text("Add"), button:has-text("Create")');
    await authenticatedPage.waitForTimeout(500);
    
    // Try to save without filling required fields
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Submit")');
    await authenticatedPage.waitForTimeout(1000);
    
    // Verify validation error messages
    await expect(authenticatedPage.locator('text=/required|mandatory/i').first()).toBeVisible();
  });

  test('TC_VD004: Upload voucher image with valid dimensions', async () => {
    await navigateToVoucherManagement();
    
    // Click Add/Create button
    await authenticatedPage.click('button:has-text("Add"), button:has-text("Create")');
    await authenticatedPage.waitForTimeout(500);
    
    // Fill basic details
    await authenticatedPage.fill('input[name="name"], input[name="title"]', 'Voucher with Image');
    await authenticatedPage.fill('input[name="price"], input[name="amount"]', '150');
    
    // Upload image with valid dimensions (e.g., 800x800)
    const fileInput = authenticatedPage.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('test-data/image-800x800.jpg');
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // Save
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Submit")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|created/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD005: Update voucher details', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button on first voucher
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Update voucher name
    const nameInput = authenticatedPage.locator('input[name="name"], input[name="title"]');
    await nameInput.fill('Updated Voucher Name');
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success message
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD006: Set voucher status as inactive', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button on first active voucher
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Toggle status to inactive
    const statusToggle = authenticatedPage.locator('input[type="checkbox"][name="active"], input[type="checkbox"][name="status"]');
    if (await statusToggle.isChecked()) {
      await statusToggle.click();
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify status changed to inactive
    await expect(authenticatedPage.locator('text=/inactive/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD007: Activate expired voucher', async () => {
    await navigateToVoucherManagement();
    
    // Find expired voucher
    const expiredVoucher = authenticatedPage.locator('tr:has-text("Expired")').first();
    
    if (await expiredVoucher.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expiredVoucher.locator('button[aria-label="Edit"]').click();
      await authenticatedPage.waitForTimeout(500);
      
      // Try to activate
      const statusToggle = authenticatedPage.locator('input[type="checkbox"][name="active"]');
      if (!await statusToggle.isChecked()) {
        await statusToggle.click();
      }
      
      // Save
      await authenticatedPage.click('button:has-text("Save")');
      await authenticatedPage.waitForTimeout(2000);
      
      // Verify error message about expired voucher
      await expect(authenticatedPage.locator('text=/cannot activate expired|expired voucher/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC_VD008: Edit voucher price', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Update price
    const priceInput = authenticatedPage.locator('input[name="price"], input[name="amount"]');
    await priceInput.fill('250');
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD009: Change voucher validity dates - valid range', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Update validity dates
    const startDate = authenticatedPage.locator('input[name="startDate"], input[name="validFrom"]');
    const endDate = authenticatedPage.locator('input[name="endDate"], input[name="validTo"]');
    
    if (await startDate.isVisible()) {
      await startDate.fill('2024-01-01');
      await endDate.fill('2024-12-31');
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD010: Change voucher validity dates - invalid range', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Set invalid date range (end date before start date)
    const startDate = authenticatedPage.locator('input[name="startDate"], input[name="validFrom"]');
    const endDate = authenticatedPage.locator('input[name="endDate"], input[name="validTo"]');
    
    if (await startDate.isVisible()) {
      await startDate.fill('2024-12-31');
      await endDate.fill('2024-01-01');
    }
    
    // Try to save
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(1000);
    
    // Verify error message
    await expect(authenticatedPage.locator('text=/invalid|start date.*end date|end date.*start date/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD011: Set voucher quantity/stock', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Update quantity/stock
    const quantityInput = authenticatedPage.locator('input[name="quantity"], input[name="stock"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('100');
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD012: Set voucher as out of stock', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Set quantity to 0 or mark as out of stock
    const quantityInput = authenticatedPage.locator('input[name="quantity"], input[name="stock"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('0');
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify out of stock status
    await expect(authenticatedPage.locator('text=/out of stock|stock.*0/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD013: Delete voucher', async () => {
    await navigateToVoucherManagement();
    
    // Get initial voucher count
    const initialCount = await authenticatedPage.locator('tr').filter({ hasText: /voucher/i }).count();
    
    // Click Delete button on last voucher
    await authenticatedPage.locator('button[aria-label="Delete"]').last().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Confirm deletion
    await authenticatedPage.click('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify deletion success
    await expect(authenticatedPage.locator('text=/deleted|removed/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD014: Update voucher category', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Update category
    const categorySelect = authenticatedPage.locator('select[name="category"], [role="combobox"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD015: Add voucher terms and conditions', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Add terms and conditions
    const termsTextarea = authenticatedPage.locator('textarea[name="terms"], textarea[name="termsAndConditions"]');
    if (await termsTextarea.isVisible()) {
      await termsTextarea.fill('Test terms and conditions for this voucher');
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_VD016: Set voucher discount percentage', async () => {
    await navigateToVoucherManagement();
    
    // Click Edit button
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // Set discount percentage
    const discountInput = authenticatedPage.locator('input[name="discount"], input[name="discountPercentage"]');
    if (await discountInput.isVisible()) {
      await discountInput.fill('10');
    }
    
    // Save changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Update")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify success
    await expect(authenticatedPage.locator('text=/success|updated/i').first()).toBeVisible({ timeout: 5000 });
  });

  // Corporate Voucher Page Tests
  test('TC_CV001: Delete corporate voucher - only applicable for inactive status', async () => {
    await navigateToVoucherManagement();
    
    // Navigate to Corporate Voucher page
    const corporateTab = authenticatedPage.locator('text=/corporate voucher/i, button:has-text("Corporate")');
    if (await corporateTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await corporateTab.click();
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // 1. Navigate to corporate voucher
    // 2. Select a voucher that is inactive
    const inactiveVoucher = authenticatedPage.locator('tr:has-text("Inactive")').first();
    
    if (await inactiveVoucher.isVisible({ timeout: 3000 }).catch(() => false)) {
      // 3. Click delete/trash icon
      await inactiveVoucher.locator('button[aria-label="Delete"]').click();
      await authenticatedPage.waitForTimeout(500);
      
      // Verify delete button is available for inactive voucher
      const confirmButton = authenticatedPage.locator('button:has-text("Confirm"), button:has-text("Delete")');
      await expect(confirmButton).toBeVisible();
      
      // Confirm deletion
      await confirmButton.click();
      await authenticatedPage.waitForTimeout(2000);
      
      // Verify voucher deleted and removed
      await expect(authenticatedPage.locator('text=/deleted|removed/i').first()).toBeVisible({ timeout: 5000 });
    } else {
      // Try to delete an active voucher - should not be allowed
      const activeVoucher = authenticatedPage.locator('tr:has-text("Active")').first();
      if (await activeVoucher.isVisible({ timeout: 3000 }).catch(() => false)) {
        const deleteButton = activeVoucher.locator('button[aria-label="Delete"]');
        // Verify delete button is disabled or not visible for active voucher
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeDisabled();
        }
      }
    }
  });

  test('TC_CV002: Upload listing icon - image uploaded successfully', async () => {
    await navigateToVoucherManagement();
    
    // Navigate to Corporate Voucher page
    const corporateTab = authenticatedPage.locator('text=/corporate voucher/i, button:has-text("Corporate")');
    if (await corporateTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await corporateTab.click();
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // 1. Navigate to corporate voucher
    // 2. Select a voucher
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // 3. Click edit icon
    // 4. Navigate to Listing Icon
    const listingIconTab = authenticatedPage.locator('text=/listing icon/i, button:has-text("Listing Icon")');
    if (await listingIconTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listingIconTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
    
    // 5. Upload image
    const fileInput = authenticatedPage.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('test-data/listing-icon.jpg');
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // 6. Click Save Changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Save Changes")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify image uploaded successfully
    await expect(authenticatedPage.locator('text=/success|uploaded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC_CV003: Upload voucher image - image uploaded successfully', async () => {
    await navigateToVoucherManagement();
    
    // Navigate to Corporate Voucher page
    const corporateTab = authenticatedPage.locator('text=/corporate voucher/i, button:has-text("Corporate")');
    if (await corporateTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await corporateTab.click();
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // 1. Navigate to corporate voucher
    // 2. Select a voucher
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.waitForTimeout(500);
    
    // 3. Click edit icon
    // 4. Navigate to Listing Icon (or main voucher image section)
    const listingIconTab = authenticatedPage.locator('text=/listing icon/i, button:has-text("Listing Icon")');
    if (await listingIconTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await listingIconTab.click();
      await authenticatedPage.waitForTimeout(500);
    }
    
    // 5. Upload image
    const fileInput = authenticatedPage.locator('input[type="file"]').last();
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles('test-data/voucher-image.jpg');
      await authenticatedPage.waitForTimeout(1000);
    }
    
    // 6. Click Save Changes
    await authenticatedPage.click('button:has-text("Save"), button:has-text("Save Changes")');
    await authenticatedPage.waitForTimeout(2000);
    
    // Verify image uploaded successfully
    await expect(authenticatedPage.locator('text=/success|uploaded/i').first()).toBeVisible({ timeout: 5000 });
  });
});
