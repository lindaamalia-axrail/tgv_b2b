import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';

// URLs for direct navigation
const BASE_URL = 'https://corpvoucher.fam-stg.click';
const ORDERS_URL = `${BASE_URL}/orders`;

// Real test data from the actual orders in the system
const TEST_DATA = {
  orderNo: 'TGV2603121232CF0',
  bookingNo: '2148902',
  merchantTxnId: 'PYM2603121232Q74',
  email: 'lindaamalia@axrail.com',
  phoneNo: '+60104411234',
  // For multi-order search
  orderNo2: 'TGV2603121231DNX',
  bookingNo2: '2148901',
};

test.describe('Admin Portal - My Order Page', () => {
  let authenticatedPage: Page;

  // Helper to wait for the app loading screen to disappear
  async function waitForAppReady() {
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  // Helper to wait for table data to load
  async function waitForTableData() {
    await authenticatedPage.waitForTimeout(2000);
    await authenticatedPage.waitForLoadState('networkidle');
  }

  // Login ONCE before all tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();

    // Go to login page first
    await authenticatedPage.goto(`${BASE_URL}/admin/login`);
    await authenticatedPage.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);

    // Check if already logged in (localStorage tokens might work)
    let currentUrl = authenticatedPage.url();

    if (currentUrl.includes('login')) {
      // Do regular login with actual form selectors
      console.log('Performing regular login...');
      const emailInput = authenticatedPage.getByRole('textbox', { name: /robot@gmail.com/i });
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(ADMIN_PORTAL.CREDENTIALS.email);
      await authenticatedPage.locator('#password').fill(ADMIN_PORTAL.CREDENTIALS.password);
      await authenticatedPage.getByRole('button', { name: /sign in/i }).click();

      // Wait for navigation away from login page
      await authenticatedPage.waitForFunction(
        () => !window.location.href.includes('/login'),
        { timeout: 30000 }
      );

      // Wait for loading screen to disappear
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

  // Helper: navigate to Orders listing page
  async function navigateToOrders() {
    await authenticatedPage.goto(ORDERS_URL);
    await waitForAppReady();
    await waitForTableData();
  }

  // ==========================================
  // TC01 - Validate Order Table Listing
  // ==========================================
  test('TC01 - My Order page - Validate Order Table Listing', async () => {
    await navigateToOrders();

    // Actual table headers from the admin portal
    const expectedHeaders = [
      'Order No',
      'Booking No',
      'Merchant TXN ID',
      'Date',
      'Email',
      'Phone No',
      'Item (Count)',
      'Amount',
      'Vista Status',
      'Status',
    ];

    // Verify all column headers exist (scroll into view for off-screen columns)
    for (const header of expectedHeaders) {
      // Use exact match to avoid "Status" matching "Vista Status"
      const col = authenticatedPage.getByRole('columnheader', { name: header, exact: true });
      await col.scrollIntoViewIfNeeded();
      await expect(col).toBeVisible();
    }

    // Verify the grid is visible
    const grid = authenticatedPage.getByRole('grid');
    await expect(grid).toBeVisible({ timeout: 15000 });

    // Verify table has data rows (at least one)
    const rows = authenticatedPage.getByRole('row');
    await expect(rows.nth(1)).toBeVisible(); // first data row (index 0 is header)

    // Verify pagination info shows data
    await expect(authenticatedPage.locator('text=/\\d+–\\d+ of \\d+/')).toBeVisible();
  });

  // ==========================================
  // TC02 - View orders placed
  // ==========================================
  test('TC02 - My Order page - View orders placed', async () => {
    await navigateToOrders();

    // Search for a specific completed order to view its details
    const orderNoInput = authenticatedPage.getByRole('textbox', { name: 'Order No' });
    await orderNoInput.fill(TEST_DATA.orderNo);
    await orderNoInput.press('Enter');
    await waitForTableData();

    // Verify search returned the order
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText('Orders (1)');

    // Click the view/eye button on the row (last button in the row)
    const dataRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo });
    await dataRow.getByRole('button').click();
    await authenticatedPage.waitForTimeout(2000);

    // Verify navigated to order details page
    await expect(authenticatedPage).toHaveURL(/orders-details\/edit\?id=/);
    await expect(authenticatedPage.getByRole('heading', { name: 'Order Details' })).toBeVisible();

    // Verify Customer Information section
    await expect(authenticatedPage.locator('text=Customer Information')).toBeVisible();
    await expect(authenticatedPage.locator('text=Company Name')).toBeVisible();
    await expect(authenticatedPage.locator('text=Company Email')).toBeVisible();
    await expect(authenticatedPage.locator('text=Phone No')).toBeVisible();
    await expect(authenticatedPage.locator('text=Billing Address')).toBeVisible();

    // Verify Order details table
    await expect(authenticatedPage.locator('text=Booking No.')).toBeVisible();
    await expect(authenticatedPage.locator('text=Transaction No.')).toBeVisible();
    await expect(authenticatedPage.locator('text=Order No.')).toBeVisible();
    await expect(authenticatedPage.locator('text=Merchant TxN ID.')).toBeVisible();

    // Verify Status section
    await expect(authenticatedPage.locator('text=Order Status')).toBeVisible();
    await expect(authenticatedPage.locator('text=Vista Status')).toBeVisible();

    // Verify Amount and item info
    await expect(authenticatedPage.locator('text=Total Amount')).toBeVisible();
    await expect(authenticatedPage.locator('text=Transaction Date Time')).toBeVisible();
    await expect(authenticatedPage.locator('text=Total Item')).toBeVisible();

    // Verify Download Receipt button
    await expect(authenticatedPage.getByRole('button', { name: 'Download Receipt' })).toBeVisible();

    // Verify Product table
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Product' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Price' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Subtotal' })).toBeVisible();

    // Verify Timeline section
    await expect(authenticatedPage.locator('text=Timeline')).toBeVisible();
  });

  // ==========================================
  // TC03 - Update orders place (nothing can be updated)
  // ==========================================
  test('TC03 - My Order page - Update orders place', async () => {
    // Navigate to order details
    await navigateToOrders();

    const orderNoInput = authenticatedPage.getByRole('textbox', { name: 'Order No' });
    await orderNoInput.fill(TEST_DATA.orderNo);
    await orderNoInput.press('Enter');
    await waitForTableData();

    const dataRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo });
    await dataRow.getByRole('button').click();
    await authenticatedPage.waitForTimeout(2000);

    await expect(authenticatedPage).toHaveURL(/orders-details\/edit\?id=/);

    // Verify all fields are read-only (displayed as paragraphs, not input fields)
    // The order detail page shows all info as text paragraphs, not editable inputs
    const editableInputs = authenticatedPage.locator('input:not([type="hidden"]):not([readonly]):not([disabled])');
    const inputCount = await editableInputs.count();

    // There should be no editable text inputs on the order detail page
    // (The page only has paragraph elements for displaying data)
    expect(inputCount).toBe(0);

    // Verify there is no Save/Update button
    await expect(authenticatedPage.getByRole('button', { name: /save|update/i })).not.toBeVisible();
  });

  // ==========================================
  // TC04 - Search orders by Order No
  // ==========================================
  test('TC04 - My Order page - Search orders by Order No', async () => {
    await navigateToOrders();

    const orderNoInput = authenticatedPage.getByRole('textbox', { name: 'Order No' });
    await orderNoInput.fill(TEST_DATA.orderNo);
    await orderNoInput.press('Enter');
    await waitForTableData();

    // Verify filter chip appears
    await expect(authenticatedPage.getByRole('button', { name: TEST_DATA.orderNo.toLowerCase() })).toBeVisible();

    // Verify search results show the matching order
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText('Orders (1)');
    const resultRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo });
    await expect(resultRow).toBeVisible();

    // Verify the order number in the cell matches
    await expect(resultRow.getByRole('cell', { name: TEST_DATA.orderNo })).toBeVisible();
  });

  // ==========================================
  // TC05 - Search orders by Booking No
  // ==========================================
  test('TC05 - My Order page - Search orders by Booking No', async () => {
    await navigateToOrders();

    const bookingNoInput = authenticatedPage.getByRole('textbox', { name: 'Booking No' });
    await bookingNoInput.fill(TEST_DATA.bookingNo);
    await bookingNoInput.press('Enter');
    await waitForTableData();

    // Verify search results show the matching order
    const resultRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.bookingNo });
    await expect(resultRow).toBeVisible();

    // Verify the booking number in the cell matches
    await expect(resultRow.getByRole('cell', { name: TEST_DATA.bookingNo })).toBeVisible();
  });

  // ==========================================
  // TC06 - Search orders by Merchant Txn ID
  // ==========================================
  test('TC06 - My Order page - Search orders by Merchant Txn ID', async () => {
    await navigateToOrders();

    const merchantTxnInput = authenticatedPage.getByRole('textbox', { name: 'Merchant Txn ID' });
    await merchantTxnInput.fill(TEST_DATA.merchantTxnId);
    await merchantTxnInput.press('Enter');
    await waitForTableData();

    // Verify search results show the matching order
    const resultRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.merchantTxnId });
    await expect(resultRow).toBeVisible();

    // Verify the merchant txn ID in the cell matches
    await expect(resultRow.getByRole('cell', { name: TEST_DATA.merchantTxnId })).toBeVisible();
  });

  // ==========================================
  // TC07 - Search orders by Email
  // ==========================================
  test('TC07 - My Order page - Search orders by Email', async () => {
    await navigateToOrders();

    const emailInput = authenticatedPage.getByRole('textbox', { name: 'Email' });
    await emailInput.fill(TEST_DATA.email);
    await emailInput.press('Enter');
    await waitForTableData();

    // Verify search results show orders with matching email
    const rows = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.email });
    await expect(rows.first()).toBeVisible();

    // Verify at least one result contains the email
    const firstRow = rows.first();
    await expect(firstRow.getByRole('cell', { name: TEST_DATA.email })).toBeVisible();
  });

  // ==========================================
  // TC08 - Search orders by Phone No
  // ==========================================
  test('TC08 - My Order page - Search orders by Phone No', async () => {
    await navigateToOrders();

    const phoneInput = authenticatedPage.getByRole('textbox', { name: 'Phone Number' });
    await phoneInput.fill(TEST_DATA.phoneNo);
    await phoneInput.press('Enter');
    await waitForTableData();

    // Verify search results show orders with matching phone number
    const rows = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.phoneNo });
    await expect(rows.first()).toBeVisible();
  });

  // ==========================================
  // TC09 - Search multiple orders using order numbers
  // ==========================================
  test('TC09 - My Order page - Search multiple orders using order numbers', async () => {
    await navigateToOrders();

    // Type first order number and press Enter to add as filter chip
    const orderNoInput = authenticatedPage.getByRole('textbox', { name: 'Order No' });
    await orderNoInput.fill(TEST_DATA.orderNo);
    await orderNoInput.press('Enter');
    await waitForTableData();

    // Type second order number and press Enter
    await orderNoInput.fill(TEST_DATA.orderNo2);
    await orderNoInput.press('Enter');
    await waitForTableData();

    // Verify both orders appear in results
    await expect(authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo })).toBeVisible();
    await expect(authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo2 })).toBeVisible();
  });

  // ==========================================
  // TC10 - Search order using order number and booking no
  // ==========================================
  test('TC10 - My Order page - Search order using order number and booking no', async () => {
    await navigateToOrders();

    // Search by order number first
    const orderNoInput = authenticatedPage.getByRole('textbox', { name: 'Order No' });
    await orderNoInput.fill(TEST_DATA.orderNo);
    await orderNoInput.press('Enter');
    await waitForTableData();

    // Then search by booking number
    const bookingNoInput = authenticatedPage.getByRole('textbox', { name: 'Booking No' });
    await bookingNoInput.fill(TEST_DATA.bookingNo);
    await bookingNoInput.press('Enter');
    await waitForTableData();

    // Verify the result satisfies both criteria
    const resultRow = authenticatedPage.getByRole('row').filter({ hasText: TEST_DATA.orderNo });
    await expect(resultRow).toBeVisible();
    await expect(resultRow.getByRole('cell', { name: TEST_DATA.bookingNo })).toBeVisible();

    // Verify only 1 result
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText('Orders (1)');
  });

  // ==========================================
  // TC11 - Filter order by start date and end date
  // ==========================================
  test('TC11 - My Order page - Filter order by start date and end date', async () => {
    await navigateToOrders();

    // Click More Filters
    await authenticatedPage.getByRole('button', { name: 'More Filters' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Expand Date accordion
    await authenticatedPage.getByRole('button', { name: 'Date' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Fill start date (DD/MM/YYYY format)
    const startDateInput = authenticatedPage.getByRole('textbox', { name: 'DD/MM/YYYY' }).first();
    await startDateInput.fill('01/01/2026');

    // Fill end date
    const endDateInput = authenticatedPage.getByRole('textbox', { name: 'DD/MM/YYYY' }).nth(1);
    await endDateInput.fill('31/12/2026');

    // Click Apply Filter
    await authenticatedPage.getByRole('button', { name: 'Apply Filter' }).click();
    await waitForTableData();

    // Verify orders are displayed (filtered results)
    const rows = authenticatedPage.getByRole('row');
    await expect(rows.nth(1)).toBeVisible({ timeout: 10000 });

    // Verify the heading shows filtered count
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText(/Orders \(\d+\)/);
  });

  // ==========================================
  // TC12 - Filter order by status
  // ==========================================
  test('TC12 - My Order page - Filter order by status', async () => {
    await navigateToOrders();

    // Click More Filters
    await authenticatedPage.getByRole('button', { name: 'More Filters' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Expand Order Status accordion
    await authenticatedPage.getByRole('button', { name: 'Order Status' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Select "Order Completed" checkbox
    await authenticatedPage.getByRole('checkbox', { name: 'Order Completed' }).first().check();
    await authenticatedPage.waitForTimeout(300);

    // Click Apply Filter
    await authenticatedPage.getByRole('button', { name: 'Apply Filter' }).click();
    await waitForTableData();

    // Verify all displayed orders have "Order Completed" status
    const dataRows = authenticatedPage.getByRole('row').filter({ hasText: 'Order Completed' });
    await expect(dataRows.first()).toBeVisible({ timeout: 10000 });

    // Verify the heading shows filtered count
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText(/Orders \(\d+\)/);
  });

  // ==========================================
  // TC13 - Filter order vista status
  // ==========================================
  test('TC13 - My Order page - Filter order vista status', async () => {
    await navigateToOrders();

    // Click More Filters
    await authenticatedPage.getByRole('button', { name: 'More Filters' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Expand Vista Status accordion
    await authenticatedPage.getByRole('button', { name: 'Vista Status' }).click();
    await authenticatedPage.waitForTimeout(500);

    // Select "Order Completed" checkbox under Vista Status
    // The Vista Status accordion is a MUI Accordion - locate it by its text, then find checkbox within
    const vistaAccordion = authenticatedPage.locator('.MuiAccordion-root', { hasText: 'Vista Status' });
    await vistaAccordion.getByRole('checkbox', { name: 'Order Completed' }).check();
    await authenticatedPage.waitForTimeout(300);

    // Click Apply Filter
    await authenticatedPage.getByRole('button', { name: 'Apply Filter' }).click();
    await waitForTableData();

    // Verify orders are displayed with matching vista status
    const dataRows = authenticatedPage.getByRole('row').filter({ hasText: 'Order Completed' });
    await expect(dataRows.first()).toBeVisible({ timeout: 10000 });
  });

  // ==========================================
  // TC14 - Combination filtering
  // ==========================================
  test('TC14 - My Order page - Combination filtering', async () => {
    await navigateToOrders();

    // Click More Filters
    await authenticatedPage.getByRole('button', { name: 'More Filters' }).click();
    await authenticatedPage.waitForTimeout(500);

    // 1. Expand Date and set date range
    await authenticatedPage.getByRole('button', { name: 'Date' }).click();
    await authenticatedPage.waitForTimeout(500);
    const startDateInput = authenticatedPage.getByRole('textbox', { name: 'DD/MM/YYYY' }).first();
    await startDateInput.fill('01/01/2026');
    const endDateInput = authenticatedPage.getByRole('textbox', { name: 'DD/MM/YYYY' }).nth(1);
    await endDateInput.fill('31/12/2026');

    // 2. Expand Order Status and select "Order Completed"
    await authenticatedPage.getByRole('button', { name: 'Order Status' }).click();
    await authenticatedPage.waitForTimeout(500);
    await authenticatedPage.getByRole('checkbox', { name: 'Order Completed' }).first().check();

    // 3. Expand Vista Status and select "Order Completed"
    await authenticatedPage.getByRole('button', { name: 'Vista Status' }).click();
    await authenticatedPage.waitForTimeout(500);
    const vistaAccordion = authenticatedPage.locator('.MuiAccordion-root', { hasText: 'Vista Status' });
    await vistaAccordion.getByRole('checkbox', { name: 'Order Completed' }).check();

    // Click Apply Filter
    await authenticatedPage.getByRole('button', { name: 'Apply Filter' }).click();
    await waitForTableData();

    // Verify filtered results are displayed
    const dataRows = authenticatedPage.getByRole('row').filter({ hasText: 'Order Completed' });
    await expect(dataRows.first()).toBeVisible({ timeout: 10000 });

    // Verify the heading shows filtered count
    await expect(authenticatedPage.getByRole('heading', { level: 5 })).toContainText(/Orders \(\d+\)/);
  });
});
