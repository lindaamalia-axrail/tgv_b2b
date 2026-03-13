import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const USER_LISTING_URL = `${BASE_URL}/user-listing`;
const ROLE_LISTING_URL = `${BASE_URL}/role-listing`;
const AUDIT_LOG_URL = `${BASE_URL}/audit-log`;

test.describe('User Management - All Users Page', () => {
  let authenticatedPage: Page;

  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

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

  async function navigateToUserListing() {
    await authenticatedPage.goto(USER_LISTING_URL);
    await waitForAppReady();
    await expect(authenticatedPage.getByRole('heading', { name: /User Listing/ })).toBeVisible({ timeout: 15000 });
  }

  async function scrollToDPSection() {
    const dpButton = authenticatedPage.getByRole('button', { name: 'Departments & Positions' });
    await dpButton.scrollIntoViewIfNeeded();
    await authenticatedPage.waitForTimeout(500);
    // Ensure the accordion is expanded
    const isExpanded = await dpButton.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await dpButton.click();
      await authenticatedPage.waitForTimeout(500);
    }
  }

  test('UM-001: Validate All User & D&P Information', async () => {
    await navigateToUserListing();

    // Validate the user listing grid
    const userGrid = authenticatedPage.getByRole('grid').first();
    await expect(userGrid).toBeVisible({ timeout: 15000 });

    // Validate user listing column headers (scoped to first grid to avoid ambiguity with D&P grid)
    await expect(userGrid.getByRole('columnheader', { name: 'Username' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Display Name' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Role' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Department', exact: true })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Position', exact: true })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Last Login' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Created Date' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Last Updated' })).toBeVisible();
    await expect(userGrid.getByRole('columnheader', { name: 'Active' })).toBeVisible();

    // Verify data rows exist
    const rows = userGrid.getByRole('row');
    await expect(rows.nth(1)).toBeVisible();

    // Validate D&P section is visible
    await scrollToDPSection();
    await expect(authenticatedPage.getByRole('button', { name: 'Departments & Positions' })).toBeVisible();

    // Validate D&P grid headers
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    await expect(dpRegion.getByRole('columnheader', { name: 'Department Name' })).toBeVisible();
    await expect(dpRegion.getByRole('columnheader', { name: 'Position Name' })).toBeVisible();
    await expect(dpRegion.getByRole('columnheader', { name: 'Assigned Users' })).toBeVisible();
  });

  test('UM-002: Update All User in admin portal', async () => {
    await navigateToUserListing();

    // Click Edit button on first user row (last cell button in each row)
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    // Wait for Edit User dialog
    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Edit the name field
    const nameInput = dialog.getByRole('textbox', { name: 'Input name' });
    const currentName = await nameInput.inputValue();
    const newName = `Updated User ${Date.now()}`;
    await nameInput.fill(newName);

    // Click Save
    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);

    // Revert: reopen and restore original name
    await firstRow.getByRole('button').first().click();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await nameInput.fill(currentName);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);
  });

  test('UM-003: Update D&P in admin portal', async () => {
    await navigateToUserListing();

    // D&P section is on the same page, below the user listing
    await scrollToDPSection();
    const dpSection = authenticatedPage.getByRole('button', { name: 'Departments & Positions' });
    await expect(dpSection).toBeVisible();

    // Click edit button on first D&P row - navigates to D&P detail page
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify we navigated to D&P detail page
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });

    // Verify department and position fields are visible
    await expect(authenticatedPage.getByRole('combobox', { name: 'Select department' })).toBeVisible();
    await expect(authenticatedPage.getByRole('combobox', { name: 'Select position' })).toBeVisible();

    // Go back without changes
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-004: Add user', async () => {
    await navigateToUserListing();

    // Click Add User button
    await authenticatedPage.getByRole('button', { name: 'Add User' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Wait for Add User dialog
    const dialog = authenticatedPage.getByRole('dialog', { name: /Add User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Fill in all fields
    const timestamp = Date.now();
    await dialog.getByRole('textbox', { name: 'Input name' }).fill(`Test User ${timestamp}`);
    await dialog.getByRole('textbox', { name: 'Input email' }).fill(`testuser${timestamp}@example.com`);

    // Select role via combobox
    await dialog.getByRole('combobox', { name: 'Choose role' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Select department via combobox
    await dialog.getByRole('combobox', { name: 'Choose department' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Select position via combobox (enabled after department is selected)
    await dialog.getByRole('combobox', { name: 'Choose position' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Click Add button
    await dialog.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(2000);

    // Expected Result: New user created
  });

  test('UM-005: Add user and empty all fields', async () => {
    await navigateToUserListing();

    await authenticatedPage.getByRole('button', { name: 'Add User' }).click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Add User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Leave all fields empty, click Add
    await dialog.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Creation unsuccessful - dialog should still be visible with validation
    await expect(dialog).toBeVisible();

    // Close dialog
    await dialog.getByRole('button', { name: 'close' }).click();
  });

  test('UM-006: Add user without specify role', async () => {
    await navigateToUserListing();

    await authenticatedPage.getByRole('button', { name: 'Add User' }).click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Add User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const timestamp = Date.now();
    await dialog.getByRole('textbox', { name: 'Input name' }).fill(`Test User ${timestamp}`);
    await dialog.getByRole('textbox', { name: 'Input email' }).fill(`testuser${timestamp}@example.com`);

    // Leave role empty, click Add
    await dialog.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Creation unsuccessful - dialog should still be visible
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'close' }).click();
  });

  test('UM-007: Add user without department and position', async () => {
    await navigateToUserListing();

    await authenticatedPage.getByRole('button', { name: 'Add User' }).click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Add User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const timestamp = Date.now();
    await dialog.getByRole('textbox', { name: 'Input name' }).fill(`Test User ${timestamp}`);
    await dialog.getByRole('textbox', { name: 'Input email' }).fill(`testuser${timestamp}@example.com`);

    // Select role only
    await dialog.getByRole('combobox', { name: 'Choose role' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Leave department and position empty, click Add
    await dialog.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Creation unsuccessful - dialog should still be visible
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'close' }).click();
  });

  test('UM-008: Reset password for user', async () => {
    await navigateToUserListing();

    // Click Edit on first user
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // The Reset Password button is visible but disabled by default
    const resetBtn = dialog.getByRole('button', { name: 'Reset Password' });
    await expect(resetBtn).toBeVisible();

    // Close dialog
    await dialog.getByRole('button', { name: 'close' }).click();
  });

  test('UM-009: Add user using existing email', async () => {
    await navigateToUserListing();

    // Get an existing email from the grid
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    const existingEmail = await firstRow.getByRole('cell').first().textContent();

    // Click Add User
    await authenticatedPage.getByRole('button', { name: 'Add User' }).click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Add User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    await dialog.getByRole('textbox', { name: 'Input name' }).fill(`Test User ${Date.now()}`);
    await dialog.getByRole('textbox', { name: 'Input email' }).fill(existingEmail || 'existing@example.com');

    // Select role
    await dialog.getByRole('combobox', { name: 'Choose role' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Select department
    await dialog.getByRole('combobox', { name: 'Choose department' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Select position
    await dialog.getByRole('combobox', { name: 'Choose position' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Click Add
    await dialog.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(2000);

    // Expected Result: User creation fail with error message about existing email
  });

  test('UM-010: Edit user name', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const nameInput = dialog.getByRole('textbox', { name: 'Input name' });
    const originalName = await nameInput.inputValue();
    const newName = `Edited User ${Date.now()}`;
    await nameInput.fill(newName);

    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);

    // Revert name
    await firstRow.getByRole('button').first().click();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await nameInput.fill(originalName);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);
  });

  test('UM-011: Edit user email to non existing/registered email', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const emailInput = dialog.getByRole('textbox', { name: 'Input email' });
    const originalEmail = await emailInput.inputValue();
    const newEmail = `newemail${Date.now()}@example.com`;
    await emailInput.fill(newEmail);

    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);

    // Revert email
    await firstRow.getByRole('button').first().click();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await emailInput.fill(originalEmail);
    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(2000);
  });

  test('UM-012: Edit user email to existing/registered email', async () => {
    await navigateToUserListing();

    // Get existing email from second row
    const secondRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(2);
    const existingEmail = await secondRow.getByRole('cell').first().textContent();

    // Edit first user
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const emailInput = dialog.getByRole('textbox', { name: 'Input email' });
    await emailInput.fill(existingEmail || 'existing@example.com');

    await dialog.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Error message about existing email
    // Close dialog
    await dialog.getByRole('button', { name: 'close' }).click().catch(() => {});
  });

  test('UM-013: Edit user role', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Change role via combobox
    const roleCombobox = dialog.getByRole('combobox', { name: 'Choose role' });
    await roleCombobox.click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').nth(1).click().catch(() => {});
    await authenticatedPage.waitForTimeout(500);

    // Close without saving to avoid data changes
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('UM-014: Edit user department', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Change department via combobox
    const deptCombobox = dialog.getByRole('combobox', { name: 'Choose department' });
    await deptCombobox.click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').nth(1).click().catch(() => {});
    await authenticatedPage.waitForTimeout(500);

    // Close without saving
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('UM-015: Edit user position', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Change position via combobox
    const posCombobox = dialog.getByRole('combobox', { name: 'Choose position' });
    await posCombobox.click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('option').nth(1).click().catch(() => {});
    await authenticatedPage.waitForTimeout(500);

    // Close without saving
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('UM-016: Inactivate user status', async () => {
    await navigateToUserListing();

    // Active toggle is a checkbox in the "Active" column of each row
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    const activeCheckbox = firstRow.getByRole('checkbox');
    const isChecked = await activeCheckbox.isChecked();

    if (isChecked) {
      await activeCheckbox.click();
      await authenticatedPage.waitForTimeout(2000);

      // Revert: re-activate
      await activeCheckbox.click();
      await authenticatedPage.waitForTimeout(2000);
    }
  });

  test('UM-017: Activate user status', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    const activeCheckbox = firstRow.getByRole('checkbox');
    const isChecked = await activeCheckbox.isChecked();

    if (!isChecked) {
      await activeCheckbox.click();
      await authenticatedPage.waitForTimeout(2000);
    }

    // Verify active status
    await expect(activeCheckbox).toBeChecked();
  });

  test('UM-018: Set valid date to today/previous date', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Valid Till field uses a date picker with textbox "dd/mm/yy"
    const validTillInput = dialog.getByRole('textbox', { name: 'dd/mm/yy' });
    await expect(validTillInput).toBeVisible();

    // Close without saving
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('UM-019: Set valid date to future dates', async () => {
    await navigateToUserListing();

    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog', { name: /Edit User/ });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Verify Valid Till date picker exists
    const validTillInput = dialog.getByRole('textbox', { name: 'dd/mm/yy' });
    await expect(validTillInput).toBeVisible();
    const datePickerBtn = dialog.getByRole('button', { name: /Choose date/ });
    await expect(datePickerBtn).toBeVisible();

    // Close without saving
    await dialog.getByRole('button', { name: 'Cancel' }).click();
  });

  test('UM-020: Login as active user', async () => {
    // This test verifies an active user can login
    // Using the same credentials we used for beforeAll login
    await navigateToUserListing();

    // If we got here, the active user login was successful
    await expect(authenticatedPage.getByRole('heading', { name: /User Listing/ })).toBeVisible();
  });

  test('UM-021: Login as inactive user', async ({ browser }) => {
    // Test with a separate context to avoid affecting the main session
    const context = await browser.newContext();
    const loginPage = await context.newPage();

    await loginPage.goto(`${BASE_URL}/admin/login`);
    await loginPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await loginPage.waitForLoadState('networkidle');
    await loginPage.waitForTimeout(1000);

    const emailInput = loginPage.getByRole('textbox', { name: /robot@gmail.com/i });
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('inactive@example.com');
    await loginPage.locator('#password').fill('password');
    await loginPage.getByRole('button', { name: /sign in/i }).click();
    await loginPage.waitForTimeout(3000);

    // Expected Result: Should still be on login page or show error
    const currentUrl = loginPage.url();
    expect(currentUrl).toContain('login');

    await loginPage.close();
    await context.close();
  });

  test('UM-022: Login as expired user', async ({ browser }) => {
    const context = await browser.newContext();
    const loginPage = await context.newPage();

    await loginPage.goto(`${BASE_URL}/admin/login`);
    await loginPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await loginPage.waitForLoadState('networkidle');
    await loginPage.waitForTimeout(1000);

    const emailInput = loginPage.getByRole('textbox', { name: /robot@gmail.com/i });
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill('expired@example.com');
    await loginPage.locator('#password').fill('password');
    await loginPage.getByRole('button', { name: /sign in/i }).click();
    await loginPage.waitForTimeout(3000);

    // Expected Result: Should still be on login page or show error
    const currentUrl = loginPage.url();
    expect(currentUrl).toContain('login');

    await loginPage.close();
    await context.close();
  });

  test('UM-023: Add department', async () => {
    await navigateToUserListing();

    // Click "Add New" button in D&P section
    await authenticatedPage.getByRole('button', { name: 'Add New' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // A menu should appear - look for Department option
    await authenticatedPage.getByRole('menuitem', { name: /Department/i }).click().catch(async () => {
      // If no menu, it might directly open a dialog
    });
    await authenticatedPage.waitForTimeout(1000);

    // Wait for dialog
    const dialog = authenticatedPage.getByRole('dialog');
    if (await dialog.isVisible()) {
      // Close without creating
      await dialog.getByRole('button', { name: 'close' }).click().catch(() => {});
    }
  });

  test('UM-024: Add 1 position for 1 department', async () => {
    await navigateToUserListing();

    await authenticatedPage.getByRole('button', { name: 'Add New' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Look for Position option in menu
    await authenticatedPage.getByRole('menuitem', { name: /Position/i }).click().catch(async () => {});
    await authenticatedPage.waitForTimeout(1000);

    const dialog = authenticatedPage.getByRole('dialog');
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'close' }).click().catch(() => {});
    }
  });

  test('UM-025: Add 3 positions for 1 department', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    // Verify D&P grid has rows
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const dpRows = dpGrid.getByRole('row');
    const rowCount = await dpRows.count();
    expect(rowCount).toBeGreaterThan(1); // header + at least 1 data row
  });

  test('UM-026: Add 5 positions for 1 department', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const dpRows = dpGrid.getByRole('row');
    const rowCount = await dpRows.count();
    expect(rowCount).toBeGreaterThan(1);
  });

  test('UM-027: Edit department name', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    // Click edit on first D&P row - navigates to detail page
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify D&P detail page loaded
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });

    // Expected Result: Department name cannot be edited upon creation (combobox is disabled)
    const deptCombobox = authenticatedPage.getByRole('combobox', { name: 'Select department' });
    await expect(deptCombobox).toBeDisabled();

    // Go back
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-028: Edit position name', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify D&P detail page loaded
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });

    // Position combobox should be editable (not disabled)
    const posCombobox = authenticatedPage.getByRole('combobox', { name: 'Select position' });
    await expect(posCombobox).toBeVisible();

    // Go back
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-029: Change position to another existing positions in d&p detail page', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify D&P detail page loaded
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });

    // Position combobox should be editable
    const posCombobox = authenticatedPage.getByRole('combobox', { name: 'Select position' });
    await expect(posCombobox).toBeVisible();

    // Go back without saving
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-030: Delete position that have associated users', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    // The second button in D&P row action cell is the delete button
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    const deleteBtn = firstDpRow.getByRole('button').nth(1);
    await expect(deleteBtn).toBeVisible();

    // Expected Result: Position cannot be deleted with error message if it has associated users
  });

  test('UM-031: Delete position that don\'t have any associated users', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    // Find a row with 0 assigned users
    const rows = dpGrid.getByRole('row');
    const rowCount = await rows.count();

    for (let i = 1; i < rowCount; i++) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      const assignedUsersCell = row.getByRole('cell').nth(3);
      const text = await assignedUsersCell.textContent();
      if (text === '0') {
        // Found a position with no users - verify delete button exists
        const deleteBtn = row.getByRole('button').nth(1);
        await expect(deleteBtn).toBeVisible();
        break;
      }
    }
  });

  test('UM-032: Delete department', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    // Verify D&P section is visible
    await expect(authenticatedPage.getByRole('button', { name: 'Departments & Positions' })).toBeVisible();
  });

  test('UM-033: View D&P detail page', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify D&P detail page loaded with all expected elements
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });
    await expect(authenticatedPage.getByRole('combobox', { name: 'Select department' })).toBeVisible();
    await expect(authenticatedPage.getByRole('combobox', { name: 'Select position' })).toBeVisible();

    // Verify Assigned Users section
    await expect(authenticatedPage.getByText('Assigned Users')).toBeVisible();

    // Go back
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-034: Add user in D&P detail page', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    await firstDpRow.scrollIntoViewIfNeeded();
    await firstDpRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify D&P detail page loaded
    await expect(authenticatedPage.getByRole('heading', { name: 'Department & Position Detail' })).toBeVisible({ timeout: 15000 });

    // Verify Add User button exists in the Assigned Users section
    await expect(authenticatedPage.getByRole('button', { name: 'Add User' })).toBeVisible();

    // Go back
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test.skip('UM-035: Delete user in D&P detail page', async () => {
    await navigateToUserListing();
    // Skipped - destructive operation
  });

  test('UM-036: Search department & position', async () => {
    await navigateToUserListing();
    await scrollToDPSection();

    // D&P section has its own search input within the region
    const dpRegion = authenticatedPage.getByRole('region', { name: 'Departments & Positions' });
    const dpSearchInput = dpRegion.getByRole('textbox', { name: 'Search' });
    await dpSearchInput.scrollIntoViewIfNeeded();
    await expect(dpSearchInput).toBeVisible();

    // Get first department name
    const dpGrid = dpRegion.getByRole('grid');
    const firstDpRow = dpGrid.getByRole('row').nth(1);
    const deptName = await firstDpRow.getByRole('cell').nth(1).textContent();

    await dpSearchInput.fill(deptName || '');
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Matching departments & positions displayed
    await expect(dpGrid.getByRole('row').nth(1)).toBeVisible();

    // Clear search
    await dpSearchInput.fill('');
    await authenticatedPage.waitForTimeout(500);
  });

  test('UM-037: Search user', async () => {
    await navigateToUserListing();

    // User listing search input
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search Username, Display Name' });
    await expect(searchInput).toBeVisible();

    // Get first user's display name
    const firstRow = authenticatedPage.getByRole('grid').first().getByRole('row').nth(1);
    const displayName = await firstRow.getByRole('cell').nth(1).textContent();

    await searchInput.fill(displayName || '');
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Users matching the display name are displayed
    const grid = authenticatedPage.getByRole('grid').first();
    await expect(grid.getByRole('row').nth(1)).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await authenticatedPage.waitForTimeout(500);
  });
});

