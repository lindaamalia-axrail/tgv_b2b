import { chromium } from '@playwright/test';
import * as fs from 'fs';

const URL = 'https://corpvoucher.fam-stg.click/login';
const CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

async function exploreDetailed() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const log: string[] = [];

  function addLog(message: string) {
    console.log(message);
    log.push(message);
  }

  try {
    addLog('=== USER MANAGEMENT DETAILED EXPLORATION ===\n');

    // Login
    addLog('Logging in...');
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    addLog(`✓ Logged in. Current URL: ${page.url()}\n`);

    // Navigate to User Management
    addLog('=== ALL USERS PAGE ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/user-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    addLog(`Current URL: ${page.url()}`);

    // Get page HTML structure
    addLog('\n--- PAGE STRUCTURE ---');
    const bodyHTML = await page.locator('body').innerHTML();
    
    // Save HTML for analysis
    fs.writeFileSync('playwright-tests/user-management-page.html', bodyHTML);
    addLog('✓ Page HTML saved to user-management-page.html');

    // Find all buttons
    addLog('\n--- ALL BUTTONS ---');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute('aria-label');
      const className = await buttons[i].getAttribute('class');
      addLog(`Button ${i + 1}: "${text?.trim()}" | aria-label: "${ariaLabel}" | class: "${className}"`);
    }

    // Find all links
    addLog('\n--- ALL LINKS ---');
    const links = await page.locator('a').all();
    for (let i = 0; i < Math.min(links.length, 20); i++) {
      const text = await links[i].textContent();
      const href = await links[i].getAttribute('href');
      addLog(`Link ${i + 1}: "${text?.trim()}" | href: "${href}"`);
    }

    // Find all inputs
    addLog('\n--- ALL INPUTS ---');
    const inputs = await page.locator('input').all();
    for (let i = 0; i < inputs.length; i++) {
      const name = await inputs[i].getAttribute('name');
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const id = await inputs[i].getAttribute('id');
      addLog(`Input ${i + 1}: name="${name}" | type="${type}" | placeholder="${placeholder}" | id="${id}"`);
    }

    // Find all selects
    addLog('\n--- ALL SELECTS ---');
    const selects = await page.locator('select').all();
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const id = await selects[i].getAttribute('id');
      addLog(`Select ${i + 1}: name="${name}" | id="${id}"`);
    }

    // Find tables
    addLog('\n--- TABLES ---');
    const tables = await page.locator('table').count();
    addLog(`Found ${tables} table(s)`);
    
    if (tables > 0) {
      for (let i = 0; i < tables; i++) {
        const table = page.locator('table').nth(i);
        const headers = await table.locator('thead th').allTextContents();
        addLog(`Table ${i + 1} headers: ${headers.join(' | ')}`);
        
        const rowCount = await table.locator('tbody tr').count();
        addLog(`Table ${i + 1} rows: ${rowCount}`);
        
        if (rowCount > 0) {
          const firstRowCells = await table.locator('tbody tr').first().locator('td').allTextContents();
          addLog(`First row: ${firstRowCells.join(' | ')}`);
        }
      }
    }

    // Find headings
    addLog('\n--- HEADINGS ---');
    const h1 = await page.locator('h1').allTextContents();
    const h2 = await page.locator('h2').allTextContents();
    const h3 = await page.locator('h3').allTextContents();
    addLog(`H1: ${h1.join(', ')}`);
    addLog(`H2: ${h2.join(', ')}`);
    addLog(`H3: ${h3.join(', ')}`);

    // Check for tabs or navigation
    addLog('\n--- TABS/NAVIGATION ---');
    const tabs = await page.locator('[role="tab"], .tab, .nav-tab').all();
    for (let i = 0; i < tabs.length; i++) {
      const text = await tabs[i].textContent();
      addLog(`Tab ${i + 1}: "${text?.trim()}"`);
    }

    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/user-mgmt-detailed-1.png', fullPage: true });
    addLog('\n✓ Screenshot 1 saved');

    // Try to find and click "Add User" or similar button
    addLog('\n--- TRYING TO FIND ADD USER BUTTON ---');
    const possibleAddButtons = [
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("Create")',
      'button:has-text("+")',
      'a:has-text("Add")',
      '[data-testid*="add"]',
      '[aria-label*="add"]'
    ];

    for (const selector of possibleAddButtons) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const text = await page.locator(selector).first().textContent();
        addLog(`✓ Found: ${selector} - "${text?.trim()}"`);
      }
    }

    // Navigate to Roles page
    addLog('\n=== ROLES PAGE ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/role-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    addLog(`Current URL: ${page.url()}`);

    // Save HTML
    const rolesHTML = await page.locator('body').innerHTML();
    fs.writeFileSync('playwright-tests/roles-page.html', rolesHTML);
    addLog('✓ Roles page HTML saved');

    // Find all buttons on roles page
    addLog('\n--- ROLES PAGE BUTTONS ---');
    const rolesButtons = await page.locator('button').all();
    for (let i = 0; i < Math.min(rolesButtons.length, 15); i++) {
      const text = await rolesButtons[i].textContent();
      addLog(`Button ${i + 1}: "${text?.trim()}"`);
    }

    // Find tables on roles page
    addLog('\n--- ROLES PAGE TABLES ---');
    const rolesTables = await page.locator('table').count();
    if (rolesTables > 0) {
      const headers = await page.locator('table thead th').allTextContents();
      addLog(`Headers: ${headers.join(' | ')}`);
      
      const rowCount = await page.locator('table tbody tr').count();
      addLog(`Rows: ${rowCount}`);
    }

    await page.screenshot({ path: 'playwright-tests/screenshots/roles-detailed.png', fullPage: true });
    addLog('✓ Screenshot 2 saved');

    // Navigate to Audit Log page
    addLog('\n=== AUDIT LOG PAGE ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/audit-log');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    addLog(`Current URL: ${page.url()}`);

    // Save HTML
    const auditHTML = await page.locator('body').innerHTML();
    fs.writeFileSync('playwright-tests/audit-log-page.html', auditHTML);
    addLog('✓ Audit log page HTML saved');

    // Find filters
    addLog('\n--- AUDIT LOG FILTERS ---');
    const auditSelects = await page.locator('select').all();
    for (let i = 0; i < auditSelects.length; i++) {
      const name = await auditSelects[i].getAttribute('name');
      const id = await auditSelects[i].getAttribute('id');
      const label = await auditSelects[i].locator('..').locator('label').textContent().catch(() => '');
      addLog(`Select ${i + 1}: name="${name}" | id="${id}" | label="${label}"`);
    }

    const auditInputs = await page.locator('input').all();
    for (let i = 0; i < auditInputs.length; i++) {
      const name = await auditInputs[i].getAttribute('name');
      const type = await auditInputs[i].getAttribute('type');
      const placeholder = await auditInputs[i].getAttribute('placeholder');
      addLog(`Input ${i + 1}: name="${name}" | type="${type}" | placeholder="${placeholder}"`);
    }

    await page.screenshot({ path: 'playwright-tests/screenshots/audit-log-detailed.png', fullPage: true });
    addLog('✓ Screenshot 3 saved');

    // Save log
    fs.writeFileSync('playwright-tests/user-management-detailed-log.txt', log.join('\n'));
    addLog('\n✓ Detailed log saved');

    addLog('\n=== EXPLORATION COMPLETE ===');

  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreDetailed();
