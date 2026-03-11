import { test, expect } from '@playwright/test';

test.describe('Admin Portal - My Order Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin portal and login
    await page.goto('https://admin.tgvcinemas.com.my/');
    
    // Wait for login or navigate to My Order page
    await page.waitForLoadState('networkidle');
    
    // Navigate to My Order page
    // TODO: Add navigation to My Order page once selector is identified
  });

  test('TC01 - My Order page - Validate Order Table Listing', async ({ page }) => {
    // Validate the table listing
    // TODO: Add selectors for table headers
    const tableHeaders = [
      'Order No',
      'Booking No',
      'Merchant Txn ID',
      'Email',
      'Phone No',
      'Status',
      'Vista Status',
      'Created Date'
    ];

    // Verify table headers are present
    for (const header of tableHeaders) {
      // TODO: Add selector validation
      // await expect(page.locator(`text=${header}`)).toBeVisible();
    }

    // Verify table displays data correctly
    // TODO: Add data validation
    
    // Expected Result: Table listing have complete header and display correct information
    // Verify all headers are visible
    for (const header of tableHeaders) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
    
    // Verify table has data rows
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
    
    // Verify data is displayed in correct columns
    const firstRow = tableRows.first();
    await expect(firstRow.locator('td').nth(0)).not.toBeEmpty(); // Order No
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty(); // Booking No
  });

  test('TC02 - My Order page - View orders placed', async ({ page }) => {
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Select the Order
    const firstOrder = page.locator('tbody tr').first();
    await firstOrder.click();
    
    // Step 3: Click the edit icon
    await page.click('[data-testid="edit-order-icon"]');
    
    // Step 4: View the order detail
    await page.waitForSelector('[data-testid="order-detail-modal"]');
    
    // Expected Result: Can view order details
    await expect(page.locator('[data-testid="order-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-detail-order-no"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-detail-booking-no"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-detail-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-detail-phone"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-detail-status"]')).toBeVisible();
  });

  test('TC03 - My Order page - Update orders place', async ({ page }) => {
    // Note: According to spec, nothing can be updated
    // This test verifies that update functionality is disabled or not available
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Select the Order
    const firstOrder = page.locator('tbody tr').first();
    await firstOrder.click();
    
    // Step 3: Click the edit icon
    await page.click('[data-testid="edit-order-icon"]');
    
    // Step 4: Attempt to update any information and save
    await page.waitForSelector('[data-testid="order-detail-modal"]');
    
    // Expected Result: Nothing can be updated (fields are read-only or disabled)
    // Verify that input fields are disabled or read-only
    const orderNoField = page.locator('[data-testid="order-detail-order-no"]');
    const bookingNoField = page.locator('[data-testid="order-detail-booking-no"]');
    const emailField = page.locator('[data-testid="order-detail-email"]');
    
    // Check if fields are disabled or read-only
    await expect(orderNoField).toBeDisabled().catch(() => 
      expect(orderNoField).toHaveAttribute('readonly')
    );
    await expect(bookingNoField).toBeDisabled().catch(() => 
      expect(bookingNoField).toHaveAttribute('readonly')
    );
    await expect(emailField).toBeDisabled().catch(() => 
      expect(emailField).toHaveAttribute('readonly')
    );
    
    // Verify save/update button is not present or disabled
    const updateButton = page.locator('[data-testid="update-order-button"]');
    await expect(updateButton).not.toBeVisible().catch(() => 
      expect(updateButton).toBeDisabled()
    );
  });

  test('TC04 - My Order page - Search orders by Order No', async ({ page }) => {
    const testOrderNo = 'ORD123456'; // TODO: Use actual order number
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in Order No in Order No search bar
    await page.fill('[data-testid="search-order-no"]', testOrderNo);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-order-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same Order No
    const searchResults = page.locator('tbody tr');
    await expect(searchResults).toHaveCount(1, { timeout: 5000 });
    await expect(searchResults.first().locator('td', { hasText: testOrderNo })).toBeVisible();
    
    // Verify the displayed order matches the search criteria
    const displayedOrderNo = await searchResults.first().locator('td').nth(0).textContent();
    expect(displayedOrderNo).toContain(testOrderNo);
  });

  test('TC05 - My Order page - Search orders by Booking No', async ({ page }) => {
    const testBookingNo = 'BK123456'; // TODO: Use actual booking number
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in Booking No in Booking No search bar
    await page.fill('[data-testid="search-booking-no"]', testBookingNo);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-booking-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same Booking No
    const searchResults = page.locator('tbody tr');
    await expect(searchResults).toHaveCount(1, { timeout: 5000 });
    await expect(searchResults.first().locator('td', { hasText: testBookingNo })).toBeVisible();
    
    // Verify the displayed order matches the search criteria
    const displayedBookingNo = await searchResults.first().locator('td').nth(1).textContent();
    expect(displayedBookingNo).toContain(testBookingNo);
  });

  test('TC06 - My Order page - Search orders by Merchant Txn ID', async ({ page }) => {
    const testMerchantTxnId = 'MTX123456'; // TODO: Use actual merchant txn ID
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in Merchant Txn ID
    await page.fill('[data-testid="search-merchant-txn-id"]', testMerchantTxnId);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-merchant-txn-id"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same Merchant Txn ID
    const searchResults = page.locator('tbody tr');
    await expect(searchResults).toHaveCount(1, { timeout: 5000 });
    await expect(searchResults.first().locator('td', { hasText: testMerchantTxnId })).toBeVisible();
    
    // Verify the displayed order matches the search criteria
    const displayedMerchantTxnId = await searchResults.first().locator('td').nth(2).textContent();
    expect(displayedMerchantTxnId).toContain(testMerchantTxnId);
  });

  test('TC07 - My Order page - Search orders by Email', async ({ page }) => {
    const testEmail = 'test@example.com'; // TODO: Use actual email
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in Email
    await page.fill('[data-testid="search-email"]', testEmail);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-email"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same Email
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    await expect(searchResults.first().locator('td', { hasText: testEmail })).toBeVisible();
    
    // Verify all displayed orders contain the search email
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const emailCell = await searchResults.nth(i).locator('td').nth(3).textContent();
      expect(emailCell).toContain(testEmail);
    }
  });

  test('TC08 - My Order page - Search orders by Phone No', async ({ page }) => {
    const testPhoneNo = '0123456789'; // TODO: Use actual phone number
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in Phone No
    await page.fill('[data-testid="search-phone-no"]', testPhoneNo);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-phone-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same Phone No
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    await expect(searchResults.first().locator('td', { hasText: testPhoneNo })).toBeVisible();
    
    // Verify all displayed orders contain the search phone number
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const phoneCell = await searchResults.nth(i).locator('td').nth(4).textContent();
      expect(phoneCell).toContain(testPhoneNo);
    }
  });

  test('TC09 - My Order page - Search multiple orders using order numbers', async ({ page }) => {
    const orderNumbers = ['ORD123456', 'ORD789012']; // TODO: Use actual order numbers
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in the order numbers in the order no. search bar
    await page.fill('[data-testid="search-order-no"]', orderNumbers.join(', '));
    
    // Step 3: Click enter
    await page.press('[data-testid="search-order-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display orders that contain the order numbers
    const searchResults = page.locator('tbody tr');
    await expect(searchResults).toHaveCount(orderNumbers.length, { timeout: 5000 });
    
    // Verify each order number is present in the results
    for (const orderNo of orderNumbers) {
      await expect(page.locator(`tbody tr td:has-text("${orderNo}")`)).toBeVisible();
    }
    
    // Verify all displayed orders match one of the search criteria
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const orderNoCell = await searchResults.nth(i).locator('td').nth(0).textContent();
      const matchesAny = orderNumbers.some(orderNo => orderNoCell?.includes(orderNo));
      expect(matchesAny).toBeTruthy();
    }
  });

  test('TC10 - My Order page - Search order using order number and booking no', async ({ page }) => {
    const testOrderNo = 'ORD123456'; // TODO: Use actual order number
    const testBookingNo = 'BK123456'; // TODO: Use actual booking number
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Type in the order no. in the order no. search bar
    await page.fill('[data-testid="search-order-no"]', testOrderNo);
    
    // Step 3: Click enter
    await page.press('[data-testid="search-order-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Step 4: Type in the booking no. in the booking no. search bar
    await page.fill('[data-testid="search-booking-no"]', testBookingNo);
    
    // Step 5: Click enter
    await page.press('[data-testid="search-booking-no"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order that satisfy both order no. and booking no.
    const searchResults = page.locator('tbody tr');
    await expect(searchResults).toHaveCount(1, { timeout: 5000 });
    
    // Verify the result contains both order no and booking no
    const resultRow = searchResults.first();
    await expect(resultRow.locator('td', { hasText: testOrderNo })).toBeVisible();
    await expect(resultRow.locator('td', { hasText: testBookingNo })).toBeVisible();
    
    // Verify the values match exactly
    const displayedOrderNo = await resultRow.locator('td').nth(0).textContent();
    const displayedBookingNo = await resultRow.locator('td').nth(1).textContent();
    expect(displayedOrderNo).toContain(testOrderNo);
    expect(displayedBookingNo).toContain(testBookingNo);
  });

  test('TC11 - My Order page - Filter order by start date and end date', async ({ page }) => {
    // Note: Need to select both start and end date, else filter not working (no error message)
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Click More Filter
    await page.click('[data-testid="more-filter-button"]');
    await page.waitForSelector('[data-testid="filter-modal"]');
    
    // Step 3: Select start date and end date
    await page.fill('[data-testid="filter-start-date"]', startDate);
    await page.fill('[data-testid="filter-end-date"]', endDate);
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display orders that satisfy the start date and end date
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    
    // Verify all displayed orders are within the date range
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const dateCell = await searchResults.nth(i).locator('td').nth(7).textContent(); // Created Date column
      const orderDate = new Date(dateCell || '');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(orderDate.getTime()).toBeLessThanOrEqual(end.getTime());
    }
    
    // Verify filter is applied (filter indicator or badge visible)
    await expect(page.locator('[data-testid="active-filter-indicator"]')).toBeVisible();
  });

  test('TC12 - My Order page - Filter order by status', async ({ page }) => {
    // Note: waiting refund shows order cancelled, no filter for order cancelled
    const testStatus = 'Completed';
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Click More Filter
    await page.click('[data-testid="more-filter-button"]');
    await page.waitForSelector('[data-testid="filter-modal"]');
    
    // Step 3: Select status
    await page.selectOption('[data-testid="filter-status"]', testStatus);
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same status
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    
    // Verify all displayed orders have the selected status
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const statusCell = await searchResults.nth(i).locator('td').nth(5).textContent(); // Status column
      expect(statusCell).toContain(testStatus);
    }
    
    // Verify status filter is applied
    await expect(page.locator('[data-testid="active-filter-indicator"]')).toBeVisible();
    await expect(page.locator(`text=${testStatus}`).first()).toBeVisible();
  });

  test('TC13 - My Order page - Filter order vista status', async ({ page }) => {
    const testVistaStatus = 'Confirmed';
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Click More Filter
    await page.click('[data-testid="more-filter-button"]');
    await page.waitForSelector('[data-testid="filter-modal"]');
    
    // Step 3: Select vista status
    await page.selectOption('[data-testid="filter-vista-status"]', testVistaStatus);
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display order with same vista status
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    
    // Verify all displayed orders have the selected vista status
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const vistaStatusCell = await searchResults.nth(i).locator('td').nth(6).textContent(); // Vista Status column
      expect(vistaStatusCell).toContain(testVistaStatus);
    }
    
    // Verify vista status filter is applied
    await expect(page.locator('[data-testid="active-filter-indicator"]')).toBeVisible();
    await expect(page.locator(`text=${testVistaStatus}`).first()).toBeVisible();
  });

  test('TC14 - My Order page - Combination filtering', async ({ page }) => {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const testStatus = 'Completed';
    const testVistaStatus = 'Confirmed';
    
    // Step 1: Navigate to Orders page (already in beforeEach)
    
    // Step 2: Click More Filter
    await page.click('[data-testid="more-filter-button"]');
    await page.waitForSelector('[data-testid="filter-modal"]');
    
    // Step 3: Select combination filter on date, status and vista status
    // Select start date
    await page.fill('[data-testid="filter-start-date"]', startDate);
    
    // Select end date
    await page.fill('[data-testid="filter-end-date"]', endDate);
    
    // Select status
    await page.selectOption('[data-testid="filter-status"]', testStatus);
    
    // Select vista status
    await page.selectOption('[data-testid="filter-vista-status"]', testVistaStatus);
    
    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Display correct items accordingly
    const searchResults = page.locator('tbody tr');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    
    // Verify all displayed orders satisfy ALL filter criteria
    const resultCount = await searchResults.count();
    for (let i = 0; i < resultCount; i++) {
      const row = searchResults.nth(i);
      
      // Verify status matches
      const statusCell = await row.locator('td').nth(5).textContent();
      expect(statusCell).toContain(testStatus);
      
      // Verify vista status matches
      const vistaStatusCell = await row.locator('td').nth(6).textContent();
      expect(vistaStatusCell).toContain(testVistaStatus);
      
      // Verify date is within range
      const dateCell = await row.locator('td').nth(7).textContent();
      const orderDate = new Date(dateCell || '');
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(orderDate.getTime()).toBeLessThanOrEqual(end.getTime());
    }
    
    // Verify all filters are applied (multiple filter indicators visible)
    await expect(page.locator('[data-testid="active-filter-indicator"]')).toBeVisible();
    await expect(page.locator(`text=${testStatus}`).first()).toBeVisible();
    await expect(page.locator(`text=${testVistaStatus}`).first()).toBeVisible();
  });
});
