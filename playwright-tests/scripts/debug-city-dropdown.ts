import { chromium } from 'playwright';

async function debugCityDropdown() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to signup page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
    await page.waitForTimeout(2000);
    
    console.log('\n=== Filling form fields ===');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@yopmail.com');
    await page.fill('input[name="phoneNumber"]', '60104411234');
    await page.fill('input[name="password"]', 'P@ssw0rd');
    await page.fill('input[name="confirmPassword"]', 'P@ssw0rd');
    
    // Select ID Type
    await page.click('input[name="idType"][value="NRIC"]');
    await page.fill('input[name="idNumber"]', '1234567890123456');
    
    // Fill address
    await page.fill('input[name="streetAddress"]', 'Test Street');
    await page.fill('input[name="postalCode"]', '40286');
    
    console.log('\n=== Checking state dropdown ===');
    const stateOptions = await page.locator('select[name="state"] option').allTextContents();
    console.log('Available states:', stateOptions);
    
    console.log('\n=== Selecting state: Johor ===');
    await page.selectOption('select[name="state"]', 'Johor');
    
    console.log('Waiting for city dropdown to populate...');
    
    // Wait and check multiple times
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(1000);
      const cityOptions = await page.locator('select[name="city"] option').allTextContents();
      console.log(`After ${i} second(s):`, cityOptions);
      
      if (cityOptions.length > 1) {
        console.log('\n=== City options loaded! ===');
        
        // Get option values too
        const citySelect = page.locator('select[name="city"]');
        const options = await citySelect.locator('option').all();
        
        console.log('\nDetailed city options:');
        for (const option of options) {
          const text = await option.textContent();
          const value = await option.getAttribute('value');
          console.log(`  Text: "${text}", Value: "${value}"`);
        }
        
        // Try to find "Johor Baru" or similar
        const johorBaruOption = cityOptions.find(opt => 
          opt.toLowerCase().includes('johor') && opt.toLowerCase().includes('baru')
        );
        
        if (johorBaruOption) {
          console.log(`\nFound matching option: "${johorBaruOption}"`);
        } else {
          console.log('\n"Johor Baru" not found in options');
          console.log('Trying to select first available city...');
          if (options.length > 1) {
            const firstValue = await options[1].getAttribute('value');
            console.log(`First city value: "${firstValue}"`);
          }
        }
        
        break;
      }
    }
    
    console.log('\n=== Taking screenshot ===');
    await page.screenshot({ path: 'playwright-tests/screenshots/debug-city-dropdown.png', fullPage: true });
    
    console.log('\nPress Ctrl+C to close browser...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/debug-city-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugCityDropdown();
