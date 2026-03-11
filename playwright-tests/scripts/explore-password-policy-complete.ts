import { chromium } from 'playwright';
import * as fs from 'fs';

async function explorePasswordPolicyComplete() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
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

  try {
    log.push('=== EXPLORING PASSWORD POLICY FLOW - COMPLETE ===\n');
    
    // Navigate to login page
    log.push('Step 1: Navigate to Admin Portal login page');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/pp-01-login-page.png' });
    log.push('✓ Login page loaded');
    
    // Click Forgot Password button
    log.push('\nStep 2: Click "Forgot password" button');
    await page.click('button:has-text("Forgot password")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/pp-02-forgot-password-clicked.png' });
    
    const currentUrl = page.url();
    log.push(`Current URL: ${currentUrl}`);
    
    // Analyze the reset password page
    log.push('\n=== RESET PASSWORD PAGE ANALYSIS ===');
    
    const inputs = await page.locator('input').all();
    log.push(`\nFound ${inputs.length} inputs:`);
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const id = await inputs[i].getAttribute('id');
      log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}", id="${id}"`);
      
      // Store selectors based on name
      if (name === 'username' || name === 'email') {
        selectors.resetPasswordPage.usernameInput = `input[name="${name}"]`;
      } else if (name === 'verificationCode' || name === 'code' || name === 'otp') {
        selectors.resetPasswordPage.verificationCodeInput = `input[name="${name}"]`;
      } else if (name === 'password' || name === 'newPassword') {
        if (!selectors.resetPasswordPage.passwordInput) {
          selectors.resetPasswordPage.passwordInput = `input[name="${name}"]`;
        }
      } else if (name === 'confirmPassword' || name === 'passwordConfirm') {
        selectors.resetPasswordPage.confirmPasswordInput = `input[name="${name}"]`;
      }
    }
    
    const buttons = await page.locator('button').all();
    log.push(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const className = await buttons[i].getAttribute('class');
      log.push(`  Button ${i + 1}: text="${text?.trim()}", type="${type}"`);
      
      if (type === 'submit' || text?.toLowerCase().includes('submit') || text?.toLowerCase().includes('send')) {
        selectors.resetPasswordPage.submitButton = 'button[type="submit"]';
      }
      if (text?.toLowerCase().includes('resend')) {
        selectors.resetPasswordPage.resendButton = `button:has-text("${text.trim()}")`;
      }
    }
    
    // Step 3: Fill username and submit
    if (selectors.resetPasswordPage.usernameInput) {
      log.push('\n\nStep 3: Fill username and submit');
      await page.fill(selectors.resetPasswordPage.usernameInput, 'lindaamalia+1@axrail.com');
      log.push('✓ Filled username');
      await page.waitForTimeout(1000);
      
      if (selectors.resetPasswordPage.submitButton) {
        await page.click(selectors.resetPasswordPage.submitButton);
        log.push('✓ Clicked submit');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'playwright-tests/screenshots/pp-03-after-username-submit.png' });
        
        // Check for new inputs after submission
        log.push('\n=== AFTER USERNAME SUBMISSION ===');
        const afterInputs = await page.locator('input').all();
        log.push(`\nFound ${afterInputs.length} inputs:`);
        
        const inputDetails: any = {};
        for (let i = 0; i < afterInputs.length; i++) {
          const name = await afterInputs[i].getAttribute('name');
          const type = await afterInputs[i].getAttribute('type');
          const placeholder = await afterInputs[i].getAttribute('placeholder');
          const id = await afterInputs[i].getAttribute('id');
          log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}", id="${id}"`);
          
          inputDetails[name || `input_${i}`] = {
            name,
            type,
            placeholder,
            selector: name ? `input[name="${name}"]` : `input[id="${id}"]`
          };
          
          // Update selectors
          if (name === 'verificationCode' || name === 'code' || name === 'otp') {
            selectors.resetPasswordPage.verificationCodeInput = `input[name="${name}"]`;
          } else if (type === 'password') {
            if (!selectors.resetPasswordPage.passwordInput) {
              selectors.resetPasswordPage.passwordInput = `input[name="${name}"]`;
            } else if (!selectors.resetPasswordPage.confirmPasswordInput) {
              selectors.resetPasswordPage.confirmPasswordInput = `input[name="${name}"]`;
            }
          }
        }
        
        // Check for resend button
        const afterButtons = await page.locator('button').all();
        log.push(`\nFound ${afterButtons.length} buttons:`);
        for (let i = 0; i < afterButtons.length; i++) {
          const text = await afterButtons[i].textContent();
          log.push(`  Button ${i + 1}: text="${text?.trim()}"`);
          
          if (text?.toLowerCase().includes('resend')) {
            selectors.resetPasswordPage.resendButton = `button:has-text("${text.trim()}")`;
            log.push(`  ✓ Found resend button: ${selectors.resetPasswordPage.resendButton}`);
          }
        }
        
        // Step 4: Test password validation
        const passwordInputs = await page.locator('input[type="password"]').all();
        if (passwordInputs.length >= 2) {
          log.push('\n\nStep 4: Testing password validation with invalid password');
          
          // Test 1: Uppercase only
          await passwordInputs[0].fill('ABCDEFG');
          await passwordInputs[1].fill('ABCDEFG');
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'playwright-tests/screenshots/pp-04-uppercase-only.png' });
          
          let pageText = await page.locator('body').textContent();
          log.push('\nChecking for validation messages...');
          
          if (pageText?.includes('Password must include')) {
            log.push('✓ Found "Password must include" message');
            
            // Find exact selector
            const possibleSelectors = [
              'text=Password must include 1 number, 1 uppercase letter & 1 symbol',
              'text=Password must include',
              'p:has-text("Password must include")',
              'span:has-text("Password must include")',
              'div:has-text("Password must include")',
              '[class*="error"]:has-text("Password must include")',
              '[class*="helper"]:has-text("Password must include")'
            ];
            
            for (const sel of possibleSelectors) {
              const elem = await page.locator(sel).first();
              if (await elem.count() > 0) {
                const text = await elem.textContent();
                log.push(`  ✓ Working selector: ${sel}`);
                log.push(`    Message: ${text?.trim()}`);
                selectors.validationMessages.passwordRequirement = sel;
                break;
              }
            }
          }
          
          // Test 2: Valid password
          log.push('\n\nStep 5: Testing with valid password');
          await passwordInputs[0].fill('Password123!');
          await passwordInputs[1].fill('Password123!');
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'playwright-tests/screenshots/pp-05-valid-password.png' });
          
          pageText = await page.locator('body').textContent();
          log.push('Checking if validation message disappeared...');
          if (!pageText?.includes('Password must include')) {
            log.push('✓ Validation message cleared with valid password');
          }
          
          // Test 3: Password mismatch
          log.push('\n\nStep 6: Testing password mismatch');
          await passwordInputs[0].fill('Password123!');
          await passwordInputs[1].fill('Password456!');
          await page.waitForTimeout(1500);
          await page.screenshot({ path: 'playwright-tests/screenshots/pp-06-password-mismatch.png' });
          
          pageText = await page.locator('body').textContent();
          if (pageText?.includes('must match') || pageText?.includes('do not match')) {
            log.push('✓ Found password mismatch message');
            
            const mismatchSelectors = [
              'text=Password must match',
              'text=Passwords must match',
              'text=do not match',
              '*:has-text("must match")',
              '*:has-text("do not match")'
            ];
            
            for (const sel of mismatchSelectors) {
              const elem = await page.locator(sel).first();
              if (await elem.count() > 0) {
                const text = await elem.textContent();
                log.push(`  ✓ Working selector: ${sel}`);
                log.push(`    Message: ${text?.trim()}`);
                selectors.validationMessages.passwordMismatch = sel;
                break;
              }
            }
          }
          
          // Test 4: Try submitting with correct verification code and valid password
          log.push('\n\nStep 7: Testing with correct verification code');
          if (selectors.resetPasswordPage.verificationCodeInput) {
            await page.fill(selectors.resetPasswordPage.verificationCodeInput, '199606');
            await passwordInputs[0].fill('NewPassword123!');
            await passwordInputs[1].fill('NewPassword123!');
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-07-valid-submission.png' });
            
            // Click submit
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-07b-after-submit.png' });
            
            pageText = await page.locator('body').textContent();
            const currentUrl = page.url();
            log.push(`URL after submit: ${currentUrl}`);
            
            if (pageText?.includes('Success') || pageText?.includes('success')) {
              log.push('✓ Found success message');
              
              const successSelectors = [
                'text=Success',
                'text=success',
                'text=Reset password successful',
                'text=Password reset successful',
                '*:has-text("Success")',
                '*:has-text("successful")'
              ];
              
              for (const sel of successSelectors) {
                const elem = await page.locator(sel).first();
                if (await elem.count() > 0) {
                  const text = await elem.textContent();
                  log.push(`  ✓ Working selector: ${sel}`);
                  log.push(`    Message: ${text?.trim()}`);
                  selectors.validationMessages.successMessage = sel;
                  break;
                }
              }
            }
            
            // Check if redirected to login
            if (currentUrl.includes('login') && !currentUrl.includes('reset')) {
              log.push('✓ Redirected to login page after successful reset');
            }
          }
          
          // Test 5: Try with incorrect verification code
          log.push('\n\nStep 8: Testing incorrect verification code');
          await page.goto('https://corpvoucher.fam-stg.click/admin/login');
          await page.waitForTimeout(2000);
          await page.click('button:has-text("Forgot password")');
          await page.waitForTimeout(2000);
          
          if (selectors.resetPasswordPage.usernameInput) {
            await page.fill(selectors.resetPasswordPage.usernameInput, 'lindaamalia+1@axrail.com');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            await page.fill(selectors.resetPasswordPage.verificationCodeInput, '000000');
            await page.fill(selectors.resetPasswordPage.passwordInput, 'Password123!');
            await page.fill(selectors.resetPasswordPage.confirmPasswordInput, 'Password123!');
            await page.waitForTimeout(1000);
            
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-08-invalid-code.png' });
            
            pageText = await page.locator('body').textContent();
            if (pageText?.includes('Invalid') || pageText?.includes('incorrect')) {
              log.push('✓ Found invalid code message');
              
              const invalidCodeSelectors = [
                'text=Invalid verification code',
                'text=Invalid code',
                'text=Incorrect code',
                '*:has-text("Invalid")',
                '*:has-text("incorrect")'
              ];
              
              for (const sel of invalidCodeSelectors) {
                const elem = await page.locator(sel).first();
                if (await elem.count() > 0) {
                  const text = await elem.textContent();
                  log.push(`  ✓ Working selector: ${sel}`);
                  log.push(`    Message: ${text?.trim()}`);
                  selectors.validationMessages.invalidCode = sel;
                  break;
                }
              }
            }
          }
          
          // Test 6: Check resend button
          if (selectors.resetPasswordPage.resendButton) {
            log.push('\n\nStep 9: Testing resend code button');
            await page.click(selectors.resetPasswordPage.resendButton);
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-09-resend-code.png' });
            
            pageText = await page.locator('body').textContent();
            if (pageText?.includes('sent') || pageText?.includes('Sent')) {
              log.push('✓ Found resend confirmation message');
              
              const resendSelectors = [
                'text=Validation code has been sent',
                'text=Code has been sent',
                'text=sent to your email',
                '*:has-text("sent")'
              ];
              
              for (const sel of resendSelectors) {
                const elem = await page.locator(sel).first();
                if (await elem.count() > 0) {
                  const text = await elem.textContent();
                  log.push(`  ✓ Working selector: ${sel}`);
                  log.push(`    Message: ${text?.trim()}`);
                  selectors.validationMessages.resendSuccess = sel;
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    // Test failed login attempts
    log.push('\n\n=== TESTING FAILED LOGIN ATTEMPTS ===');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('\nStep 10: Testing 3 failed login attempts');
    for (let i = 1; i <= 3; i++) {
      log.push(`\nAttempt ${i}:`);
      await page.fill('input[name="username"]', 'lindaamalia+1@axrail.com');
      await page.fill('input[name="password"]', `WrongPass${i}!`);
      await page.click('button[type="submit"]:has-text("Sign in")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `playwright-tests/screenshots/pp-10-failed-attempt-${i}.png` });
      
      const url = page.url();
      log.push(`  URL after attempt: ${url}`);
      
      if (url.includes('reset') || url.includes('forgot')) {
        log.push(`  ✓ Redirected to reset password page after ${i} attempts`);
        selectors.loginPage.redirectsToResetAfterFailedAttempts = true;
        break;
      }
    }
    
    log.push('\n\n=== FINAL SELECTORS ===');
    log.push(JSON.stringify(selectors, null, 2));
    
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

explorePasswordPolicyComplete();
