import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function exploreSignup() {
  // Use incognito mode to avoid logged-in state
  const browser = await chromium.launch({ headless: false, slowMo: 1500 });
  const context = await browser.newContext(); // Fresh context, no cookies
  const page = await context.newPage();

  try {
    console.log('=== EXPLORING SIGNUP PAGE (CLEAN SESSION) ===\n');

    // 1. Go to login page
    console.log('1. Navigating to login page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'playwright-tests/screenshots/signup-01-login.png', fullPage: true });

    // 2. Scroll down and find Sign Up link
    console.log('2. Scrolling to find Sign Up link...');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'playwright-tests/screenshots/signup-02-login-scrolled.png', fullPage: true });

    // 3. Click Sign Up link
    const signUpLink = page.locator('a:has-text("Sign Up"), a[href*="signup"]');
    if (await signUpLink.isVisible()) {
      console.log('3. Clicking Sign Up link...');
      await signUpLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      console.log('3. Sign Up link not visible, trying direct navigation...');
      await page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    console.log('4. Taking signup page screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-03-page.png', fullPage: true });

    // Save HTML
    const html = await page.content();
    fs.writeFileSync('playwright-tests/signup-clean.html', html);

    // 4. Extract all form elements
    console.log('\n5. Extracting signup form elements...\n');

    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const isVisible = await inputs[i].isVisible();
      
      if (isVisible) {
        console.log(`  [${i}] type="${type}", name="${name}", placeholder="${placeholder}"`);
      }
    }

    const selects = await page.locator('select').all();
    console.log(`\nFound ${selects.length} select fields:`);
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const isVisible = await selects[i].isVisible();
      
      if (isVisible) {
        console.log(`  [${i}] name="${name}"`);
      }
    }

    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const isVisible = await buttons[i].isVisible();
      
      if (isVisible && text?.trim()) {
        console.log(`  [${i}] "${text?.trim()}" (type="${type}")`);
      }
    }

    // 5. Try filling the form
    console.log('\n6. Testing form fill...');
    
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      console.log('  ✓ Filled name');
    }

    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('testuser_999@yopmail.com');
      console.log('  ✓ Filled email');
    }

    const phoneInput = page.locator('input[name="phoneNumber"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('60104411239');
      console.log('  ✓ Filled phone');
    }

    // Select ID Type (NRIC)
    const nricRadio = page.locator('input[name="idType"][value="NRIC"], input[name="idType"]').first();
    if (await nricRadio.isVisible()) {
      await nricRadio.click();
      console.log('  ✓ Selected ID Type');
    }

    const idNumberInput = page.locator('input[name="idNumber"]');
    if (await idNumberInput.isVisible()) {
      await idNumberInput.fill('1234567890123456');
      console.log('  ✓ Filled ID Number');
    }

    const addressInput = page.locator('input[name="streetAddress"]');
    if (await addressInput.isVisible()) {
      await addressInput.fill('Test Address');
      console.log('  ✓ Filled address');
    }

    const postalInput = page.locator('input[name="postalCode"]');
    if (await postalInput.isVisible()) {
      await postalInput.fill('40286');
      console.log('  ✓ Filled postal code');
    }

    await page.waitForTimeout(1000);

    console.log('\n7. Taking filled form screenshot...');
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-04-filled.png', fullPage: true });

    console.log('\n=== EXPLORATION COMPLETE ===');
    console.log('Screenshots and HTML saved');

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/signup-error.png', fullPage: true });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreSignup();
