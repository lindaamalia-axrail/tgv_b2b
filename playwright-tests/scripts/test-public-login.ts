import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';

async function testPublicLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Navigate to home page');
    await page.goto(PUBLIC_WEB.URL);
    await page.waitForLoadState('networkidle');

    console.log('2. Click Sign In');
    await page.click('a:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    console.log('Current URL:', page.url());

    console.log('\n3. Fill login form');
    console.log('Email:', PUBLIC_WEB.EXISTING_USER.email);
    console.log('Password:', PUBLIC_WEB.EXISTING_USER.password);
    
    await page.fill('input[id="email"]', PUBLIC_WEB.EXISTING_USER.email);
    await page.fill('input[id="password"]', PUBLIC_WEB.EXISTING_USER.password);
    
    console.log('\n4. Click Sign In button');
    await page.click('button:has-text("Sign In")');
    
    // Wait and see what happens
    await page.waitForTimeout(5000);
    
    console.log('\n5. After login:');
    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());
    
    // Check for error messages
    const errorMsg = await page.locator('text=/error/i, text=/invalid/i, text=/incorrect/i, .error, .alert-danger').textContent().catch(() => null);
    if (errorMsg) {
      console.log('ERROR MESSAGE:', errorMsg);
    }
    
    // Check if still on login page
    if (page.url().includes('/login')) {
      console.log('\n⚠️  Still on login page - login may have failed');
      
      // Take screenshot
      await page.screenshot({ path: 'playwright-tests/screenshots/login-failed.png', fullPage: true });
      console.log('Screenshot saved: screenshots/login-failed.png');
    } else {
      console.log('\n✓ Login successful - redirected away from login page');
    }
    
    // Get page content
    const pageText = await page.locator('body').textContent();
    console.log('\nPage contains "Sign In":', pageText?.includes('Sign In'));
    console.log('Page contains user email:', pageText?.includes(PUBLIC_WEB.EXISTING_USER.email.split('@')[0]));
    
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/error.png' });
  } finally {
    await browser.close();
  }
}

testPublicLogin();
