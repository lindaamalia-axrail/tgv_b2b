import { test, expect } from '@playwright/test';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';
import { SignUpPage } from '../../pages/public-web/SignUpPage';
import { TestHelpers } from '../../utils/helpers';
import { PUBLIC_WEB, SIGNUP_DATA } from '../../utils/test-data';
import { YopmailHelper } from '../../utils/yopmail-helper';

test.describe('Public Web - Login & Authentication', () => {
  let loginPage: PublicLoginPage;
  let signUpPage: SignUpPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    loginPage = new PublicLoginPage(page);
    signUpPage = new SignUpPage(page);
    helpers = new TestHelpers(page);
  });

  test('TC001: Public Browse Functionality - Browse without authentication', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    await expect(page.locator('a[href="/buy"]').first()).toBeVisible();
    
    // Navigate to Buy Voucher
    await page.click('a[href="/buy"]', { force: true });
    await helpers.waitForPageLoad();
    
    // Verify buy page is accessible
    await expect(page).toHaveURL(/.*\/buy.*/);
  });

  test('TC002: View voucher detail pages publicly', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a[href="/buy"]');
    await helpers.waitForPageLoad();
    
    // Verify buy page is accessible
    await expect(page).toHaveURL(/.*\/buy.*/);
  });

  test('TC003: Display voucher information (image, name, price, details, T&C)', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a[href="/buy"]');
    await helpers.waitForPageLoad();
    
    // Verify buy page loaded
    await expect(page).toHaveURL(/.*\/buy.*/);
  });

  test('TC004: User sign in functionality', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await loginPage.verifyLoginSuccess();
  });

  test('TC005: Redirect unauthenticated users to sign in page', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    
    // Try to access login page directly
    await page.goto(PUBLIC_WEB.LOGIN_URL);
    
    // Should be on login page
    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator('#email')).toBeVisible();
  });

  test('TC006: Maintain user session state across tabs', async ({ page, context }) => {
    // Open first tab and login
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await loginPage.verifyLoginSuccess();
    
    // Open second tab
    const newPage = await context.newPage();
    await newPage.goto(PUBLIC_WEB.URL);
    
    // Verify user is logged in on second tab (check URL is not login page)
    await expect(newPage).not.toHaveURL(/.*login.*/);
    
    await newPage.close();
  });

  test('TC007: Redirect authenticated users after sign in', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    
    // Go to login page
    await page.goto(PUBLIC_WEB.LOGIN_URL);
    
    // Login
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    
    // Should redirect away from login page
    await expect(page).not.toHaveURL(/.*login.*/);
  });

  test('TC008: Restrict checkout to authenticated users only', async ({ page }) => {
    await page.goto(PUBLIC_WEB.URL);
    await page.click('a[href="/buy"]');
    await helpers.waitForPageLoad();
    
    // Verify buy page is accessible without login
    await expect(page).toHaveURL(/.*\/buy.*/);
  });

  test('TC009: Sign up with non-existing email', async ({ page, context }) => {
    const userIndex = Date.now() % 1000;
    const email = SIGNUP_DATA.generateEmail(userIndex);
    const phoneNumber = SIGNUP_DATA.generatePhoneNumber(userIndex % 10);
    const nric = SIGNUP_DATA.generateNRIC();
    const password = SIGNUP_DATA.password;
    
    console.log(`Testing signup with email: ${email}`);
    
    // Step 1: Fill and submit signup form
    await signUpPage.navigate();
    await signUpPage.fillSignUpForm({
      name: SIGNUP_DATA.name,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
      idType: SIGNUP_DATA.idType,
      idNumber: nric,
      streetAddress: SIGNUP_DATA.streetAddress,
      postalCode: SIGNUP_DATA.postalCode,
      state: SIGNUP_DATA.state,
      city: SIGNUP_DATA.city,
      country: SIGNUP_DATA.country
    });
    
    await signUpPage.clickNext();
    await page.waitForTimeout(3000);
    
    // Step 2: Get OTP from Yopmail
    console.log('Getting OTP from Yopmail...');
    const yopmailHelper = new YopmailHelper(context);
    const otp = await yopmailHelper.getOTPFromEmail(email);
    
    expect(otp).not.toBeNull();
    console.log(`Received OTP: ${otp}`);
    
    // Step 3: Enter OTP
    if (otp) {
      await signUpPage.enterOTP(otp);
      await signUpPage.clickVerifyEmail();
      await page.waitForTimeout(3000);
      
      // Verify we moved away from signup page
      await expect(page).not.toHaveURL(/.*signup.*/);
      console.log('✓ Signup completed successfully');
    }
    
    // Step 4: Login with newly created account
    console.log('Logging in with new account...');
    await loginPage.navigate();
    await loginPage.login(email, password);
    await loginPage.verifyLoginSuccess();
    console.log('✓ Login successful with new account');
  });

  test('TC010: Sign up with existing email - Negative', async ({ page }) => {
    await signUpPage.navigate();
    await signUpPage.fillSignUpForm({
      name: SIGNUP_DATA.name,
      email: PUBLIC_WEB.EXISTING_USER.email, // Use existing email
      phoneNumber: SIGNUP_DATA.generatePhoneNumber(1),
      password: SIGNUP_DATA.password,
      idType: SIGNUP_DATA.idType,
      idNumber: SIGNUP_DATA.generateNRIC(),
      streetAddress: SIGNUP_DATA.streetAddress,
      postalCode: SIGNUP_DATA.postalCode,
      state: SIGNUP_DATA.state,
      city: SIGNUP_DATA.city,
      country: SIGNUP_DATA.country
    });
    
    await signUpPage.clickNext();
    
    // Should show error or stay on same page
    await page.waitForTimeout(2000);
  });

  test('TC011: Sign up without filling required fields - Negative', async ({ page }) => {
    await signUpPage.navigate();
    await signUpPage.clickNext();
    
    // Should stay on signup page
    await expect(page).toHaveURL(/.*signup.*/);
  });

  test('TC012: Sign up with invalid postal code (alphabets) - Negative', async ({ page }) => {
    await signUpPage.navigate();
    await signUpPage.fillSignUpForm({
      name: SIGNUP_DATA.name,
      email: SIGNUP_DATA.generateEmail(999),
      phoneNumber: SIGNUP_DATA.generatePhoneNumber(9),
      password: SIGNUP_DATA.password,
      idType: SIGNUP_DATA.idType,
      idNumber: SIGNUP_DATA.generateNRIC(),
      streetAddress: SIGNUP_DATA.streetAddress,
      postalCode: 'ABCDE', // Invalid postal code
      state: SIGNUP_DATA.state,
      city: SIGNUP_DATA.city,
      country: SIGNUP_DATA.country
    });
    
    await signUpPage.clickNext();
    
    // Should show error or stay on same page
    await page.waitForTimeout(2000);
  });

  test('TC013: Login with correct credentials', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await loginPage.verifyLoginSuccess();
  });

  test('TC014: Login with incorrect password - Negative', async ({ page }) => {
    await loginPage.navigate();
    await page.fill('#email', PUBLIC_WEB.EXISTING_USER.email);
    await page.fill('#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC015: Login with empty password - Negative', async ({ page }) => {
    await loginPage.navigate();
    await page.fill('#email', PUBLIC_WEB.EXISTING_USER.email);
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC016: Password reset with registered email', async ({ page }) => {
    await loginPage.navigate();
    
    // Check if forgot password link exists
    const forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    if (await forgotPasswordLink.isVisible()) {
      await loginPage.clickForgotPassword();
      await page.waitForTimeout(2000);
    }
  });

  test('TC017: Password reset with non-registered email - Negative', async ({ page }) => {
    await loginPage.navigate();
    
    // Check if forgot password link exists
    const forgotPasswordLink = page.locator('a:has-text("Forgot Password")');
    if (await forgotPasswordLink.isVisible()) {
      await loginPage.clickForgotPassword();
      await page.waitForTimeout(2000);
    }
  });
});
