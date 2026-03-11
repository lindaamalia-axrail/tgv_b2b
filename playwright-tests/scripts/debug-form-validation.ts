import { chromium } from 'playwright';

async function debugFormValidation() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  try {
    const nric = `${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}-${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    console.log(`Generated NRIC: ${nric}`);
    
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
    await page.waitForTimeout(2000);
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@yopmail.com`);
    await page.fill('input[name="phoneNumber"]', '60104411234');
    await page.fill('input[name="password"]', 'P@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'P@ssw0rd');
    
    await page.click('input[name="idType"][value="NRIC"]');
    await page.waitForTimeout(500);
    
    await page.fill('input[name="idNumber"]', nric);
    
    await page.fill('input[name="streetAddress"]', 'Test Street');
    await page.fill('input[name="postalCode"]', '40286');
    
    await page.selectOption('select[name="state"]', 'Johor');
    await page.waitForFunction(() => {
      const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement | null;
      return citySelect && citySelect.options.length > 1;
    }, { timeout: 10000 });
    
    await page.selectOption('select[name="city"]', 'Johor Bahru');
    
    console.log('\n=== Checking form validity before submit ===');
    const formValidity = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { found: false };
      
      const inputs = Array.from(form.querySelectorAll('input, select'));
      const invalidFields = inputs
        .filter((input: any) => !input.checkValidity())
        .map((input: any) => ({
          name: input.name,
          type: input.type,
          value: input.value,
          validationMessage: input.validationMessage
        }));
      
      return {
        found: true,
        isValid: form.checkValidity(),
        invalidFields
      };
    });
    
    console.log('Form validity:', JSON.stringify(formValidity, null, 2));
    
    if (formValidity.invalidFields && formValidity.invalidFields.length > 0) {
      console.log('\n❌ Invalid fields found:');
      formValidity.invalidFields.forEach((field: any) => {
        console.log(`  - ${field.name} (${field.type}): ${field.validationMessage}`);
        console.log(`    Current value: "${field.value}"`);
      });
    }
    
    console.log('\n=== Checking for visible error messages ===');
    const errorMessages = await page.locator('[class*="error"], [class*="invalid"], .text-red-500, .text-danger').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:', errorMessages);
    } else {
      console.log('No error messages visible');
    }
    
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/debug-before-submit.png', fullPage: true });
    
    console.log('\n=== Attempting to click submit ===');
    const submitButton = page.locator('button[type="submit"]');
    const isEnabled = await submitButton.isEnabled();
    const isVisible = await submitButton.isVisible();
    console.log(`Submit button - Enabled: ${isEnabled}, Visible: ${isVisible}`);
    
    await submitButton.click();
    await page.waitForTimeout(3000);
    
    console.log('\n=== After submit ===');
    console.log('URL:', page.url());
    
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/debug-after-submit.png', fullPage: true });
    
    console.log('\n=== Keeping browser open for 30 seconds ===');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/playwright-tests/screenshots/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugFormValidation();
