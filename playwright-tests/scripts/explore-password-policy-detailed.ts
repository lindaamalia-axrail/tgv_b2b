import { chromium } from 'playwright';
import * as fs from 'fs';

async function explorePasswordPolicyDetailed() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
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
    log.push('=== EXPLORING PASSWORD POLICY FLOW - DETAILED ===\n');
    
    // Navigate to login page
    log.push('Step 1: Navigate to Admin Portal login page');
    await page.goto('https://corpvoucher.fam-stg.click/admin/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take snapshot of login page
    const snapshot = await page.locator('body').innerHTML();
    log.push('\n=== LOGIN PAGE STRUCTURE ===');
    
    // Get all links
    const links = await page.locator('a').all();
    log.push(`\nFound ${links.length} links:`);
    for (let i = 0; i < links.length; i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      log.push(`  Link ${i + 1}: href="${href}", text="${text?.trim()}"`);
    }
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    log.push(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const className = await buttons[i].getAttribute('class');
      log.push(`  Button ${i + 1}: text="${text?.trim()}", type="${type}", class="${className}"`);
    }
    
    // Get all inputs
    const inputs = await page.locator('input').all();
    log.push(`\nFound ${inputs.length} inputs:`);
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const id = await inputs[i].getAttribute('id');
      log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}", id="${id}"`);
    }
    
    // Check if there's text mentioning reset/forgot password
    const pageText = await page.locator('body').textContent();
    log.push('\n=== CHECKING FOR RESET/FORGOT PASSWORD TEXT ===');
    if (pageText?.toLowerCase().includes('reset')) {
      log.push('✓ Found "reset" in page text');
    }
    if (pageText?.toLowerCase().includes('forgot')) {
      log.push('✓ Found "forgot" in page text');
    }
    
    // Try to directly navigate to reset password page
    log.push('\n\nStep 2: Trying to navigate directly to reset password page...');
    const resetUrls = [
      'https://corpvoucher.fam-stg.click/admin/reset-password',
      'https://corpvoucher.fam-stg.click/admin/forgot-password',
      'https://corpvoucher.fam-stg.click/admin/password-reset',
      'https://corpvoucher.fam-stg.click/reset-password',
      'https://corpvoucher.fam-stg.click/forgot-password'
    ];
    
    for (const url of resetUrls) {
      log.push(`\nTrying: ${url}`);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      log.push(`  Current URL: ${currentUrl}`);
      
      if (!currentUrl.includes('login') || currentUrl.includes('reset') || currentUrl.includes('forgot')) {
        log.push('  ✓ Possibly found reset password page!');
        await page.screenshot({ path: `playwright-tests/screenshots/reset-attempt-${resetUrls.indexOf(url)}.png` });
        
        // Analyze this page
        log.push('\n=== RESET PASSWORD PAGE STRUCTURE ===');
        
        const resetInputs = await page.locator('input').all();
        log.push(`\nFound ${resetInputs.length} inputs:`);
        for (let i = 0; i < resetInputs.length; i++) {
          const name = await resetInputs[i].getAttribute('name');
          const type = await resetInputs[i].getAttribute('type');
          const placeholder = await resetInputs[i].getAttribute('placeholder');
          const id = await resetInputs[i].getAttribute('id');
          log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}", id="${id}"`);
          
          // Store selectors
          if (name === 'username' || name === 'email') {
            selectors.resetPasswordPage.emailInput = `input[name="${name}"]`;
          }
          if (name === 'verificationCode' || name === 'code') {
            selectors.resetPasswordPage.verificationCodeInput = `input[name="${name}"]`;
          }
          if (type === 'password') {
            if (!selectors.resetPasswordPage.newPasswordInput) {
              selectors.resetPasswordPage.newPasswordInput = `input[name="${name}"]`;
            } else if (!selectors.resetPasswordPage.confirmPasswordInput) {
              selectors.resetPasswordPage.confirmPasswordInput = `input[name="${name}"]`;
            }
          }
        }
        
        const resetButtons = await page.locator('button').all();
        log.push(`\nFound ${resetButtons.length} buttons:`);
        for (let i = 0; i < resetButtons.length; i++) {
          const text = await resetButtons[i].textContent();
          const type = await resetButtons[i].getAttribute('type');
          log.push(`  Button ${i + 1}: text="${text?.trim()}", type="${type}"`);
          
          if (type === 'submit') {
            selectors.resetPasswordPage.submitButton = 'button[type="submit"]';
          }
          if (text?.toLowerCase().includes('resend')) {
            selectors.resetPasswordPage.resendCodeButton = `button:has-text("${text.trim()}")`;
          }
        }
        
        // Try the flow
        if (selectors.resetPasswordPage.emailInput) {
          log.push('\n\nStep 3: Testing reset password flow...');
          await page.fill(selectors.resetPasswordPage.emailInput, 'lindaamalia+1@axrail.com');
          log.push('✓ Filled email');
          
          if (selectors.resetPasswordPage.submitButton) {
            await page.click(selectors.resetPasswordPage.submitButton);
            await page.waitForTimeout(3000);
            log.push('✓ Clicked submit');
            await page.screenshot({ path: 'playwright-tests/screenshots/after-email-submit.png' });
            
            // Check for new inputs
            const afterSubmitInputs = await page.locator('input').all();
            log.push(`\nAfter submit - Found ${afterSubmitInputs.length} inputs:`);
            for (let i = 0; i < afterSubmitInputs.length; i++) {
              const name = await afterSubmitInputs[i].getAttribute('name');
              const type = await afterSubmitInputs[i].getAttribute('type');
              const placeholder = await afterSubmitInputs[i].getAttribute('placeholder');
              log.push(`  Input ${i + 1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
            }
            
            // Test password validation
            const passwordInputs = await page.locator('input[type="password"]').all();
            if (passwordInputs.length >= 2) {
              log.push('\n\nStep 4: Testing password validation...');
              
              // Test with invalid password
              await passwordInputs[0].fill('ABCDEFG');
              await passwordInputs[1].fill('ABCDEFG');
              await page.waitForTimeout(1500);
              await page.screenshot({ path: 'playwright-tests/screenshots/invalid-password.png' });
              
              // Look for validation message
              const pageContent = await page.locator('body').textContent();
              log.push('\nSearching for validation messages in page...');
              
              if (pageContent?.includes('Password must include')) {
                log.push('✓ Found validation message in page');
                
                // Try to find the exact element
                const possibleSelectors = [
                  'text=Password must include 1 number, 1 uppercase letter & 1 symbol',
                  'text=Password must include',
                  '*:has-text("Password must include")',
                  'p:has-text("Password must include")',
                  'span:has-text("Password must include")',
                  'div:has-text("Password must include")'
                ];
                
                for (const sel of possibleSelectors) {
                  const elem = await page.locator(sel).first();
                  if (await elem.count() > 0) {
                    const text = await elem.textContent();
                    log.push(`  ✓ Selector works: ${sel}`);
                    log.push(`    Text: ${text}`);
                    selectors.validationMessages.passwordRequirement = sel;
                    break;
                  }
                }
              }
              
              // Test with valid password
              log.push('\n\nStep 5: Testing with valid password...');
              await passwordInputs[0].fill('Password123!');
              await passwordInputs[1].fill('Password123!');
              await page.waitForTimeout(1500);
              await page.screenshot({ path: 'playwright-tests/screenshots/valid-password.png' });
              
              // Test password mismatch
              log.push('\n\nStep 6: Testing password mismatch...');
              await passwordInputs[0].fill('Password123!');
              await passwordInputs[1].fill('Password456!');
              await page.waitForTimeout(1500);
              await page.screenshot({ path: 'playwright-tests/screenshots/password-mismatch.png' });
              
              const mismatchContent = await page.locator('body').textContent();
              if (mismatchContent?.includes('must match')) {
                log.push('✓ Found password mismatch message');
                selectors.validationMessages.passwordMismatch = 'text=Password must match';
              }
            }
          }
        }
        
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

explorePasswordPolicyDetailed();
