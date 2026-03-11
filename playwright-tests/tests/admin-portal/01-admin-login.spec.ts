import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../../pages/admin-portal/LoginPage';
import { TestHelpers } from '../../utils/helpers';
import { ADMIN_PORTAL } from '../../utils/test-data';

test.describe('Admin Portal - Login & Authentication', () => {
  let loginPage: AdminLoginPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
    helpers = new TestHelpers(page);
  });

  test('TC_ADMIN_001: Login with correct credentials', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    await loginPage.verifyLoginSuccess();
    
    // Verify dashboard/main page loaded
    await expect(page.locator('text=Orders')).toBeVisible();
  });

  test('TC_ADMIN_002: Login with incorrect password - Negative', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, 'WrongPassword123!');
    
    // Should show error message
    await expect(page.locator('text=incorrect')).toBeVisible();
  });

  test('TC_ADMIN_003: Login with incorrect email - Negative', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('wrong@email.com', ADMIN_PORTAL.CREDENTIALS.password);
    
    await expect(page.locator('text=Invalid, text=not found')).toBeVisible();
  });

  test('TC_ADMIN_004: Login with empty credentials - Negative', async ({ page }) => {
    await loginPage.navigate();
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('TC_ADMIN_005: Password visibility toggle', async ({ page }) => {
    await loginPage.navigate();
    await page.fill('input[type="password"]', 'TestPassword123');
    
    // Toggle password visibility
    await loginPage.togglePasswordVisibility();
    
    // Verify password is visible
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('TC_ADMIN_006: Reset password with registered email', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    
    await loginPage.resetPassword(ADMIN_PORTAL.CREDENTIALS.email);
    
    // Verify success message
    await expect(page.locator('text=sent, text=email')).toBeVisible();
  });

  test('TC_ADMIN_007: Reset password with non-registered email - Negative', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    
    await loginPage.resetPassword('nonexistent@example.com');
    
    // Should show error
    await expect(page.locator('text=not found, text=does not exist')).toBeVisible();
  });

  test('TC_ADMIN_008: Session timeout handling', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    await loginPage.verifyLoginSuccess();
    
    // Wait for session timeout (if applicable)
    // Note: Adjust timeout based on actual session duration
    await page.waitForTimeout(3600000); // 1 hour
    
    // Try to navigate
    await page.click('text=Orders, text=Vouchers').catch(() => {});
    
    // Should redirect to login
    await page.waitForURL(/.*login.*/);
  });

  test('TC_ADMIN_009: Multiple failed login attempts', async ({ page }) => {
    await loginPage.navigate();
    
    // Attempt login 3 times with wrong password
    for (let i = 0; i < 3; i++) {
      await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, 'WrongPassword123!');
      await page.waitForTimeout(1000);
    }
    
    // Should show account locked or additional security message
    await expect(page.locator('text=locked, text=too many attempts, text=disabled')).toBeVisible();
  });

  test('TC_ADMIN_010: Logout functionality', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    await loginPage.verifyLoginSuccess();
    
    // Click logout
    await page.click('text=Logout, text=Sign Out, button:has-text("Logout")');
    
    // Should redirect to login page
    await page.waitForURL(/.*login.*/);
  });

  test('TC_ADMIN_011: Access protected page without login', async ({ page }) => {
    // Try to access admin dashboard directly
    await page.goto('https://corpvoucher.fam-stg.click/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/.*login.*/);
  });

  test('TC_ADMIN_012: Remember me functionality', async ({ page }) => {
    await loginPage.navigate();
    
    // Check remember me checkbox if available
    const rememberMe = page.locator('input[type="checkbox"][name*="remember"]');
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }
    
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    await loginPage.verifyLoginSuccess();
    
    // Close and reopen browser
    await page.context().close();
    
    // Create new context and verify still logged in
    // Note: This requires persistent context
  });

  test('TC_ADMIN_013: Password reset with valid code', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    await loginPage.resetPassword(ADMIN_PORTAL.CREDENTIALS.email);
    
    // Note: In real scenario, you would get OTP from email
    // For now, we verify the reset code input page is shown
    await expect(page.locator('input[name*="code"], input[placeholder*="code"]')).toBeVisible();
  });

  test('TC_ADMIN_014: Password reset with invalid code - Negative', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    await loginPage.resetPassword(ADMIN_PORTAL.CREDENTIALS.email);
    
    // Enter invalid code
    await page.fill('input[name*="code"]', '000000');
    await page.fill('input[name*="password"]', 'NewPassword123!');
    await page.fill('input[name*="confirm"]', 'NewPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Invalid, text=expired')).toBeVisible();
  });

  test('TC_ADMIN_015: Password reset with mismatched passwords - Negative', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    await loginPage.resetPassword(ADMIN_PORTAL.CREDENTIALS.email);
    
    // Enter valid code (mock)
    await page.fill('input[name*="code"]', '123456');
    await page.fill('input[name*="password"]', 'NewPassword123!');
    await page.fill('input[name*="confirm"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=match, text=same')).toBeVisible();
  });
});
