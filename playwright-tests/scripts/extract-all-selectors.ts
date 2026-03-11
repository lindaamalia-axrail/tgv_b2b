import { chromium } from '@playwright/test';
import { ADMIN_PORTAL } from '../utils/test-data';
import { ADMIN_LOCALSTORAGE_TOKENS } from '../utils/auth-helper';
import * as fs from 'fs';

async function extractAllSelectors() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate and authenticate...');
    await page.goto(ADMIN_PORTAL.URL.replace('/login', '/'));

    await page.evaluate((tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        // @ts-ignore
        window.localStorage.setItem(key, value);
      }
    }, ADMIN_LOCALSTORAGE_TOKENS);

    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log('Step 2: Navigate to Homepage Carousel...');
    await page.click('.MuiIconButton-root:has(svg)');
    await page.waitForTimeout(1000);
    await page.click('text=Content Management');
    await page.waitForTimeout(500);
    await page.click('text=Homepage');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== EXTRACTING ALL SELECTORS ===\n');

    const selectors: any = {
      url: page.url(),
      pageTitle: await page.title(),
      elements: {}
    };

    // Extract breadcrumb
    const breadcrumb = await page.locator('.MuiBreadcrumbs-root, [aria-label="breadcrumb"]').textContent().catch(() => null);
    selectors.elements.breadcrumb = {
      text: breadcrumb,
      selector: '.MuiBreadcrumbs-root, [aria-label="breadcrumb"]'
    };

    // Extract page heading
    const heading = await page.locator('h1, h2, h3').first().textContent().catch(() => null);
    selectors.elements.heading = {
      text: heading,
      selector: 'h1, h2, h3'
    };

    // Extract tabs
    const tabs = await page.locator('[role="tab"], .MuiTab-root').allTextContents().catch(() => []);
    selectors.elements.tabs = {
      texts: tabs,
      selector: '[role="tab"], .MuiTab-root',
      count: tabs.length
    };

    // Extract buttons
    const buttons = await page.locator('button').evaluateAll((btns) => 
      btns.map(btn => ({
        text: btn.textContent?.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        className: btn.className,
        type: btn.getAttribute('type')
      }))
    );
    selectors.elements.buttons = buttons.filter(b => b.text || b.ariaLabel);

    // Extract table structure
    const tableExists = await page.locator('table').count() > 0;
    if (tableExists) {
      console.log('✓ Standard <table> element found');
      selectors.elements.table = {
        type: 'standard',
        selector: 'table',
        headers: await page.locator('table th').allTextContents(),
        rowCount: await page.locator('table tbody tr').count()
      };
    } else {
      console.log('✗ No standard <table> element, checking for MUI Table...');
      
      // Check for MUI Table
      const muiTableHeaders = await page.locator('[role="columnheader"], .MuiTableCell-head').allTextContents().catch(() => []);
      if (muiTableHeaders.length > 0) {
        console.log('✓ MUI Table found');
        selectors.elements.table = {
          type: 'mui',
          selector: '[role="table"], .MuiTable-root',
          headerSelector: '[role="columnheader"], .MuiTableCell-head',
          headers: muiTableHeaders,
          rowSelector: '[role="row"]:not(:first-child), .MuiTableRow-root:not(:first-child)',
          rowCount: await page.locator('[role="row"]').count() - 1
        };
      } else {
        console.log('✗ No MUI Table found, checking for grid...');
        
        // Check for data grid
        const gridHeaders = await page.locator('[role="gridcell"], .MuiDataGrid-columnHeader').allTextContents().catch(() => []);
        if (gridHeaders.length > 0) {
          console.log('✓ Data Grid found');
          selectors.elements.table = {
            type: 'grid',
            selector: '[role="grid"], .MuiDataGrid-root',
            headerSelector: '[role="gridcell"], .MuiDataGrid-columnHeader',
            headers: gridHeaders
          };
        }
      }
    }

    // Extract action buttons in rows
    const editButtons = await page.locator('button:has(svg[data-testid*="Edit"]), button[aria-label*="edit" i]').count();
    const deleteButtons = await page.locator('button:has(svg[data-testid*="Delete"]), button[aria-label*="delete" i]').count();
    
    selectors.elements.rowActions = {
      editButtons: {
        count: editButtons,
        selector: 'button:has(svg[data-testid*="Edit"]), button[aria-label*="edit" i]'
      },
      deleteButtons: {
        count: deleteButtons,
        selector: 'button:has(svg[data-testid*="Delete"]), button[aria-label*="delete" i]'
      }
    };

    // Extract all visible text for reference
    const allText = await page.locator('body').textContent();
    selectors.pageContent = allText?.substring(0, 1000);

    // Save to file
    const output = JSON.stringify(selectors, null, 2);
    fs.writeFileSync('playwright-tests/selectors-output.json', output);
    
    console.log('\n=== RESULTS ===');
    console.log(output);
    console.log('\n✓ Selectors saved to: playwright-tests/selectors-output.json');

    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/homepage-carousel-full.png', fullPage: true });
    console.log('✓ Screenshot saved to: playwright-tests/screenshots/homepage-carousel-full.png');

    console.log('\n=== WAITING 5 SECONDS FOR INSPECTION ===');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

extractAllSelectors();
