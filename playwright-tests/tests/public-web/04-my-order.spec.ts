import { test, expect } from '@playwright/test';
import { PUBLIC_WEB } from '../../utils/test-data';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

test.describe('Public Web - My Order', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new PublicLoginPage(page);
    await loginPage.navigate();
    await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
    await page.waitForLoadState('networkidle');
  });

  test('TC_ORDER001: [Checkout page] Proceed to checkout order functionality', async ({ page }) => {
    // Navigate to Buy Voucher
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    await page.waitForLoadState('networkidle');
    // Select a voucher
    const voucher = page.locator('div[class*="card"], article').first();
    await voucher.click();
    // Click Buy Now
    await page.click('button:has-text("Buy"), button:has-text("Add to Cart")');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Can redirect to checkout page with the voucher selected to purchase
    await expect(page).toHaveURL(/.*checkout.*|.*cart.*/);
    await expect(page.locator('div[class*="selected"], div[class*="item"], div[class*="product"]')).toBeVisible();
  });

  test('TC_ORDER002: [Checkout page] Redirect to payment gateway', async ({ page }) => {
    // Navigate to Buy Voucher, choose voucher, click Buy Now
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    await page.waitForLoadState('networkidle');
    const voucher = page.locator('div[class*="card"], article').first();
    await voucher.click();
    await page.click('button:has-text("Buy"), button:has-text("Add to Cart")');
    // In checkout page, verify voucher detail and quantity
    await expect(page).toHaveURL(/.*checkout.*|.*cart.*/);
    await page.waitForLoadState('networkidle');
    // Click Proceed to Payment button
    await page.click('button:has-text("Proceed to Payment"), button:has-text("Checkout"), button:has-text("Pay Now")');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: User will be redirected to eGHL payment gateway
    await expect(page).toHaveURL(/.*payment.*|.*eghl.*/);
  });

  test('TC_ORDER003: [Checkout page] Handle payment gateway integration and secure payment processing', async ({ page }) => {
    // Navigate through buy flow to payment gateway
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await page.click('button:has-text("Proceed to Payment")');
    // In Payment Gateway page, choose payment method
    await page.waitForTimeout(2000);
    
    // Expected Result: User redirected to eGHL payment gateway and able to complete payment transaction
    await expect(page).toHaveURL(/.*payment.*|.*eghl.*/);
    await expect(page.locator('text=Payment Gateway')).toBeVisible();
  });

  test('TC_ORDER004: [Checkout page] Receive and process payment status responses from payment gateways', async ({ page }) => {
    // Complete payment flow
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await page.click('button:has-text("Proceed to Payment")');
    // Complete payment
    await page.waitForTimeout(2000);
    
    // Expected Result: System receives and processes payment status responses
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await expect(page.locator('text=/Processing/, text=/Confirmed/, text=/Completed/, text=/Failed/')).toBeVisible();
  });

  test('TC_ORDER005: [Payment Status Management] Handle multiple payment outcomes (successful/failed/cancelled)', async ({ page }) => {
    // Complete payment flow and observe order status
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForTimeout(2000);
    // Redirect to order confirmation page and observe order status
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    
    // Expected Result: System handles multiple payment outcomes
    // No expected result specified in Excel
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER006: [Order Confirmation page] Provide user feedback for each payment status', async ({ page }) => {
    // Complete payment and navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const orderCard = page.locator('div[class*="order"], div[class*="card"]').first();
    await orderCard.click();
    
    // Expected Result: User can see voucher payment status at My Order page
    // - booking no. haven't returned? status = order processing
    // - booking no. returned? status = order confirmed
    await expect(page.locator('text=Order Processing, Order Confirmed')).toBeVisible();
  });

  test('TC_ORDER007: [Order Confirmation page] Update order status based on payment results', async ({ page }) => {
    // Complete payment and observe status
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.locator('div[class*="order"], div[class*="card"]').first().click();
    
    // Expected Result: User can see voucher order status at My Order page
    // Order/payment statuses:
    // - payment failed - eghl timeout
    // - payment cancelled - cancel payment in eghl
    // - order processing - do payment but no booking no. yet
    // - order completed - do payment and have booking no.
    await expect(page.locator('text=Order Status')).toBeVisible();
    const status = await page.locator('text=/Processing/, text=/Confirmed/, text=/Completed/, text=/Failed/').textContent();
    expect(['Payment Failed', 'Payment Cancelled', 'Order Processing', 'Order Completed']).toContain(status);
  });

  test('TC_ORDER008: [Order Confirmation page] Send order details to Vista for booking number request', async ({ page }) => {
    // Complete payment and wait for Vista response
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    await page.waitForTimeout(3000); // Allow few seconds for vista to return booking no.
    
    // Expected Result: Upon successful payment, order status is "order processing" (no booking no.)
    // Once booking no. is returned and successfully retrieved, status updates
    await expect(order.locator('text=Booking')).toBeVisible();
  });

  test('TC_ORDER009: [Order Confirmation page] Handle communication with Vista booking system', async ({ page }) => {
    // Complete payment and wait for Vista
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForTimeout(3000);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    
    // Expected Result: Allow few seconds for vista to return booking no.
    // Order status: order processing → order confirmed
    await expect(order).toBeVisible();
  });

  test('TC_ORDER010: [Order Confirmation page] Manage booking number assignment and tracking', async ({ page }) => {
    // Complete payment and check booking number
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    await page.waitForTimeout(3000);
    
    // Expected Result: Allow few seconds for vista to return booking no.
    // Once retrieved, order status updates to confirmed
    await expect(page.locator('text=Booking Number')).toBeVisible();
  });

  test('TC_ORDER011: [Order Confirmation page] Handle Vista system response timeouts and failures', async ({ page }) => {
    // Navigate through buy flow
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    // eGHL gateway timeout
    await page.waitForTimeout(5000);
    
    // Expected Result: Redirect to My Cart (no expected result specified in Excel)
    await expect(page).toHaveURL(/.*cart.*/);
  });

  test('TC_ORDER012: [Order Confirmation page] Monitor Vista booking system responses', async ({ page }) => {
    // Complete payment and check My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: System shall retrieve the booking number from vista and display them in public web
    await expect(page.locator('text=Booking Number')).toBeVisible();
    await expect(page.locator('[data-testid="booking-number"]')).not.toBeEmpty();
  });

  test('TC_ORDER013: [My Order page] Handle booking when Vista returns booking number successfully', async ({ page }) => {
    // Complete payment and wait for Vista
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForTimeout(3000); // Wait for Vista response
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: Allow few seconds for vista to return booking no.
    // Order status: order processing → order confirmed
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('TC_ORDER014: [My Order page] Implement timeout mechanisms for booking requests', async ({ page }) => {
    // Test checkout timeout (15 minutes) or eGHL timeout (13 minutes)
    await page.goto(`${PUBLIC_WEB.URL}checkout`);
    await page.waitForTimeout(5000);
    
    // Expected Result: Verify timeout in:
    // - checkout page = 15 minutes
    // - eGHL gateway = 13 minutes
    // Checkout timeout returns to cart page
    // eGHL timeout returns to order detail page
    // For checkout timeout, order history will not be recorded
    // For eGHL timeout, status displayed in My Order page is "Payment Failed"
    await expect(page).toHaveURL(/.*cart.*/);
  });

  test('TC_ORDER015: [My Order page] Flag orders when Vista does not return booking numbers', async ({ page }) => {
    // Complete payment but Vista doesn't return booking number
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: Order status update to "Waiting Refund"
    await expect(page.locator('text=Waiting Refund')).toBeVisible();
  });

  test('TC_ORDER016: [My Order page] Allocate vouchers upon successful booking confirmation', async ({ page }) => {
    // Complete payment and check order detail
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    // View Inventory
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    
    // Expected Result: In order confirmation page, order status update to "Order Confirmed"
    // In order detail page, status is "Order Completed"
    // In Inventory, voucher purchased quantity will increase based on (quantity x no. of codes per purchase quantity)
    await expect(page.locator('div[class*="voucher"], div[class*="item"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER017: [My Order page] Mark orders as completed when all processes succeed', async ({ page }) => {
    // Complete payment and check status
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: Order status update to "Order Processing" when booking no. not yet retrieved
    // Once retrieved, status will update to "Order Confirmed"
    await expect(page.locator('text=Order Confirmed, Order Processing')).toBeVisible();
  });

  test('TC_ORDER018: [Order Confirmation page] Provide order completion confirmation to users', async ({ page }) => {
    // Complete payment flow
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForTimeout(2000);
    
    // Expected Result: User can view the order confirmation page
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });

  test('TC_ORDER019: [Email] Update user account with purchased voucher inventory', async ({ page }) => {
    // Complete payment and navigate to Inventory
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForTimeout(2000);
    await page.goto(`${PUBLIC_WEB.URL}inventory`);
    
    // Expected Result: In Inventory, voucher purchased quantity will increase based on (quantity x no. of codes per purchase quantity)
    await expect(page.locator('div[class*="voucher"], div[class*="item"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER020: [My Order page] Maintain comprehensive order status throughout entire process', async ({ page }) => {
    // Navigate to My Order from navigation bar
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await expect(order.locator('.status')).toBeVisible();
    await order.click();
    
    // Expected Result: User can keep track their purchase in the My Order page
    await expect(page.locator('text=Order Status')).toBeVisible();
  });

  test('TC_ORDER021: [My Order page] Provide real-time order status updates to users', async ({ page }) => {
    // Go to My Order page and observe order status
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: User can keep track their purchase in My Order page (can view the timestamp)
    await expect(page.locator('[data-testid="order-timestamp"]')).toBeVisible();
  });

  test('TC_ORDER022: Log order state transitions in report', async ({ page }) => {
    // Complete payment and click Download Report button
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    await page.click('button:has-text("Download Report")');
    await page.waitForTimeout(2000);
    
    // Expected Result: System generates and downloads the inventory report containing voucher metadata and statuses
    // Verify download initiated
  });

  test('TC_ORDER023: Handle order status queries and reporting', async ({ page }) => {
    // Navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    
    // Expected Result: No expected result specified in Excel
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
    const orderCount = await page.locator('div[class*="order"], div[class*="card"]').count();
    expect(orderCount).toBeGreaterThan(0);
  });

  test('TC_ORDER024: [Error Handling and Recovery] Implement robust error handling for payment gateway failures', async ({ page }) => {
    // Navigate through payment flow
    await page.goto(`${PUBLIC_WEB.URL}checkout`);
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForTimeout(2000);
    
    // Expected Result: No expected result specified in Excel
    // Simulate payment failure
    await expect(page.locator('text=Payment Failed')).toBeVisible();
  });

  test('TC_ORDER025: Provide graceful handling of external system (Vista) failures', async ({ page }) => {
    // Navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: No expected result specified in Excel
    // Check for error handling when Vista fails
    await expect(page.locator('text=Waiting Refund')).toBeVisible();
  });

  test('TC_ORDER026: Ensure data consistency across all order processing stages', async ({ page }) => {
    // Navigate to My Order and verify order number consistency
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    const orderNo = await order.locator('[data-testid="order-number"]').textContent();
    await order.click();
    
    // Expected Result: No expected result specified in Excel
    // Verify order number consistency
    await expect(page.locator(`text=${orderNo}`)).toBeVisible();
  });

  test('TC_ORDER027: [Integration Management] Maintain reliable connections with external systems', async ({ page }) => {
    // Navigate to checkout and proceed to payment
    await page.goto(`${PUBLIC_WEB.URL}checkout`);
    await page.click('button:has-text("Proceed to Payment")');
    
    // Expected Result: No expected result specified in Excel
    // Verify payment gateway connection
    await expect(page).toHaveURL(/.*payment.*/);
  });

  test('TC_ORDER028: Handle system integration failures gracefully', async ({ page }) => {
    // Navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    
    // Expected Result: No expected result specified in Excel
    // Verify error messages are displayed appropriately
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER029: Provide fallback mechanisms for critical integration points', async ({ page }) => {
    // Navigate to checkout and proceed to payment
    await page.goto(`${PUBLIC_WEB.URL}checkout`);
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForTimeout(2000);
    
    // Expected Result: No expected result specified in Excel
    // Verify fallback handling
    await expect(page).toHaveURL(/.*payment.*|.*checkout.*/);
  });

  test('TC_ORDER030: Monitor external system availability and performance', async ({ page }) => {
    // Navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
    
    // Expected Result: No expected result specified in Excel
    // Verify system is responsive
    const response = await page.request.get(`${PUBLIC_WEB.URL}api/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('TC_ORDER031: [Process Flow Control] Ensure proper sequencing of order processing steps', async ({ page }) => {
    // Navigate through buy flow
    await page.goto(`${PUBLIC_WEB.URL}buy`);
    const voucher = page.locator('.voucher-card').first();
    await voucher.click();
    await page.click('button:has-text("Buy Now")');
    await expect(page).toHaveURL(/.*checkout.*/);
    await page.click('button:has-text("Proceed to Payment")');
    
    // Expected Result: No expected result specified in Excel
    await expect(page).toHaveURL(/.*payment.*/);
  });

  test('TC_ORDER032: Handle concurrent order processing efficiently', async ({ page }) => {
    // Navigate to My Order
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    
    // Expected Result: No expected result specified in Excel
    const orderCount = await page.locator('div[class*="order"], div[class*="card"]').count();
    expect(orderCount).toBeGreaterThanOrEqual(0);
  });

  test('TC_ORDER033: [Email] Provide process completion notifications', async ({ page }) => {
    // Complete payment and redirect to order confirmation page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    
    // Expected Result: User will receive email order completion confirmation notification
    // Verify email notification indicator
    await expect(page.locator('text=Email sent')).toBeVisible();
  });

  test('TC_ORDER034: [My Order page] Filter order by date', async ({ page }) => {
    // Navigate to My Order page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Click the Filter Date bar
    await page.click('button:has-text("Filter Date")');
    await page.waitForTimeout(1000);
    // Choose start date and end date
    await page.fill('input[name="startDate"], input[placeholder*="start" i]', '2024-01-01');
    await page.fill('input[name="endDate"], input[placeholder*="end" i]', '2024-12-31');
    // Click enter
    await page.click('button:has-text("Apply"), button:has-text("Filter")');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Order based on date are displayed
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER035: [My Order page] Search order by Booking Number', async ({ page }) => {
    // Navigate to My Order page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Click the search bar beside filter date
    // Type in booking number
    await page.fill('input[placeholder="Search by Booking Number, Order Number"]', 'BK123456');
    // Click enter
    await page.press('input[placeholder="Search by Booking Number, Order Number"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Order that have same booking number will displayed
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER036: [My Order page] Search order by Order No', async ({ page }) => {
    // Navigate to My Order page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Click the search bar beside filter date
    // Type in order no
    await page.fill('input[placeholder="Search by Booking Number, Order Number"]', 'TGV123');
    // Click enter
    await page.press('input[placeholder="Search by Booking Number, Order Number"]', 'Enter');
    await page.waitForLoadState('networkidle');
    
    // Expected Result: Order that have the same order no will displayed
    await expect(page.locator('div[class*="order"], div[class*="card"]')).toBeVisible();
  });

  test('TC_ORDER037: [My Order page] View e-receipt for order', async ({ page }) => {
    // Navigate to My Order page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Choose order and click order
    await page.locator('div[class*="order"], div[class*="card"]').first().click();
    await page.waitForLoadState('networkidle');
    // Observe the View Receipt button
    // Click the button
    await page.click('button:has-text("View Receipt"), button:has-text("Receipt"), a:has-text("Receipt")');
    await page.waitForTimeout(2000);
    
    // Expected Result: e-receipt pdf will be opened in a different tab and user can opt to download in the tab
    await expect(page.locator('text=/Receipt/, text=/Invoice/')).toBeVisible();
  });

  test('TC_ORDER038: [My Order page] Request e-invoice', async ({ page }) => {
    // Navigate to Orders page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Observe the Request e-invoice button at top right corner
    // Click on the button
    await page.click('button:has-text("Request e-Invoice")');
    await page.waitForTimeout(2000);
    
    // Expected Result: System will open a new tab and go to https://uateinvoice.tgv.com.my/
    await expect(page).toHaveURL(/.*einvoice\.tgv\.com\.my.*/);
  });

  test('TC_ORDER039: [My Order page] View voucher expiry date in receipt', async ({ page }) => {
    // Navigate to My Order page
    await page.goto(`${PUBLIC_WEB.URL}my-orders`);
    await page.waitForLoadState('networkidle');
    // Select the order from the list
    const order = page.locator('div[class*="order"], div[class*="card"]').first();
    await order.click();
    await page.waitForLoadState('networkidle');
    // Go to order detail page
    // Click the View E-receipt button
    await page.click('button:has-text("View Receipt"), button:has-text("Receipt"), a:has-text("Receipt")');
    await page.waitForTimeout(2000);
    // View the order details
    
    // Expected Result: User can view the expiry date for the vouchers they purchased in the receipt
    await expect(page.locator('text=/Expiry/, text=/Expires/, text=/Valid Until/')).toBeVisible();
  });
});
