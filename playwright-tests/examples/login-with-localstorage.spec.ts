import { test, expect } from '@playwright/test';
import { loginViaLocalStorage, ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';
import { ADMIN_PORTAL } from '../utils/test-data';

/**
 * Example test demonstrating localStorage injection for authentication
 * This approach is much faster than traditional form-based login
 */
test.describe('Admin Portal - LocalStorage Authentication', () => {
  
  test('should login using localStorage injection', async ({ page }) => {
    // Login via localStorage injection (fast method)
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
    
    // Verify we're on the dashboard or authenticated page
    await expect(page).not.toHaveURL(/.*login.*/);
    
    console.log('✅ Successfully authenticated via localStorage');
  });

  test('should access protected pages after localStorage login', async ({ page }) => {
    // Login first
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
    
    // Navigate to a protected page (example: user management)
    await page.goto('https://corpvoucher.fam-stg.click/admin/user-management');
    
    // Verify we can access the page
    await expect(page).not.toHaveURL(/.*login.*/);
    
    console.log('✅ Can access protected pages');
  });

  test('should maintain session across page navigations', async ({ page }) => {
    // Login via localStorage
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
    
    // Navigate to different pages
    const pages = [
      'https://corpvoucher.fam-stg.click/admin/dashboard',
      'https://corpvoucher.fam-stg.click/admin/user-management',
      'https://corpvoucher.fam-stg.click/admin/reports'
    ];
    
    for (const url of pages) {
      await page.goto(url);
      await expect(page).not.toHaveURL(/.*login.*/);
      console.log(`✅ Accessed: ${url}`);
    }
  });
});

/**
 * Alternative: Use as a beforeEach hook for all tests
 */
test.describe('Admin Portal - With Auth Hook', () => {
  
  test.beforeEach(async ({ page }) => {
    // Automatically login before each test
    await loginViaLocalStorage(page, ADMIN_PORTAL.URL, ADMIN_LOCALSTORAGE_TOKENS);
  });

  test('test 1 - already authenticated', async ({ page }) => {
    // You're already logged in, start testing immediately
    await page.goto('https://corpvoucher.fam-stg.click/admin/dashboard');
    // Your test logic here
  });

  test('test 2 - already authenticated', async ({ page }) => {
    // You're already logged in, start testing immediately
    await page.goto('https://corpvoucher.fam-stg.click/admin/user-management');
    // Your test logic here
  });
});
