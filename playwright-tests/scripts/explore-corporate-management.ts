import { chromium } from '@playwright/test';

async function exploreCorporateManagement() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    navigation: {},
    mainPage: {},
    searchFilters: {},
    exportButtons: {},
    editModal: {},
    purchaseHistory: {},
    inventory: {},
    sorting: {}
  };

  try {
    console.log('=== STEP 1: Login ===');
    await page.goto('https://corpvoucher.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'playwright-tests/screenshots/login-page.png', fullPage: true });
    
    // Find email input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="gmail" i]',
      'input[id*="email" i]'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        const input = await page.locator(selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found email/username input: ${selector}`);
          emailInput = selector;
          await page.fill(selector, 'lindaamalia+1@axrail.com');
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Find password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[id*="password" i]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        const input = await page.locator(selector).first();
        if (await input.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found password input: ${selector}`);
          passwordInput = selector;
          await page.fill(selector, 'Rahasia123@');
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Find submit button
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'button:has-text("Log in")',
      '[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      try {
        const btn = await page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          console.log(`✓ Found submit button: ${selector}`);
          await btn.click();
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('Current URL after login:', page.url());
    await page.screenshot({ path: 'playwright-tests/screenshots/after-login.png', fullPage: true });

    console.log('=== STEP 2: Navigate to Corporate Management ===');
    
    // Check if we're already on corporate management or need to navigate
    if (!page.url().includes('corporate-management')) {
      // Try different navigation selectors
      const navSelectors = [
        'a[href*="corporate"]',
        'text=Corporate Management',
        '[data-testid*="corporate"]',
        'nav a:has-text("Corporate")',
        '.sidebar a:has-text("Corporate")',
        '.menu a:has-text("Corporate")',
        'a:has-text("Corporate")'
      ];

      let navigated = false;
      for (const selector of navSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            console.log(`✓ Found navigation with: ${selector}`);
            selectors.navigation.corporateManagementLink = selector;
            await element.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            navigated = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!navigated) {
        // Try direct URL
        console.log('Trying direct URL navigation...');
        await page.goto('https://corpvoucher.fam-stg.click/corporate-management');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
    }

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'playwright-tests/screenshots/corporate-main.png', fullPage: true });
    
    // Get page content to debug
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page has content:', pageContent.length > 0);

    console.log('=== STEP 3: Explore Main Page Elements ===');
    
    // Get all visible elements
    const allButtons = await page.locator('button').all();
    console.log(`\nFound ${allButtons.length} buttons on page`);
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const text = await allButtons[i].textContent();
      const classes = await allButtons[i].getAttribute('class');
      console.log(`Button ${i}: "${text?.trim()}" classes="${classes}"`);
    }
    
    const allInputs = await page.locator('input').all();
    console.log(`\nFound ${allInputs.length} inputs on page`);
    for (let i = 0; i < allInputs.length; i++) {
      const type = await allInputs[i].getAttribute('type');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      const name = await allInputs[i].getAttribute('name');
      console.log(`Input ${i}: type="${type}", placeholder="${placeholder}", name="${name}"`);
    }
    
    const allTables = await page.locator('table').all();
    console.log(`\nFound ${allTables.length} tables on page`);
    
    // Search filters
    console.log('\n--- Search Filters ---');
    const searchInputs = await page.locator('input[type="text"], input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]').all();
    console.log(`Found ${searchInputs.length} search inputs`);
    
    for (let i = 0; i < searchInputs.length; i++) {
      const input = searchInputs[i];
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      console.log(`Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
      
      if (placeholder?.toLowerCase().includes('company') || name?.toLowerCase().includes('company')) {
        selectors.searchFilters.companyName = name ? `input[name="${name}"]` : `input[placeholder*="${placeholder}"]`;
      }
      if (placeholder?.toLowerCase().includes('email') || name?.toLowerCase().includes('email')) {
        selectors.searchFilters.email = name ? `input[name="${name}"]` : `input[placeholder*="${placeholder}"]`;
      }
      if (placeholder?.toLowerCase().includes('phone') || name?.toLowerCase().includes('phone')) {
        selectors.searchFilters.phone = name ? `input[name="${name}"]` : `input[placeholder*="${placeholder}"]`;
      }
    }

    // Export buttons
    console.log('\n--- Export Buttons ---');
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Download")',
      '[data-testid*="export"]',
      '.export-button',
      'button[class*="export"]'
    ];

    for (const selector of exportButtons) {
      try {
        const btn = await page.locator(selector).first();
        if (await btn.isVisible({ timeout: 1000 })) {
          console.log(`✓ Found export button: ${selector}`);
          selectors.exportButtons.main = selector;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Table headers for sorting
    console.log('\n--- Table Headers ---');
    const headers = await page.locator('th, [role="columnheader"]').all();
    console.log(`Found ${headers.length} table headers`);
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const text = await header.textContent();
      console.log(`Header ${i}: "${text?.trim()}"`);
    }
    
    // Table rows
    const rows = await page.locator('tr, [role="row"]').all();
    console.log(`\nFound ${rows.length} table rows`);

    // Edit buttons
    console.log('\n--- Edit Buttons / Action Buttons ---');
    
    // Look for SVG icons in the Actions column
    const svgIcons = await page.locator('svg').all();
    console.log(`Found ${svgIcons.length} SVG icons`);
    
    for (let i = 0; i < Math.min(svgIcons.length, 15); i++) {
      const testId = await svgIcons[i].getAttribute('data-testid');
      const classes = await svgIcons[i].getAttribute('class');
      console.log(`SVG ${i}: testId="${testId}", classes="${classes}"`);
    }
    
    const editSelectors = [
      'button[aria-label="Edit"]',
      'button:has-text("Edit")',
      '[data-testid*="edit"]',
      'button:has(svg[data-testid="EditIcon"])',
      'button:has(svg[data-testid*="Edit"])',
      'svg[data-testid="EditIcon"]',
      'button svg[data-testid="EditIcon"]',
      'button.MuiIconButton-root:has(svg)',
      'td:last-child button',
      '[role="cell"]:last-child button'
    ];

    for (const selector of editSelectors) {
      try {
        const btns = await page.locator(selector).all();
        if (btns.length > 0) {
          console.log(`✓ Found ${btns.length} edit/action buttons: ${selector}`);
          selectors.mainPage.editButton = selector;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Checkboxes
    console.log('\n--- Checkboxes ---');
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`Found ${checkboxes.length} checkboxes`);
    if (checkboxes.length > 0) {
      selectors.mainPage.checkbox = 'input[type="checkbox"]';
    }

    console.log('=== STEP 4: Search for a corporate user first ===');
    // First, let's search for a company to get data in the table
    try {
      await page.fill('input[placeholder*="Company Name"]', 'Axrail');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/corporate-with-data.png', fullPage: true });
      
      console.log('\n--- After Search ---');
      const rowsAfterSearch = await page.locator('[role="row"]').all();
      console.log(`Found ${rowsAfterSearch.length} rows after search`);
      
      // Look for action buttons in the last column
      const actionButtons = await page.locator('[role="row"] [role="cell"]:last-child button').all();
      console.log(`Found ${actionButtons.length} action buttons in last column`);
      
      if (actionButtons.length > 0) {
        selectors.mainPage.editButton = '[role="row"] [role="cell"]:last-child button';
        console.log('✓ Set edit button selector to: [role="row"] [role="cell"]:last-child button');
      }
      
    } catch (error) {
      console.error('Error searching:', error);
    }
    
    console.log('=== STEP 5: Click Edit Button to Open Modal ===');
    if (selectors.mainPage.editButton) {
      try {
        await page.locator(selectors.mainPage.editButton).first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-tests/screenshots/corporate-edit-modal.png', fullPage: true });

        console.log('\n--- Edit Modal Elements ---');
        
        // Modal container
        const modalSelectors = [
          '[role="dialog"]',
          '.modal',
          '[class*="modal"]',
          '[class*="Modal"]',
          '[data-testid*="modal"]'
        ];

        for (const selector of modalSelectors) {
          try {
            const modal = await page.locator(selector).first();
            if (await modal.isVisible({ timeout: 1000 })) {
              console.log(`✓ Found modal: ${selector}`);
              selectors.editModal.container = selector;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Form inputs in modal
        const modalInputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').all();
        console.log(`Found ${modalInputs.length} inputs in modal`);
        
        for (let i = 0; i < modalInputs.length; i++) {
          const input = modalInputs[i];
          const name = await input.getAttribute('name');
          const id = await input.getAttribute('id');
          const label = await input.getAttribute('aria-label');
          console.log(`Modal Input ${i}: name="${name}", id="${id}", label="${label}"`);
        }

        // Save button
        const saveSelectors = [
          'button:has-text("Save")',
          'button:has-text("Update")',
          'button[type="submit"]',
          '[data-testid*="save"]'
        ];

        for (const selector of saveSelectors) {
          try {
            const btn = await page.locator(selector).first();
            if (await btn.isVisible({ timeout: 1000 })) {
              console.log(`✓ Found save button: ${selector}`);
              selectors.editModal.saveButton = selector;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Tabs (Purchase History, Inventory)
        console.log('\n--- Tabs ---');
        const tabSelectors = [
          'button[role="tab"]',
          '[role="tablist"] button',
          '.tabs button',
          '[class*="tab"]'
        ];

        for (const selector of tabSelectors) {
          try {
            const tabs = await page.locator(selector).all();
            if (tabs.length > 0) {
              console.log(`✓ Found ${tabs.length} tabs with: ${selector}`);
              for (let i = 0; i < tabs.length; i++) {
                const text = await tabs[i].textContent();
                console.log(`  Tab ${i}: "${text?.trim()}"`);
              }
              selectors.editModal.tabs = selector;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Look for Purchase History section
        console.log('\n--- Purchase History Section ---');
        const purchaseHistorySelectors = [
          'text=Purchase History',
          '[data-testid*="purchase"]',
          '[class*="purchase"]'
        ];

        for (const selector of purchaseHistorySelectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              console.log(`✓ Found Purchase History: ${selector}`);
              selectors.purchaseHistory.section = selector;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Filter Date button
        const filterDateSelectors = [
          'button:has-text("Filter Date")',
          'button:has-text("Filter")',
          '[data-testid*="filter"]'
        ];

        for (const selector of filterDateSelectors) {
          try {
            const btn = await page.locator(selector).first();
            if (await btn.isVisible({ timeout: 1000 })) {
              console.log(`✓ Found Filter Date button: ${selector}`);
              selectors.purchaseHistory.filterDateButton = selector;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Search in Purchase History
        const purchaseSearchInputs = await page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[placeholder*="Booking"], input[placeholder*="Order"], input[placeholder*="Transaction"]').all();
        console.log(`Found ${purchaseSearchInputs.length} search inputs in Purchase History`);
        
        for (let i = 0; i < purchaseSearchInputs.length; i++) {
          const input = purchaseSearchInputs[i];
          const placeholder = await input.getAttribute('placeholder');
          console.log(`  Search Input ${i}: placeholder="${placeholder}"`);
        }

        // Look for Inventory tab/section
        console.log('\n--- Inventory Section ---');
        const inventorySelectors = [
          'button:has-text("Inventory")',
          'text=Inventory',
          '[data-testid*="inventory"]',
          '[role="tab"]:has-text("Inventory")'
        ];

        for (const selector of inventorySelectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              console.log(`✓ Found Inventory: ${selector}`);
              selectors.inventory.tab = selector;
              
              // Click to see inventory section
              await element.click();
              await page.waitForTimeout(2000);
              await page.screenshot({ path: 'playwright-tests/screenshots/corporate-inventory.png', fullPage: true });
              
              // Download Inventory button
              const downloadInventorySelectors = [
                'button:has-text("Download")',
                'button:has-text("Export")',
                '[data-testid*="download"]'
              ];

              for (const dlSelector of downloadInventorySelectors) {
                try {
                  const btn = await page.locator(dlSelector).first();
                  if (await btn.isVisible({ timeout: 1000 })) {
                    console.log(`✓ Found Download Inventory button: ${dlSelector}`);
                    selectors.inventory.downloadButton = dlSelector;
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
              
              break;
            }
          } catch (e) {
            continue;
          }
        }

      } catch (error) {
        console.error('Error exploring edit modal:', error);
      }
    }

    console.log('\n=== FINAL SELECTORS ===');
    console.log(JSON.stringify(selectors, null, 2));

    // Save selectors to file
    const fs = require('fs');
    fs.writeFileSync(
      'playwright-tests/corporate-management-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    console.log('\n✓ Selectors saved to corporate-management-selectors.json');

  } catch (error) {
    console.error('Error during exploration:', error);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

exploreCorporateManagement();