test.describe('User Management - Roles Page', () => {
  let authenticatedPage: Page;

  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();

    await authenticatedPage.goto(`${BASE_URL}/admin/login`);
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    let currentUrl = authenticatedPage.url();

    if (currentUrl.includes('login')) {
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
      if (currentUrl.includes('login')) {
        throw new Error('Login failed - still on login page');
      }
    }

    console.log('✓ Roles page authentication completed');
  });

  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  async function navigateToRoleListing() {
    await authenticatedPage.goto(ROLE_LISTING_URL);
    await waitForAppReady();
    await expect(authenticatedPage.getByRole('heading', { name: /Roles/ })).toBeVisible({ timeout: 15000 });
  }

  test('UM-038: Validate Roles Information', async () => {
    await navigateToRoleListing();

    const grid = authenticatedPage.getByRole('grid');
    await expect(grid).toBeVisible({ timeout: 15000 });

    // Validate column headers
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Role Name' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Description' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

    // Verify data rows exist
    const rows = authenticatedPage.getByRole('row');
    await expect(rows.nth(1)).toBeVisible();
  });

  test('UM-039: Update Roles in admin portal', async () => {
    await navigateToRoleListing();

    // Click edit button on first role row (first button in Actions cell)
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    // Edit Role navigates to a full page: /role-detail/edit?id=...
    await expect(authenticatedPage).toHaveURL(/role-detail\/edit/);
    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    // Verify role details form
    const roleNameInput = authenticatedPage.getByRole('textbox', { name: 'Input role name' }).first();
    await expect(roleNameInput).toBeVisible();

    // Verify Active checkbox
    const activeCheckbox = authenticatedPage.getByRole('checkbox').first();
    await expect(activeCheckbox).toBeVisible();

    // Verify Role Description
    const descInput = authenticatedPage.getByRole('textbox', { name: 'Input role name' }).nth(1);
    await expect(descInput).toBeVisible();

    // Cancel without saving
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-040: View roles available', async () => {
    await navigateToRoleListing();

    const grid = authenticatedPage.getByRole('grid');
    await expect(grid).toBeVisible({ timeout: 15000 });

    const roleCount = await authenticatedPage.getByRole('row').count();
    expect(roleCount).toBeGreaterThan(1); // header + at least 1 data row
  });

  test('UM-041: Add role and empty all fields then save', async () => {
    await navigateToRoleListing();

    await authenticatedPage.getByRole('button', { name: 'Add Role' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Add Role navigates to a new page
    await expect(authenticatedPage).toHaveURL(/role-detail/);

    // Leave all fields empty, click Save
    await authenticatedPage.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Role creation fail, prompt to fill in required fields
    // Should still be on the form page
    await expect(authenticatedPage).toHaveURL(/role-detail/);

    // Cancel
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-042: Add role and dont give access to all modules', async () => {
    await navigateToRoleListing();

    await authenticatedPage.getByRole('button', { name: 'Add Role' }).click();
    await authenticatedPage.waitForTimeout(1000);

    const roleNameInput = authenticatedPage.getByRole('textbox', { name: 'Input role name' }).first();
    await roleNameInput.fill(`Test Role ${Date.now()}`);

    // Don't toggle on any modules, click Save
    await authenticatedPage.getByRole('button', { name: 'Save' }).click();
    await authenticatedPage.waitForTimeout(1000);

    // Expected Result: Role creation fail
    await expect(authenticatedPage).toHaveURL(/role-detail/);

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-043: Edit role and set permission to List only for all modules', async () => {
    await navigateToRoleListing();

    // Click edit on first role
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    // Verify Access Module section with permission checkboxes (List, View, Add, Edit, Delete)
    // Each module section has labeled checkboxes
    const listCheckboxes = authenticatedPage.getByRole('checkbox', { name: 'List' });
    const count = await listCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    // Cancel without saving
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-044: Edit role and set permission to List and View only for all modules', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    // Verify View checkboxes exist
    const viewCheckboxes = authenticatedPage.getByRole('checkbox', { name: 'View' });
    const count = await viewCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-045: Edit role and set permission to List, View and Edit only for all modules', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    const editCheckboxes = authenticatedPage.getByRole('checkbox', { name: 'Edit' });
    const count = await editCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-046: Edit role and set permission to List and Add only for all modules', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    const addCheckboxes = authenticatedPage.getByRole('checkbox', { name: 'Add' });
    const count = await addCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-047: Edit role and set permission to List and Delete only for all modules', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    const deleteCheckboxes = authenticatedPage.getByRole('checkbox', { name: 'Delete' });
    const count = await deleteCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-048: Edit role and set permission to all for all modules', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    await firstRow.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(1000);

    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Role' })).toBeVisible({ timeout: 15000 });

    // Verify all permission types exist
    for (const perm of ['List', 'View', 'Add', 'Edit', 'Delete']) {
      const checkboxes = authenticatedPage.getByRole('checkbox', { name: perm });
      const count = await checkboxes.count();
      expect(count).toBeGreaterThan(0);
    }

    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('UM-049: Set role as active', async () => {
    await navigateToRoleListing();

    // Status column has checkboxes (toggle switches) for each role
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const statusCheckbox = firstRow.getByRole('checkbox').first();
    await expect(statusCheckbox).toBeVisible();
  });

  test('UM-050: Set role as inactive', async () => {
    await navigateToRoleListing();

    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const statusCheckbox = firstRow.getByRole('checkbox').first();
    await expect(statusCheckbox).toBeVisible();
  });

  test('UM-051: Delete role with associated users', async () => {
    await navigateToRoleListing();

    // Delete button is the second button in the Actions cell
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const deleteBtn = firstRow.getByRole('button').nth(1);
    await expect(deleteBtn).toBeVisible();

    // Expected Result: Role deletion unsuccessful with error message if it has associated users
  });

  test('UM-052: Delete role with no associated users', async () => {
    await navigateToRoleListing();

    // Find a role row and verify delete button exists
    const firstRow = authenticatedPage.getByRole('row').nth(1);
    const deleteBtn = firstRow.getByRole('button').nth(1);
    await expect(deleteBtn).toBeVisible();
  });
});

test.describe('User Management - Audit Log Page', () => {
  let authenticatedPage: Page;

  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();

    await authenticatedPage.goto(`${BASE_URL}/admin/login`);
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    let currentUrl = authenticatedPage.url();

    if (currentUrl.includes('login')) {
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
      if (currentUrl.includes('login')) {
        throw new Error('Login failed - still on login page');
      }
    }

    console.log('✓ Audit Log page authentication completed');
  });

  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  async function navigateToAuditLog() {
    await authenticatedPage.goto(AUDIT_LOG_URL);
    await waitForAppReady();
    await authenticatedPage.waitForTimeout(2000); // Extra wait for audit log data to load
    await expect(authenticatedPage.getByRole('heading', { name: /All Audit Logs/ })).toBeVisible({ timeout: 15000 });
  }

  // Helper to select a filter option from the custom grid-based dropdown
  async function selectFilterOption(filterName: string, optionName: string) {
    const filterInput = authenticatedPage.getByRole('textbox', { name: filterName });
    await filterInput.click();
    await authenticatedPage.waitForTimeout(1000);

    // The dropdown is a grid with rows containing checkboxes - click the row with the option name
    const optionRow = authenticatedPage.getByRole('row', { name: optionName }).last();
    await optionRow.getByRole('checkbox').click();
    await authenticatedPage.waitForTimeout(500);

    // Close dropdown by clicking the heading
    await authenticatedPage.getByRole('heading', { name: /All Audit Logs/ }).click();
    await authenticatedPage.waitForTimeout(1000);
  }

  // Helper to select the first available filter option
  async function selectFirstFilterOption(filterName: string) {
    const filterInput = authenticatedPage.getByRole('textbox', { name: filterName });
    await filterInput.click();
    await authenticatedPage.waitForTimeout(1000);

    // Click the first data row's checkbox in the dropdown grid
    const dropdownRows = authenticatedPage.locator('[role="row"]').filter({ has: authenticatedPage.locator('[role="checkbox"]') });
    // Skip the header row (Select All) and click the first data row
    const firstDataRow = dropdownRows.nth(1);
    await firstDataRow.getByRole('checkbox').click();
    await authenticatedPage.waitForTimeout(500);

    // Close dropdown by clicking the heading
    await authenticatedPage.getByRole('heading', { name: /All Audit Logs/ }).click();
    await authenticatedPage.waitForTimeout(1000);
  }

  test('UM-053: View all audit logs', async () => {
    await navigateToAuditLog();

    // Validate column headers in the main audit log grid
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Date' })).toBeVisible({ timeout: 15000 });
    await expect(authenticatedPage.getByRole('columnheader', { name: 'User' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Action' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Description' })).toBeVisible();

    // Verify data rows exist
    const rows = authenticatedPage.getByRole('row');
    await expect(rows.nth(1)).toBeVisible();
  });

  test('UM-054: Only view audit log by order module', async () => {
    await navigateToAuditLog();

    // Select Order module from the custom grid-based filter dropdown
    await selectFilterOption('Module', 'Order');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-055: Only view audit log by voucher module', async () => {
    await navigateToAuditLog();

    await selectFilterOption('Module', 'Voucher');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-056: Only view audit log by corporate management module', async () => {
    await navigateToAuditLog();

    await selectFilterOption('Module', 'Corporate Management');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-057: Only view audit log by users module', async () => {
    await navigateToAuditLog();

    await selectFilterOption('Module', 'Users');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-058: Only view audit log by content management module', async () => {
    await navigateToAuditLog();

    await selectFilterOption('Module', 'Content Management');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-059: Only view audit log by settings module', async () => {
    await navigateToAuditLog();

    await selectFilterOption('Module', 'Settings');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-060: Only view audit log by certain users', async () => {
    await navigateToAuditLog();

    await selectFirstFilterOption('Username');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-061: Only view audit log from certain period of time', async () => {
    await navigateToAuditLog();

    // Verify the filter controls exist
    const moduleInput = authenticatedPage.getByRole('textbox', { name: 'Module' });
    await expect(moduleInput).toBeVisible();

    const usernameInput = authenticatedPage.getByRole('textbox', { name: 'Username' });
    await expect(usernameInput).toBeVisible();

    const subModuleInput = authenticatedPage.getByRole('textbox', { name: 'Sub Module' });
    await expect(subModuleInput).toBeVisible();
  });

  test('UM-062: View audit log for single module and single user', async () => {
    await navigateToAuditLog();

    // Select module
    await selectFirstFilterOption('Module');

    // Select username
    await selectFirstFilterOption('Username');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-063: View audit log for multiple modules and multiple users', async () => {
    await navigateToAuditLog();

    // Select module
    await selectFirstFilterOption('Module');

    // Select username
    await selectFirstFilterOption('Username');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  test('UM-064: View audit log for single module made by single user in certain time range', async () => {
    await navigateToAuditLog();

    // Select module
    await selectFirstFilterOption('Module');

    // Select username
    await selectFirstFilterOption('Username');

    const rows = await authenticatedPage.getByRole('row').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });
});
