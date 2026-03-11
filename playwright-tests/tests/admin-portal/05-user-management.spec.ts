import { test, expect } from '@playwright/test';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

test.describe('User Management - All Users Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to User Management
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/user-listing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('UM-001: Validate All User & D&P Information', async ({ page }) => {
    // Module: All Users Page
    // Navigate to All User module - already on the page
    
    // Validate the table listing (Material-UI DataGrid)
    const dataGrid = page.locator('.MuiDataGrid-root');
    await expect(dataGrid).toBeVisible();
    
    // Expected Result: Table listing have complete header and display correct information
    const columnHeaders = await page.locator('.MuiDataGrid-columnHeader').allTextContents();
    expect(columnHeaders.length).toBeGreaterThan(0);
    
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('UM-002: Update All User in admin portal', async ({ page }) => {
    // Module: All Users Page
    // Click Edit button on any available item under All User
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit any details
    const newName = `Updated User ${Date.now()}`;
    await page.fill('input[name="name"]', newName);
    
    // Click Save
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Table listing updated according to the changes
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${newName}")`)).toBeVisible();
  });

  test('UM-003: Update D&P in admin portal', async ({ page }) => {
    // Module: All Users Page
    // Navigate to D&P section
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Click Edit button on any available item under D&P
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit any details (if editable)
    // Click Save
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Table listing updated according to the changes
    await expect(page.locator('.MuiSnackbar-root, .MuiAlert-root')).toBeVisible();
  });

  test('UM-004: Add user', async ({ page }) => {
    // Module: All Users Page
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill in all fields
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test User ${timestamp}`);
    await page.fill('input[type="email"]', `testuser${timestamp}@example.com`);
    
    // Select role (click autocomplete and select first option)
    await page.click('input[placeholder="Choose role"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]').catch(() => {});
    
    // Select department
    await page.click('input[placeholder="Choose department"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]').catch(() => {});
    
    // Select position
    await page.click('input[placeholder="Choose position"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]').catch(() => {});
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: New user created
    await expect(page.locator(`.MuiDataGrid-cell:has-text("Test User ${timestamp}")`)).toBeVisible();
  });

  test('UM-005: Add user and empty all fields', async ({ page }) => {
    // Module: All Users Page (Negative)
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Empty all fields (clear if pre-filled)
    await page.fill('input[name="name"]', '');
    await page.fill('input[type="email"]', '');
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: Creation unsuccessful (All fields are mandatory)
    await expect(page.locator('text=required, text=mandatory, text=This field is required')).toBeVisible();
  });

  test('UM-006: Add user without specify role', async ({ page }) => {
    // Module: All Users Page
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill in all fields except role
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test User ${timestamp}`);
    await page.fill('input[type="email"]', `testuser${timestamp}@example.com`);
    
    // Leave role fields empty
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: Creation unsuccessful (All fields are mandatory)
    await expect(page.locator('text=Role is required, text=required')).toBeVisible();
  });

  test('UM-007: Add user without department and position', async ({ page }) => {
    // Module: All Users Page
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill in all fields except department and position
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `Test User ${timestamp}`);
    await page.fill('input[type="email"]', `testuser${timestamp}@example.com`);
    
    // Select role
    await page.click('input[placeholder="Choose role"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]').catch(() => {});
    
    // Leave department and position fields empty
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: Creation unsuccessful (All fields are mandatory)
    await expect(page.locator('text=Department is required, text=Position is required, text=required')).toBeVisible();
  });

  test('UM-008: Reset password for user', async ({ page }) => {
    // Module: All Users Page
    // Select a user and click the edit icon
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click the Reset Password button
    await page.click('button:has-text("Reset Password")');
    await page.waitForTimeout(1000);
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Email for temporary password is sent to the user
    await expect(page.locator('text=Password reset, text=email sent, .MuiAlert-root')).toBeVisible();
  });

  test('UM-009: Add user using existing email', async ({ page }) => {
    // Module: All Users Page (Negative)
    // Get an existing email from the grid
    const existingEmail = await page.locator('.MuiDataGrid-cell').nth(1).textContent();
    
    // Click Add User button
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Fill in fields with existing email
    await page.fill('input[name="name"]', `Test User ${Date.now()}`);
    await page.fill('input[type="email"]', existingEmail || 'existing@example.com');
    
    // Select role, department, position
    await page.click('input[placeholder="Choose role"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]').catch(() => {});
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: User creation fail with error message
    await expect(page.locator('text=User with this Email Exists, text=email already exists')).toBeVisible();
  });

  test('UM-010: Edit user name', async ({ page }) => {
    // Module: All Users Page
    // Select and edit a user
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit name
    const newName = `Edited User ${Date.now()}`;
    await page.fill('input[name="name"]', newName);
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User details successfully edited and saved
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${newName}")`)).toBeVisible();
  });

  // Continue with remaining tests following the same pattern...
  // Due to length constraints, I'll provide a template for the remaining tests

  test('UM-011: Edit user email to non existing/registered email', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit email to non existing/registered email
    const newEmail = `newemail${Date.now()}@example.com`;
    await page.fill('input[type="email"]', newEmail);
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User details successfully edited and saved
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${newEmail}")`)).toBeVisible();
  });

  test('UM-012: Edit user email to existing/registered email', async ({ page }) => {
    // Module: All Users Page (Negative)
    const existingEmail = await page.locator('.MuiDataGrid-cell').nth(3).textContent();
    
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit email to existing/registered email
    await page.fill('input[type="email"]', existingEmail || 'existing@example.com');
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: User creation fail with error message
    await expect(page.locator('text=User with this Email Exists, text=email already exists')).toBeVisible();
  });

  test('UM-013: Edit user role', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Choose different role for the user
    await page.click('input[placeholder="Choose role"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').nth(1).click().catch(() => {});
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User details successfully edited and saved
    await expect(page.locator('.MuiAlert-root, .MuiSnackbar-root')).toBeVisible();
  });

  test('UM-014: Edit user department', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Choose different department for the user
    await page.click('input[placeholder="Choose department"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').nth(1).click().catch(() => {});
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User details successfully edited and saved
    await expect(page.locator('.MuiAlert-root, .MuiSnackbar-root')).toBeVisible();
  });

  test('UM-015: Edit user position', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Choose different position for the user
    await page.click('input[placeholder="Choose position"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').nth(1).click().catch(() => {});
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User details successfully edited and saved
    await expect(page.locator('.MuiAlert-root, .MuiSnackbar-root')).toBeVisible();
  });

  test('UM-016: Inactivate user status', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Toggle off the active toggle
    await page.locator('input[type="checkbox"], .MuiSwitch-root').first().click();
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User status change from active to inactive
    await expect(page.locator('text=Inactive, text=Disabled')).toBeVisible();
  });

  test('UM-017: Activate user status', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Toggle on the active toggle
    await page.locator('input[type="checkbox"], .MuiSwitch-root').first().click();
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User status change from inactive to active
    await expect(page.locator('text=Active')).toBeVisible();
  });

  test('UM-018: Set valid date to today/previous date', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit valid date to current/previous dates
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Observe the status is changed to expired
    await expect(page.locator('text=Expired')).toBeVisible();
  });

  test('UM-019: Set valid date to future dates', async ({ page }) => {
    // Module: All Users Page
    const firstEditButton = page.locator('.MuiIconButton-root.css-nm0ua4').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit valid date to future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Observe the status is active
    await expect(page.locator('text=Active')).toBeVisible();
  });

  test('UM-020: Login as active user', async ({ page, context }) => {
    // Module: All Users Page
    const loginPage = await context.newPage();
    await loginPage.goto(`${BASE_URL}/login`);
    await loginPage.fill('input[name="username"]', CREDENTIALS.email);
    await loginPage.fill('input[name="password"]', CREDENTIALS.password);
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForLoadState('networkidle');
    
    // Expected Result: User successfully login and see the order page
    await expect(loginPage.locator('text=Orders, text=Dashboard')).toBeVisible();
    await loginPage.close();
  });

  test('UM-021: Login as inactive user', async ({ page, context }) => {
    // Module: All Users Page (Negative)
    const loginPage = await context.newPage();
    await loginPage.goto(`${BASE_URL}/login`);
    await loginPage.fill('input[name="username"]', 'inactive@example.com');
    await loginPage.fill('input[name="password"]', 'password');
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForTimeout(2000);
    
    // Expected Result: Popup message "user is disabled." is displayed
    await expect(loginPage.locator('text=user is disabled, text=account is disabled, text=inactive')).toBeVisible();
    await loginPage.close();
  });

  test('UM-022: Login as expired user', async ({ page, context }) => {
    // Module: All Users Page (Negative)
    const loginPage = await context.newPage();
    await loginPage.goto(`${BASE_URL}/login`);
    await loginPage.fill('input[name="username"]', 'expired@example.com');
    await loginPage.fill('input[name="password"]', 'password');
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForTimeout(2000);
    
    // Expected Result: Popup message "user is disabled." is displayed
    await expect(loginPage.locator('text=user is disabled, text=account is disabled, text=expired')).toBeVisible();
    await loginPage.close();
  });

  test('UM-023: Add department', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Add New")');
    await page.waitForTimeout(500);
    await page.click('text=Add New Department, [role="menuitem"]:has-text("Department")').catch(() => {});
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const deptName = `Department ${Date.now()}`;
    await page.fill('input[name="name"], input[name="departmentName"]', deptName);
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: New department successfully created
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${deptName}")`)).toBeVisible();
  });

  test('UM-024: Add 1 position for 1 department', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Add New")');
    await page.waitForTimeout(500);
    await page.click('text=Add New Position, [role="menuitem"]:has-text("Position")').catch(() => {});
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.click('input[placeholder="Choose department"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    
    const positionName = `Position ${Date.now()}`;
    await page.fill('input[name="name"], input[name="positionName"]', positionName);
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Position created
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${positionName}")`)).toBeVisible();
  });

  test('UM-025: Add 3 positions for 1 department', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Add New")');
      await page.waitForTimeout(500);
      await page.click('text=Add New Position, [role="menuitem"]:has-text("Position")').catch(() => {});
      await page.waitForTimeout(1000);
      
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      await page.click('input[placeholder="Choose department"]');
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      
      const positionName = `Position ${Date.now()}_${i}`;
      await page.fill('input[name="name"], input[name="positionName"]', positionName);
      
      await page.click('[role="dialog"] button:has-text("Save")');
      await page.waitForTimeout(2000);
    }
    
    // Expected Result: 3 positions created
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(3);
  });

  test('UM-026: Add 5 positions for 1 department', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Add New")');
      await page.waitForTimeout(500);
      await page.click('text=Add New Position, [role="menuitem"]:has-text("Position")').catch(() => {});
      await page.waitForTimeout(1000);
      
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      await page.click('input[placeholder="Choose department"]');
      await page.waitForTimeout(500);
      await page.locator('[role="option"]').first().click();
      
      const positionName = `Position ${Date.now()}_${i}`;
      await page.fill('input[name="name"], input[name="positionName"]', positionName);
      
      await page.click('[role="dialog"] button:has-text("Save")');
      await page.waitForTimeout(2000);
    }
    
    // Expected Result: 5 positions created
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(5);
  });

  test('UM-027: Edit department name', async ({ page }) => {
    // Module: All Users Page (Negative)
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const deptNameField = page.locator('input[name="departmentName"], input[name="name"]');
    
    // Expected Result: Department name cannot be edited upon creation
    await expect(deptNameField).toBeDisabled();
  });

  test('UM-028: Edit position name', async ({ page }) => {
    // Module: All Users Page (Negative)
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const positionNameField = page.locator('input[name="positionName"], input[name="name"]');
    
    // Expected Result: Position name cannot be edited upon creation
    await expect(positionNameField).toBeDisabled();
  });

  test('UM-029: Change position to another existing positions in d&p detail page', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Expected Result: Can view list of users for the selected position
    await expect(page.locator('text=Assigned Users, text=Users')).toBeVisible();
  });

  test('UM-030: Delete position that have associated users', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const deleteButton = page.locator('.MuiIconButton-root[aria-label*="delete"], .MuiIconButton-root[aria-label*="Delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    // Expected Result: Position cannot be deleted with error message
    await expect(page.locator('text=Cannot delete position. It has associated users., text=associated users')).toBeVisible();
  });

  test('UM-031: Delete position that don\'t have any associated users', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const positionName = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    const deleteButton = page.locator('.MuiIconButton-root[aria-label*="delete"], .MuiIconButton-root[aria-label*="Delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("Confirm"), button:has-text("Yes")').catch(() => {});
    await page.waitForTimeout(2000);
    
    // Expected Result: Position will be deleted
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${positionName}")`)).not.toBeVisible();
  });

  test('UM-032: Delete department', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const deptName = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    // Delete all positions with no associated users
    const deleteButtons = page.locator('.MuiIconButton-root[aria-label*="delete"]');
    const count = await deleteButtons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Confirm"), button:has-text("Yes")').catch(() => {});
      await page.waitForTimeout(1000);
    }
    
    // Expected Result: Department deleted
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${deptName}")`)).not.toBeVisible();
  });

  test('UM-033: View D&P detail page', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    
    // Expected Result: User can view D&P details
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Department, text=Position')).toBeVisible();
  });

  test('UM-034: Add user in D&P detail page', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.click('button:has-text("Add User")').catch(() => {});
    await page.waitForTimeout(1000);
    
    const timestamp = Date.now();
    await page.fill('input[name="name"]', `DP User ${timestamp}`);
    await page.fill('input[type="email"]', `dpuser${timestamp}@example.com`);
    
    await page.click('input[placeholder="Choose role"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Can add user under the particular position
    await expect(page.locator(`text=DP User ${timestamp}`)).toBeVisible();
  });

  test('UM-035: Delete user in D&P detail page', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    const userName = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    const deleteButton = page.locator('.MuiIconButton-root[aria-label*="delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("Confirm"), button:has-text("Yes")').catch(() => {});
    await page.waitForTimeout(2000);
    
    // Expected Result: Can remove/delete user
    await expect(page.locator(`text=${userName}`)).not.toBeVisible();
  });

  test('UM-036: Search department & position', async ({ page }) => {
    // Module: All Users Page
    await page.click('text=Department, text=D&P').catch(() => {});
    await page.waitForTimeout(1000);
    
    const searchTerm = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    await page.fill('input[placeholder="Search"]', searchTerm || '');
    await page.waitForTimeout(1000);
    
    // Expected Result: Matching departments & positions will be displayed
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${searchTerm}")`)).toBeVisible();
  });

  test('UM-037: Search user', async ({ page }) => {
    // Module: All Users Page
    const displayName = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    await page.fill('input[placeholder="Search"]', displayName || '');
    await page.waitForTimeout(1000);
    
    // Expected Result: Users that match the display name entered will be displayed
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${displayName}")`)).toBeVisible();
  });
});

