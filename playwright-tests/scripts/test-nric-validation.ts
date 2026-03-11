import { chromium } from 'playwright';

async function testNRICValidation() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Generate NRIC in the correct format
    const part1 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const part2 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const part3 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const nric = `${part1}-${part2}-${part3}`;
    
    console.log(`Generated NRIC: ${nric}`);
    console.log(`NRIC length: ${nric.length} characters`);
    console.log(`Format check: ${/^\d{6}-\d{2}-\d{4}$/.test(nric) ? 'VALID' : 'INVALID'}`);
    
    console.log('\n=== Navigating to signup page ===');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Filling form with generated NRIC ===');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@yopmail.com`);
    await page.fill('input[name="phoneNumber"]', '60104411234');
    await page.fill('input[name="password"]', 'P@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'P@ssw0rd');
    
    // Select NRIC type
    await page.click('input[name="idType"][value="NRIC"]');
    await page.waitForTimeout(500);
    
    // Fill NRIC
    console.log(`Filling NRIC field with: ${nric}`);
    await page.fill('input[name="idNumber"]', nric);
    
    await page.fill('input[name="streetAddress"]', 'Test Street');
    await page.fill('input[name="postalCode"]', '40286');
    
    await page.selectOption('select[name="state"]', 'Johor');
    
    // Wait for city to load
    await page.waitForFunction(() => {
      const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement | null;
      return citySelect && citySelect.options.length > 1;
    }, { timeout: 10000 });
    
    await page.selectOption('select[name="city"]', 'Johor Bahru');
    
    console.log('\n=== Taking screenshot before submit ===');
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/nric-test-before-submit.png', fullPage: true });
    
    console.log('\n=== Clicking Submit ===');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('\n=== Checking for validation errors ===');
    const validationError = await page.locator('text=/validation error/i, text=/nric format/i').count();
    
    if (validationError > 0) {
      console.log('❌ VALIDATION ERROR FOUND!');
      const errorText = await page.locator('text=/validation error/i, text=/nric format/i').first().textContent();
      console.log(`Error message: ${errorText}`);
    } else {
      console.log('✓ No validation error visible');
    }
    
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('signup')) {
      console.log('❌ Still on signup page - form did not submit');
    } else {
      console.log('✓ Form submitted successfully - moved to next page');
    }
    
    console.log('\n=== Taking screenshot after submit ===');
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/nric-test-after-submit.png', fullPage: true });
    
    console.log('\n=== Keeping browser open for 20 seconds ===');
    await page.waitForTimeout(20000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/nric-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testNRICValidation();
