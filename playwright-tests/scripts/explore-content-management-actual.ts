import { chromium } from '@playwright/test';
import * as fs from 'fs';

const ADMIN_URL = 'https://corpvoucher.fam-stg.click/login';
const ADMIN_EMAIL = 'lindaamalia+1@axrail.com';
const ADMIN_PASSWORD = 'Rahasia123@';

interface SelectorInfo {
  section: string;
  testCase: string;
  element: string;
  selector: string;
  alternatives?: string[];
  notes?: string;
}

const selectors: SelectorInfo[] = [];

function addSelector(section: string, testCase: string, element: string, selector: string, alternatives?: string[], notes?: string) {
  selectors.push({ section, testCase, element, selector, alternatives, notes });
  console.log(`✓ Found ${element}: ${selector}`);
}

async function main() {
  console.log('Starting Content Management exploration...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // ============================================
    // LOGIN
    // ============================================
    console.log('\n=== LOGGING IN ===');
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find and fill email
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(ADMIN_EMAIL);
    console.log('✓ Email filled');

    // Find and fill password
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(ADMIN_PASSWORD);
    console.log('✓ Password filled');

    // Find and click login button
    const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();
    console.log('✓ Login button clicked');

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✓ Login successful');

    // ============================================
    // NAVIGATE TO CONTENT MANAGEMENT
    // ============================================
    console.log('\n=== NAVIGATING TO CONTENT MANAGEMENT ===');
    
    // Click hamburger menu
    const hamburgerMenu = await page.locator('.MuiIconButton-root:has(svg), button[aria-label*="menu" i]').first();
    await hamburgerMenu.click();
    console.log('✓ Hamburger menu clicked');
    await page.waitForTimeout(1500);

    // Wait for sidebar
    await page.waitForSelector('text=Content Management', { state: 'visible', timeout: 10000 });
    
    // Click Content Management
    const contentMgmtLink = await page.locator('text=Content Management, a:has-text("Content Management"), button:has-text("Content Management")').first();
    await contentMgmtLink.click();
    console.log('✓ Content Management clicked');
    await page.waitForTimeout(1000);

    // ============================================
    // HOMEPAGE CAROUSEL SECTION
    // ============================================
    console.log('\n=== EXPLORING HOMEPAGE CAROUSEL ===');
    
    // Click Homepage
    const homepageLink = await page.locator('text=Homepage, a:has-text("Homepage"), button:has-text("Homepage")').first();
    await homepageLink.click();
    console.log('✓ Homepage clicked');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/cms-homepage-carousel.png', fullPage: true });

    // Check for table
    const table = await page.locator('table, [role="table"], .MuiTable-root').first();
    if (await table.isVisible()) {
      const tableSelector = await table.evaluate(el => {
        if (el.getAttribute('role') === 'table') return '[role="table"]';
        if (el.classList.contains('MuiTable-root')) return '.MuiTable-root';
        return 'table';
      });
      addSelector('Homepage Carousel', 'TC_CMS001', 'Table', tableSelector);
    }

    // Check for column headers
    const headers = ['HomePage Carousel Title', 'Start Date', 'End Date', 'Status'];
    for (const header of headers) {
      const headerEl = await page.locator(`th:has-text("${header}"), [role="columnheader"]:has-text("${header}")`).first();
      if (await headerEl.isVisible().catch(() => false)) {
        const headerSelector = await headerEl.evaluate((el, h) => {
          if (el.getAttribute('role') === 'columnheader') return `[role="columnheader"]:has-text("${h}")`;
          return `th:has-text("${h}")`;
        }, header);
        addSelector('Homepage Carousel', 'TC_CMS001', `Header: ${header}`, headerSelector);
      }
    }

    // Check for Add button
    const addButton = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
    if (await addButton.isVisible().catch(() => false)) {
      const addBtnText = await addButton.textContent();
      addSelector('Homepage Carousel', 'TC_CMS002', 'Add Button', `button:has-text("${addBtnText?.trim()}")`);
    }

    // Check for Edit buttons
    const editButton = await page.locator('button[aria-label="Edit"], button:has-text("Edit"), svg[data-testid="EditIcon"]').first();
    if (await editButton.isVisible().catch(() => false)) {
      const editSelector = await editButton.evaluate(el => {
        if (el.getAttribute('aria-label') === 'Edit') return 'button[aria-label="Edit"]';
        if (el.tagName === 'svg') return 'svg[data-testid="EditIcon"]';
        return 'button:has-text("Edit")';
      });
      addSelector('Homepage Carousel', 'TC_CMS006', 'Edit Button', editSelector);
    }

    // Check for Delete buttons
    const deleteButton = await page.locator('button[aria-label="Delete"], button:has-text("Delete"), svg[data-testid="DeleteIcon"]').first();
    if (await deleteButton.isVisible().catch(() => false)) {
      const deleteSelector = await deleteButton.evaluate(el => {
        if (el.getAttribute('aria-label') === 'Delete') return 'button[aria-label="Delete"]';
        if (el.tagName === 'svg') return 'svg[data-testid="DeleteIcon"]';
        return 'button:has-text("Delete")';
      });
      addSelector('Homepage Carousel', 'TC_CMS013', 'Delete Button', deleteSelector);
    }

    // Click Add to see form fields
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-homepage-add-form.png', fullPage: true });

      // Check form fields
      const nameInput = await page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        const nameSelector = await nameInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          if (el.getAttribute('id')) return `input[id="${el.getAttribute('id')}"]`;
          return 'input[placeholder*="name" i]';
        });
        addSelector('Homepage Carousel', 'TC_CMS002', 'Name Input', nameSelector);
      }

      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false) || await page.locator('input[type="file"]').count() > 0) {
        addSelector('Homepage Carousel', 'TC_CMS002', 'File Input', 'input[type="file"]');
      }

      const urlInput = await page.locator('input[name="url"], input[placeholder*="url" i], input[id*="url" i]').first();
      if (await urlInput.isVisible().catch(() => false)) {
        const urlSelector = await urlInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          return 'input[placeholder*="url" i]';
        });
        addSelector('Homepage Carousel', 'TC_CMS009', 'URL Input', urlSelector);
      }

      const startDateInput = await page.locator('input[name="startDate"], input[type="date"]:first, input[placeholder*="start" i]').first();
      if (await startDateInput.isVisible().catch(() => false)) {
        const startDateSelector = await startDateInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          return 'input[type="date"]';
        });
        addSelector('Homepage Carousel', 'TC_CMS010', 'Start Date Input', startDateSelector);
      }

      const endDateInput = await page.locator('input[name="endDate"], input[type="date"]:last, input[placeholder*="end" i]').first();
      if (await endDateInput.isVisible().catch(() => false)) {
        const endDateSelector = await endDateInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          return 'input[type="date"]';
        });
        addSelector('Homepage Carousel', 'TC_CMS010', 'End Date Input', endDateSelector);
      }

      const activeCheckbox = await page.locator('input[type="checkbox"][name="active"], input[type="checkbox"][id*="active" i]').first();
      if (await activeCheckbox.isVisible().catch(() => false)) {
        const activeSelector = await activeCheckbox.evaluate(el => {
          if (el.getAttribute('name')) return `input[type="checkbox"][name="${el.getAttribute('name')}"]`;
          return 'input[type="checkbox"]';
        });
        addSelector('Homepage Carousel', 'TC_CMS007', 'Active Checkbox', activeSelector);
      }

      const saveButton = await page.locator('button:has-text("Save"), button[type="submit"]').first();
      if (await saveButton.isVisible().catch(() => false)) {
        addSelector('Homepage Carousel', 'TC_CMS002', 'Save Button', 'button:has-text("Save")');
      }

      // Go back
      const cancelButton = await page.locator('button:has-text("Cancel"), button:has-text("Back")').first();
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }

    // ============================================
    // CATEGORY SECTION
    // ============================================
    console.log('\n=== EXPLORING CATEGORY ===');
    
    // Navigate back to Content Management
    await hamburgerMenu.click();
    await page.waitForTimeout(1000);
    await contentMgmtLink.click();
    await page.waitForTimeout(500);

    // Click Category
    const categoryLink = await page.locator('text=Category, a:has-text("Category"), button:has-text("Category")').first();
    await categoryLink.click();
    console.log('✓ Category clicked');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'playwright-tests/screenshots/cms-category.png', fullPage: true });

    // Check for table
    const categoryTable = await page.locator('table, [role="table"], .MuiTable-root').first();
    if (await categoryTable.isVisible()) {
      addSelector('Category', 'TC_CMS014', 'Table', 'table');
    }

    // Check for column headers
    const categoryHeaders = ['Title', 'Start Date', 'End Date', 'Status'];
    for (const header of categoryHeaders) {
      const headerEl = await page.locator(`th:has-text("${header}")`).first();
      if (await headerEl.isVisible().catch(() => false)) {
        addSelector('Category', 'TC_CMS014', `Header: ${header}`, `th:has-text("${header}")`);
      }
    }

    // Check for Add Category button
    const addCategoryButton = await page.locator('button:has-text("Add Category"), button:has-text("Add"), button:has-text("Create")').first();
    if (await addCategoryButton.isVisible().catch(() => false)) {
      const addCatBtnText = await addCategoryButton.textContent();
      addSelector('Category', 'TC_CMS015', 'Add Category Button', `button:has-text("${addCatBtnText?.trim()}")`);
      
      // Click to see form
      await addCategoryButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-category-add-form.png', fullPage: true });

      // Check form fields
      const titleInput = await page.locator('input[name="title"], input[placeholder*="title" i]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        const titleSelector = await titleInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          return 'input[placeholder*="title" i]';
        });
        addSelector('Category', 'TC_CMS015', 'Title Input', titleSelector);
      }

      const descriptionInput = await page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
      if (await descriptionInput.isVisible().catch(() => false)) {
        const descSelector = await descriptionInput.evaluate(el => {
          if (el.getAttribute('name')) return `textarea[name="${el.getAttribute('name')}"]`;
          return 'textarea[placeholder*="description" i]';
        });
        addSelector('Category', 'TC_CMS015', 'Description Textarea', descSelector);
      }

      // Go back
      const cancelBtn = await page.locator('button:has-text("Cancel"), button:has-text("Back")').first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
      } else {
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }

    // ============================================
    // HIGHLIGHTS SECTION
    // ============================================
    console.log('\n=== EXPLORING HIGHLIGHTS ===');
    
    // Navigate back to Homepage
    await hamburgerMenu.click();
    await page.waitForTimeout(1000);
    await contentMgmtLink.click();
    await page.waitForTimeout(500);
    await homepageLink.click();
    await page.waitForTimeout(1000);

    // Click Highlights tab
    const highlightsTab = await page.locator('text=Highlights, button:has-text("Highlights"), [role="tab"]:has-text("Highlights")').first();
    if (await highlightsTab.isVisible().catch(() => false)) {
      await highlightsTab.click();
      console.log('✓ Highlights tab clicked');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-highlights.png', fullPage: true });

      addSelector('Highlights', 'TC_CMS023', 'Highlights Tab', 'text=Highlights');

      // Check for table headers
      const highlightHeaders = ['Name', 'Position', 'Start Date', 'End Date', 'Status'];
      for (const header of highlightHeaders) {
        const headerEl = await page.locator(`th:has-text("${header}")`).first();
        if (await headerEl.isVisible().catch(() => false)) {
          addSelector('Highlights', 'TC_CMS023', `Header: ${header}`, `th:has-text("${header}")`);
        }
      }

      // Check for Add button
      const addHighlightButton = await page.locator('button:has-text("Add")').first();
      if (await addHighlightButton.isVisible().catch(() => false)) {
        await addHighlightButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright-tests/screenshots/cms-highlights-add-form.png', fullPage: true });

        // Check for position select
        const positionSelect = await page.locator('select[name="position"], [role="combobox"]').first();
        if (await positionSelect.isVisible().catch(() => false)) {
          const posSelector = await positionSelect.evaluate(el => {
            if (el.getAttribute('name')) return `select[name="${el.getAttribute('name')}"]`;
            return 'select';
          });
          addSelector('Highlights', 'TC_CMS028', 'Position Select', posSelector);
        }

        // Go back
        const cancelHighlight = await page.locator('button:has-text("Cancel"), button:has-text("Back")').first();
        if (await cancelHighlight.isVisible().catch(() => false)) {
          await cancelHighlight.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // ============================================
    // POPULAR SEARCH SECTION
    // ============================================
    console.log('\n=== EXPLORING POPULAR SEARCH ===');
    
    // Navigate back to Content Management
    await hamburgerMenu.click();
    await page.waitForTimeout(1000);
    await contentMgmtLink.click();
    await page.waitForTimeout(500);

    // Click Popular Search
    const popularSearchLink = await page.locator('text=Popular Search, a:has-text("Popular Search"), button:has-text("Popular Search")').first();
    await popularSearchLink.click();
    console.log('✓ Popular Search clicked');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'playwright-tests/screenshots/cms-popular-search.png', fullPage: true });

    // Check for table headers
    const popularSearchHeaders = ['Keyword', 'Status', 'Sequence'];
    for (const header of popularSearchHeaders) {
      const headerEl = await page.locator(`th:has-text("${header}")`).first();
      if (await headerEl.isVisible().catch(() => false)) {
        addSelector('Popular Search', 'TC_CMS037', `Header: ${header}`, `th:has-text("${header}")`);
      }
    }

    // Check for Add button
    const addPopularButton = await page.locator('button:has-text("Add")').first();
    if (await addPopularButton.isVisible().catch(() => false)) {
      await addPopularButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright-tests/screenshots/cms-popular-search-add-form.png', fullPage: true });

      // Check for keyword input
      const keywordInput = await page.locator('input[name="keyword"], input[placeholder*="keyword" i]').first();
      if (await keywordInput.isVisible().catch(() => false)) {
        const keywordSelector = await keywordInput.evaluate(el => {
          if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`;
          return 'input[placeholder*="keyword" i]';
        });
        addSelector('Popular Search', 'TC_CMS038', 'Keyword Input', keywordSelector);
      }

      // Go back
      const cancelPopular = await page.locator('button:has-text("Cancel"), button:has-text("Back")').first();
      if (await cancelPopular.isVisible().catch(() => false)) {
        await cancelPopular.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check for Manage Display Sequence button
    const manageSeqButton = await page.locator('button:has-text("Manage Display Sequence"), button:has-text("Manage Sequence")').first();
    if (await manageSeqButton.i