import { chromium } from '@playwright/test';
import { ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';

async function exploreContentManagement() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to admin portal...');
    await page.goto('https://corpvoucher.fam-stg.click/admin');
    
    console.log('Injecting auth tokens...');
    await page.evaluate((tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        localStorage.setItem(key, value);
      }
    }, ADMIN_LOCALSTORAGE_TOKENS);
    await page.reload();
    await page.waitForTimeout(2000);

    console.log('\n=== SIDEBAR BUTTONS ===');
    const sidebarButtons = await page.locator('button').all();
    for (const button of sidebarButtons) {
      const text = await button.textContent();
      if (text && text.trim()) {
        console.log(`Button: "${text.trim()}"`);
      }
    }

    console.log('\n=== CLICKING CONTENT MANAGEMENT ===');
    await page.getByRole('button', { name: /Content Management/i }).click();
    await page.waitForTimeout(1000);

    console.log('\n=== CURRENT URL ===');
    console.log(page.url());

    console.log('\n=== PAGE CONTENT ===');
    const content = await page.textContent('body');
    console.log(content?.substring(0, 500));

    console.log('\n=== TABS/SECTIONS ===');
    const tabs = await page.locator('[role="tab"], button').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text && (text.includes('Carousel') || text.includes('Category') || text.includes('Highlights') || text.includes('Popular'))) {
        console.log(`Tab: "${text.trim()}"`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

exploreContentManagement();
