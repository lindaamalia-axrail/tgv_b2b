import { chromium } from '@playwright/test';

async function exploreReportsPublicWeb() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== EXPLORING PUBLIC WEB REPORTS ===\n');

    // Login
    console.log('1. Logging in...');
    await page.goto('https://corpvoucher.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"], input[name="email"]', 'lindaamalia+1@axrail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Rahasia123@');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Login successful!\n');

    // Navigate to Reports page
    console.log('2. Looking for Reports navigation...');
    await page.screenshot({ path: 'playwright-tests/screenshots/reports-home.png', fullPage: true });
    
    // Try to find reports link/menu
    const possibleReportsSelectors = [
      'a:has-text("Reports")',
      'a:has-text("Report")',
      '[href*="report"]',
      'button:has-text("Reports")',
      'button:has-text("Report")',
      '.nav-item:has-text("Report")',
      '.menu-item:has-text("Report")'
    ];

    let reportsFound = false;
    for (const selector of possibleReportsSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`Found Reports link with selector: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        reportsFound = true;
        break;
      }
    }

    if (!reportsFound) {
      console.log('Reports link not found in navigation. Checking current URL...');
      console.log('Current URL:', page.url());
      
      // Try direct navigation
      const baseUrl = 'https://corpvoucher.fam-stg.click';
      const reportUrls = [
        `${baseUrl}/reports`,
        `${baseUrl}/report`,
        `${baseUrl}/my-reports`,
        `${baseUrl}/sales-report`
      ];

      for (const url of reportUrls) {
        console.log(`Trying to navigate to: ${url}`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        if (!page.url().includes('login') && !page.url().includes('404')) {
          console.log(`Successfully navigated to: ${page.url()}`);
          reportsFound = true;
          break;
        }
      }
    }

    if (!reportsFound) {
      console.log('\n=== EXPLORING AVAILABLE NAVIGATION ===');
      const navLinks = await page.locator('a, button').all();
      console.log(`Found ${navLinks.length} navigation elements`);
      
      for (let i = 0; i < Math.min(navLinks.length, 30); i++) {
        const text = await navLinks[i].textContent();
        const href = await navLinks[i].getAttribute('href');
        if (text?.trim()) {
          console.log(`${i + 1}. Text: "${text.trim()}" | Href: ${href || 'N/A'}`);
        }
      }
    }

    await page.screenshot({ path: 'playwright-tests/screenshots/reports-page.png', fullPage: true });

    console.log('\n=== EXPLORING REPORTS PAGE STRUCTURE ===');
    
    // Look for Sales Report section
    console.log('\n3. Looking for Sales Report section...');
    const salesReportSelectors = [
      'text=Sales Report',
      'h1:has-text("Sales Report")',
      'h2:has-text("Sales Report")',
      'h3:has-text("Sales Report")',
      '.report-section:has-text("Sales Report")',
      '[data-testid*="sales"]'
    ];

    for (const selector of salesReportSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found Sales Report with selector: ${selector} (${count} matches)`);
      }
    }

    // Look for date inputs
    console.log('\n4. Looking for date input fields...');
    const dateInputs = await page.locator('input[type="date"], input[type="text"][placeholder*="date" i], input[name*="date" i]').all();
    console.log(`Found ${dateInputs.length} date input fields`);
    
    for (let i = 0; i < dateInputs.length; i++) {
      const name = await dateInputs[i].getAttribute('name');
      const id = await dateInputs[i].getAttribute('id');
      const placeholder = await dateInputs[i].getAttribute('placeholder');
      const type = await dateInputs[i].getAttribute('type');
      console.log(`  Date Input ${i + 1}:`);
      console.log(`    - Name: ${name}`);
      console.log(`    - ID: ${id}`);
      console.log(`    - Type: ${type}`);
      console.log(`    - Placeholder: ${placeholder}`);
    }

    // Look for Download Report buttons
    console.log('\n5. Looking for Download Report buttons...');
    const downloadButtons = await page.locator('button:has-text("Download"), button:has-text("download" i)').all();
    console.log(`Found ${downloadButtons.length} download buttons`);
    
    for (let i = 0; i < downloadButtons.length; i++) {
      const text = await downloadButtons[i].textContent();
      const className = await downloadButtons[i].getAttribute('class');
      const id = await downloadButtons[i].getAttribute('id');
      console.log(`  Button ${i + 1}:`);
      console.log(`    - Text: ${text?.trim()}`);
      console.log(`    - Class: ${className}`);
      console.log(`    - ID: ${id}`);
    }

    // Look for Remind Me Report section
    console.log('\n6. Looking for Remind Me Report section...');
    const remindMeSelectors = [
      'text=Remind Me Report',
      'text=Remind Me',
      'h2:has-text("Remind Me")',
      'h3:has-text("Remind Me")',
      '.report-section:has-text("Remind Me")'
    ];

    for (const selector of remindMeSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ Found Remind Me Report with selector: ${selector} (${count} matches)`);
      }
    }

    // Get page HTML structure
    console.log('\n7. Analyzing page structure...');
    const pageContent = await page.content();
    const hasForm = pageContent.includes('<form');
    const hasTable = pageContent.includes('<table');
    console.log(`Page has forms: ${hasForm}`);
    console.log(`Page has tables: ${hasTable}`);

    // Look for all sections/cards
    console.log('\n8. Looking for report sections/cards...');
    const sections = await page.locator('section, .card, .report-card, [class*="report"]').all();
    console.log(`Found ${sections.length} potential report sections`);
    
    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      const text = await sections[i].textContent();
      const className = await sections[i].getAttribute('class');
      console.log(`  Section ${i + 1}:`);
      console.log(`    - Class: ${className}`);
      console.log(`    - Text preview: ${text?.trim().substring(0, 100)}...`);
    }

    // Test filling date fields
    console.log('\n9. Testing date field interaction...');
    if (dateInputs.length >= 2) {
      try {
        console.log('Attempting to fill start date...');
        await dateInputs[0].fill('2024-01-01');
        console.log('✓ Start date filled successfully');
        
        console.log('Attempting to fill end date...');
        await dateInputs[1].fill('2024-12-31');
        console.log('✓ End date filled successfully');
        
        await page.screenshot({ path: 'playwright-tests/screenshots/reports-dates-filled.png', fullPage: true });
      } catch (error) {
        console.log('Error filling dates:', error);
      }
    }

    // Look for validation messages
    console.log('\n10. Looking for validation message elements...');
    const validationSelectors = [
      '.error',
      '.error-message',
      '.validation-error',
      '[class*="error"]',
      '.text-red',
      '.text-danger',
      '[role="alert"]'
    ];

    for (const selector of validationSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Found validation elements with selector: ${selector} (${count} matches)`);
      }
    }

    console.log('\n=== EXPLORATION COMPLETE ===');
    console.log('Screenshots saved to playwright-tests/screenshots/');
    
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error during exploration:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/reports-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

exploreReportsPublicWeb();
