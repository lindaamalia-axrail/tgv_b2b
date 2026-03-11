import { test, expect } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';
import { AdminLoginPage } from '../../pages/admin-portal/LoginPage';

test.describe('Admin Portal - Corporate Management', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.navigate();
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    await page.waitForLoadState('networkidle');
  });

  test('TC_CORP001: Download all corporate customers details', async ({ page }) => {
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    await page.click('button:has-text("Export List")');
    await page.click('text=Export All');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate customer details for all customers is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP002: Download corporate customers by search result', async ({ page }) => {
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    await page.fill('input[placeholder*="Search"]', 'Test Company');
    await page.press('input[placeholder*="Search"]', 'Enter');
    await page.click('button:has-text("Export List")');
    await page.click('text=Search Result');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate customer details for customers result based on search result is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP003: Download selected corporate customers', async ({ page }) => {
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    await page.locator('input[type="checkbox"]').first().check();
    await page.click('button:has-text("Export List")');
    await page.click('text=Export Selected');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate customer details for customers selected is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP004: Corporate Management page - Search corporate users based on company name', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in company name in company name search filter
    await page.fill('input[placeholder*="Company Name"]', 'Axrail');
    // Step 3: Press enter
    await page.press('input[placeholder*="Company Name"]', 'Enter');
    // Expected Result: Corporate customer that matched the company name searched is displayed
    await expect(page.locator('text=Axrail')).toBeVisible();
  });

  test('TC_CORP005: Corporate Management page - Search corporate users based on email', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in email in email search filter
    await page.fill('input[placeholder*="Email"]', 'test@axrail.com');
    // Step 3: Press enter
    await page.press('input[placeholder*="Email"]', 'Enter');
    // Expected Result: Corporate customer that matched the email searched is displayed
    await expect(page.locator('text=test@axrail.com')).toBeVisible();
  });

  test('TC_CORP006: Corporate Management page - Search corporate users based on phone number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in phone number in phone number search filter
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 3: Press enter
    await page.press('input[placeholder*="Phone Number"]', 'Enter');
    // Expected Result: Corporate customer that matched the phone number searched is displayed
    await expect(page.locator('text=60123456789')).toBeVisible();
  });

  test('TC_CORP007: Corporate Management page - Edit corporate customer\'s corporate information', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's information in the Corporate Information section
    await page.fill('input[name="fullName"]', 'Updated Company Name');
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Corporate customer new information is edited and saved successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP008: Corporate Management page - Delete entered mandatory fields', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    await page.waitForTimeout(1000);
    // Step 4: Delete corporate user's information that is mandatory in the Corporate Information section
    await page.fill('input[name="fullName"]', '');
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Error message will be displayed for any empty mandatory fields (e.g., "Company name is required")
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('TC_CORP009: Corporate Management page - Edit corporate customer\'s email to unused email', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to unused email
    await page.fill('input[name="primaryEmail"]', `newemail${Date.now()}@test.com`);
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Changes saved/updated successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP010: Corporate Management page - Edit corporate customer\'s email to used email only', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to used email
    await page.fill('input[name="primaryEmail"]', 'existing@axrail.com');
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Error message will be displayed "Email ..... already exists for another customer"
    await expect(page.locator('text=already exists')).toBeVisible();
  });

  test('TC_CORP011: Corporate Management page - View corporate user\'s purchase history from a specific date until today', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the Filter Date button
    await page.click('button:has-text("Filter Date")');
    // Step 6: Select start date only
    await page.fill('input[name="startDate"]', '2024-01-01');
    // Step 7: Click Update
    await page.click('button:has-text("Update")');
    // Expected Result: Corporate user's purchase history from the date selected until today is displayed
    await expect(page.locator('.purchase-history')).toBeVisible();
  });

  test('TC_CORP012: Corporate Management page - Search corporate user\'s purchase history by booking number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Type in the booking number in the search bar
    await page.fill('input[placeholder*="Booking"]', 'BK123456');
    // Step 6: Click enter
    await page.press('input[placeholder*="Booking"]', 'Enter');
    // Expected Result: Corporate user's purchase history that satisfies the booking number in the listing
    await expect(page.locator('text=BK123456')).toBeVisible();
  });

  test('TC_CORP013: Corporate Management page - Search corporate user\'s purchase history by Order ID', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Type in the Order ID in the search bar
    await page.fill('input[placeholder*="Order"]', 'TGV123');
    // Step 6: Click enter
    await page.press('input[placeholder*="Order"]', 'Enter');
    // Expected Result: Corporate user's purchase history that satisfies the Order ID is displayed in the listing
    await expect(page.locator('text=TGV123')).toBeVisible();
  });

  test('TC_CORP014: Corporate Management page - Search corporate user\'s inventory by voucher name', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Search by voucher name in the search filter
    await page.fill('input[placeholder*="Search"]', 'Movie Pass');
    // Step 6: Observe the search result
    await page.press('input[placeholder*="Search"]', 'Enter');
    // Expected Result: Corporate user's purchase history that satisfies the voucher name is displayed in the listing
    await expect(page.locator('text=Movie Pass')).toBeVisible();
  });

  test('TC_CORP015: Corporate Management page - Download corporate user\'s all inventory', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Click Download Inventory Report
    await page.click('button:has-text("Download")');
    // Step 6: Select Export All
    await page.click('text=Export All');
    // Step 7: Click Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate user's inventory is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP016: Corporate Management page - Search corporate users based on company name and email', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in company name in company name search filter
    await page.fill('input[placeholder*="Company Name"]', 'Axrail');
    // Step 3: Press enter
    await page.press('input[placeholder*="Company Name"]', 'Enter');
    // Step 4: Type in email in email search filter
    await page.fill('input[placeholder*="Email"]', 'test@axrail.com');
    // Step 5: Press enter
    await page.press('input[placeholder*="Email"]', 'Enter');
    // Expected Result: Corporate customer that matched the company name and email searched is displayed
    await expect(page.locator('text=Axrail')).toBeVisible();
    await expect(page.locator('text=test@axrail.com')).toBeVisible();
  });

  test('TC_CORP017: Corporate Management page - Search corporate users based on company name and phone number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in company name in company name search filter
    await page.fill('input[placeholder*="Company Name"]', 'Axrail');
    // Step 3: Press enter
    await page.press('input[placeholder*="Company Name"]', 'Enter');
    // Step 4: Type in phone number in phone number search filter
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 5: Press enter
    await page.press('input[placeholder*="Phone Number"]', 'Enter');
    // Expected Result: Corporate customer that matched the company name and phone number searched is displayed
    await expect(page.locator('text=Axrail')).toBeVisible();
    await expect(page.locator('text=60123456789')).toBeVisible();
  });

  test('TC_CORP018: Corporate Management page - Search corporate users based on email and phone number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in email in email search filter
    await page.fill('input[placeholder*="Email"]', 'test@axrail.com');
    // Step 3: Press enter
    await page.press('input[placeholder*="Email"]', 'Enter');
    // Step 4: Type in phone number in phone number search filter
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 5: Press enter
    await page.press('input[placeholder*="Phone Number"]', 'Enter');
    // Expected Result: Corporate customer that matched the email and phone number searched is displayed
    await expect(page.locator('text=test@axrail.com')).toBeVisible();
    await expect(page.locator('text=60123456789')).toBeVisible();
  });

  test('TC_CORP019: Corporate Management page - Search corporate users based on company name, email and phone number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Type in company name in company name search filter
    await page.fill('input[placeholder*="Company Name"]', 'Axrail');
    // Step 3: Press enter
    await page.press('input[placeholder*="Company Name"]', 'Enter');
    // Step 4: Type in email in email search filter
    await page.fill('input[placeholder*="Email"]', 'test@axrail.com');
    // Step 5: Press enter
    await page.press('input[placeholder*="Email"]', 'Enter');
    // Step 6: Type in phone number in phone number search filter
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 7: Press enter
    await page.press('input[placeholder*="Phone Number"]', 'Enter');
    // Expected Result: Corporate customer that matched the company name, email and phone number searched is displayed
    await expect(page.locator('text=Axrail')).toBeVisible();
    await expect(page.locator('text=test@axrail.com')).toBeVisible();
    await expect(page.locator('text=60123456789')).toBeVisible();
  });

  test('TC_CORP020: Corporate Management page - Edit corporate customer\'s mobile number to unused mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company mobile number to unused mobile number
    await page.fill('input[name="mobileNo"]', `6012${Date.now().toString().slice(-7)}`);
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Changes saved/updated successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP021: Corporate Management page - Edit corporate customer\'s mobile number to used mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company mobile number to used mobile number
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 5: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Changes saved/updated successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP022: Corporate Management page - Edit email to unused email and mobile number to unused mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to unused email
    await page.fill('input[name="primaryEmail"]', `newemail${Date.now()}@test.com`);
    // Step 5: Edit corporate user's company mobile number to unused mobile number
    await page.fill('input[name="mobileNo"]', `6012${Date.now().toString().slice(-7)}`);
    // Step 6: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Changes saved/updated successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP023: Corporate Management page - Edit email to unused email and mobile number to used mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to unused email
    await page.fill('input[name="primaryEmail"]', `newemail${Date.now()}@test.com`);
    // Step 5: Edit corporate user's company mobile number to used mobile number
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 6: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Changes saved/updated successfully
    await expect(page.locator('text=Success')).toBeVisible();
  });

  test('TC_CORP024: Corporate Management page - Edit email to used email and mobile number to unused mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to used email
    await page.fill('input[name="primaryEmail"]', 'existing@axrail.com');
    // Step 5: Edit corporate user's company mobile number to unused mobile number
    await page.fill('input[name="mobileNo"]', `6012${Date.now().toString().slice(-7)}`);
    // Step 6: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Error message will be displayed "Email ..... already exists for another customer"
    await expect(page.locator('text=already exists')).toBeVisible();
  });

  test('TC_CORP025: Corporate Management page - Edit email to used email and mobile number to used mobile number', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Edit corporate user's company email to used email
    await page.fill('input[name="primaryEmail"]', 'existing@axrail.com');
    // Step 5: Edit corporate user's company mobile number to used mobile number
    await page.fill('input[name="mobileNo"]', '60123456789');
    // Step 6: Click Save Changes button
    await page.click('button:has-text("Save")');
    // Expected Result: Error message will be displayed "Email ..... already exists for another customer"
    await expect(page.locator('text=already exists')).toBeVisible();
  });

  test('TC_CORP026: Corporate Management page - Filter corporate user\'s purchase history by date', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the Filter Date button
    await page.click('button:has-text("Filter Date")');
    // Step 6: Select start date and end date
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    // Step 7: Click Update
    await page.click('button:has-text("Update")');
    // Expected Result: Corporate user's purchase history that satisfies the filter date is displayed in the listing
    await expect(page.locator('.purchase-history')).toBeVisible();
  });

  test('TC_CORP027: Corporate Management page - Clear filter date choices', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the Filter Date button
    await page.click('button:has-text("Filter Date")');
    // Step 6: Select start date and end date
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    // Step 7: Click Update
    await page.click('button:has-text("Update")');
    // Step 8: Click the Filter Date button again
    await page.click('button:has-text("Filter Date")');
    // Step 9: Select Cancel
    await page.click('button:has-text("Cancel")');
    // Expected Result: Observe that the filter date are cleared and listings update to show all purchase history
    await expect(page.locator('.purchase-history')).toBeVisible();
  });

  test('TC_CORP028: Corporate Management page - Search corporate user\'s purchase history by Transaction No.', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Type in the Transaction No in the search bar
    await page.fill('input[placeholder*="Transaction"]', 'TXN123456');
    // Step 6: Click enter
    await page.press('input[placeholder*="Transaction"]', 'Enter');
    // Expected Result: Corporate user's purchase history that satisfies the Transaction No is displayed in the listing
    await expect(page.locator('text=TXN123456')).toBeVisible();
  });

  test('TC_CORP029: Corporate Management page - Download corporate user\'s inventory by search result', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Search by voucher name in the search filter
    await page.fill('input[placeholder*="Search"]', 'Movie Pass');
    await page.press('input[placeholder*="Search"]', 'Enter');
    // Step 6: Click Download Inventory Report
    await page.click('button:has-text("Download")');
    // Step 7: Click Export List button
    // Step 8: Select Search Result
    await page.click('text=Search Result');
    // Step 9: Click Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate user's inventory for result based on search result is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP030: Corporate Management page - Download corporate user\'s selected inventory', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Select vouchers by ticking the checkboxes
    await page.locator('input[type="checkbox"]').first().check();
    // Step 6: Click Export List button
    await page.click('button:has-text("Download")');
    // Step 7: Select Export All
    await page.click('text=Export Selected');
    // Step 8: Click Export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    const download = await downloadPromise;
    // Expected Result: Corporate user's inventory for selected inventory(s) is successfully downloaded into user's device in csv file
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP031: Corporate Management page - Sort Purchase History by Booking No.', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Booking No.
    await page.click('th:has-text("Booking No.")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Booking No. (Arrow up: ascending)
    await expect(page.locator('th:has-text("Booking No.") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Booking No.")');
    // Expected Result: Corporate user's purchase history is sorted based on Booking No. (Arrow down: descending)
    await expect(page.locator('th:has-text("Booking No.") svg')).toBeVisible();
  });

  test('TC_CORP032: Corporate Management page - Sort Purchase History by Order ID', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Order ID
    await page.click('th:has-text("Order ID")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Order ID (Arrow up: ascending)
    await expect(page.locator('th:has-text("Order ID") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Order ID")');
    // Expected Result: Corporate user's purchase history is sorted based on Order ID (Arrow down: descending)
    await expect(page.locator('th:has-text("Order ID") svg')).toBeVisible();
  });

  test('TC_CORP033: Corporate Management page - Sort Purchase History by Transaction No.', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Transaction No.
    await page.click('th:has-text("Transaction No.")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Transaction No. (Arrow up: ascending)
    await expect(page.locator('th:has-text("Transaction No.") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Transaction No.")');
    // Expected Result: Corporate user's purchase history is sorted based on Transaction No. (Arrow down: descending)
    await expect(page.locator('th:has-text("Transaction No.") svg')).toBeVisible();
  });

  test('TC_CORP034: Corporate Management page - Sort Purchase History by Total Item', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Total Item
    await page.click('th:has-text("Total Item")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Total Item (Arrow up: ascending)
    await expect(page.locator('th:has-text("Total Item") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Total Item")');
    // Expected Result: Corporate user's purchase history is sorted based on Total Item (Arrow down: descending)
    await expect(page.locator('th:has-text("Total Item") svg')).toBeVisible();
  });

  test('TC_CORP035: Corporate Management page - Sort Purchase History by Amount', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Amount
    await page.click('th:has-text("Amount")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Amount (Arrow up: ascending)
    await expect(page.locator('th:has-text("Amount") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Amount")');
    // Expected Result: Corporate user's purchase history is sorted based on Amount (Arrow down: descending)
    await expect(page.locator('th:has-text("Amount") svg')).toBeVisible();
  });

  test('TC_CORP036: Corporate Management page - Sort Purchase History by Purchase Date', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Purchase Date
    await page.click('th:has-text("Purchase Date")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Purchase Date (Arrow up: ascending)
    await expect(page.locator('th:has-text("Purchase Date") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Purchase Date")');
    // Expected Result: Corporate user's purchase history is sorted based on Purchase Date (Arrow down: descending)
    await expect(page.locator('th:has-text("Purchase Date") svg')).toBeVisible();
  });

  test('TC_CORP037: Corporate Management page - Sort Purchase History by Status', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Purchase History section
    // Step 5: Click the arrow beside Status
    await page.click('th:has-text("Status")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's purchase history is sorted based on Status (Arrow up: ascending)
    await expect(page.locator('th:has-text("Status") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Status")');
    // Expected Result: Corporate user's purchase history is sorted based on Status (Arrow down: descending)
    await expect(page.locator('th:has-text("Status") svg')).toBeVisible();
  });

  test('TC_CORP038: Corporate Management page - Sort Inventory by Voucher Name', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Click the arrow beside Voucher Name
    await page.click('th:has-text("Voucher Name")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's inventory is sorted based on Voucher Name (Arrow up: ascending)
    await expect(page.locator('th:has-text("Voucher Name") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Voucher Name")');
    // Expected Result: Corporate user's inventory is sorted based on Voucher Name (Arrow down: descending)
    await expect(page.locator('th:has-text("Voucher Name") svg')).toBeVisible();
  });

  test('TC_CORP039: Corporate Management page - Sort Inventory by Total Voucher Purchase', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Click the arrow beside Total Voucher Purchase
    await page.click('th:has-text("Total Voucher Purchase")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's inventory is sorted based on Total Voucher Purchase (Arrow up: ascending)
    await expect(page.locator('th:has-text("Total Voucher Purchase") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Total Voucher Purchase")');
    // Expected Result: Corporate user's inventory is sorted based on Total Voucher Purchase (Arrow down: descending)
    await expect(page.locator('th:has-text("Total Voucher Purchase") svg')).toBeVisible();
  });

  test('TC_CORP040: Corporate Management page - Sort Inventory by Remaining Voucher', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Click the arrow beside Remaining Voucher
    await page.click('th:has-text("Remaining Voucher")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's inventory is sorted based on Remaining Voucher (Arrow up: ascending)
    await expect(page.locator('th:has-text("Remaining Voucher") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Remaining Voucher")');
    // Expected Result: Corporate user's inventory is sorted based on Remaining Voucher (Arrow down: descending)
    await expect(page.locator('th:has-text("Remaining Voucher") svg')).toBeVisible();
  });

  test('TC_CORP041: Corporate Management page - Sort Inventory by Expiry Date', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Select a corporate user
    // Step 3: Click on the edit icon located at the end of the corporate user's row
    await page.locator('[role="row"] [role="cell"]:last-child button').first().click();
    await page.waitForTimeout(1000);
    // Step 4: Scroll down to Inventory section
    await page.click('text=Inventory');
    // Step 5: Click the arrow beside Expiry Date
    await page.click('th:has-text("Expiry Date")');
    // Step 6: Click once to observe ascending order
    // Expected Result: Corporate user's inventory is sorted based on Expiry Date (Arrow up: ascending)
    await expect(page.locator('th:has-text("Expiry Date") svg')).toBeVisible();
    // Step 7: Click again to observe descending order
    await page.click('th:has-text("Expiry Date")');
    // Expected Result: Corporate user's inventory is sorted based on Expiry Date (Arrow down: descending)
    await expect(page.locator('th:has-text("Expiry Date") svg')).toBeVisible();
  });

  test('TC_CORP042: Corporate Management page - Sort Corporate Users by Company Name', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Company Name
    await page.click('th:has-text("Company Name")');
    // Expected Result: Corporate users list is sorted based on Company Name (Arrow up: ascending, number -> upper case -> lower case)
    await expect(page.locator('th:has-text("Company Name") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Company Name")');
    // Expected Result: Corporate users list is sorted based on Company Name (Arrow down: descending)
    await expect(page.locator('th:has-text("Company Name") svg')).toBeVisible();
  });

  test('TC_CORP043: Corporate Management page - Sort Corporate Users by Company Email', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Company Email
    await page.click('th:has-text("Company Email")');
    // Expected Result: Corporate users list is sorted based on Company Email (Arrow up: ascending)
    await expect(page.locator('th:has-text("Company Email") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Company Email")');
    // Expected Result: Corporate users list is sorted based on Company Email (Arrow down: descending)
    await expect(page.locator('th:has-text("Company Email") svg')).toBeVisible();
  });

  test('TC_CORP044: Corporate Management page - Sort Corporate Users by Company Phone No.', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Company Phone No.
    await page.click('th:has-text("Company Phone No.")');
    // Expected Result: Corporate users list is sorted based on Company Phone Number (Arrow up: ascending)
    await expect(page.locator('th:has-text("Company Phone No.") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Company Phone No.")');
    // Expected Result: Corporate users list is sorted based on Company Phone Number (Arrow down: descending)
    await expect(page.locator('th:has-text("Company Phone No.") svg')).toBeVisible();
  });

  test('TC_CORP045: Corporate Management page - Sort Corporate Users by Created Date', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Created Date
    await page.click('th:has-text("Created Date")');
    // Expected Result: Corporate users list is sorted based on Created Date (Arrow up: ascending)
    await expect(page.locator('th:has-text("Created Date") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Created Date")');
    // Expected Result: Corporate users list is sorted based on Created Date (Arrow down: descending)
    await expect(page.locator('th:has-text("Created Date") svg')).toBeVisible();
  });

  test('TC_CORP046: Corporate Management page - Sort Corporate Users by Last Update', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Last Update
    await page.click('th:has-text("Last Update")');
    // Expected Result: Corporate users list is sorted based on Last Update (Arrow up: ascending)
    await expect(page.locator('th:has-text("Last Update") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Last Update")');
    // Expected Result: Corporate users list is sorted based on Last Update (Arrow down: descending)
    await expect(page.locator('th:has-text("Last Update") svg')).toBeVisible();
  });

  test('TC_CORP047: Corporate Management page - Sort Corporate Users by Last Login', async ({ page }) => {
    // Step 1: Go to Corporate Management page
    await page.goto(`${ADMIN_PORTAL.URL.replace('/login', '')}/corporate-management`);
    // Step 2: Click the arrow beside Last Login
    await page.click('th:has-text("Last Login")');
    // Expected Result: Corporate users list is sorted based on Last Login (Arrow up: ascending)
    await expect(page.locator('th:has-text("Last Login") svg')).toBeVisible();
    // Step 3: Click again to observe descending order
    await page.click('th:has-text("Last Login")');
    // Expected Result: Corporate users list is sorted based on Last Login (Arrow down: descending)
    await expect(page.locator('th:has-text("Last Login") svg')).toBeVisible();
  });
});
