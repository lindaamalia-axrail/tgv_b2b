import { chromium } from '@playwright/test';
import * as fs from 'fs';

const ADMIN_URL = 'https://corpvoucher.fam-stg.click/login';
const ADMIN_EMAIL = 'lindaamalia+1@axrail.com';
const ADMIN_PASSWORD = 'Rahasia123@';

async function main() {
  console.log('Starting CMS exploration...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  
  const log: string[] = [];
  const logMsg = (msg: string) => {
    console.log(msg);
    log.push(msg);
  };

  try {
    // LOGIN
    logMsg('\n=== LOGIN ===');
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    logMsg('✓ Logged in');

    // NAVIGATE TO CONTENT MANAGEMENT
    logMsg('\n=== CONTENT MANAGEMENT NAVIGATION ===');
    await page.locator('.MuiIconButton-root:has(svg)').first().click();
    await page.waitForTimeout(1500);
    logMsg('✓ Hamburger menu clicked');

    await page.waitForSelector('text=Content Management', { state: 'visible' });
    await page.locator('text=Content Management').first().click();
    await page.waitForTimeout(1000);
    logMsg('✓ Content Management clicked');

    // HOMEPAGE CAROUSEL
    logMsg('\n=== HOMEPAGE CAROUSEL ===');
    await page.locator('text=Homepage').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-homepage.png', fullPage: true });
    logMsg('✓ Homepage page loaded');

    // Check table
    const tableVisible = await page.locator('table, [role="table"], .MuiTable-root').first().isVisible();
    logMsg(`Table visible: ${tableVisible}`);
    
    // Check headers
    const headers = ['HomePage Carousel Title', 'Start Date', 'End Date', 'Status'];
    for (const h of headers) {
      const visible = await page.locator(`th:has-text("${h}"), [role="columnheader"]:has-text("${h}")`).first().isVisible().catch(() => false);
      logMsg(`Header "${h}": ${visible}`);
    }

    // Check Add button
    const addBtnCount = await page.locator('button:has-text("Add")').count();
    logMsg(`Add buttons found: ${addBtnCount}`);
    if (addBtnCount > 0) {
      const addBtnText = await page.locator('button:has-text("Add")').first().textContent();
      logMsg(`Add button text: "${addBtnText}"`);
      
      // Click Add to see form
      await page.locator('button:has-text("Add")').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-homepage-form.png', fullPage: true });
      logMsg('✓ Add form opened');

      // Check form fields
      const nameInput = await page.locator('input[name="name"]').count();
      logMsg(`Name input found: ${nameInput > 0}`);
      
      const fileInput = await page.locator('input[type="file"]').count();
      logMsg(`File input found: ${fileInput > 0}`);
      
      const urlInput = await page.locator('input[name="url"]').count();
      logMsg(`URL input found: ${urlInput > 0}`);
      
      const startDateInput = await page.locator('input[name="startDate"], input[type="date"]').count();
      logMsg(`Start date input found: ${startDateInput > 0}`);
      
      const endDateInput = await page.locator('input[name="endDate"], input[type="date"]').count();
      logMsg(`End date input found: ${endDateInput > 0}`);
      
      const activeCheckbox = await page.locator('input[type="checkbox"]').count();
      logMsg(`Checkbox found: ${activeCheckbox > 0}`);
      
      const saveBtn = await page.locator('button:has-text("Save")').count();
      logMsg(`Save button found: ${saveBtn > 0}`);

      // Go back
      await page.goBack();
      await page.waitForTimeout(1500);
    }

    // Check Edit/Delete buttons
    const editBtnCount = await page.locator('button[aria-label="Edit"]').count();
    logMsg(`Edit buttons found: ${editBtnCount}`);
    
    const deleteBtnCount = await page.locator('button[aria-label="Delete"]').count();
    logMsg(`Delete buttons found: ${deleteBtnCount}`);

    // CATEGORY
    logMsg('\n=== CATEGORY ===');
    await page.locator('.MuiIconButton-root:has(svg)').first().click();
    await page.waitForTimeout(1000);
    await page.locator('text=Content Management').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=Category').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-category.png', fullPage: true });
    logMsg('✓ Category page loaded');

    const catHeaders = ['Title', 'Start Date', 'End Date', 'Status'];
    for (const h of catHeaders) {
      const visible = await page.locator(`th:has-text("${h}")`).first().isVisible().catch(() => false);
      logMsg(`Category header "${h}": ${visible}`);
    }

    const addCatBtn = await page.locator('button:has-text("Add")').count();
    logMsg(`Add Category button found: ${addCatBtn > 0}`);
    
    if (addCatBtn > 0) {
      await page.locator('button:has-text("Add")').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-category-form.png', fullPage: true });
      
      const titleInput = await page.locator('input[name="title"]').count();
      logMsg(`Title input found: ${titleInput > 0}`);
      
      const descInput = await page.locator('textarea[name="description"]').count();
      logMsg(`Description textarea found: ${descInput > 0}`);
      
      await page.goBack();
      await page.waitForTimeout(1500);
    }

    // HIGHLIGHTS
    logMsg('\n=== HIGHLIGHTS ===');
    await page.locator('.MuiIconButton-root:has(svg)').first().click();
    await page.waitForTimeout(1000);
    await page.locator('text=Content Management').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=Homepage').first().click();
    await page.waitForTimeout(1500);
    
    const highlightsTab = await page.locator('text=Highlights, button:has-text("Highlights")').count();
    logMsg(`Highlights tab found: ${highlightsTab > 0}`);
    
    if (highlightsTab > 0) {
      await page.locator('text=Highlights').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-highlights.png', fullPage: true });
      logMsg('✓ Highlights tab loaded');

      const highlightHeaders = ['Name', 'Position', 'Start Date', 'End Date', 'Status'];
      for (const h of highlightHeaders) {
        const visible = await page.locator(`th:has-text("${h}")`).first().isVisible().catch(() => false);
        logMsg(`Highlight header "${h}": ${visible}`);
      }

      const addHighlightBtn = await page.locator('button:has-text("Add")').count();
      if (addHighlightBtn > 0) {
        await page.locator('button:has-text("Add")').first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-tests/screenshots/cms-highlights-form.png', fullPage: true });
        
        const positionSelect = await page.locator('select[name="position"]').count();
        logMsg(`Position select found: ${positionSelect > 0}`);
        
        await page.goBack();
        await page.waitForTimeout(1500);
      }
    }

    // POPULAR SEARCH
    logMsg('\n=== POPULAR SEARCH ===');
    await page.locator('.MuiIconButton-root:has(svg)').first().click();
    await page.waitForTimeout(1000);
    await page.locator('text=Content Management').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=Popular Search').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-popular-search.png', fullPage: true });
    logMsg('✓ Popular Search page loaded');

    const popHeaders = ['Keyword', 'Status', 'Sequence'];
    for (const h of popHeaders) {
      const visible = await page.locator(`th:has-text("${h}")`).first().isVisible().catch(() => false);
      logMsg(`Popular Search header "${h}": ${visible}`);
    }

    const addPopBtn = await page.locator('button:has-text("Add")').count();
    logMsg(`Add Popular Search button found: ${addPopBtn > 0}`);
    
    if (addPopBtn > 0) {
      await page.locator('button:has-text("Add")').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-popular-search-form.png', fullPage: true });
      
      const keywordInput = await page.locator('input[name="keyword"]').count();
      logMsg(`Keyword input found: ${keywordInput > 0}`);
      
      await page.goBack();
      await page.waitForTimeout(1500);
    }

    const manageSeqBtn = await page.locator('button:has-text("Manage Display Sequence")').count();
    logMsg(`Manage Display Sequence button found: ${manageSeqBtn > 0}`);

    logMsg('\n=== EXPLORATION COMPLETE ===');
    
    // Save log
    fs.writeFileSync('playwright-tests/cms-exploration-log.txt', log.join('\n'));
    logMsg('✓ Log saved to cms-exploration-log.txt');

  } catch (error) {
    logMsg(`\n❌ Error: ${error}`);
    fs.writeFileSync('playwright-tests/cms-exploration-log.txt', log.join('\n'));
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

main();
