import { chromium } from '@playwright/test';
import * as fs from 'fs';

const URL = 'https://corpvoucher.fam-stg.click/login';
const CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

interface Selectors {
  allUsersPage: any;
  rolesPage: any;
  auditLogPage: any;
}

async function exploreUserManagement() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: Selectors = {
    allUsersPage: {},
    rolesPage: {},
    auditLogPage: {}
  };

  const log: string[] = [];

  function addLog(message: string) {
    console.log(message);
    log.push(message);
  }

  try {
    addLog('=== STARTING USER MANAGEMENT EXPLORATION ===\n');

    // Login
    addLog('Step 1: Navigating to login page...');
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    addLog('Step 2: Logging in...');
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    addLog('Login successful!\n');

    // Navigate to User Management
    addLog('=== EXPLORING ALL USERS PAGE ===\n');
    
    // Try different navigation methods
    addLog('Step 3: Navigating to User Management...');
    
    // Check if there's a sidebar menu
    const sidebarLinks = await page.locator('a, button').all();
    for (const link of sidebarLinks) {
      const text = await link.textContent();
      if (text && (text.includes('User') || text.includes('Management'))) {
        addLog(`Found link: ${text}`);
      }
    }

    // Try direct URL navigation
    const possibleUrls = [
      '/admin/user-management',
      '/admin/user-management/users',
      '/admin/users',
      '/user-management',
      '/users'
    ];

    let userManagementUrl = '';
    for (const url of possibleUrls) {
      try {
        await page.goto(`https://corpvoucher.fam-stg.click${url}`);
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        if (!currentUrl.includes('login') && !currentUrl.includes('404')) {
          userManagementUrl = url;
          addLog(`✓ Found User Management URL: ${url}`);
          break;
        }
      } catch (e) {
        addLog(`✗ URL not found: ${url}`);
      }
    }

    if (!userManagementUrl) {
      addLog('Trying to find User Management link in navigation...');
      await page.click('text=User, text=Management').catch(() => {});
      await page.waitForTimeout(2000);
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    addLog(`\nCurrent URL: ${page.url()}`);
    addLog('\n--- ALL USERS PAGE SELECTORS ---\n');

    // Capture page structure
    addLog('Page Title:');
    const pageTitle = await page.locator('h1, h2, .page-title, .title').first().textContent().catch(() => 'Not found');
    addLog(`  ${pageTitle}`);

    // Search box
    addLog('\nSearch Box:');
    const searchSelectors = [
      'input[placeholder*="Search"]',
      'input[type="search"]',
      'input[placeholder*="search"]',
      '.search-input',
      '[data-testid="search"]'
    ];
    
    for (const selector of searchSelectors) {
      const exists = await page.locator(selector).count();
      if (exists > 0) {
        addLog(`  ✓ ${selector}`);
        selectors.allUsersPage.searchInput = selector;
        break;
      }
    }

    // Add User button
    addLog('\nAdd User Button:');
    const addUserSelectors = [
      'button:has-text("Add User")',
      'button:has-text("Add")',
      'a:has-text("Add User")',
      '[data-testid="add-user"]',
      '.add-user-btn'
    ];
    
    for (const selector of addUserSelectors) {
      const exists = await page.locator(selector).count();
      if (exists > 0) {
        addLog(`  ✓ ${selector}`);
        selectors.allUsersPage.addUserButton = selector;
        break;
      }
    }

    // Table structure
    addLog('\nTable Structure:');
    const tableExists = await page.locator('table').count();
    if (tableExists > 0) {
      addLog('  ✓ table found');
      selectors.allUsersPage.table = 'table';
      
      const headers = await page.locator('table thead th').allTextContents();
      addLog(`  Headers: ${headers.join(', ')}`);
      selectors.allUsersPage.tableHeaders = headers;
      
      const rowCount = await page.locator('table tbody tr').count();
      addLog(`  Rows: ${rowCount}`);
      
      if (rowCount > 0) {
        // Get first row structure
        const firstRow = page.locator('table tbody tr').first();
        const cells = await firstRow.locator('td').allTextContents();
        addLog(`  First row data: ${cells.join(' | ')}`);
        
        // Check for action buttons
        const editBtn = await firstRow.locator('button:has-text("Edit"), [aria-label="Edit"], .edit-btn').count();
        if (editBtn > 0) {
          addLog('  ✓ Edit button found in row');
          selectors.allUsersPage.editButton = 'button:has-text("Edit"), [aria-label="Edit"]';
        }
        
        const deleteBtn = await firstRow.locator('button[aria-label="Delete"], [aria-label="delete"], .delete-btn').count();
        if (deleteBtn > 0) {
          addLog('  ✓ Delete button found in row');
          selectors.allUsersPage.deleteButton = 'button[aria-label="Delete"], [aria-label="delete"]';
        }
      }
    }

    // Check for tabs (All Users / D&P)
    addLog('\nTabs:');
    const tabSelectors = [
      'text=D&P',
      'text=Department',
      'text=Position',
      '[role="tab"]',
      '.tab'
    ];
    
    for (const selector of tabSelectors) {
      const exists = await page.locator(selector).count();
      if (exists > 0) {
        const text = await page.locator(selector).first().textContent();
        addLog(`  ✓ ${selector} - "${text}"`);
      }
    }

    // Try clicking Add User to see the form
    addLog('\n--- EXPLORING ADD USER FORM ---\n');
    const addBtn = page.locator(selectors.allUsersPage.addUserButton || 'button:has-text("Add User")').first();
    const addBtnExists = await addBtn.count();
    
    if (addBtnExists > 0) {
      await addBtn.click();
      await page.waitForTimeout(2000);
      
      addLog('Add User form opened');
      
      // Check for modal or form
      const modalExists = await page.locator('.modal, [role="dialog"], .dialog').count();
      if (modalExists > 0) {
        addLog('  ✓ Modal/Dialog found');
        selectors.allUsersPage.modal = '.modal, [role="dialog"]';
      }
      
      // Form fields
      addLog('\nForm Fields:');
      const formFields = [
        { name: 'displayName', selectors: ['input[name="displayName"]', 'input[name="name"]', 'input[placeholder*="Name"]'] },
        { name: 'email', selectors: ['input[name="email"]', 'input[type="email"]'] },
        { name: 'role', selectors: ['select[name="role"]', '[name="role"]'] },
        { name: 'department', selectors: ['select[name="department"]', '[name="department"]'] },
        { name: 'position', selectors: ['select[name="position"]', '[name="position"]'] },
        { name: 'active', selectors: ['input[name="active"]', 'input[type="checkbox"]'] }
      ];
      
      for (const field of formFields) {
        for (const selector of field.selectors) {
          const exists = await page.locator(selector).count();
          if (exists > 0) {
            addLog(`  ✓ ${field.name}: ${selector}`);
            selectors.allUsersPage[`${field.name}Input`] = selector;
            break;
          }
        }
      }
      
      // Save button
      const saveBtn = await page.locator('button:has-text("Save")').count();
      if (saveBtn > 0) {
        addLog('  ✓ Save button: button:has-text("Save")');
        selectors.allUsersPage.saveButton = 'button:has-text("Save")';
      }
      
      // Cancel/Close button
      const cancelBtn = await page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').count();
      if (cancelBtn > 0) {
        addLog('  ✓ Cancel button found');
        selectors.allUsersPage.cancelButton = 'button:has-text("Cancel"), button:has-text("Close")';
        await page.locator('button:has-text("Cancel"), button:has-text("Close")').first().click();
        await page.waitForTimeout(1000);
      }
    }

    // Explore D&P section
    addLog('\n--- EXPLORING D&P SECTION ---\n');
    const dpTab = page.locator('text=D&P, text=Department').first();
    const dpTabExists = await dpTab.count();
    
    if (dpTabExists > 0) {
      await dpTab.click();
      await page.waitForTimeout(2000);
      addLog('D&P tab clicked');
      
      // Check D&P table
      const dpTableExists = await page.locator('table').count();
      if (dpTableExists > 0) {
        const headers = await page.locator('table thead th').allTextContents();
        addLog(`  D&P Headers: ${headers.join(', ')}`);
        selectors.allUsersPage.dpTableHeaders = headers;
      }
      
      // Add New button for D&P
      const addNewBtn = await page.locator('button:has-text("Add New")').count();
      if (addNewBtn > 0) {
        addLog('  ✓ Add New button found');
        selectors.allUsersPage.addNewButton = 'button:has-text("Add New")';
      }
    }

    // Navigate to Roles page
    addLog('\n=== EXPLORING ROLES PAGE ===\n');
    
    const rolesUrls = [
      '/admin/user-management/roles',
      '/admin/roles',
      '/roles'
    ];
    
    let rolesUrl = '';
    for (const url of rolesUrls) {
      try {
        await page.goto(`https://corpvoucher.fam-stg.click${url}`);
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        if (!currentUrl.includes('login') && !currentUrl.includes('404')) {
          rolesUrl = url;
          addLog(`✓ Found Roles URL: ${url}`);
          break;
        }
      } catch (e) {
        addLog(`✗ URL not found: ${url}`);
      }
    }

    if (rolesUrl) {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      addLog('\n--- ROLES PAGE SELECTORS ---\n');
      
      // Page title
      const rolesTitle = await page.locator('h1, h2, .page-title').first().textContent().catch(() => 'Not found');
      addLog(`Page Title: ${rolesTitle}`);
      
      // Add Role button
      const addRoleBtn = await page.locator('button:has-text("Add Role"), button:has-text("Add")').count();
      if (addRoleBtn > 0) {
        addLog('  ✓ Add Role button found');
        selectors.rolesPage.addRoleButton = 'button:has-text("Add Role"), button:has-text("Add")';
      }
      
      // Roles table
      const rolesTableExists = await page.locator('table').count();
      if (rolesTableExists > 0) {
        const headers = await page.locator('table thead th').allTextContents();
        addLog(`  Table Headers: ${headers.join(', ')}`);
        selectors.rolesPage.tableHeaders = headers;
        
        const rowCount = await page.locator('table tbody tr').count();
        addLog(`  Rows: ${rowCount}`);
      }
    }

    // Navigate to Audit Log page
    addLog('\n=== EXPLORING AUDIT LOG PAGE ===\n');
    
    const auditLogUrls = [
      '/admin/user-management/audit-log',
      '/admin/audit-log',
      '/audit-log'
    ];
    
    let auditLogUrl = '';
    for (const url of auditLogUrls) {
      try {
        await page.goto(`https://corpvoucher.fam-stg.click${url}`);
        await page.waitForTimeout(2000);
        const currentUrl = page.url();
        if (!currentUrl.includes('login') && !currentUrl.includes('404')) {
          auditLogUrl = url;
          addLog(`✓ Found Audit Log URL: ${url}`);
          break;
        }
      } catch (e) {
        addLog(`✗ URL not found: ${url}`);
      }
    }

    if (auditLogUrl) {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      addLog('\n--- AUDIT LOG PAGE SELECTORS ---\n');
      
      // Page title
      const auditTitle = await page.locator('h1, h2, .page-title').first().textContent().catch(() => 'Not found');
      addLog(`Page Title: ${auditTitle}`);
      
      // Filters
      addLog('\nFilters:');
      const moduleFilter = await page.locator('select[name="module"], .module-filter').count();
      if (moduleFilter > 0) {
        addLog('  ✓ Module filter found');
        selectors.auditLogPage.moduleFilter = 'select[name="module"], .module-filter';
      }
      
      const userFilter = await page.locator('select[name="username"], select[name="user"], .user-filter').count();
      if (userFilter > 0) {
        addLog('  ✓ User filter found');
        selectors.auditLogPage.userFilter = 'select[name="username"], select[name="user"]';
      }
      
      const dateFilter = await page.locator('input[type="date"], .date-filter').count();
      if (dateFilter > 0) {
        addLog('  ✓ Date filter found');
        selectors.auditLogPage.dateFilter = 'input[type="date"]';
      }
      
      // Audit log table
      const auditTableExists = await page.locator('table').count();
      if (auditTableExists > 0) {
        const headers = await page.locator('table thead th').allTextContents();
        addLog(`  Table Headers: ${headers.join(', ')}`);
        selectors.auditLogPage.tableHeaders = headers;
      }
    }

    // Take screenshots
    addLog('\n--- TAKING SCREENSHOTS ---\n');
    await page.goto(`https://corpvoucher.fam-stg.click${userManagementUrl}`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'playwright-tests/screenshots/user-management-all-users.png', fullPage: true });
    addLog('✓ Screenshot saved: user-management-all-users.png');
    
    if (rolesUrl) {
      await page.goto(`https://corpvoucher.fam-stg.click${rolesUrl}`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/user-management-roles.png', fullPage: true });
      addLog('✓ Screenshot saved: user-management-roles.png');
    }
    
    if (auditLogUrl) {
      await page.goto(`https://corpvoucher.fam-stg.click${auditLogUrl}`);
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/user-management-audit-log.png', fullPage: true });
      addLog('✓ Screenshot saved: user-management-audit-log.png');
    }

    // Save selectors to JSON
    fs.writeFileSync(
      'playwright-tests/user-management-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    addLog('\n✓ Selectors saved to user-management-selectors.json');

    // Save log
    fs.writeFileSync(
      'playwright-tests/user-management-exploration-log.txt',
      log.join('\n')
    );
    addLog('✓ Log saved to user-management-exploration-log.txt');

    addLog('\n=== EXPLORATION COMPLETE ===');

  } catch (error) {
    addLog(`\n❌ Error: ${error}`);
    console.error(error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreUserManagement();
