import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreLoginAuth() {
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    login: {},
    signup: {},
    forgotPassword: {},
    navigation: {},
    buttons: {},
    inputs: {},
    errors: {}
  };

  try {
    console.log('=== EXPLORING LOGIN & AUTHENTICATION ===\n');

    // 1. Explore public browsing (no auth)
    console.log('1. Testing public browse without authentication...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('2. Taking homepage screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-01-homepage.png', fullPage: true });

    // Check if Buy Voucher link is accessible
    const buyLink = page.locator('a[href="/buy"]').first();
    if (await buyLink.isVisible()) {
      console.log('  ✓ Buy Voucher link found: a[href="/buy"]');
      selectors.navigation.buyVoucher = 'a[href="/buy"]';
      
      await buyLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('3. Taking buy page screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/auth-02-buy-page.png', fullPage: true });
    }

    // 2. Explore Login Page
    console.log('\n4. Navigating to login page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('5. Taking login page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-03-login-page.png', fullPage: true });

    // Extract login form elements
    console.log('6. Extracting login form elements...');
    
    const emailInput = page.locator('input[id="email"], input[type="email"], input[name="email"]');
    if (await emailInput.count() > 0) {
      const id = await emailInput.first().getAttribute('id');
      const type = await emailInput.first().getAttribute('type');
      const name = await emailInput.first().getAttribute('name');
      console.log(`  Email input: id="${id}", type="${type}", name="${name}"`);
      selectors.login.emailInput = `input[id="${id}"]`;
    }

    const passwordInput = page.locator('input[id="password"], input[type="password"], input[name="password"]');
    if (await passwordInput.count() > 0) {
      const id = await passwordInput.first().getAttribute('id');
      const type = await passwordInput.first().getAttribute('type');
      const name = await passwordInput.first().getAttribute('name');
      console.log(`  Password input: id="${id}", type="${type}", name="${name}"`);
      selectors.login.passwordInput = `input[id="${id}"]`;
    }

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")');
    if (await submitButton.count() > 0) {
      const text = await submitButton.first().textContent();
      const type = await submitButton.first().getAttribute('type');
      console.log(`  Submit button: type="${type}", text="${text?.trim()}"`);
      selectors.login.submitButton = 'button[type="submit"]';
    }

    // Check for Forgot Password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot Password"), a:has-text("Forgot")');
    if (await forgotPasswordLink.isVisible()) {
      const text = await forgotPasswordLink.textContent();
      console.log(`  Forgot Password link: "${text?.trim()}"`);
      selectors.login.forgotPasswordLink = 'a:has-text("Forgot Password"), a:has-text("Forgot")';
    }

    // Check for Sign Up link
    const signUpLinkOnLogin = page.locator('a:has-text("Sign Up"), a[href*="signup"]');
    if (await signUpLinkOnLogin.isVisible()) {
      const text = await signUpLinkOnLogin.textContent();
      const href = await signUpLinkOnLogin.getAttribute('href');
      console.log(`  Sign Up link: "${text?.trim()}" -> ${href}`);
      selectors.login.signUpLink = 'a:has-text("Sign Up"), a[href*="signup"]';
    }

    // 3. Test login with correct credentials
    console.log('\n7. Testing login with correct credentials...');
    await page.fill('input[id="email"]', 'lindaamalia@axrail.com');
    await page.fill('input[id="password"]', 'Rahasia567_');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('8. Taking post-login screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-04-after-login.png', fullPage: true });

    // Check if redirected away from login
    const postLoginUrl = page.url();
    console.log(`  Current URL: ${postLoginUrl}`);
    if (!postLoginUrl.includes('login')) {
      console.log('  ✓ Successfully logged in and redirected');
    }

    // 4. Explore Sign Up Page
    console.log('\n9. Signing out to access signup page...');
    // Sign out first if logged in
    const signOutButton = page.locator('button:has-text("Sign Out")');
    if (await signOutButton.isVisible()) {
      console.log('  User is logged in, signing out...');
      await signOutButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    console.log('10. Navigating to login page to find signup link...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Scroll down to find Sign Up link
    console.log('11. Scrolling down to find Sign Up link...');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);
    
    console.log('12. Taking login page with signup link screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-05-login-with-signup.png', fullPage: true });
    
    // Find and click Sign Up link
    const signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("sign up"), a[href*="signup"]');
    if (await signUpLink.isVisible()) {
      const text = await signUpLink.textContent();
      const href = await signUpLink.getAttribute('href');
      console.log(`  ✓ Sign Up link found: "${text?.trim()}" -> ${href}`);
      selectors.login.signUpLink = 'a:has-text("Sign Up"), a[href*="signup"]';
      
      await signUpLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      // Try direct navigation if link not found
      console.log('  Sign Up link not found, trying direct navigation...');
      await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    console.log('13. Taking signup page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-06-signup-page.png', fullPage: true });

    // Save HTML for detailed analysis
    const signupContent = await page.content();
    fs.writeFileSync('playwright-tests/signup-page.html', signupContent);

    // Extract signup form elements
    console.log('14. Extracting signup form elements...');
    
    const inputs = await page.locator('input').all();
    console.log(`\nFound ${inputs.length} input fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const isVisible = await inputs[i].isVisible();
      
      if (isVisible) {
        console.log(`  [${i}] type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
        
        // Map common fields
        if (name === 'name' || placeholder?.toLowerCase().includes('name')) {
          selectors.signup.nameInput = name ? `input[name="${name}"]` : `input[placeholder*="name" i]`;
        }
        if (type === 'email' || name === 'email') {
          selectors.signup.emailInput = name ? `input[name="${name}"]` : 'input[type="email"]';
        }
        if (placeholder?.toLowerCase().includes('phone') || name?.toLowerCase().includes('phone')) {
          selectors.signup.phoneInput = name ? `input[name="${name}"]` : `input[placeholder*="phone" i]`;
        }
        if (type === 'password' && !name?.includes('confirm')) {
          selectors.signup.passwordInput = name ? `input[name="${name}"]` : 'input[type="password"]';
        }
        if (name?.includes('confirm') || placeholder?.toLowerCase().includes('confirm')) {
          selectors.signup.confirmPasswordInput = name ? `input[name="${name}"]` : `input[placeholder*="confirm" i]`;
        }
        if (placeholder?.toLowerCase().includes('nric') || placeholder?.toLowerCase().includes('id')) {
          selectors.signup.idNumberInput = name ? `input[name="${name}"]` : `input[placeholder*="nric" i]`;
        }
        if (placeholder?.toLowerCase().includes('address') || name?.toLowerCase().includes('address')) {
          selectors.signup.addressInput = name ? `input[name="${name}"]` : `input[placeholder*="address" i]`;
        }
        if (placeholder?.toLowerCase().includes('postal') || name?.toLowerCase().includes('postal')) {
          selectors.signup.postalCodeInput = name ? `input[name="${name}"]` : `input[placeholder*="postal" i]`;
        }
        if (placeholder?.toLowerCase().includes('city') || name?.toLowerCase().includes('city')) {
          selectors.signup.cityInput = name ? `input[name="${name}"]` : `input[placeholder*="city" i]`;
        }
        if (placeholder?.toLowerCase().includes('state') || name?.toLowerCase().includes('state')) {
          selectors.signup.stateInput = name ? `input[name="${name}"]` : `input[placeholder*="state" i]`;
        }
      }
    }

    // Extract select/dropdown elements
    const selects = await page.locator('select').all();
    console.log(`\nFound ${selects.length} select/dropdown fields:`);
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const id = await selects[i].getAttribute('id');
      const isVisible = await selects[i].isVisible();
      
      if (isVisible) {
        console.log(`  [${i}] name="${name}", id="${id}"`);
        
        if (name?.toLowerCase().includes('country')) {
          selectors.signup.countrySelect = name ? `select[name="${name}"]` : 'select';
        }
        if (name?.toLowerCase().includes('idtype') || name?.toLowerCase().includes('id_type')) {
          selectors.signup.idTypeSelect = name ? `select[name="${name}"]` : 'select';
        }
      }
    }

    // Extract buttons
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const isVisible = await buttons[i].isVisible();
      
      if (isVisible && text?.trim()) {
        console.log(`  [${i}] "${text?.trim()}" (type="${type}")`);
        
        if (text?.toLowerCase().includes('next')) {
          selectors.signup.nextButton = 'button:has-text("Next")';
        }
        if (text?.toLowerCase().includes('submit') || type === 'submit') {
          selectors.signup.submitButton = 'button[type="submit"]';
        }
        if (text?.toLowerCase().includes('back')) {
          selectors.signup.backButton = 'button:has-text("Back")';
        }
      }
    }

    // 5. Test filling signup form
    console.log('\n15. Testing signup form fill...');
    
    // Check if we're on the actual signup page (not profile page)
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('signup')) {
      // Try to fill basic fields
      const nameField = page.locator('input[name="name"]').first();
      if (await nameField.isVisible() && await nameField.isEnabled()) {
        await nameField.fill('Test User');
        console.log('  ✓ Filled name field');
      }

      const emailField = page.locator('input[name="email"]').first();
      if (await emailField.isVisible() && await emailField.isEnabled()) {
        await emailField.fill('testuser_001@yopmail.com');
        console.log('  ✓ Filled email field');
      }

      const phoneField = page.locator('input[name="phoneNumber"]').first();
      if (await phoneField.isVisible() && await phoneField.isEnabled()) {
        await phoneField.fill('60104411234');
        console.log('  ✓ Filled phone field');
      }

      await page.waitForTimeout(1000);

      console.log('16. Taking filled signup form screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/auth-07-signup-filled.png', fullPage: true });
    } else {
      console.log('  Not on signup page, skipping form fill test');
    }

    // 6. Test Forgot Password flow
    console.log('\n17. Testing Forgot Password flow...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const forgotLink = page.locator('a:has-text("Forgot Password"), a:has-text("Forgot")');
    if (await forgotLink.isVisible()) {
      console.log('  ✓ Forgot Password link found');
      await forgotLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('18. Taking forgot password page screenshot...');
      await page.screenshot({ path: 'playwright-tests/screenshots/auth-08-forgot-password.png', fullPage: true });

      // Extract forgot password elements
      const forgotInputs = await page.locator('input').all();
      console.log(`\nForgot Password page inputs (${forgotInputs.length}):`);
      for (let i = 0; i < forgotInputs.length; i++) {
        const type = await forgotInputs[i].getAttribute('type');
        const placeholder = await forgotInputs[i].getAttribute('placeholder');
        const isVisible = await forgotInputs[i].isVisible();
        if (isVisible) {
          console.log(`  [${i}] type="${type}", placeholder="${placeholder}"`);
        }
      }
    }

    // Save all selectors
    console.log('\n19. Saving selectors to file...');
    fs.writeFileSync(
      'playwright-tests/login-auth-selectors.json',
      JSON.stringify(selectors, null, 2)
    );

    console.log('\n=== EXPLORATION COMPLETE ===');
    console.log('\nKey Selectors Found:');
    console.log('Login:', Object.keys(selectors.login));
    console.log('Signup:', Object.keys(selectors.signup));
    console.log('\nFiles saved:');
    console.log('  - login-auth-selectors.json');
    console.log('  - signup-page.html');
    console.log('  - Screenshots in screenshots/ folder');

  } catch (error) {
    console.error('Error during exploration:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/auth-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreLoginAuth();
