import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const REPORT_URL = `${BASE_URL}/report`;

test.describe('Admin Portal - Reports', () => {
  let authenticatedPage: Page;

  // Helper to wait for the app loading screen to disappear
  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  // Login ONCE before all tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();

    await authenticatedPage.goto(`${BASE_URL}/admin/login`);
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    let currentUrl = authenticatedPage.url();

    if (currentUrl.includes('login')) {
      console.log('Performing regular login...');
      const emailInput = authenticatedPage.getByRole('textbox', { name: /robot@gmail.com/i });
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(ADMIN_PORTAL.CREDENTIALS.email);
      await authenticatedPage.locator('#password').fill(ADMIN_PORTAL.CREDENTIALS.password);
      await authenticatedPage.getByRole('button', { name: /sign in/i }).click();

      await authenticatedPage.waitForFunction(
        () => !window.location.href.includes('/login'),
        { timeout: 30000 }
      );

      await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
      await authenticatedPage.waitForLoadState('networkidle');
      await authenticatedPage.waitForTimeout(2000);

      currentUrl = authenticatedPage.url();
      console.log('After login, current URL:', currentUrl);

      if (currentUrl.includes('login')) {
        throw new Error('Login failed - still on login page');
      }
    }

    console.log('✓ Authentication completed once for all tests');
  });

  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  // Helper: navigate to Report page (fresh state, no dates selected)
  async function navigateToReport() {
    await authenticatedPage.goto(REPORT_URL);
    await waitForAppReady();
    await authenticatedPage.getByRole('heading', { name: 'Report', level: 5 }).waitFor({ state: 'visible', timeout: 15000 });
  }

  // Helper: select a date from the calendar picker dialog
  // Opens the date picker by clicking the button, navigates to previous month, and selects a day
  async function selectDateFromPicker(dateButton: ReturnType<Page['getByRole']>, dayNumber: string) {
    await dateButton.click();
    const dialog = authenticatedPage.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    // Navigate to previous month to ensure dates are selectable (not disabled)
    await authenticatedPage.getByRole('button', { name: 'Go to previous month' }).click();
    await authenticatedPage.waitForTimeout(300);
    // Click the day within the dialog to avoid ambiguity
    await dialog.getByRole('gridcell', { name: dayNumber, exact: true }).click();
    await authenticatedPage.waitForTimeout(300);
    // Close the date picker dialog by pressing Escape
    await authenticatedPage.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await authenticatedPage.waitForTimeout(300);
  }

  // =====================================================
  // SALES REPORT TESTS
  // =====================================================

  test('TC_REPORT001: [Sales Report] Download sales report without filling in start date and end date (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, click Download Report button
    // Expected: "Start date is required" error and "Failed to initiate report download" toast
    await navigateToReport();
    // Click the first Download Report button (Sales Report section)
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    await authenticatedPage.waitForTimeout(1000);
    // Verify error message
    await expect(authenticatedPage.locator('text=Start date is required').first()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

  test('TC_REPORT002: [Sales Report] Download sales report for a specific date range (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, choose start date and end date (different dates)  3. Click Download Report
    // Expected: Sales report csv file within the date range is downloaded successfully
    await navigateToReport();
    // Select start date (1st of previous month)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).first();
    await selectDateFromPicker(startBtn, '1');
    // Select end date (5th of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).first();
    await selectDateFromPicker(endBtn, '5');
    // Click Download Report
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT003: [Sales Report] Download sales report for a specific date/day (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, choose start date and end date (same date)  3. Click Download Report
    // Expected: Sales report csv file for a particular day/date is downloaded successfully
    await navigateToReport();
    // Select start date (1st of previous month)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).first();
    await selectDateFromPicker(startBtn, '1');
    // Select end date (same: 1st of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).first();
    await selectDateFromPicker(endBtn, '1');
    // Click Download Report
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT004: [Sales Report] Download sales report by filling in start date only (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, choose start date only  3. Click Download Report
    // Expected: Sales report csv file from start date to current date is downloaded successfully
    await navigateToReport();
    // Select start date only (1st of previous month)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).first();
    await selectDateFromPicker(startBtn, '1');
    // Click Download Report (end date defaults to current date)
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT005: [Sales Report] Download sales report by filling in end date only (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, choose end date only  3. Click Download Report
    // Expected: "Start date is required" and "Failed to initiate report download"
    await navigateToReport();
    // Select end date only (5th of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).first();
    await selectDateFromPicker(endBtn, '5');
    // Click Download Report
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=Start date is required').first()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

  test('TC_REPORT006: [Sales Report] Download sales report with end date earlier than start date (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Sales Report, choose end date  3. Choose start date later than end date  4. Click Download Report
    // Expected: "End date must be after start date" and "Failed to initiate report download"
    await navigateToReport();
    // Select end date first (1st of previous month - earlier date)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).first();
    await selectDateFromPicker(endBtn, '1');
    // Select start date (5th of previous month - later date)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).first();
    await selectDateFromPicker(startBtn, '5');
    // Click Download Report
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).first().click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=End date must be after start date').first()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

  // =====================================================
  // REMIND ME REPORT TESTS
  // =====================================================

  test('TC_REPORT007: [Remind Me Report] Download remind me report without filling in start date and end date (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, click Download Report button
    // Expected: "Start date is required"
    await navigateToReport();
    // Click the second Download Report button (Remind Me Report section)
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    await authenticatedPage.waitForTimeout(1000);
    // Verify error message
    await expect(authenticatedPage.locator('text=Start date is required').last()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

  test('TC_REPORT008: [Remind Me Report] Download remind me report for a specific date range (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, choose start date and end date (different dates)  3. Click Download Report
    // Expected: Remind me report csv file within the date range is downloaded successfully
    await navigateToReport();
    // Select start date (1st of previous month) - use .nth(1) for Remind Me section
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).nth(1);
    await selectDateFromPicker(startBtn, '1');
    // Select end date (5th of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).nth(1);
    await selectDateFromPicker(endBtn, '5');
    // Click Download Report
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT009: [Remind Me Report] Download remind me report for a specific date/day (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, choose start date and end date (same date)  3. Click Download Report
    // Expected: Remind me report csv file for a particular day/date is downloaded successfully
    await navigateToReport();
    // Select start date (1st of previous month)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).nth(1);
    await selectDateFromPicker(startBtn, '1');
    // Select end date (same: 1st of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).nth(1);
    await selectDateFromPicker(endBtn, '1');
    // Click Download Report
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT010: [Remind Me Report] Download remind me report by filling in start date only (Positive)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, choose start date only  3. Click Download Report
    // Expected: Remind me report csv file from start date to current date is downloaded successfully
    await navigateToReport();
    // Select start date only (1st of previous month)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).nth(1);
    await selectDateFromPicker(startBtn, '1');
    // Click Download Report (end date defaults to current date)
    const downloadPromise = authenticatedPage.waitForEvent('download', { timeout: 30000 });
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_REPORT011: [Remind Me Report] Download remind me report by filling in end date only (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, choose end date only  3. Click Download Report
    // Expected: "Start date is required" and "Failed to initiate report download"
    await navigateToReport();
    // Select end date only (5th of previous month)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).nth(1);
    await selectDateFromPicker(endBtn, '5');
    // Click Download Report
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=Start date is required').last()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

  test('TC_REPORT012: [Remind Me Report] Download remind me report with end date earlier than start date (Negative)', async () => {
    // Steps: 1. Navigate to Report page  2. Under Remind Me Report, choose end date  3. Choose start date later than end date  4. Click Download Report
    // Expected: "End date must be after start date" and "Failed to initiate report download"
    await navigateToReport();
    // Select end date first (1st of previous month - earlier date)
    const endBtn = authenticatedPage.getByRole('button', { name: 'End date' }).nth(1);
    await selectDateFromPicker(endBtn, '1');
    // Select start date (5th of previous month - later date)
    const startBtn = authenticatedPage.getByRole('button', { name: 'Start date' }).nth(1);
    await selectDateFromPicker(startBtn, '5');
    // Click Download Report
    await authenticatedPage.getByRole('button', { name: 'Download Report' }).nth(1).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=End date must be after start date').last()).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByRole('status').filter({ hasText: 'Failed to initiate report download' })).toBeVisible({ timeout: 5000 });
  });

});
