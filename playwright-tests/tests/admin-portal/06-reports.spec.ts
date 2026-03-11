import { test, expect } from '@playwright/test';

// Public Web credentials for Reports
const PUBLIC_WEB_URL = 'https://corpvoucher.fam-stg.click';
const PUBLIC_WEB_CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

test.describe('Public Web - Reports', () => {
  test.beforeEach(async ({ page }) => {
    // Login to Public Web
    await page.goto(`${PUBLIC_WEB_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for loading animation
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // Already logged in, navigate to reports
      await page.goto(`${PUBLIC_WEB_URL}/report`);
    } else {
      // Need to login
      await page.fill('input[type="email"]', PUBLIC_WEB_CREDENTIALS.email);
      await page.fill('input[type="password"]', PUBLIC_WEB_CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Navigate to Reports page
      await page.click('a[href="/report"]');
      await page.waitForLoadState('networkidle');
    }
  });

  // Sales Report Tests
  test('TC_REPORT001: [Sales Report] Download sales report without filling in start date and end date - Negative', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, click Download Report button
    await page.locator('button:has-text("Download Report")').first().click();
    
    // Expected Result: Start date is required
    await expect(page.locator('p:has-text("Start date is required")')).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });

  test('TC_REPORT002: [Sales Report] Download sales report for a specific date range - Positive', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, choose start date and end date (make sure both dates are different)
    
    // Click Start date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date (e.g., 1st of current month)
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // Click End date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a later date (e.g., 5th of current month)
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Sales report csv file within the date range chosen is downloaded into user's device successfully
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT003: [Sales Report] Download sales report for a specific date/day - Positive', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, choose start date and end date (make sure both dates are the same)
    
    // Click Start date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // Click End date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select the same date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Sales report csv file for a particular day/date is downloaded into user's device successfully
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT004: [Sales Report] Download sales report by filling in start date only - Positive', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, choose start date only
    
    // Click Start date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Sales report csv file starting from the start date chosen is downloaded into user's device successfully. 
    // By default, the end date is current date. (Start date to current date report)
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT005: [Sales Report] Download sales report by filling in end date only - Negative', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, choose end date only
    
    // Click End date button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    
    // Expected Result: 
    // 1. Report couldn't be generated "Failed to initiate report download"
    // 2. User prompted to fill in start date "Start date is required"
    await expect(page.locator('p:has-text("Start date is required")')).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });

  test('TC_REPORT006: [Sales Report] Download sales report with end date earlier than start date - Negative', async ({ page }) => {
    // Module: Sales Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Sales Report, choose end date
    
    // Click End date button first
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select an early date (e.g., 1st)
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Then, choose start date (choose date later than end date chosen before)
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a later date (e.g., 5th)
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 4. Click Download Report button
    await page.locator('h3:has-text("Sales Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    
    // Expected Result:
    // 1. Report couldn't be generated "Failed to initiate report download"
    // 2. Under end date box, "End date must be after start date" is displayed
    await expect(page.locator('p:has-text("End date must be after start date")')).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });

  // Remind Me Report Tests
  test('TC_REPORT007: [Remind Me Report] Download remind me report without filling in start date and end date - Negative', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, click Download Report button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    
    // Expected Result: Start date is required
    await expect(page.locator('p:has-text("Start date is required")').last()).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });

  test('TC_REPORT008: [Remind Me Report] Download remind me report for a specific date range - Positive', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, choose start date and end date (make sure both dates are different)
    
    // Click Start date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // Click End date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a later date
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Remind me report csv file within the date range chosen is downloaded into user's device successfully
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT009: [Remind Me Report] Download remind me report for a specific date/day - Positive', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, choose start date and end date (make sure both dates are the same)
    
    // Click Start date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // Click End date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select the same date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Remind me report csv file for a particular day/date is downloaded into user's device successfully
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT010: [Remind Me Report] Download remind me report by filling in start date only - Positive', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, choose start date only
    
    // Click Start date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    const download = await downloadPromise;
    
    // Expected Result: Remind me report csv file starting from the start date chosen is downloaded into user's device successfully. 
    // By default, the end date is current date. (Start date to current date report)
    expect(download.suggestedFilename()).toContain('.csv');
    expect(download).toBeTruthy();
  });

  test('TC_REPORT011: [Remind Me Report] Download remind me report by filling in end date only - Negative', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, choose end date only
    
    // Click End date button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a date
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 3. Click Download Report button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    
    // Expected Result:
    // 1. Report couldn't be generated "Failed to initiate report download"
    // 2. User prompted to fill in start date "Start date is required"
    await expect(page.locator('p:has-text("Start date is required")').last()).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });

  test('TC_REPORT012: [Remind Me Report] Download remind me report with end date earlier than start date - Negative', async ({ page }) => {
    // Module: Remind Me Report
    // Test Steps:
    // 1. Navigate to Report page (done in beforeEach)
    // 2. Under Remind Me Report, choose end date
    
    // Click End date button first
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("End date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select an early date
    await page.locator('dialog gridcell').first().click();
    await page.waitForTimeout(500);
    
    // 3. Then, choose start date (choose date later than end date chosen before)
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Start date")').first().click();
    await page.waitForSelector('dialog');
    
    // Select a later date
    await page.locator('dialog gridcell').nth(4).click();
    await page.waitForTimeout(500);
    
    // 4. Click Download Report button
    await page.locator('h3:has-text("Remind Me Report Date Range")').locator('..').locator('button:has-text("Download Report")').click();
    
    // Expected Result:
    // 1. Report couldn't be generated "Failed to initiate report download"
    // 2. Under end date box, "End date must be after start date" is displayed
    await expect(page.locator('p:has-text("End date must be after start date")').last()).toBeVisible();
    await expect(page.locator('status:has-text("Failed to initiate report download")')).toBeVisible();
  });
});