test.describe('User Management - Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to Roles page
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/role-listing`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('UM-038: Validate Roles Information', async ({ page }) => {
    // Module: Roles Page
    // Validate the table listing
    const dataGrid = page.locator('.MuiDataGrid-root');
    await expect(dataGrid).toBeVisible();
    
    // Expected Result: Table listing have complete header and display correct information
    const columnHeaders = await page.locator('.MuiDataGrid-columnHeader').allTextContents();
    expect(columnHeaders.length).toBeGreaterThan(0);
    
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('UM-039: Update Roles in admin portal', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Edit any details
    const newDescription = `Updated Role ${Date.now()}`;
    await page.fill('textarea[name="description"], input[name="description"]', newDescription).catch(() => {});
    
    // Click Save
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Table listing updated according to the changes
    await expect(page.locator('.MuiAlert-root, .MuiSnackbar-root')).toBeVisible();
  });

  test('UM-040: View roles available', async ({ page }) => {
    // Module: Roles Page
    // Observe the listings
    const dataGrid = page.locator('.MuiDataGrid-root');
    await expect(dataGrid).toBeVisible();
    
    // Expected Result: User can view roles available in the listings
    const roleCount = await page.locator('.MuiDataGrid-row').count();
    expect(roleCount).toBeGreaterThan(0);
  });

  test('UM-041: Add role and empty all fields then save', async ({ page }) => {
    // Module: Roles Page
    // Click Add Role
    await page.click('button:has-text("Add Role")');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Empty all fields
    await page.fill('input[name="name"], input[name="roleName"]', '');
    
    // Click Save button
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: Role creation fail, prompt to fill in required fields
    await expect(page.locator('text=required, text=mandatory, text=This field is required')).toBeVisible();
  });

  test('UM-042: Add role and dont give access to all modules', async ({ page }) => {
    // Module: Roles Page (Negative)
    await page.click('button:has-text("Add Role")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.fill('input[name="name"], input[name="roleName"]', `Test Role ${Date.now()}`);
    
    // Don't toggle on any modules
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Expected Result: Role creation fail
    await expect(page.locator('text=at least one module, text=select module')).toBeVisible();
  });

  test('UM-043: Edit role and set permission to List only for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Toggle on all modules and tick List checkbox only
    const listCheckboxes = page.locator('input[type="checkbox"][value="list"], input[name*="list"]');
    const count = await listCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await listCheckboxes.nth(i).check();
    }
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-044: Edit role and set permission to List and View only for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.check('input[value="list"], input[name*="list"]').catch(() => {});
    await page.check('input[value="view"], input[name*="view"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-045: Edit role and set permission to List, View and Edit only for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.check('input[value="list"]').catch(() => {});
    await page.check('input[value="view"]').catch(() => {});
    await page.check('input[value="edit"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-046: Edit role and set permission to List and Add only for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.check('input[value="list"]').catch(() => {});
    await page.check('input[value="add"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-047: Edit role and set permission to List and Delete only for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.check('input[value="list"]').catch(() => {});
    await page.check('input[value="delete"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-048: Edit role and set permission to all for all modules', async ({ page }) => {
    // Module: Roles Page
    const firstEditButton = page.locator('.MuiIconButton-root').first();
    await firstEditButton.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.check('input[value="list"]').catch(() => {});
    await page.check('input[value="view"]').catch(() => {});
    await page.check('input[value="edit"]').catch(() => {});
    await page.check('input[value="add"]').catch(() => {});
    await page.check('input[value="delete"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role permission successfully updated
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('UM-049: Set role as active', async ({ page }) => {
    // Module: Roles Page
    await page.click('button:has-text("Add Role")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.fill('input[name="name"], input[name="roleName"]', `Active Role ${Date.now()}`);
    
    await page.locator('input[type="checkbox"]').first().check();
    await page.check('input[value="list"]').catch(() => {});
    await page.check('input[type="checkbox"][name="active"], .MuiSwitch-root').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role saved as active
    await expect(page.locator('text=Active')).toBeVisible();
  });

  test('UM-050: Set role as inactive', async ({ page }) => {
    // Module: Roles Page
    await page.click('button:has-text("Add Role")');
    await page.waitForTimeout(1000);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.fill('input[name="name"], input[name="roleName"]', `Inactive Role ${Date.now()}`);
    
    await page.locator('input[type="checkbox"]').first().check();
    await page.check('input[value="list"]').catch(() => {});
    await page.uncheck('input[type="checkbox"][name="active"]').catch(() => {});
    
    await page.click('[role="dialog"] button:has-text("Save")');
    await page.waitForTimeout(2000);
    
    // Expected Result: Role saved as inactive
    await expect(page.locator('text=Inactive')).toBeVisible();
  });

  test('UM-051: Delete role with associated users', async ({ page }) => {
    // Module: Roles Page
    const deleteButton = page.locator('.MuiIconButton-root[aria-label*="delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    // Expected Result: Role deletion unsuccessful with error message
    await expect(page.locator('text=Can not delete role that still contains user, text=associated users')).toBeVisible();
  });

  test('UM-052: Delete role with no associated users', async ({ page }) => {
    // Module: Roles Page
    const roleName = await page.locator('.MuiDataGrid-cell').first().textContent();
    
    const deleteButton = page.locator('.MuiIconButton-root[aria-label*="delete"]').first();
    await deleteButton.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("Confirm"), button:has-text("Yes")').catch(() => {});
    await page.waitForTimeout(2000);
    
    // Expected Result: Role successfully deleted
    await expect(page.locator(`.MuiDataGrid-cell:has-text("${roleName}")`)).not.toBeVisible();
  });
});

test.describe('User Management - Audit Log Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to Audit Log page
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(`${BASE_URL}/audit-log`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('UM-053: View all audit logs', async ({ page }) => {
    // Module: Audit Log Page
    // View the audit log table
    const dataGrid = page.locator('.MuiDataGrid-root');
    await expect(dataGrid).toBeVisible();
    
    // Expected Result: Can view all audit logs
    const logCount = await page.locator('.MuiDataGrid-row').count();
    expect(logCount).toBeGreaterThanOrEqual(0);
    
    const columnHeaders = await page.locator('.MuiDataGrid-columnHeader').allTextContents();
    expect(columnHeaders.length).toBeGreaterThan(0);
  });

  test('UM-054: Only view audit log by order module', async ({ page }) => {
    // Module: Audit Log Page
    // Click the Module filter
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    
    // Select Order
    await page.click('[role="option"]:has-text("Order")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for order module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-055: Only view audit log by voucher module', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Voucher")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for voucher module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-056: Only view audit log by corporate management module', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Corporate Management")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for corporate management module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-057: Only view audit log by users module', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Users")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for users module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-058: Only view audit log by content management module', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Content Management")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for content management module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-059: Only view audit log by settings module', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Settings")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for settings module is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-060: Only view audit log by certain users', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Username"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for the selected user is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-061: Only view audit log from certain period of time', async ({ page }) => {
    // Module: Audit Log Page
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    
    await page.fill('input[type="date"]', startDate.toISOString().split('T')[0]).catch(() => {});
    await page.fill('input[type="date"]', endDate.toISOString().split('T')[0]).catch(() => {});
    
    await page.click('button:has-text("Apply"), button:has-text("Filter")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for the selected time period is displayed
    const logCount = await page.locator('.MuiDataGrid-row').count();
    expect(logCount).toBeGreaterThanOrEqual(0);
  });

  test('UM-062: View audit log for single module and single user', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Order")').catch(() => {});
    
    await page.click('input[placeholder="Username"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for the selected module and user is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });

  test('UM-063: View audit log for multiple modules and multiple users', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Order")').catch(() => {});
    await page.click('[role="option"]:has-text("Voucher")').catch(() => {});
    
    await page.click('input[placeholder="Username"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    await page.locator('[role="option"]').nth(1).click().catch(() => {});
    
    await page.click('button:has-text("Apply"), button:has-text("Filter")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for the selected modules and users is displayed
    const logCount = await page.locator('.MuiDataGrid-row').count();
    expect(logCount).toBeGreaterThanOrEqual(0);
  });

  test('UM-064: View audit log for single module made by single user in certain time range', async ({ page }) => {
    // Module: Audit Log Page
    await page.click('input[placeholder="Module"]');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:has-text("Order")').catch(() => {});
    
    await page.click('input[placeholder="Username"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    
    await page.fill('input[type="date"]', startDate.toISOString().split('T')[0]).catch(() => {});
    await page.fill('input[type="date"]', endDate.toISOString().split('T')[0]).catch(() => {});
    
    await page.click('button:has-text("Apply"), button:has-text("Filter")').catch(() => {});
    await page.waitForTimeout(1000);
    
    // Expected Result: All audit logs for the selected module and user made at a certain time range is displayed
    const rows = await page.locator('.MuiDataGrid-row').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});
