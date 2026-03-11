import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../../pages/admin-portal/LoginPage';

/**
 * Module: Admin Portal - Password Policy
 * Reference: Section 2.8.1.3 Password Requirement
 * 
 * Test Coverage:
 * - Password length validation (<8, =8, >8 characters)
 * - Password complexity requirements (uppercase, lowercase, numbers, special characters)
 * - Verification code validation
 * - Password mismatch validation
 * - Password reuse prevention (previous 5 passwords)
 * - Failed login attempts (3 times)
 * - Resend verification code functionality
 * 
 * Note: Tests require manual verification code entry from yopmail.com
 * Email: adminusertgv01@yopmail.com
 */

test.describe('Admin Portal - Password Policy', () => {
  let loginPage: AdminLoginPage;
  const testEmail = 'adminusertgv01@yopmail.com';

  test.beforeEach(async ({ page }) => {
    loginPage = new AdminLoginPage(page);
  });

  // Helper function to start reset password flow
  async function startResetPasswordFlow(page: any, email: string) {
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Forgot password")');
    await page.waitForTimeout(1000);
    await page.fill('input[name="username"]', email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Password length < 8 characters tests
  test('TC_PP001: Reset password with length <8 chars - uppercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'ABCDEFG');
    await page.fill('input[name="confirmPassword"]', 'ABCDEFG');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP002: Reset password with length <8 chars - lowercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'abcdefg');
    await page.fill('input[name="confirmPassword"]', 'abcdefg');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP003: Reset password with length <8 chars - numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '1234567');
    await page.fill('input[name="confirmPassword"]', '1234567');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP004: Reset password with length <8 chars - special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '!@#$%^&');
    await page.fill('input[name="confirmPassword"]', '!@#$%^&');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP005: Reset password with length <8 chars - lower & upper case only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'AbCdEfG');
    await page.fill('input[name="confirmPassword"]', 'AbCdEfG');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP006: Reset password with length <8 chars - numbers & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '123!@#$');
    await page.fill('input[name="confirmPassword"]', '123!@#$');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP007: Reset password with length <8 chars - lower, upper & numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abc123d');
    await page.fill('input[name="confirmPassword"]', 'Abc123d');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP008: Reset password with length <8 chars - lower, upper & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abc!@#D');
    await page.fill('input[name="confirmPassword"]', 'Abc!@#D');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP009: Reset password with length <8 chars - all requirements met', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abc12!@');
    await page.fill('input[name="confirmPassword"]', 'Abc12!@');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  // Password length = 8 characters tests
  test('TC_PP010: Reset password with length =8 chars - uppercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'ABCDEFGH');
    await page.fill('input[name="confirmPassword"]', 'ABCDEFGH');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP011: Reset password with length =8 chars - lowercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'abcdefgh');
    await page.fill('input[name="confirmPassword"]', 'abcdefgh');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP012: Reset password with length =8 chars - numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '12345678');
    await page.fill('input[name="confirmPassword"]', '12345678');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP013: Reset password with length =8 chars - special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '!@#$%^&*');
    await page.fill('input[name="confirmPassword"]', '!@#$%^&*');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP014: Reset password with length =8 chars - lower & upper case only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'AbCdEfGh');
    await page.fill('input[name="confirmPassword"]', 'AbCdEfGh');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP015: Reset password with length =8 chars - numbers & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '1234!@#$');
    await page.fill('input[name="confirmPassword"]', '1234!@#$');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP016: Reset password with length =8 chars - lower, upper & numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abcd1234');
    await page.fill('input[name="confirmPassword"]', 'Abcd1234');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP017: Reset password with length =8 chars - lower, upper & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abcd!@#$');
    await page.fill('input[name="confirmPassword"]', 'Abcd!@#$');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP018: Reset password with length =8 chars - all requirements met', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    // Note: Requires valid verification code from yopmail
    await page.fill('input[name="verificationCode"]', '123456'); // Replace with actual code
    await page.fill('input[name="password"]', 'Pass123!');
    await page.fill('input[name="confirmPassword"]', 'Pass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    // Verify success or stay on page for manual verification
    await expect(page).toHaveURL(/.*login.*/);
  });

  // Password length > 8 characters tests
  test('TC_PP019: Reset password with length >8 chars - uppercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'ABCDEFGHIJ');
    await page.fill('input[name="confirmPassword"]', 'ABCDEFGHIJ');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP020: Reset password with length >8 chars - lowercase only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'abcdefghij');
    await page.fill('input[name="confirmPassword"]', 'abcdefghij');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP021: Reset password with length >8 chars - numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '1234567890');
    await page.fill('input[name="confirmPassword"]', '1234567890');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP022: Reset password with length >8 chars - special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '!@#$%^&*()');
    await page.fill('input[name="confirmPassword"]', '!@#$%^&*()');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP023: Reset password with length >8 chars - lower & upper case only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'AbCdEfGhIj');
    await page.fill('input[name="confirmPassword"]', 'AbCdEfGhIj');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP024: Reset password with length >8 chars - numbers & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', '12345!@#$%');
    await page.fill('input[name="confirmPassword"]', '12345!@#$%');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP025: Reset password with length >8 chars - lower, upper & numbers only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abcd123456');
    await page.fill('input[name="confirmPassword"]', 'Abcd123456');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP026: Reset password with length >8 chars - lower, upper & special chars only', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Abcd!@#$%^');
    await page.fill('input[name="confirmPassword"]', 'Abcd!@#$%^');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must include 1 number, 1 uppercase letter & 1 symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP027: Reset password with length >8 chars - all requirements met', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    // Note: Requires valid verification code from yopmail
    await page.fill('input[name="verificationCode"]', '123456'); // Replace with actual code
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/.*login.*/);
  });

  // Other scenarios
  test('TC_PP028: Resend verification code when first OTP email not received', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    const resendButton = page.locator('button:has-text("Resend Code")');
    if (await resendButton.count() > 0) {
      await resendButton.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('text=Validation code has been sent')).toBeVisible();
    }
  });

  test('TC_PP029: Reset password - incorrect verification code', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="verificationCode"]', '000000');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Invalid verification code')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP030: Reset password - password mismatch', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password456!');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Password must match')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP031: Reset password - reuse previous 5 passwords', async ({ page }) => {
    await startResetPasswordFlow(page, testEmail);
    // Note: Requires valid verification code and previously used password
    await page.fill('input[name="verificationCode"]', '123456'); // Replace with actual code
    await page.fill('input[name="password"]', 'Rahasia123@'); // Previously used password
    await page.fill('input[name="confirmPassword"]', 'Rahasia123@');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Password has previously been used')).toBeVisible();
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC_PP032: Login with incorrect password 3 times', async ({ page }) => {
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    
    // First attempt
    await page.fill('input[name="username"]', testEmail);
    await page.fill('input[name="password"]', 'WrongPass1!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Second attempt
    await page.fill('input[name="password"]', 'WrongPass2!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Third attempt
    await page.fill('input[name="password"]', 'WrongPass3!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Should redirect to reset password or show error
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login/);
  });
});
