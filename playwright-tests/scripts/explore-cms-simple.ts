import { chromium } from '@playwright/test';
import * as fs from 'fs';
import { ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';

const ADMIN_URL = 'https://corpvoucher.fam-stg.click';

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  const log: string[] = [];
  const addLog = (msg: string) => {
    console.log(msg);
    log.push(msg);
  };
  
  try {
    // Login
    addLog('🔐 Logging in...');
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    
    await page.evaluate((tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        window.localStorage.setItem(key, value);
      }
    }, ADMIN_LOCALSTORAGE_TOKENS);
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    addLog('✅ Logged in');
    
    // Take initial screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-01-dashboard.png', fullPage: true });
    addLog('📸 Dashboard screenshot saved');

    
    // Open sidebar
    addLog('\n📍 Opening sidebar...');
    await page.waitForTimeout(2000);
    
    // Try to find and click hamburger menu
    const hamburgerSelectors = [
      '.MuiIconButton-root:has(svg)',
      'button[aria-label="open drawer"]',
      'button.MuiIconButton-edgeStart',
      'header button:first-child'
    ];
    
    let clicked = false;
    for (const selector of hamburgerSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          addLog(`✅ Clicked hamburger: ${selector}`);
          clicked = true;
          break;
        }
      } catch (e) {}
    }
    
    if (!clicked) {
      addLog('❌ Could not find hamburger menu');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-02-sidebar-open.png', fullPage: true });
    
    // Click Content Management
    addLog('\n📍 Clicking Content Management...');
    const cmSelectors = [
      'text=Content Management',
      'a:has-text("Content Management")',
      'li:has-text("Content Management")'
    ];
    
    clicked = false;
    for (const selector of cmSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          addLog(`✅ Clicked Content Management: ${selector}`);
          clicked = true;
          break;
        }
      } catch (e) {}
    }
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-03-cm-expanded.png', fullPage: true });

    
    // HOMEPAGE CAROUSEL
    addLog('\n\n========== HOMEPAGE CAROUSEL ==========');
    await page.click('text=Homepage');
    await page.waitForTimeout(3000);
    addLog('✅ Navigated to Homepage');
    
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-04-homepage-carousel.png', fullPage: true });
    
    // Extract table info
    const carouselHeaders = await page.locator('th, [role="columnheader"]').allTextContents();
    addLog(`📊 Headers: ${JSON.stringify(carouselHeaders)}`);
    
    // Find buttons
    const addBtn = await page.locator('button:has-text("Add")').first().isVisible().catch(() => false);
    addLog(`🔘 Add button visible: ${addBtn}`);
    
    const editBtn = await page.locator('button[aria-label="Edit"], button:has(svg[data-testid="EditIcon"])').first().isVisible().catch(() => false);
    addLog(`🔘 Edit button visible: ${editBtn}`);
    
    // CATEGORY
    addLog('\n\n========== CATEGORY ==========');
    await page.click('text=Category');
    await page.waitForTimeout(3000);
    addLog('✅ Navigated to Category');
    
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-05-category.png', fullPage: true });
    
    const categoryHeaders = await page.locator('th, [role="columnheader"]').allTextContents();
    addLog(`📊 Headers: ${JSON.stringify(categoryHeaders)}`);

    
    // HIGHLIGHTS
    addLog('\n\n========== HIGHLIGHTS ==========');
    await page.click('text=Homepage');
    await page.waitForTimeout(2000);
    
    // Click Highlights tab
    const highlightsTab = await page.locator('button:has-text("Highlights"), [role="tab"]:has-text("Highlights")').first();
    if (await highlightsTab.isVisible({ timeout: 2000 })) {
      await highlightsTab.click();
      await page.waitForTimeout(2000);
      addLog('✅ Clicked Highlights tab');
    }
    
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-06-highlights.png', fullPage: true });
    
    const highlightsHeaders = await page.locator('th, [role="columnheader"]').allTextContents();
    addLog(`📊 Headers: ${JSON.stringify(highlightsHeaders)}`);
    
    // POPULAR SEARCH
    addLog('\n\n========== POPULAR SEARCH ==========');
    await page.click('text=Popular Search');
    await page.waitForTimeout(3000);
    addLog('✅ Navigated to Popular Search');
    
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-07-popular-search.png', fullPage: true });
    
    const popularHeaders = await page.locator('th, [role="columnheader"]').allTextContents();
    addLog(`📊 Headers: ${JSON.stringify(popularHeaders)}`);
    
    // Save log
    fs.writeFileSync('playwright-tests/cms-exploration-log.txt', log.join('\n'));
    addLog('\n✅ Exploration complete! Log saved to cms-exploration-log.txt');
    
  } catch (error) {
    addLog(`❌ Error: ${error}`);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main();
