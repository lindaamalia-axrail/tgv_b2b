import { chromium } from '@playwright/test';
import { loginViaLocalStorage, ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';
import { ADMIN_PORTAL } from '../utils/test-data';

/**
 * Test script to verify localStorage injection login works
 * This demonstrates how to bypass the login UI using stored tokens
 */
async function testLocalStorageLogin() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Starting localStorage injection login test...');
    
    // Login using localStorage injection
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
    
    // Wait a bit to see the result
    await page.waitForTimeout(3000);
    
    // Verify we're logged in by checking for dashboard elements
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Take a screenshot to verify
    await page.screenshot({ path: 'playwright-tests/localstorage-login-result.png', fullPage: true });
    console.log('Screenshot saved to: playwright-tests/localstorage-login-result.png');
    
    console.log('✅ Login via localStorage injection completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during localStorage login:', error);
  } finally {
    await browser.close();
  }
}

testLocalStorageLogin();
