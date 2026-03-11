import { chromium } from '@playwright/test';
import * as fs from 'fs';

const URL = 'https://corpvoucher.fam-stg.click/login';
const CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

async function exploreForms() {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {};
  const log: string[] = [];

  function addLog(message: string) {
    console.log(message);
    log.push(message);
  }

  try {
    addLog('=== EXPLORING USER MANAGEMENT FORMS ===\n');

    // Login
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    addLog('✓ Logged in\n');

    // === ALL USERS PAGE - ADD USER FORM ===
    addLog('=== EXPLORING ADD USER FORM ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/user-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Add User
    await page.click('button:has-text("Add User")');
    await page.waitForTimeout(2000);

    addLog('Add User modal opened');

    // Check for dialog
    const dialogExists = await page.locator('[role="dialog"], .MuiDialog-root').count();
    if (dialogExists > 0) {
      addLog('✓ Dialog found');
      
      // Get all form fields
      addLog('\n--- FORM FIELDS ---');
      
      // Text inputs
      const textInputs = await page.locator('[role="dialog"] input[type="text"]').all();
      for (let i = 0; i < textInputs.length; i++) {
        const label = await textInputs[i].locator('..').locator('..').locator('label').textContent().catch(() => '');
        const placeholder = await textInputs[i].getAttribute('placeholder');
        const name = await textInputs[i].getAttribute('name');
        const id = await textInputs[i].getAttribute('id');
        addLog(`Text Input ${i + 1}: label="${label}" | placeholder="${placeholder}" | name="${name}" | id="${id}"`);
      }
      
      // Email inputs
      const emailInputs = await page.locator('[role="dialog"] input[type="email"]').all();
      for (let i = 0; i < emailInputs.length; i++) {
        const label = await emailInputs[i].locator('..').locator('..').locator('label').textContent().catch(() => '');
        const placeholder = await emailInputs[i].getAttribute('placeholder');
        addLog(`Email Input ${i + 1}: label="${label}" | placeholder="${placeholder}"`);
      }
      
      // Autocomplete/Select fields
      const autocompletes = await page.locator('[role="dialog"] .MuiAutocomplete-root, [role="dialog"] [role="combobox"]').all();
      addLog(`\nFound ${autocompletes.length} autocomplete/select fields`);
      for (let i = 0; i < autocompletes.length; i++) {
        const label = await autocompletes[i].locator('..').locator('label').textContent().catch(() => '');
        const input = await autocompletes[i].locator('input').getAttribute('placeholder').catch(() => '');
        addLog(`Autocomplete ${i + 1}: label="${label}" | placeholder="${input}"`);
      }
      
      // Checkboxes/Switches
      const checkboxes = await page.locator('[role="dialog"] input[type="checkbox"], [role="dialog"] .MuiSwitch-root').all();
      addLog(`\nFound ${checkboxes.length} checkboxes/switches`);
      
      // Date inputs
      const dateInputs = await page.locator('[role="dialog"] input[type="date"]').all();
      addLog(`Found ${dateInputs.length} date inputs`);
      
      // Buttons
      addLog('\n--- FORM BUTTONS ---');
      const buttons = await page.locator('[role="dialog"] button').all();
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        const ariaLabel = await buttons[i].getAttribute('aria-label');
        addLog(`Button ${i + 1}: "${text?.trim()}" | aria-label="${ariaLabel}"`);
      }
      
      // Save HTML
      const formHTML = await page.locator('[role="dialog"]').innerHTML();
      fs.writeFileSync('playwright-tests/add-user-form.html', formHTML);
      addLog('\n✓ Form HTML saved');
      
      await page.screenshot({ path: 'playwright-tests/screenshots/add-user-form.png' });
      addLog('✓ Screenshot saved');
      
      // Close modal
      await page.click('button:has-text("Cancel"), button[aria-label="close"]').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // === ROLES PAGE - ADD ROLE FORM ===
    addLog('\n=== EXPLORING ADD ROLE FORM ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/role-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Add Role
    await page.click('button:has-text("Add Role")');
    await page.waitForTimeout(2000);

    addLog('Add Role modal opened');

    const roleDialogExists = await page.locator('[role="dialog"], .MuiDialog-root').count();
    if (roleDialogExists > 0) {
      addLog('✓ Dialog found');
      
      // Get form structure
      addLog('\n--- ROLE FORM FIELDS ---');
      
      const roleInputs = await page.locator('[role="dialog"] input').all();
      for (let i = 0; i < Math.min(roleInputs.length, 20); i++) {
        const type = await roleInputs[i].getAttribute('type');
        const name = await roleInputs[i].getAttribute('name');
        const placeholder = await roleInputs[i].getAttribute('placeholder');
        const label = await roleInputs[i].locator('..').locator('..').locator('label').textContent().catch(() => '');
        addLog(`Input ${i + 1}: type="${type}" | name="${name}" | placeholder="${placeholder}" | label="${label}"`);
      }
      
      // Check for permission checkboxes
      const permissionCheckboxes = await page.locator('[role="dialog"] input[type="checkbox"]').count();
      addLog(`\nFound ${permissionCheckboxes} permission checkboxes`);
      
      // Save HTML
      const roleFormHTML = await page.locator('[role="dialog"]').innerHTML();
      fs.writeFileSync('playwright-tests/add-role-form.html', roleFormHTML);
      addLog('✓ Role form HTML saved');
      
      await page.screenshot({ path: 'playwright-tests/screenshots/add-role-form.png' });
      addLog('✓ Screenshot saved');
      
      // Close modal
      await page.click('button:has-text("Cancel"), button[aria-label="close"]').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // === EXPLORE EDIT USER ===
    addLog('\n=== EXPLORING EDIT USER ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/user-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to click first edit button
    const editButtons = await page.locator('.MuiIconButton-root.css-nm0ua4').all();
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await page.waitForTimeout(2000);
      
      addLog('Edit user modal opened');
      
      const editDialogExists = await page.locator('[role="dialog"]').count();
      if (editDialogExists > 0) {
        await page.screenshot({ path: 'playwright-tests/screenshots/edit-user-form.png' });
        addLog('✓ Edit form screenshot saved');
        
        // Check for Reset Password button
        const resetPwdBtn = await page.locator('button:has-text("Reset Password")').count();
        if (resetPwdBtn > 0) {
          addLog('✓ Reset Password button found');
        }
        
        await page.click('button:has-text("Cancel"), button[aria-label="close"]').catch(() => {});
      }
    }

    // === EXPLORE D&P SECTION ===
    addLog('\n=== EXPLORING D&P SECTION ===\n');
    await page.goto('https://corpvoucher.fam-stg.click/user-listing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to find and click D&P tab
    const dpTab = await page.locator('text=Department, text=D&P').count();
    if (dpTab > 0) {
      await page.click('text=Department, text=D&P').catch(() => {});
      await page.waitForTimeout(2000);
      
      addLog('D&P tab clicked');
      
      await page.screenshot({ path: 'playwright-tests/screenshots/dp-section.png' });
      addLog('✓ D&P section screenshot saved');
      
      // Click Add New
      const addNewBtn = await page.locator('button:has-text("Add New")').count();
      if (addNewBtn > 0) {
        await page.click('button:has-text("Add New")');
        await page.waitForTimeout(1000);
        
        // Check for menu options
        const menuItems = await page.locator('[role="menuitem"], .MuiMenuItem-root').all();
        addLog(`\nFound ${menuItems.length} menu items:`);
        for (const item of menuItems) {
          const text = await item.textContent();
          addLog(`  - ${text?.trim()}`);
        }
        
        await page.screenshot({ path: 'playwright-tests/screenshots/dp-add-menu.png' });
        addLog('✓ D&P add menu screenshot saved');
      }
    }

    // Save all findings
    fs.writeFileSync('playwright-tests/user-management-forms-log.txt', log.join('\n'));
    addLog('\n✓ Log saved');

    addLog('\n=== FORM EXPLORATION COMPLETE ===');

  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreForms();
