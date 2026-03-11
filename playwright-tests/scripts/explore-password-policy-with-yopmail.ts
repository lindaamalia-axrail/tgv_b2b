import { chromium } from 'playwright';
import * as fs from 'fs';

async function getVerificationCodeFromYopmail(page: any, email: string): Promise<string | null> {
  const log: string[] = [];
  
  try {
    log.push('\n=== CHECKING YOPMAIL FOR VERIFICATION CODE ===');
    
    // Open yopmail in new tab
    const yopmailPage = await page.context().newPage();
    await yopmailPage.goto('https://yopmail.com');
    await yopmailPage.waitForLoadState('networkidle');
    await yopmailPage.waitForTimeout(2000);
    
    // Extract username from email (before @)
    const username = email.split('@')[0];
    log.push(`Looking for emails for: ${username}`);
    
    // Enter email
    const emailInput = await yopmailPage.locator('input[name="login"], input#login').first();
    await emailInput.fill(username);
    await yopmailPage.waitForTimeout(1000);
    
    // Click check inbox button
    await yopmailPage.click('button[type="submit"], button.sbut, input.sbut');
    await yopmailPage.waitForTimeout(3000);
    await yopmailPage.screenshot({ path: 'playwright-tests/screenshots/yopmail-inbox.png' });
    
    // Switch to inbox iframe
    const inboxFrame = yopmailPage.frameLocator('iframe#ifinbox');
    
    // Click on the first email (most recent)
    const firstEmail = inboxFrame.locator('.m').first();
    if (await firstEmail.count() > 0) {
      await firstEmail.click();
      await yopmailPage.waitForTimeout(2000);
      log.push('✓ Clicked on first email');
    }
    
    // Switch to email content iframe
    const mailFrame = yopmailPage.frameLocator('iframe#ifmail');
    await yopmailPage.waitForTimeout(2000);
    await yopmailPage.screenshot({ path: 'playwright-tests/screenshots/yopmail-email-content.png' });
    
    // Get email content
    const emailContent = await mailFrame.locator('body').textContent();
    log.push('\nEmail content:');
    log.push(emailContent || 'No content found');
    
    // Extract verification code (looking for 6-digit number or specific pattern)
    const codePatterns = [
      /temporary password is (\w+)/i,
      /verification code[:\s]+(\d{6})/i,
      /code[:\s]+(\d{6})/i,
      /(\d{6})/,
      /password[:\s]+(\w+)/i
    ];
    
    let code = null;
    for (const pattern of codePatterns) {
      const match = emailContent?.match(pattern);
      if (match && match[1]) {
        code = match[1];
        log.push(`✓ Found code: ${code}`);
        break;
      }
    }
    
    await yopmailPage.close();
    
    console.log(log.join('\n'));
    return code;
    
  } catch (error) {
    log.push(`❌ Error getting code from yopmail: ${error}`);
    console.log(log.join('\n'));
    return null;
  }
}

