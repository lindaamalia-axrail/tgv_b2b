import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const CORP_MGMT_URL = `${BASE_URL}/corporate-management`;

test.describe('Admin Portal - Corporate Management', () => {
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

  // Helper: navigate to Corporate Management page
  async function navigateToCorporateManagement() {
    await authenticatedPage.goto(CORP_MGMT_URL);
    await waitForAppReady();
    // Wait for the table to be visible
    await authenticatedPage.getByRole('grid').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  // Helper: open edit form for first corporate user
  async function openFirstCorporateUserEdit() {
    await navigateToCorporateManagement();
    // Click the action button (last cell) in the first data row
    const firstRow = authenticatedPage.getByRole('row').filter({ has: authenticatedPage.getByRole('checkbox', { name: 'Select row' }) }).first();
    await firstRow.getByRole('button').click();
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
    // Wait for the edit page to load
    await authenticatedPage.getByRole('heading', { name: 'Corporate Customer Detail' }).waitFor({ state: 'visible', timeout: 15000 });
  }

  // =====================================================
  // EXPORT / DOWNLOAD CORPORATE CUSTOMERS LIST
  // =====================================================

  test('TC_CORP001: Download all corporate customers details', async () => {
    // Steps: Go to Corporate Management > Click Export List > Select Export All > Click Export
    // Expected: Corporate customer details for all customers is successfully downloaded in csv file
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('button', { name: 'Export List' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export All' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP002: Download corporate customers details based on search result', async () => {
    // Steps: Go to Corporate Management > Search corporate customer in search filter > Click Export List > Select Search Result > Click Export
    // Expected: Corporate customer details for customers based on search result is successfully downloaded in csv file
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).fill('Company');
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await authenticatedPage.getByRole('button', { name: 'Export List' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export Search Result' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP003: Download selected corporate customer details', async () => {
    // Steps: Go to Corporate Management > Select corporate users by ticking checkboxes > Click Export List > Select Export All > Click Export
    // Expected: Corporate customer details for selected customers is successfully downloaded in csv file
    await navigateToCorporateManagement();
    // Tick the first row checkbox
    await authenticatedPage.getByRole('checkbox', { name: 'Select row' }).first().check();
    await authenticatedPage.getByRole('button', { name: 'Export List' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export All' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  // =====================================================
  // SEARCH CORPORATE USERS
  // =====================================================

  test('TC_CORP004: Search corporate users based on company name', async () => {
    // Steps: Go to Corporate Management > Type company name in company name search filter > Press enter > Observe results
    // Expected: Corporate customer that matched the company name searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).fill('Company 88');
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'Company 88' }).first()).toBeVisible();
  });

  test('TC_CORP005: Search corporate users based on email', async () => {
    // Steps: Go to Corporate Management > Type email in email search filter > Press enter > Observe results
    // Expected: Corporate customer that matched the email searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).fill('najwa+88@axrail.com');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'najwa+88@axrail.com' }).first()).toBeVisible();
  });

  test('TC_CORP006: Search corporate users based on phone number', async () => {
    // Steps: Go to Corporate Management > Type phone number in phone number search filter > Press enter > Observe results
    // Expected: Corporate customer that matched the phone number searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).fill('60102345600');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: '+60102345600' }).first()).toBeVisible();
  });

  test('TC_CORP007: Search corporate users based on company name and email', async () => {
    // Steps: Go to Corporate Management > Type company name > Enter > Type email > Enter > Observe results
    // Expected: Corporate customer that matched the company name and email searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).fill('Company 88');
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).press('Enter');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).fill('najwa+88@axrail.com');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'Company 88' }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('cell', { name: 'najwa+88@axrail.com' }).first()).toBeVisible();
  });

  test('TC_CORP008: Search corporate users based on company name and phone number', async () => {
    // Steps: Go to Corporate Management > Type company name > Enter > Type phone number > Enter > Observe results
    // Expected: Corporate customer that matched the company name and phone number searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).fill('Company 88');
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).press('Enter');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).fill('60102345600');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'Company 88' }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('cell', { name: '+60102345600' }).first()).toBeVisible();
  });

  test('TC_CORP009: Search corporate users based on email and phone number', async () => {
    // Steps: Go to Corporate Management > Type email > Enter > Type phone number > Enter > Observe results
    // Expected: Corporate customer that matched the email and phone number searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).fill('najwa+88@axrail.com');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).press('Enter');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).fill('60102345600');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'najwa+88@axrail.com' }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('cell', { name: '+60102345600' }).first()).toBeVisible();
  });

  test('TC_CORP010: Search corporate users based on company name, email and phone number', async () => {
    // Steps: Go to Corporate Management > Type company name > Enter > Type email > Enter > Type phone number > Enter > Observe results
    // Expected: Corporate customer that matched the company name, email and phone number searched is displayed
    await navigateToCorporateManagement();
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).fill('Company 88');
    await authenticatedPage.getByRole('textbox', { name: 'Company Name' }).press('Enter');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).fill('najwa+88@axrail.com');
    await authenticatedPage.getByRole('textbox', { name: 'Email' }).press('Enter');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).fill('60102345600');
    await authenticatedPage.getByRole('textbox', { name: 'Phone Number' }).press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'Company 88' }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('cell', { name: 'najwa+88@axrail.com' }).first()).toBeVisible();
    await expect(authenticatedPage.getByRole('cell', { name: '+60102345600' }).first()).toBeVisible();
  });

  // =====================================================
  // EDIT CORPORATE CUSTOMER INFORMATION
  // =====================================================

  test('TC_CORP011: Edit corporate customer\'s corporate information', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit corporate info > Click Save Changes
    // Expected: Corporate customer new information is edited and saved successfully
    await openFirstCorporateUserEdit();
    const companyNameInput = authenticatedPage.locator('text=Company Name *').locator('..').getByRole('textbox');
    const originalName = await companyNameInput.inputValue();
    await companyNameInput.fill('Updated Company Name');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert the name back
    await companyNameInput.fill(originalName);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP012: Delete entered mandatory fields (Negative)', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Delete mandatory field > Click Save Changes
    // Expected: Error message displayed for empty mandatory fields, e.g. "Company name is required"
    await openFirstCorporateUserEdit();
    const companyNameInput = authenticatedPage.locator('text=Company Name *').locator('..').getByRole('textbox');
    const originalName = await companyNameInput.inputValue();
    await companyNameInput.fill('');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=/required/i')).toBeVisible({ timeout: 10000 });
    // Restore original value
    await companyNameInput.fill(originalName);
  });

  test('TC_CORP013: Edit corporate customer\'s email to unused email', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to unused email > Click Save Changes
    // Expected: Changes saved/updated successfully
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    const originalEmail = await emailInput.inputValue();
    await emailInput.fill(`newemail${Date.now()}@test.com`);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert email
    await emailInput.fill(originalEmail);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP014: Edit corporate customer\'s email to used email only (Negative)', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to used email > Click Save Changes
    // Expected: Error message "Email ..... already exists for another customer"
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    await emailInput.fill('aliaarina@axrail.com');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=/already exists/i')).toBeVisible({ timeout: 10000 });
  });

  test('TC_CORP015: Edit corporate customer\'s mobile number to used mobile number', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit mobile number to unused mobile number > Click Save Changes
    // Expected: Changes saved/updated successfully
    await openFirstCorporateUserEdit();
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    const originalPhone = await phoneInput.inputValue();
    await phoneInput.fill(`6012${Date.now().toString().slice(-7)}`);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert phone
    await phoneInput.fill(originalPhone);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP016: Edit corporate customer\'s mobile number to unused mobile number', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit mobile number to used mobile number > Click Save Changes
    // Expected: Changes saved/updated successfully
    await openFirstCorporateUserEdit();
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    const originalPhone = await phoneInput.inputValue();
    await phoneInput.fill('60168402737');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert phone
    await phoneInput.fill(originalPhone);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP017: Edit email to unused email and mobile number to unused mobile number', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to unused > Edit mobile to unused > Click Save Changes
    // Expected: Changes saved/updated successfully
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    const originalEmail = await emailInput.inputValue();
    const originalPhone = await phoneInput.inputValue();
    await emailInput.fill(`newemail${Date.now()}@test.com`);
    await phoneInput.fill(`6012${Date.now().toString().slice(-7)}`);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert
    await emailInput.fill(originalEmail);
    await phoneInput.fill(originalPhone);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP018: Edit email to unused email and mobile number to used mobile number', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to unused > Edit mobile to used > Click Save Changes
    // Expected: Changes saved/updated successfully
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    const originalEmail = await emailInput.inputValue();
    const originalPhone = await phoneInput.inputValue();
    await emailInput.fill(`newemail${Date.now()}@test.com`);
    await phoneInput.fill('60168402737');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    // Revert
    await emailInput.fill(originalEmail);
    await phoneInput.fill(originalPhone);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
  });

  test('TC_CORP019: Edit email to used email and mobile number to unused mobile number (Negative)', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to used > Edit mobile to unused > Click Save Changes
    // Expected: Error message "Email ..... already exists for another customer"
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    await emailInput.fill('aliaarina@axrail.com');
    await phoneInput.fill(`6012${Date.now().toString().slice(-7)}`);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=/already exists/i')).toBeVisible({ timeout: 10000 });
  });

  test('TC_CORP020: Edit email to used email and mobile number to used mobile number (Negative)', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Edit email to used > Edit mobile to used > Click Save Changes
    // Expected: Error message "Email ..... already exists for another customer"
    await openFirstCorporateUserEdit();
    const emailInput = authenticatedPage.locator('text=Company Email *').locator('..').getByRole('textbox');
    const phoneInput = authenticatedPage.locator('text=Company Phone Number *').locator('..').getByRole('textbox');
    await emailInput.fill('aliaarina@axrail.com');
    await phoneInput.fill('60168402737');
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.locator('text=/already exists/i')).toBeVisible({ timeout: 10000 });
  });

  // =====================================================
  // PURCHASE HISTORY - FILTER & SEARCH
  // =====================================================

  test('TC_CORP021: View corporate user\'s purchase history from a specific date until today', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Click Filter Date > Select start date only > Click Update
    // Expected: Corporate user's purchase history from the date selected until today is displayed
    await openFirstCorporateUserEdit();
    await authenticatedPage.getByRole('button', { name: 'Filter Date' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    // Navigate to previous month and select a start date
    await authenticatedPage.getByRole('button', { name: 'Go to previous month' }).click();
    await authenticatedPage.getByRole('gridcell', { name: '1' }).first().click();
    // Click Update with only start date selected
    await authenticatedPage.getByRole('button', { name: 'Update' }).click();
    await authenticatedPage.waitForTimeout(1000);
    // Verify purchase history table is still visible
    await expect(authenticatedPage.getByRole('grid').first()).toBeVisible();
  });

  test('TC_CORP022: Filter corporate user\'s purchase history by date', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Click Filter Date > Select start date and end date > Click Update
    // Expected: Corporate user's purchase history that satisfies the filter date is displayed in the listing
    await openFirstCorporateUserEdit();
    await authenticatedPage.getByRole('button', { name: 'Filter Date' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    // Select start date
    await authenticatedPage.getByRole('button', { name: 'Go to previous month' }).click();
    await authenticatedPage.getByRole('gridcell', { name: '1' }).first().click();
    // Select end date
    await authenticatedPage.getByRole('gridcell', { name: '28' }).last().click();
    await authenticatedPage.getByRole('button', { name: 'Update' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('grid').first()).toBeVisible();
  });

  test('TC_CORP023: Clear filter date choices', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Click Filter Date > Select start/end date > Click Update > Click Filter Date again > Select Cancel > Observe
    // Expected: Filter date are cleared and listings update to show all purchase history
    await openFirstCorporateUserEdit();
    await authenticatedPage.getByRole('button', { name: 'Filter Date' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('button', { name: 'Go to previous month' }).click();
    await authenticatedPage.getByRole('gridcell', { name: '1' }).first().click();
    await authenticatedPage.getByRole('gridcell', { name: '28' }).last().click();
    await authenticatedPage.getByRole('button', { name: 'Update' }).click();
    await authenticatedPage.waitForTimeout(500);
    // Click Filter Date again and Cancel to clear
    await authenticatedPage.getByRole('button', { name: 'Filter Date' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('button', { name: 'Cancel' }).click();
    await authenticatedPage.waitForTimeout(500);
    // Verify listing is still visible (filter cleared, showing all history)
    await expect(authenticatedPage.getByRole('grid').first()).toBeVisible();
  });

  test('TC_CORP024: Search corporate user\'s purchase history by booking number', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Type booking number in search bar > Click enter
    // Expected: Corporate user's purchase history that satisfies the booking number is displayed in the listing
    await openFirstCorporateUserEdit();
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search by Booking Number, Order ID' });
    await searchInput.fill('2148822');
    await searchInput.press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: '2148822' }).first()).toBeVisible();
  });

  test('TC_CORP025: Search corporate user\'s purchase history by Order ID', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Type Order ID in search bar > Click enter
    // Expected: Corporate user's purchase history that satisfies the Order ID is displayed in the listing
    await openFirstCorporateUserEdit();
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search by Booking Number, Order ID' });
    await searchInput.fill('TGV2603101551E0I');
    await searchInput.press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'TGV2603101551E0I' }).first()).toBeVisible();
  });

  test('TC_CORP026: Search corporate user\'s purchase history by Transaction No.', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Purchase History > Type Transaction No in search bar > Click enter
    // Expected: Corporate user's purchase history that satisfies the Transaction No is displayed in the listing
    await openFirstCorporateUserEdit();
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search by Booking Number, Order ID' });
    await searchInput.fill('PYM2603101551LZ7');
    await searchInput.press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'PYM2603101551LZ7' }).first()).toBeVisible();
  });

  // =====================================================
  // INVENTORY - SEARCH & DOWNLOAD
  // =====================================================

  test('TC_CORP027: Search corporate user\'s inventory by voucher name', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Inventory > Search by voucher name > Observe result
    // Expected: Corporate user's inventory that satisfies the voucher name is displayed in the listing
    await openFirstCorporateUserEdit();
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search by Voucher Name' });
    await searchInput.fill('IMAX');
    await searchInput.press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await expect(authenticatedPage.getByRole('cell', { name: 'IMAX Pass' }).first()).toBeVisible();
  });

  test('TC_CORP028: Download corporate user\'s all inventory', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Inventory > Click Download Inventory Report > Select Export All > Click Export
    // Expected: Corporate user's inventory is successfully downloaded in csv file
    await openFirstCorporateUserEdit();
    await authenticatedPage.getByRole('button', { name: 'Download Inventory Report' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export All' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP029: Download corporate user\'s inventory by search result', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Inventory > Search by voucher name > Click Download Inventory Report > Select Search Result > Click Export
    // Expected: Corporate user's inventory based on search result is successfully downloaded in csv file
    await openFirstCorporateUserEdit();
    const searchInput = authenticatedPage.getByRole('textbox', { name: 'Search by Voucher Name' });
    await searchInput.fill('IMAX');
    await searchInput.press('Enter');
    await authenticatedPage.waitForTimeout(1000);
    await authenticatedPage.getByRole('button', { name: 'Download Inventory Report' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export Search Result' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('TC_CORP030: Download corporate user\'s selected inventory', async () => {
    // Steps: Go to Corporate Management > Select a corporate user > Click edit icon > Scroll to Inventory > Select vouchers by ticking checkboxes > Click Download Inventory Report > Select Export All > Click Export
    // Expected: Corporate user's inventory for selected inventory(s) is successfully downloaded in csv file
    await openFirstCorporateUserEdit();
    // Tick the first inventory row checkbox (inside the Inventory grid)
    const inventoryGrid = authenticatedPage.getByRole('grid').last();
    await inventoryGrid.getByRole('checkbox', { name: 'Select row' }).first().check();
    await authenticatedPage.getByRole('button', { name: 'Download Inventory Report' }).click();
    await authenticatedPage.getByRole('dialog').waitFor({ state: 'visible' });
    await authenticatedPage.getByRole('radio', { name: 'Export All' }).click();
    const downloadPromise = authenticatedPage.waitForEvent('download');
    await authenticatedPage.getByRole('dialog').getByRole('button', { name: 'Export' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  // =====================================================
  // SORT PURCHASE HISTORY
  // =====================================================

  test('TC_CORP031: Sort Purchase History by Booking No.', async () => {
    // Steps: Click arrow beside Booking No. > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Booking No. (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Booking No.' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP032: Sort Purchase History by Order ID', async () => {
    // Steps: Click arrow beside Order ID > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Order ID (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Order ID' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP033: Sort Purchase History by Transaction No.', async () => {
    // Steps: Click arrow beside Transaction No. > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Transaction No. (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Transaction No.' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP034: Sort Purchase History by Total Item', async () => {
    // Steps: Click arrow beside Total Item > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Total Item (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Total Item' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP035: Sort Purchase History by Amount', async () => {
    // Steps: Click arrow beside Amount > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Amount (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Amount' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP036: Sort Purchase History by Purchase Date', async () => {
    // Steps: Click arrow beside Purchase Date > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Purchase Date (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Purchase Date' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP037: Sort Purchase History by Status', async () => {
    // Steps: Click arrow beside Status > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Purchase history sorted by Status (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const purchaseHistoryGrid = authenticatedPage.getByRole('grid').first();
    const header = purchaseHistoryGrid.getByRole('columnheader', { name: 'Status' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  // =====================================================
  // SORT INVENTORY
  // =====================================================

  test('TC_CORP038: Sort Inventory by Voucher Name', async () => {
    // Steps: Click arrow beside Voucher Name > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Inventory sorted by Voucher Name (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const inventoryGrid = authenticatedPage.getByRole('grid').last();
    const header = inventoryGrid.getByRole('columnheader', { name: 'Voucher Name' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP039: Sort Inventory by Total Voucher Purchase', async () => {
    // Steps: Click arrow beside Total Voucher Purchase > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Inventory sorted by Total Voucher Purchase (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const inventoryGrid = authenticatedPage.getByRole('grid').last();
    const header = inventoryGrid.getByRole('columnheader', { name: 'Total Voucher Purchase' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP040: Sort Inventory by Remaining Voucher', async () => {
    // Steps: Click arrow beside Remaining Voucher > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Inventory sorted by Remaining Voucher (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const inventoryGrid = authenticatedPage.getByRole('grid').last();
    const header = inventoryGrid.getByRole('columnheader', { name: 'Remaining Voucher' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP041: Sort Inventory by Expiry Date', async () => {
    // Steps: Click arrow beside Expiry Date > Click once (ascending) > Click again (descending) > Click again (original)
    // Expected: Inventory sorted by Expiry Date (Arrow up: ascending, Arrow down: descending)
    await openFirstCorporateUserEdit();
    const inventoryGrid = authenticatedPage.getByRole('grid').last();
    const header = inventoryGrid.getByRole('columnheader', { name: 'Expiry Date' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  // =====================================================
  // SORT CORPORATE USERS LIST
  // =====================================================

  test('TC_CORP042: Sort Corporate Users by Company Name', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Company Name
    // Expected: Corporate users list sorted by Company Name (Arrow up: ascending, Arrow down: descending)
    // Note: Sorting follows letter case - ascending: number -> upper case -> lower case
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Company Name' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP043: Sort Corporate Users by Company Email', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Company Email
    // Expected: Corporate users list sorted by Company Email (Arrow up: ascending, Arrow down: descending)
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Company Email' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP044: Sort Corporate Users by Company Phone No.', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Company Phone No.
    // Expected: Corporate users list sorted by Company Phone Number (Arrow up: ascending, Arrow down: descending)
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Company Phone No.' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP045: Sort Corporate Users by Created Date', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Created Date
    // Expected: Corporate users list sorted by Created Date (Arrow up: ascending, Arrow down: descending)
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Created Date' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP046: Sort Corporate Users by Last Update', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Last Update
    // Expected: Corporate users list sorted by Last Update (Arrow up: ascending, Arrow down: descending)
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Last Update' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });

  test('TC_CORP047: Sort Corporate Users by Last Login', async () => {
    // Steps: Go to Corporate Management > Click the arrow beside Last Login
    // Expected: Corporate users list sorted by Last Login (Arrow up: ascending, Arrow down: descending)
    await navigateToCorporateManagement();
    const header = authenticatedPage.getByRole('columnheader', { name: 'Last Login' });
    await header.click();
    await authenticatedPage.waitForTimeout(500);
    await header.click();
    await authenticatedPage.waitForTimeout(500);
  });
});
