import { chromium } from 'playwright';
import * as fs from 'fs';

async function explorePasswordPolicy() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    loginPage: {},
    resetPasswordPage: {},
    validationMessages: {},
    buttons: {},
    inputs: {}
  };

  const log: string[] = [];

  try {
    log.push('=== EXPLORING PASSWORD POLICY FLOW ===\n');
    
    // Navigate to login page
    log.push('Step 1: Navigate to Admin Portal login page');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'playwright-tests/screenshots/password-policy-login.png' });
    
    // Check for Reset Password link
    log.push('\nStep 2: Looking for Reset Password link...');
    const resetPasswordSelectors = [
      'a:has-text("Reset Password")',
      'a:has-text("Forgot Password")',
      'a:has-text("reset password")',
      'a:has-text("forgot password")',
      'a[href*="reset"]',
      'a[href*="forgot"]',
      'button:has-text("Reset Password")',
      'button:has-text("Forgot Password")'
    ];
    
    let resetPasswordLink = null;
    for (const selector of resetPasswordSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        log.push(`✓ Found Reset Password link: ${selector}`);
        selectors.loginPage.resetPasswordLink = selector;
        resetPasswordLink = element;
        break;
      }
    }
    
    if (!resetPasswordLink) {
      log.push('✗ Reset Password link not found, checking page content...');
      const pageContent = await page.content();
      log.push('Page HTML snippet:');
      log.push(pageContent.substring(0, 2000));
    }
    
    // Click Reset Password
    if (resetPasswordLink) {
      log.push('\nStep 3: Clicking Reset Password link...');
      await resetPasswordLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'playwright-tests/screenshots/password-policy-reset-page.png' });
      
      // Check current URL
      const currentUrl = page.url();
      log.push(`Current URL: ${currentUrl}`);
      
      // Find email/username input
      log.push('\nStep 4: Looking for email/username input...');
      const emailSelectors = [
        'input[name="username"]',
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="username" i]',
        'input[id*="email" i]',
        'input[id*="username" i]'
      ];
      
      for (const selector of emailSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log.push(`✓ Found email input: ${selector}`);
          selectors.resetPasswordPage.emailInput = selector;
          
          // Fill email
          await element.fill('lindaamalia+1@axrail.com');
          log.push('✓ Filled email address');
          break;
        }
      }
      
      // Find submit button
      log.push('\nStep 5: Looking for submit button...');
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Send")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'input[type="submit"]'
      ];
      
      for (const selector of submitSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log.push(`✓ Found submit button: ${selector}`);
          selectors.resetPasswordPage.submitButton = selector;
          
          // Click submit
          await element.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'playwright-tests/screenshots/password-policy-after-submit.png' });
          log.push('✓ Clicked submit button');
          break;
        }
      }
      
      // Look for verification code input
      log.push('\nStep 6: Looking for verification code input...');
      const codeSelectors = [
        'input[name="verificationCode"]',
        'input[name="code"]',
        'input[name="otp"]',
        'input[placeholder*="code" i]',
        'input[placeholder*="verification" i]',
        'input[id*="code" i]',
        'input[id*="verification" i]'
      ];
      
      for (const selector of codeSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log.push(`✓ Found verification code input: ${selector}`);
          selectors.resetPasswordPage.verificationCodeInput = selector;
          break;
        }
      }
      
      // Look for password inputs
      log.push('\nStep 7: Looking for password inputs...');
      const passwordSelectors = [
        'input[name="password"]',
        'input[name="newPassword"]',
        'input[type="password"]'
      ];
      
      const passwordInputs = await page.locator('input[type="password"]').all();
      log.push(`Found ${passwordInputs.length} password inputs`);
      
      if (passwordInputs.length >= 2) {
        selectors.resetPasswordPage.newPasswordInput = 'input[type="password"]:nth-of-type(1)';
        selectors.resetPasswordPage.confirmPasswordInput = 'input[type="password"]:nth-of-type(2)';
        log.push('✓ Identified password and confirm password inputs');
        
        // Try filling with invalid password to trigger validation
        log.push('\nStep 8: Testing password validation...');
        await passwordInputs[0].fill('ABCDEFG');
        await passwordInputs[1].fill('ABCDEFG');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'playwright-tests/screenshots/password-policy-validation.png' });
        
        // Look for validation messages
        log.push('\nStep 9: Looking for validation messages...');
        const validationSelectors = [
          'text=Password must include 1 number, 1 uppercase letter & 1 symbol',
          'text=Password must include',
          '[class*="error"]',
          '[class*="validation"]',
          '[class*="message"]',
          '.error-message',
          '.validation-message',
          'p[class*="error"]',
          'span[class*="error"]',
          'div[class*="error"]'
        ];
        
        for (const selector of validationSelectors) {
          const element = await page.locator(selector).first();
          if (await element.count() > 0) {
            const text = await element.textContent();
            log.push(`✓ Found validation message: ${selector}`);
            log.push(`  Text: ${text}`);
            selectors.validationMessages.passwordRequirement = selector;
          }
        }
      }
      
      // Look for Resend Code button
      log.push('\nStep 10: Looking for Resend Code button...');
      const resendSelectors = [
        'button:has-text("Resend Code")',
        'button:has-text("Resend")',
        'a:has-text("Resend Code")',
        'a:has-text("Resend")',
        '[class*="resend"]'
      ];
      
      for (const selector of resendSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          log.push(`✓ Found Resend Code button: ${selector}`);
          selectors.resetPasswordPage.resendCodeButton = selector;
          break;
        }
      }
      
      // Test with valid password
      log.push('\nStep 11: Testing with valid password...');
      if (passwordInputs.length >= 2) {
        await passwordInputs[0].fill('Password123!');
        await passwordInputs[1].fill('Password123!');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'playwright-tests/screenshots/password-policy-valid-password.png' });
      }
      
      // Look for success message selectors
      log.push('\nStep 12: Looking for success message patterns...');
      const successSelectors = [
        'text=Success',
        'text=success',
        'text=Password reset successful',
        '[class*="success"]',
        '.success-message',
        'div[role="alert"]'
      ];
      
      for (const selector of successSelectors) {
        log.push(`Checking: ${selector}`);
        selectors.validationMessages.successPattern = 'text=Success';
      }
      
      // Look for error message patterns
      log.push('\nStep 13: Error message patterns...');
      selectors.validationMessages.invalidCode = 'text=Invalid verification code';
      selectors.validationMessages.passwordMismatch = 'text=Password must match';
      selectors.validationMessages.passwordReused = 'text=Password has previously been used';
      
      // Get page structure
      log.push('\nStep 14: Analyzing page structure...');
      const formElements = await page.locator('form').all();
      log.push(`Found ${formElements.length} form(s)`);
      
      const allInputs = await page.locator('input').all();
      log.push(`Found ${allInputs.length} input(s)`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const name = await allInputs[i].getAttribute('name');
        const type = await allInputs[i].getAttribute('type');
        const placeholder = await allInputs[i].getAttribute('placeholder');
        log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
      }
      
      const allButtons = await page.locator('button').all();
      log.push(`Found ${allButtons.length} button(s)`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent();
        const type = await allButtons[i].getAttribute('type');
        log.push(`  Button ${i + 1}: text="${text?.trim()}", type="${type}"`);
      }
    }
    
    // Go back to login to test failed login attempts
    log.push('\n\n=== TESTING FAILED LOGIN ATTEMPTS ===');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    
    log.push('\nStep 15: Looking for login form inputs...');
    const loginEmailInput = await page.locator('input[name="username"], input[name="email"], input[type="email"]').first();
    const loginPasswordInput = await page.locator('input[name="password"], input[type="password"]').first();
    const loginButton = await page.locator('button[type="submit"]').first();
    
    if (await loginEmailInput.count() > 0) {
      selectors.loginPage.emailInput = 'input[name="username"], input[name="email"], input[type="email"]';
      log.push('✓ Found login email input');
    }
    
    if (await loginPasswordInput.count() > 0) {
      selectors.loginPage.passwordInput = 'input[name="password"], input[type="password"]';
      log.push('✓ Found login password input');
    }
    
    if (await loginButton.count() > 0) {
      selectors.loginPage.loginButton = 'button[type="submit"]';
      log.push('✓ Found login button');
    }
    
    log.push('\n=== EXPLORATION COMPLETE ===');
    
  } catch (error) {
    log.push(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    // Save selectors to JSON
    fs.writeFileSync(
      'playwright-tests/password-policy-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    
    // Save log
    fs.writeFileSync(
      'playwright-tests/password-policy-exploration-log.txt',
      log.join('\n')
    );
    
    console.log('\n' + log.join('\n'));
    console.log('\n✓ Selectors saved to: password-policy-selectors.json');
    console.log('✓ Log saved to: password-policy-exploration-log.txt');
    
    await browser.close();
  }
}

explorePasswordPolicy();
