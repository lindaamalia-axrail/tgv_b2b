import { chromium } from 'playwright';

async function exploreCompleteSignup() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    const testEmail = `tgvuser_${Date.now() % 1000}@yopmail.com`;
    console.log(`Using email: ${testEmail}`);
    
    console.log('\n=== Step 1: Navigate to signup page ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Step 2: Fill signup form ===');
    await page.fill('input[name="name"]', 'TGV USER ONE');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phoneNumber"]', '60104411234');
    await page.fill('input[name="password"]', 'P@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'P@ssw0rd');
    
    await page.click('input[name="idType"][value="NRIC"]');
    await page.fill('input[name="idNumber"]', '1234567890123456');
    
    await page.fill('input[name="streetAddress"]', 'Jaalan Bersama');
    await page.fill('input[name="postalCode"]', '40286');
    
    await page.selectOption('select[name="state"]', 'Johor');
    
    // Wait for city to load
    await page.waitForFunction(() => {
      const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement | null;
      return citySelect && citySelect.options.length > 1;
    }, { timeout: 10000 });
    
    await page.selectOption('select[name="city"]', 'Johor Bahru');
    
    console.log('\n=== Step 3: Click Next/Submit ===');
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-step1-filled.png', fullPage: true });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('\n=== Step 4: Check what page we are on ===');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-step2-after-submit.png', fullPage: true });
    
    // Check for OTP input fields
    const otpInputs = await page.locator('input[type="text"]').count();
    console.log('Number of text inputs:', otpInputs);
    
    // Check for any visible text about OTP or verification
    const pageText = await page.textContent('body');
    if (pageText?.toLowerCase().includes('otp')) {
      console.log('\n✓ OTP page detected');
    }
    if (pageText?.toLowerCase().includes('verify')) {
      console.log('✓ Verification text found');
    }
    if (pageText?.toLowerCase().includes('email')) {
      console.log('✓ Email verification mentioned');
    }
    
    // Look for OTP input fields
    const otpField = page.locator('input[placeholder*="OTP"], input[name*="otp"], input.otp-input');
    const otpCount = await otpField.count();
    console.log(`\nFound ${otpCount} OTP input field(s)`);
    
    if (otpCount > 0) {
      console.log('\n=== Step 5: OTP Input Fields Found ===');
      for (let i = 0; i < Math.min(otpCount, 6); i++) {
        const field = otpField.nth(i);
        const placeholder = await field.getAttribute('placeholder');
        const name = await field.getAttribute('name');
        const className = await field.getAttribute('class');
        console.log(`  Field ${i + 1}: placeholder="${placeholder}", name="${name}", class="${className}"`);
      }
      
      console.log('\n=== Step 6: Check for Verify/Submit button ===');
      const verifyButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]');
      const verifyCount = await verifyButton.count();
      console.log(`Found ${verifyCount} verify/submit button(s)`);
      
      if (verifyCount > 0) {
        const buttonText = await verifyButton.first().textContent();
        console.log(`Button text: "${buttonText}"`);
      }
    }
    
    // Check for email verification link or instructions
    console.log('\n=== Step 7: Check for email verification instructions ===');
    const emailLink = page.locator('a:has-text("email"), a:has-text("yopmail")');
    const emailLinkCount = await emailLink.count();
    if (emailLinkCount > 0) {
      console.log('✓ Found email-related link');
    }
    
    console.log('\n=== Keeping browser open for 30 seconds for manual inspection ===');
    console.log('Press Ctrl+C to close...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreCompleteSignup();
