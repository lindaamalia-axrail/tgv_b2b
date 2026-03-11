import { test, expect, Page } from '@playwright/test';
import { ADMIN_PORTAL } from '../../utils/test-data';
import { AdminLoginPage } from '../../pages/admin-portal/LoginPage';

test.describe.configure({ mode: 'serial' });

test.describe('Admin Portal - Content Management', () => {
  let authenticatedPage: Page;

  // Login ONCE before all tests in this file
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    authenticatedPage = await context.newPage();
    
    // Perform actual login
    const loginPage = new AdminLoginPage(authenticatedPage);
    await loginPage.navigate();
    
    console.log('Attempting login with:', ADMIN_PORTAL.CREDENTIALS.email);
    await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
    
    // Verify we're logged in by checking the URL
    const currentUrl = authenticatedPage.url();
    console.log('After login, current URL:', currentUrl);
    
    if (currentUrl.includes('login')) {
      throw new Error('Login failed - still on login page');
    }
    
    await loginPage.verifyLoginSuccess();
    
    // Wait for auth to be applied
    await authenticatedPage.waitForTimeout(2000);
    
    console.log('✓ Authentication completed once for all tests in this file');
  });

  // Close the page after all tests
  test.afterAll(async () => {
    await authenticatedPage?.close();
  });

  // Helper function to navigate to Homepage Carousel
  async function navigateToHomepageCarousel() {
    // Navigate directly to content management homepage
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/content-management/homepage'));
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  // Helper function to navigate to Category page (Product Category tab)
  async function navigateToCategory() {
    // Navigate directly to content management homepage
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/content-management/homepage'));
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
    
    // Click Product Category tab
    await authenticatedPage.getByRole('tab', { name: 'Product Category' }).click();
    await authenticatedPage.waitForTimeout(1000);
  }

  // Helper function to navigate to Popular Search
  async function navigateToPopularSearch() {
    // Navigate directly to content management popular search
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/content-management/popular-search'));
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
  }

  // Helper function to navigate to Highlights
  async function navigateToHighlights() {
    // Navigate directly to content management homepage
    await authenticatedPage.goto(ADMIN_PORTAL.URL.replace('/login', '/content-management/homepage'));
    await authenticatedPage.waitForLoadState('networkidle');
    await authenticatedPage.waitForTimeout(1000);
    
    // Click Highlights tab
    await authenticatedPage.getByRole('tab', { name: 'Highlights' }).click();
    await authenticatedPage.waitForTimeout(1000);
  }

  // Homepage Carousel Tests
  test('TC_CMS001: Content Management page (Homepage Carousel) - Validate Homepage Carousel Information', async () => {
    await navigateToHomepageCarousel();
    
    // Expected Result: Table listing have complete header and display correct information
    await expect(authenticatedPage.locator('[role="grid"]').first()).toBeVisible({ timeout: 15000 });
    await expect(authenticatedPage.getByRole('columnheader', { name: 'HomePage Carousel Title' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Start Date' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'End Date' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Last Update' })).toBeVisible();
    await expect(authenticatedPage.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('TC_CMS002: Content Management page (Homepage Carousel) - Create homepage carousel', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.getByRole('button', { name: 'Add HomePage Carousel' }).click();
    await authenticatedPage.waitForTimeout(1000);
    
    // Upload image first
    const fileInput = authenticatedPage.locator('input[type="file"]');
    await fileInput.setInputFiles('test-data/carousel-image.jpg');
    await authenticatedPage.waitForTimeout(1000);
    
    // Fill form fields
    await authenticatedPage.getByRole('textbox').nth(1).fill('Test Carousel');
    
    // Set dates (start and end date)
    // The dates are already set to today by default, so we can skip this
    
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    await authenticatedPage.waitForTimeout(2000);
    
    // Expected Result: Homepage carousel successfully created and displayed in homepage carousel listings
    // Check if we're back on the listing page
    await expect(authenticatedPage.getByRole('button', { name: 'Add HomePage Carousel' })).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.locator('text=Test Carousel')).toBeVisible();
  });

  test('TC_CMS003: Content Management page (Homepage Carousel) - Create carousel with empty fields', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.getByRole('button', { name: 'Add HomePage Carousel' }).click();
    await authenticatedPage.waitForTimeout(1000);
    await authenticatedPage.getByRole('button', { name: 'Save Changes' }).click();
    
    // Expected Result: Homepage carousel creation failed. User stays in Add homepage carousel page and prompted to fill in the details
    await expect(authenticatedPage.locator('text=required')).toBeVisible();
    await expect(authenticatedPage).toHaveURL(/add|details/);
  });

  test('TC_CMS004: Content Management page (Homepage Carousel) - Upload carousel image 800x800', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('button:has-text("Add")');
    await authenticatedPage.fill('input[name="name"]', 'Test Carousel 800x800');
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/image-800x800.jpg');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: New voucher successfully created and will be displayed/listed in the voucher list. Public web reflect the image by default its fit according to its size
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Test Carousel 800x800')).toBeVisible();
  });

  test('TC_CMS005: Content Management page (Homepage Carousel) - Upload carousel image 1080x600', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('button:has-text("Add")');
    await authenticatedPage.fill('input[name="name"]', 'Test Carousel 1080x600');
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/image-1080x600.jpg');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: New voucher successfully created and will be displayed/listed in the voucher list. Public web reflect the image by default its fit according to its size
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Test Carousel 1080x600')).toBeVisible();
  });

  test('TC_CMS006: Content Management page (Homepage Carousel) - Update homepage carousel', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="name"]', 'Updated Carousel');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Table listing updated according to the changes. Public Web reflected the changes
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Updated Carousel')).toBeVisible();
  });

  test('TC_CMS007: Content Management page (Homepage Carousel) - Set carousel status as inactive', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Homepage carousel status will change from active to inactive. In public web, homepage carousel will not be displayed
    await expect(authenticatedPage.locator('text=Inactive')).toBeVisible();
  });

  test('TC_CMS008: Content Management page (Homepage Carousel) - Activate expired carousel', async () => {
    await navigateToHomepageCarousel();
    const expiredCarousel = authenticatedPage.locator('tr:has-text("Expired")').first();
    await expiredCarousel.locator('button[aria-label="Edit"]').click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Homepage carousel status toggle will revert back to inactive since the carousel is expired
    await expect(authenticatedPage.locator('text=cannot activate expired')).toBeVisible();
    await expect(authenticatedPage.locator('text=Inactive')).toBeVisible();
  });

  test('TC_CMS009: Content Management page (Homepage Carousel) - Edit carousel details', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="name"]', 'Edited Carousel Name');
    await authenticatedPage.fill('input[name="url"]', 'https://example.com');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Homepage carousel details edited and changes saved successfully
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Edited Carousel Name')).toBeVisible();
  });

  test('TC_CMS010: Content Management page (Homepage Carousel) - Change carousel dates valid', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-01-01');
    await authenticatedPage.fill('input[name="endDate"]', '2024-12-31');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Start date and end date changes and save/updated successfully
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });

  test('TC_CMS011: Content Management page (Homepage Carousel) - Change carousel dates invalid', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-12-31');
    await authenticatedPage.fill('input[name="endDate"]', '2024-01-01');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Update unsuccessful. Will have error message: "Start date cannot be later than end date" or "End date cannot be earlier than start date"
    await expect(authenticatedPage.locator('text=Start date cannot be later')).toBeVisible();
  });

  test('TC_CMS012: Content Management page (Homepage Carousel) - Rearrange carousel sequence', async () => {
    await navigateToHomepageCarousel();
    
    // Get first and second carousel items
    const firstItem = authenticatedPage.locator('tr[draggable="true"]').first();
    const secondItem = authenticatedPage.locator('tr[draggable="true"]').nth(1);
    
    // Drag and drop
    await firstItem.dragTo(secondItem);
    await authenticatedPage.waitForTimeout(1000);
    
    // Expected Result: The position changes and new sequence reflects on public web
    await expect(authenticatedPage.locator('text=Sequence updated')).toBeVisible();
  });

  test('TC_CMS013: Content Management page (Homepage Carousel) - Delete carousel', async () => {
    await navigateToHomepageCarousel();
    const carouselName = await authenticatedPage.locator('tr').first().locator('td').first().textContent();
    await authenticatedPage.locator('button[aria-label="Delete"]').first().click();
    await authenticatedPage.click('button:has-text("Confirm")');
    
    // Expected Result: Homepage carousel successfully deleted and no longer in the homepage carousel listings
    await expect(authenticatedPage.locator('text=Deleted successfully')).toBeVisible();
    await expect(authenticatedPage.locator(`text=${carouselName}`)).not.toBeVisible();
  });

  // Category Tests
  test('TC_CMS014: Content Management page (Category) - Validate Category Information', async () => {
    await navigateToCategory();
    
    // Expected Result: Table listing have complete header and display correct information
    await expect(authenticatedPage.locator('[role="grid"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Category Name")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Start Date")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("End Date")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Status")')).toBeVisible();
  });

  test('TC_CMS015: Content Management page (Category) - Create category', async () => {
    await navigateToCategory();
    await authenticatedPage.getByRole('button', { name: 'Add Product Category' }).click();
    await authenticatedPage.waitForTimeout(1000);
    
    const titleInput = authenticatedPage.getByRole('textbox').first();
    await titleInput.fill('Test Category');
    
    const descriptionInput = authenticatedPage.locator('textarea').first();
    await descriptionInput.fill('Test Description');
    
    await authenticatedPage.getByRole('button', { name: /Save/i }).click();
    
    // Expected Result: Product category created successfully and will be displayed in both category page and homepage (product category tab)
    await expect(authenticatedPage.locator('text=Success')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.locator('text=Test Category')).toBeVisible();
  });

  test('TC_CMS016: Content Management page (Category) - Update category', async () => {
    await navigateToCategory();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="title"]', 'Updated Category');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Table listing updated according to the changes. Public Web reflected the changes
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Updated Category')).toBeVisible();
  });

  test('TC_CMS017: Content Management page (Category) - Change category dates valid', async () => {
    await navigateToCategory();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-01-01');
    await authenticatedPage.fill('input[name="endDate"]', '2024-12-31');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Start date and end date changes and save/updated successfully
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });

  test('TC_CMS018: Content Management page (Category) - Change category dates invalid', async () => {
    await navigateToCategory();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-12-31');
    await authenticatedPage.fill('input[name="endDate"]', '2024-01-01');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Update unsuccessful. Will have error message: "Start date cannot be later than end date" or "End date cannot be earlier than start date"
    await expect(authenticatedPage.locator('text=Start date cannot be later')).toBeVisible();
  });

  test('TC_CMS019: Content Management page (Category) - Set category status to inactive', async () => {
    await navigateToCategory();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Category status changes to inactive and will not displayed in public web
    await expect(authenticatedPage.locator('text=Inactive')).toBeVisible();
  });

  test('TC_CMS020: Content Management page (Category) - Activate category status', async () => {
    await navigateToCategory();
    await authenticatedPage.locator('tr:has-text("Inactive")').first().locator('button[aria-label="Edit"]').click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Category status changes to active and able to be displayed in public web
    await expect(authenticatedPage.locator('text=Active')).toBeVisible();
  });

  test('TC_CMS021: Content Management page (Category) - Rearrange category sequence', async () => {
    await navigateToCategory();
    
    // Get first and second category items
    const firstItem = authenticatedPage.locator('tr[draggable="true"]').first();
    const secondItem = authenticatedPage.locator('tr[draggable="true"]').nth(1);
    
    // Drag and drop
    await firstItem.dragTo(secondItem);
    await authenticatedPage.waitForTimeout(1000);
    
    // Expected Result: The position changes and new sequence reflects on public web
    await expect(authenticatedPage.locator('text=Sequence updated')).toBeVisible();
  });

  test('TC_CMS022: Content Management page (Category) - Delete category', async () => {
    await navigateToCategory();
    const categoryName = await authenticatedPage.locator('tr').first().locator('td').first().textContent();
    await authenticatedPage.locator('button[aria-label="Delete"]').first().click();
    await authenticatedPage.click('button:has-text("Confirm")');
    
    // Expected Result: Product category deleted successfully and if active, it will no longer displayed in public web
    await expect(authenticatedPage.locator('text=Deleted successfully')).toBeVisible();
    await expect(authenticatedPage.locator(`text=${categoryName}`)).not.toBeVisible();
  });

  // Highlights Tests
  test('TC_CMS023: Content Management page (Highlights) - Validate Highlights Information', async () => {
    await navigateToHighlights();
    
    // Expected Result: Table listing have complete header and display correct information
    await expect(authenticatedPage.locator('[role="grid"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Highlight Title")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Position")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Start Date")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("End Date")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Status")').or(authenticatedPage.locator('columnheader:has-text("Last Update")'))).toBeVisible();
  });

  test('TC_CMS024: Content Management page (Highlights) - Create highlights', async () => {
    await navigateToHighlights();
    await authenticatedPage.getByRole('button', { name: 'Add Highlight' }).click();
    await authenticatedPage.waitForTimeout(1000);
    
    const nameInput = authenticatedPage.getByRole('textbox').first();
    await nameInput.fill('Test Highlight');
    
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/highlight-image.jpg');
    await authenticatedPage.getByRole('button', { name: /Save/i }).click();
    
    // Expected Result: New highlights added and displayed in the listings
    await expect(authenticatedPage.locator('text=Success')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.locator('text=Test Highlight')).toBeVisible();
  });

  test('TC_CMS025: Content Management page (Highlights) - Create highlights with 800x800 image', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.click('button:has-text("Add")');
    await authenticatedPage.fill('input[name="name"]', 'Test Highlight 800x800');
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/image-800x800.jpg');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: New item successfully created and will be displayed/listed in the item list. Public web reflect the image by default its fit according to its size
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Test Highlight 800x800')).toBeVisible();
  });

  test('TC_CMS026: Content Management page (Highlights) - Update highlights', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="name"]', 'Updated Highlight');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Table listing updated according to the changes. Public Web reflected the changes
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Updated Highlight')).toBeVisible();
  });

  test('TC_CMS027: Content Management page (Highlights) - Create highlights with 1080x60 image', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.click('button:has-text("Add")');
    await authenticatedPage.fill('input[name="name"]', 'Test Highlight 1080x60');
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/image-1080x60.jpg');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: New item successfully created and will be displayed/listed in the item list. Public web reflect the image by default its fit according to its size
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Test Highlight 1080x60')).toBeVisible();
  });

  test('TC_CMS028: Content Management page (Highlights) - Set 2 highlights position as Top', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    
    // Set first highlight to Top
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.selectOption('select[name="position"]', 'Top');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Set second highlight to Top
    await authenticatedPage.locator('button[aria-label="Edit"]').nth(1).click();
    await authenticatedPage.selectOption('select[name="position"]', 'Top');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Only one highlights selected to fill in the position. Priority: 1. latest start date (same start date?) 2. latest last update
    await expect(authenticatedPage.locator('text=Only one highlight can occupy this position')).toBeVisible();
  });

  test('TC_CMS029: Content Management page (Highlights) - Set 2 highlights position as Bottom Left', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    
    // Set first highlight to Bottom Left
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.selectOption('select[name="position"]', 'Bottom Left');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Set second highlight to Bottom Left
    await authenticatedPage.locator('button[aria-label="Edit"]').nth(1).click();
    await authenticatedPage.selectOption('select[name="position"]', 'Bottom Left');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Only one highlights selected to fill in the position. Priority: 1. latest start date (same start date?) 2. latest last update
    await expect(authenticatedPage.locator('text=Only one highlight can occupy this position')).toBeVisible();
  });

  test('TC_CMS030: Content Management page (Highlights) - Set 2 highlights position as Bottom Right', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    
    // Set first highlight to Bottom Right
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.selectOption('select[name="position"]', 'Bottom Right');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Set second highlight to Bottom Right
    await authenticatedPage.locator('button[aria-label="Edit"]').nth(1).click();
    await authenticatedPage.selectOption('select[name="position"]', 'Bottom Right');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Only one highlights selected to fill in the position. Priority: 1. latest start date (same start date?) 2. latest last update
    await expect(authenticatedPage.locator('text=Only one highlight can occupy this position')).toBeVisible();
  });

  test('TC_CMS031: Content Management page (Highlights) - Change highlights dates valid', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-01-01');
    await authenticatedPage.fill('input[name="endDate"]', '2024-12-31');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Start date and end date changes and save/updated successfully
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });

  test('TC_CMS032: Content Management page (Highlights) - Change highlights dates invalid', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="startDate"]', '2024-12-31');
    await authenticatedPage.fill('input[name="endDate"]', '2024-01-01');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Update unsuccessful. Will have error message: "Start date cannot be later than end date" or "End date cannot be earlier than start date"
    await expect(authenticatedPage.locator('text=Start date cannot be later')).toBeVisible();
  });

  test('TC_CMS033: Content Management page (Highlights) - Change highlights image', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    
    // Remove current image
    await authenticatedPage.click('button:has-text("Remove")');
    
    // Upload new image
    await authenticatedPage.setInputFiles('input[type="file"]', 'test-data/new-highlight-image.jpg');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Image changes and reflected in public web
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });

  test('TC_CMS034: Content Management page (Highlights) - Edit highlights direct URL', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="url"]', 'https://new-url.com');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Direct url successfully changes and upon clicking the highlights in public web, will be redirected to the new url
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
  });

  test('TC_CMS035: Content Management page (Highlights) - Delete highlights', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    const highlightName = await authenticatedPage.locator('tr').first().locator('td').first().textContent();
    await authenticatedPage.locator('button[aria-label="Delete"]').first().click();
    await authenticatedPage.click('button:has-text("Confirm")');
    
    // Expected Result: Highlights deleted successfully and no longer in the listings
    await expect(authenticatedPage.locator('text=Deleted successfully')).toBeVisible();
    await expect(authenticatedPage.locator(`text=${highlightName}`)).not.toBeVisible();
  });

  test('TC_CMS036: Content Management page (Highlights) - Edit highlights name', async () => {
    await navigateToHomepageCarousel();
    await authenticatedPage.click('text=Highlights');
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="name"]', 'Newly Edited Highlight Name');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Newly edited highlights name will be reflected in public web
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Newly Edited Highlight Name')).toBeVisible();
  });

  // Popular Search Tests
  test('TC_CMS037: Content Management page (Popular Search) - Validate Popular Search Information', async () => {
    await navigateToPopularSearch();
    
    // Expected Result: Table listing have complete header and display correct information
    await expect(authenticatedPage.locator('[role="grid"]').first()).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Title")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Status")')).toBeVisible();
    await expect(authenticatedPage.locator('columnheader:has-text("Last Update")').or(authenticatedPage.locator('columnheader:has-text("Sequence")'))).toBeVisible();
  });

  test('TC_CMS038: Content Management page (Popular Search) - Create popular search', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.getByRole('button', { name: 'Add' }).click();
    await authenticatedPage.waitForTimeout(1000);
    
    const keywordInput = authenticatedPage.getByRole('textbox').first();
    await keywordInput.fill('Movie Pass');
    
    await authenticatedPage.getByRole('button', { name: /Save/i }).click();
    
    // Expected Result: New popular search created successfully and listed in the listings
    await expect(authenticatedPage.locator('text=Success')).toBeVisible({ timeout: 10000 });
    await expect(authenticatedPage.locator('text=Movie Pass')).toBeVisible();
  });

  test('TC_CMS039: Content Management page (Popular Search) - Update popular search', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.fill('input[name="keyword"]', 'Updated Keyword');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Table listing updated according to the changes. Public Web reflected the changes
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator('text=Updated Keyword')).toBeVisible();
  });

  test('TC_CMS040: Content Management page (Popular Search) - Edit popular search', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    const currentKeyword = await authenticatedPage.locator('input[name="keyword"]').inputValue();
    await authenticatedPage.fill('input[name="keyword"]', currentKeyword + ' Edited');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Popular search word edited successfully
    await expect(authenticatedPage.locator('text=Success')).toBeVisible();
    await expect(authenticatedPage.locator(`text=${currentKeyword} Edited`)).toBeVisible();
  });

  test('TC_CMS041: Content Management page (Popular Search) - Set popular search as inactive', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.locator('button[aria-label="Edit"]').first().click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Popular search status becomes inactive and not displayed in public web
    await expect(authenticatedPage.locator('text=Inactive')).toBeVisible();
  });

  test('TC_CMS042: Content Management page (Popular Search) - Activate popular search', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.locator('tr:has-text("Inactive")').first().locator('button[aria-label="Edit"]').click();
    await authenticatedPage.click('input[type="checkbox"][name="active"]');
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: Popular search status becomes active and display in public web
    await expect(authenticatedPage.locator('text=Active')).toBeVisible();
  });

  test('TC_CMS043: Content Management page (Popular Search) - Rearrange popular search sequence', async () => {
    await navigateToPopularSearch();
    await authenticatedPage.click('button:has-text("Manage Display Sequence")');
    
    // Get first and second items
    const firstItem = authenticatedPage.locator('tr[draggable="true"]').first();
    const secondItem = authenticatedPage.locator('tr[draggable="true"]').nth(1);
    
    // Drag and drop
    await firstItem.dragTo(secondItem);
    await authenticatedPage.click('button:has-text("Save")');
    
    // Expected Result: The position changes and new sequence reflects on public web
    await expect(authenticatedPage.locator('text=Sequence updated')).toBeVisible();
  });

  test('TC_CMS044: Content Management page (Popular Search) - Delete popular search', async () => {
    await navigateToPopularSearch();
    const keywordName = await authenticatedPage.locator('tr').first().locator('td').first().textContent();
    await authenticatedPage.locator('button[aria-label="Delete"]').first().click();
    await authenticatedPage.click('button:has-text("Confirm")');
    
    // Expected Result: Popular search deleted successfully
    await expect(authenticatedPage.locator('text=Deleted successfully')).toBeVisible();
    await expect(authenticatedPage.locator(`text=${keywordName}`)).not.toBeVisible();
  });
});
