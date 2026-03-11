import { chromium } from 'playwright';
import * as fs from 'fs';
import * as readline from 'readline';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function explorePasswordPolicyManual() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    loginPage: {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      signInButton: 'button[type="submit"]:has-text("Sign in")',
      forgotPasswordButton: 'button:has-text("Forgot password")'
    },
    resetPasswordPage: {},
    validationMessages: {},
  };

  const log: string[] = [];
  const email = 'adminusertgv01@yopmail.com';

  try {
    log.push('=== EXPLORING PASSWORD POLICY FLOW - MANUAL ===\n');
    
    // Step 1: Navigate to login page
    log.push('Step 1: Navigate to Admin Portal login page');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/pp-01-login-page.png' });
    log.push('✓ Login page loaded');
    
    // Step 2: Click Forgot Password
    log.push('\nStep 2: Click "Forgot password" button');
    await page.click('button:has-text("Forgot password")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/pp-02-forgot-password.png' });
    log.push(`Current URL: ${page.url()}`);
    
    // Step 3: Analyze reset password page
    log.push('\n=== RESET PASSWORD PAGE ANALYSIS ===');
    const inputs = await page.locator('input').all();
    log.push(`\nFound ${inputs.length} inputs:`);
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
      
      if (name === 'username' || name === 'email') {
        selectors.resetPasswordPage.usernameInput = `input[name="${name}"]`;
      }
    }
    
    const buttons = await page.locator('button').all();
    log.push(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      log.push(`  Button ${i + 1}: text="${text?.trim()}", type="${type}"`);
      
      if (type === 'submit') {
        selectors.resetPasswordPage.submitButton = 'button[type="submit"]';
      }
    }
    
    // Step 4: Fill username and submit
    log.push('\n\nStep 4: Fill username and submit');
    await page.fill(selectors.resetPasswordPage.usernameInput, email);
    log.push('✓ Filled username');
    await page.waitForTimeout(1000);
    
    await page.click(selectors.resetPasswordPage.submitButton);
    log.push('✓ Clicked submit');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'playwright-tests/screenshots/pp-03-after-submit.png' });
    
    // Step 5: Analyze page after submission
    log.push('\n=== AFTER USERNAME SUBMISSION ===');
    const afterInputs = await page.locator('input').all();
    log.push(`\nFound ${afterInputs.length} inputs:`);
    
    for (let i = 0; i < afterInputs.length; i++) {
      const name = await afterInputs[i].getAttribute('name');
      const type = await afterInputs[i].getAttribute('type');
      const placeholder = await afterInputs[i].getAttribute('placeholder');
      log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
      
      if (name === 'verificationCode' || name === 'code' || name === 'otp') {
        selectors.resetPasswordPage.verificationCodeInput = `input[name="${name}"]`;
      } else if (type === 'password' && !selectors.resetPasswordPage.passwordInput) {
        selectors.resetPasswordPage.passwordInput = `input[name="${name}"]`;
      } else if (type === 'password' && selectors.resetPasswordPage.passwordInput) {
        selectors.resetPasswordPage.confirmPasswordInput = `input[name="${name}"]`;
      }
    }
    
    const afterButtons = await page.locator('button').all();
    log.push(`\nFound ${afterButtons.length} buttons:`);
    for (let i = 0; i < afterButtons.length; i++) {
      const text = await afterButtons[i].textContent();
      log.push(`  Button ${i + 1}: text="${text?.trim()}"`);
      
      if (text?.toLowerCase().includes('resend')) {
        selectors.resetPasswordPage.resendButton = `button:has-text("${text.trim()}")`;
      }
    }
    
    // Step 6: Test password validation
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      log.push('\n\nStep 6: Testing password validation');
      
      // Test 1: Uppercase only
      log.push('\n--- Test: Uppercase only (<8 chars) ---');
      await passwordInputs[0].fill('ABCDEFG');
      await passwordInputs[1].fill('ABCDEFG');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'playwright-tests/screenshots/pp-04-uppercase-only.png' });
      
      let pageText = await page.locator('body').textContent();
      if (pageText?.includes('Password must include')) {
        log.push('✓ Found validation message');
        
        const possibleSelectors = [
          'text=Password must include 1 number, 1 uppercase letter & 1 symbol',
          'text=Password must include',
          'p:has-text("Password must include")',
          'span:has-text("Password must include")',
          'div:has-text("Password must include")'
        ];
        
        for (const sel of possibleSelectors) {
          const elem = await page.locator(sel).first();
          if (await elem.count() > 0) {
            const text = await elem.textContent();
            log.push(`  ✓ Selector: ${sel}`);
            log.push(`    Message: ${text?.trim()}`);
            selectors.validationMessages.passwordRequirement = sel;
            break;
          }
        }
      }
      
      // Test 2: Password mismatch
      log.push('\n--- Test: Password mismatch ---');
      await passwordInputs[0].fill('Password123!');
      await passwordInputs[1].fill('Password456!');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'playwright-tests/screenshots/pp-05-mismatch.png' });
      
      pageText = await page.locator('body').textContent();
      if (pageText?.includes('must match') || pageText?.includes('do not match')) {
        log.push('✓ Found mismatch message');
        
        const mismatchSelectors = [
          'text=Password must match',
          'text=Passwords must match',
          '*:has-text("must match")'
        ];
        
        for (const sel of mismatchSelectors) {
          const elem = await page.locator(sel).first();
          if (await elem.count() > 0) {
            const text = await elem.textContent();
            log.push(`  ✓ Selector: ${sel}`);
            log.push(`    Message: ${text?.trim()}`);
            selectors.validationMessages.passwordMismatch = sel;
            break;
          }
        }
      }
      
      // Step 7: Manual verification code entry
      console.log('\n\n=== MANUAL STEP ===');
      console.log('Please check yopmail.com for the verification code');
      console.log(`Email: ${email}`);
      const verificationCode = await askQuestion('Enter the verification code: ');
      
      if (verificationCode && selectors.resetPasswordPage.verificationCodeInput) {
        log.push(`\n\nStep 7: Testing with verification code: ${verificationCode}`);
        
        // Test invalid code first
        log.push('\n--- Test: Invalid verification code ---');
        await page.fill(selectors.resetPasswordPage.verificationCodeInput, '000000');
        await passwordInputs[0].fill('Password123!');
        await passwordInputs[1].fill('Password123!');
        await page.waitForTimeout(1000);
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-tests/screenshots/pp-06-invalid-code.png' });
        
        pageText = await page.locator('body').textContent();
        if (pageText?.includes('Invalid') || pageText?.includes('incorrect')) {
          log.push('✓ Found invalid code message');
          
          const invalidSelectors = [
            'text=Invalid verification code',
            'text=Invalid code',
            '*:has-text("Invalid")'
          ];
          
          for (const sel of invalidSelectors) {
            const elem = await page.locator(sel).first();
            if (await elem.count() > 0) {
              const text = await elem.textContent();
              log.push(`  ✓ Selector: ${sel}`);
              log.push(`    Message: ${text?.trim()}`);
              selectors.validationMessages.invalidCode = sel;
              break;
            }
          }
        }
        
        // Test valid submission
        log.push('\n--- Test: Valid submission ---');
        await page.fill(selectors.resetPasswordPage.verificationCodeInput, verificationCode);
        await passwordInputs[0].fill('NewPassword123!');
        await passwordInputs[1].fill('NewPassword123!');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'playwright-tests/screenshots/pp-07-valid-before-submit.png' });
        
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'playwright-tests/screenshots/pp-08-after-submit.png' });
        
        const urlAfter = page.url();
        log.push(`URL after submit: ${urlAfter}`);
        
        pageText = await page.locator('body').textContent();
        if (pageText?.includes('Success') || pageText?.includes('success')) {
          log.push('✓ Found success message');
          
          const successSelectors = [
            'text=Success',
            'text=success',
            '*:has-text("Success")',
            '*:has-text("successful")'
          ];
          
          for (const sel of successSelectors) {
            const elem = await page.locator(sel).first();
            if (await elem.count() > 0) {
              const text = await elem.textContent();
              log.push(`  ✓ Selector: ${sel}`);
              log.push(`    Message: ${text?.trim()}`);
              selectors.validationMessages.successMessage = sel;
              break;
            }
          }
        }
        
        if (urlAfter.includes('login') && !urlAfter.includes('reset')) {
          log.push('✓ Redirected to login page');
        }
      }
    }
    
    log.push('\n\n=== FINAL SELECTORS ===');
    log.push(JSON.stringify(selectors, null, 2));
    
  } catch (error) {
    log.push(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    // Save selectors
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

explorePasswordPolicyManual();