async function explorePasswordPolicyWithYopmail() {
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
  const email = 'adminusertgv01@yopmail.com';

  try {
    log.push('=== EXPLORING PASSWORD POLICY FLOW WITH YOPMAIL ===\n');
    
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
      log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
      
      if (name === 'username' || name === 'email') {
        selectors.resetPasswordPage.usernameInput = `input[name="${name}"]`;
      } else if (name === 'verificationCode' || name === 'code' || name === 'otp') {
        selectors.resetPasswordPage.verificationCodeInput = `input[name="${name}"]`;
      } else if (type === 'password' && !selectors.resetPasswordPage.passwordInput) {
        selectors.resetPasswordPage.passwordInput = `input[name="${name}"]`;
      } else if (type === 'password' && selectors.resetPasswordPage.passwordInput) {
        selectors.resetPasswordPage.confirmPasswordInput = `input[name="${name}"]`;
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
      if (text?.toLowerCase().includes('resend')) {
        selectors.resetPasswordPage.resendButton = `button:has-text("${text.trim()}")`;
      }
    }
    
    // Step 3: Fill username and submit
    if (selectors.resetPasswordPage.usernameInput) {
      log.push('\n\nStep 3: Fill username and submit');
      await page.fill(selectors.resetPasswordPage.usernameInput, email);
      log.push('✓ Filled username');
      await page.waitForTimeout(1000);
      
      if (selectors.resetPasswordPage.submitButton) {
        await page.click(selectors.resetPasswordPage.submitButton);
        log.push('✓ Clicked submit');
        await page.waitForTimeout(5000); // Wait for email to arrive
        await page.screenshot({ path: 'playwright-tests/screenshots/pp-03-after-username-submit.png' });
        
        // Get verification code from yopmail
        log.push('\n\nStep 4: Getting verification code from yopmail...');
        const verificationCode = await getVerificationCodeFromYopmail(page, email);
        
        if (verificationCode) {
          log.push(`✓ Got verification code: ${verificationCode}`);
          
          // Check for new inputs after submission
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
          
          // Test password validation scenarios
          const passwordInputs = await page.locator('input[type="password"]').all();
          if (passwordInputs.length >= 2) {
            log.push('\n\nStep 5: Testing password validation scenarios');
            
            // Test 1: Uppercase only (<8 chars)
            log.push('\n--- Test 1: Uppercase only (<8 chars) ---');
            await passwordInputs[0].fill('ABCDEFG');
            await passwordInputs[1].fill('ABCDEFG');
            await page.waitForTimeout(1500);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-05a-uppercase-only.png' });
            
            let pageText = await page.locator('body').textContent();
            if (pageText?.includes('Password must include')) {
              log.push('✓ Found validation message for uppercase only');
              
              const possibleSelectors = [
                'text=Password must include 1 number, 1 uppercase letter & 1 symbol',
                'text=Password must include',
                'p:has-text("Password must include")',
                'span:has-text("Password must include")',
                'div:has-text("Password must include")',
                '[class*="error"]:has-text("Password")',
                '[class*="helper"]:has-text("Password")'
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
            
            // Test 2: Password mismatch
            log.push('\n--- Test 2: Password mismatch ---');
            await passwordInputs[0].fill('Password123!');
            await passwordInputs[1].fill('Password456!');
            await page.waitForTimeout(1500);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-05b-password-mismatch.png' });
            
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
            
            // Test 3: Invalid verification code
            log.push('\n--- Test 3: Invalid verification code ---');
            if (selectors.resetPasswordPage.verificationCodeInput) {
              await page.fill(selectors.resetPasswordPage.verificationCodeInput, '000000');
              await passwordInputs[0].fill('Password123!');
              await passwordInputs[1].fill('Password123!');
              await page.waitForTimeout(1000);
              
              await page.click('button[type="submit"]');
              await page.waitForTimeout(2000);
              await page.screenshot({ path: 'playwright-tests/screenshots/pp-05c-invalid-code.png' });
              
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
            
            // Test 4: Valid submission with correct code
            log.push('\n--- Test 4: Valid submission with correct code ---');
            if (selectors.resetPasswordPage.verificationCodeInput && verificationCode) {
              await page.fill(selectors.resetPasswordPage.verificationCodeInput, verificationCode);
              await passwordInputs[0].fill('NewPassword123!');
              await passwordInputs[1].fill('NewPassword123!');
              await page.waitForTimeout(1000);
              await page.screenshot({ path: 'playwright-tests/screenshots/pp-05d-valid-submission.png' });
              
              await page.click('button[type="submit"]');
              await page.waitForTimeout(3000);
              await page.screenshot({ path: 'playwright-tests/screenshots/pp-05e-after-submit.png' });
              
              pageText = await page.locator('body').textContent();
              const urlAfterSubmit = page.url();
              log.push(`URL after submit: ${urlAfterSubmit}`);
              
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
              
              if (urlAfterSubmit.includes('login') && !urlAfterSubmit.includes('reset')) {
                log.push('✓ Redirected to login page after successful reset');
                selectors.resetPasswordPage.redirectsToLoginAfterSuccess = true;
              }
            }
          }
          
          // Test resend button
          if (selectors.resetPasswordPage.resendButton) {
            log.push('\n\nStep 6: Testing resend code button');
            
            // Go back to reset flow
            await page.goto('https://corpvoucher.fam-stg.click/admin/login');
            await page.waitForTimeout(2000);
            await page.click('button:has-text("Forgot password")');
            await page.waitForTimeout(2000);
            await page.fill(selectors.resetPasswordPage.usernameInput, email);
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            await page.click(selectors.resetPasswordPage.resendButton);
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'playwright-tests/screenshots/pp-06-resend-code.png' });
            
            const resendPageText = await page.locator('body').textContent();
            if (resendPageText?.includes('sent') || resendPageText?.includes('Sent')) {
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
        } else {
          log.push('❌ Could not get verification code from yopmail');
        }
      }
    }
    
    // Test failed login attempts
    log.push('\n\n=== TESTING FAILED LOGIN ATTEMPTS ===');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    log.push('\nStep 7: Testing 3 failed login attempts');
    for (let i = 1; i <= 3; i++) {
      log.push(`\nAttempt ${i}:`);
      await page.fill('input[name="username"]', email);
      await page.fill('input[name="password"]', `WrongPass${i}!`);
      await page.click('button[type="submit"]:has-text("Sign in")');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `playwright-tests/screenshots/pp-07-failed-attempt-${i}.png` });
      
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

explorePasswordPolicyWithYopmail();
