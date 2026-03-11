import { chromium } from '@playwright/test';
import { ADMIN_PORTAL } from '../utils/test-data';
import { ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';

async function debugNavigation() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to admin portal...');
    await page.goto(ADMIN_PORTAL.URL.replace('/login', '/'));

    console.log('Step 2: Inject authentication tokens...');
    await page.evaluate((tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        // @ts-ignore
        window.localStorage.setItem(key, value);
      }
    }, ADMIN_LOCALSTORAGE_TOKENS);

    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('Current URL after auth:', page.url());

    console.log('\nStep 3: Click hamburger menu...');
    await page.click('.MuiIconButton-root:has(svg)');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'playwright-tests/screenshots/debug-01-sidebar-opened.png', fullPage: true });

    console.log('\nStep 4: Get all visible menu items...');
    const menuItems = await page.locator('nav a, aside a, [role="navigation"] a, .MuiDrawer-root a, .MuiList-root a').allTextContents();
    console.log('Menu items found:', menuItems);

    console.log('\nStep 5: Click Content Management...');
    await page.click('text=Content Management');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'playwright-tests/screenshots/debug-02-content-mgmt-clicked.png', fullPage: true });

    console.log('\nStep 6: Get submenu items...');
    const submenuItems = await page.locator('a, button').allTextContents();
    console.log('All clickable items:', submenuItems.filter(text => text.trim().length > 0));

    console.log('\nStep 7: Try clicking Homepage...');
    try {
      await page.click('text=Homepage', { timeout: 3000 });
      await page.waitForTimeout(1500);
      console.log('✓ Homepage clicked');
    } catch (e) {
      console.log('✗ Homepage not found, trying alternatives...');
      
      // Try other options
      const alternatives = ['Homepage Carousel', 'Home', 'Carousel'];
      for (const alt of alternatives) {
        try {
          await page.click(`text=${alt}`, { timeout: 2000 });
          console.log(`✓ Clicked: ${alt}`);
          await page.waitForTimeout(1500);
          break;
        } catch {
          console.log(`✗ Not found: ${alt}`);
        }
      }
    }

    await page.screenshot({ path: 'playwright-tests/screenshots/debug-03-final-page.png', fullPage: true });
    console.log('\nCurrent URL:', page.url());

    console.log('\nStep 8: Check for table...');
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    console.log('Table visible:', hasTable);

    if (hasTable) {
      const headers = await page.locator('table th').allTextContents();
      console.log('Table headers:', headers);
    } else {
      console.log('No table found. Page content:');
      const pageText = await page.locator('body').textContent();
      console.log(pageText?.substring(0, 500));
    }

    console.log('\n=== Check screenshots folder for visual reference ===');
    await page.waitForTimeout(3000);
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugNavigation();
