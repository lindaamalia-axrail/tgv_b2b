import { chromium } from 'playwright';

async function completeSignupWithOTP() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    const timestamp = Date.now() % 1000;
    const testEmail = `tgvuser_${String(timestamp).padStart(3, '0')}@yopmail.com`;
    const nric = `${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    console.log(`\n=== Test Email: ${testEmail} ===`);
    console.log(`=== NRIC: ${nric} ===\n`);
    
    // Step 1: Fill signup form
    console.log('Step 1: Navigate to signup page');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
    await page.waitForTimeout(2000);
    
    console.log('Step 2: Fill signup form');
    await page.fill('input[name="name"]', 'TGV USER ONE');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phoneNumber"]', '60104411234');
    await page.fill('input[name="password"]', 'P@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'P@ssw0rd');
    
    await page.click('input[name="idType"][value="NRIC"]');
    await page.fill('input[name="idNumber"]', nric);
    
    await page.fill('input[name="streetAddress"]', 'Jaalan Bersama');
    await page.fill('input[name="postalCode"]', '40286');
    
    await page.selectOption('select[name="state"]', 'Johor');
    await page.waitForFunction(() => {
      const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement | null;
      return citySelect && citySelect.options.length > 1;
    }, { timeout: 10000 });
    
    await page.selectOption('select[name="city"]', 'Johor Bahru');
    
    console.log('Step 3: Submit signup form');
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-01-filled.png', fullPage: true });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log(`Current URL after submit: ${page.url()}`);
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-02-after-submit.png', fullPage: true });
    
    // Step 2: Go to Yopmail and get OTP
    console.log('\nStep 4: Opening Yopmail in new tab');
    const yopmailPage = await context.newPage();
    await yopmailPage.goto('https://yopmail.com/en/');
    await yopmailPage.waitForTimeout(2000);
    
    console.log('Step 5: Enter email in Yopmail');
    const emailInput = yopmailPage.locator('input[placeholder*="Enter your inbox"], input#login');
    await emailInput.fill(testEmail);
    await emailInput.press('Enter');
    await yopmailPage.waitForTimeout(3000);
    
    await yopmailPage.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-03-yopmail.png', fullPage: true });
    
    console.log('Step 6: Switch to email iframe and get OTP');
    // Yopmail uses an iframe for email content
    const emailFrame = yopmailPage.frameLocator('#ifmail');
    
    // Wait for email to load
    await yopmailPage.waitForTimeout(2000);
    
    // Try to find OTP/verification code in the email
    const emailBody = await emailFrame.locator('body').textContent();
    console.log('\n=== Email Content ===');
    console.log(emailBody);
    
    // Extract OTP - look for 6-digit code
    const otpMatch = emailBody?.match(/\b\d{6}\b/);
    let otp = '';
    
    if (otpMatch) {
      otp = otpMatch[0];
      console.log(`\n✓ Found OTP: ${otp}`);
    } else {
      console.log('\n❌ Could not find 6-digit OTP in email');
      console.log('Looking for any verification code pattern...');
      
      // Try other patterns
      const codeMatch = emailBody?.match(/code[:\s]+(\d+)/i) || 
                       emailBody?.match(/verification[:\s]+(\d+)/i) ||
                       emailBody?.match(/OTP[:\s]+(\d+)/i);
      
      if (codeMatch) {
        otp = codeMatch[1];
        console.log(`✓ Found code: ${otp}`);
      }
    }
    
    await yopmailPage.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-04-email-content.png', fullPage: true });
    
    if (!otp) {
      console.log('\n⚠️  No OTP found. Keeping browser open for manual inspection...');
      await page.waitForTimeout(60000);
      return;
    }
    
    // Step 3: Return to signup page and enter OTP
    console.log('\nStep 7: Returning to signup page to enter OTP');
    await page.bringToFront();
    await page.waitForTimeout(1000);
    
    // Look for OTP input fields
    console.log('Step 8: Looking for OTP input fields');
    const otpInputs = page.locator('input[type="text"], input[type="number"], input.otp-input');
    const otpCount = await otpInputs.count();
    console.log(`Found ${otpCount} potential OTP input fields`);
    
    if (otpCount > 0) {
      console.log(`Step 9: Entering OTP: ${otp}`);
      
      // If there are multiple inputs (one per digit)
      if (otpCount >= 6) {
        const otpDigits = otp.split('');
        for (let i = 0; i < Math.min(6, otpDigits.length); i++) {
          await otpInputs.nth(i).fill(otpDigits[i]);
          await page.waitForTimeout(200);
        }
      } else {
        // Single input field
        await otpInputs.first().fill(otp);
      }
      
      await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-05-otp-entered.png', fullPage: true });
      
      console.log('Step 10: Clicking Verify/Submit button');
      const verifyButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]');
      await verifyButton.first().click();
      await page.waitForTimeout(3000);
      
      console.log(`\nFinal URL: ${page.url()}`);
      await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-06-final.png', fullPage: true });
      
      if (!page.url().includes('signup')) {
        console.log('✓ Signup completed successfully!');
      } else {
        console.log('⚠️  Still on signup page');
      }
    } else {
      console.log('⚠️  No OTP input fields found on page');
    }
    
    console.log('\n=== Keeping browser open for 30 seconds ===');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/complete-signup-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

completeSignupWithOTP();
