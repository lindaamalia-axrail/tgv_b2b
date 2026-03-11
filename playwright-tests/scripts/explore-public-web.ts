import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';
import * as fs from 'fs';

async function explorePublicWeb() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allSelectors: any = {
    pages: {}
  };

  try {
    console.log('=== EXPLORING PUBLIC WEB PORTAL ===\n');

    // 1. LOGIN PAGE
    console.log('1. LOGIN PAGE');
    await page.goto(PUBLIC_WEB.URL);
    await page.waitForLoadState('networkidle');

    allSelectors.pages.login = {
      url: page.url(),
      elements: {
        emailInput: await findSelector(page, ['#email', 'input[name="email"]', 'input[type="email"]']),
        passwordInput: await findSelector(page, ['#password', 'input[name="password"]', 'input[type="password"]']),
        submitButton: await findSelector(page, ['button[type="submit"]', 'button:has-text("Login")', 'button:has-text("Sign In")']),
        signUpLink: await findSelector(page, ['a:has-text("Sign Up")', 'a:has-text("Register")', 'a[href*="signup"]'])
      }
    };

    // Perform login
    console.log('Logging in...');
    await page.fill(allSelectors.pages.login.elements.emailInput, PUBLIC_WEB.EXISTING_USER.email);
    await page.fill(allSelectors.pages.login.elements.passwordInput, PUBLIC_WEB.EXISTING_USER.password);
    await page.click(allSelectors.pages.login.elements.submitButton);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 2. HOME PAGE (after login)
    console.log('\n2. HOME PAGE');
    allSelectors.pages.home = {
      url: page.url(),
      elements: {
        navigation: await extractNavigation(page),
        buyVoucherButton: await findSelector(page, ['button:has-text("Buy Voucher")', 'a:has-text("Buy Voucher")', '[href*="voucher"]']),
        cartIcon: await findSelector(page, ['.cart-icon', '[aria-label*="cart" i]', 'button:has(svg):has-text("cart")']),
        userMenu: await findSelector(page, ['.user-menu', '[aria-label*="user" i]', 'button:has-text("' + PUBLIC_WEB.EXISTING_USER.email.split('@')[0] + '")'])
      }
    };

    // 3. VOUCHER LISTING PAGE
    console.log('\n3. VOUCHER LISTING PAGE');
    const buyVoucherBtn = allSelectors.pages.home.elements.buyVoucherButton;
    if (buyVoucherBtn) {
      await page.click(buyVoucherBtn);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.voucherListing = {
        url: page.url(),
        elements: {
          searchInput: await findSelector(page, ['input[placeholder*="Search" i]', 'input[type="search"]', '#search']),
          categoryFilter: await findSelector(page, ['select[name="category"]', '.category-filter', '[aria-label*="category" i]']),
          voucherCards: await extractVoucherCards(page),
          pagination: await extractPagination(page)
        }
      };

      // Click first voucher to see detail page
      if (allSelectors.pages.voucherListing.elements.voucherCards.cardSelector) {
        console.log('\n4. VOUCHER DETAIL PAGE');
        await page.locator(allSelectors.pages.voucherListing.elements.voucherCards.cardSelector).first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        allSelectors.pages.voucherDetail = {
          url: page.url(),
          elements: {
            title: await findSelector(page, ['h1', '.voucher-title', '.product-title']),
            price: await findSelector(page, ['.price', '.voucher-price', '[class*="price"]']),
            description: await findSelector(page, ['.description', '.voucher-description', 'p']),
            quantityInput: await findSelector(page, ['input[type="number"]', 'input[name="quantity"]', '.quantity-input']),
            increaseQtyBtn: await findSelector(page, ['button:has-text("+")', '.increase-qty', '[aria-label*="increase" i]']),
            decreaseQtyBtn: await findSelector(page, ['button:has-text("-")', '.decrease-qty', '[aria-label*="decrease" i]']),
            addToCartBtn: await findSelector(page, ['button:has-text("Add to Cart")', '.add-to-cart', '[aria-label*="add to cart" i]']),
            buyNowBtn: await findSelector(page, ['button:has-text("Buy Now")', '.buy-now', '[aria-label*="buy now" i]']),
            backBtn: await findSelector(page, ['button:has-text("Back")', 'a:has-text("Back")', '[aria-label*="back" i]'])
          }
        };

        // Go back to listing
        await page.goBack();
        await page.waitForLoadState('networkidle');
      }
    }

    // 5. CART PAGE
    console.log('\n5. CART PAGE');
    const cartIcon = allSelectors.pages.home.elements.cartIcon;
    if (cartIcon) {
      await page.click(cartIcon);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.cart = {
        url: page.url(),
        elements: {
          cartItems: await extractCartItems(page),
          subtotal: await findSelector(page, ['.subtotal', '[class*="subtotal"]', 'text=Subtotal']),
          total: await findSelector(page, ['.total', '[class*="total"]', 'text=Total']),
          checkoutBtn: await findSelector(page, ['button:has-text("Checkout")', 'button:has-text("Proceed")', '.checkout-btn']),
          continueShoppingBtn: await findSelector(page, ['button:has-text("Continue Shopping")', 'a:has-text("Continue Shopping")'])
        }
      };
    }

    // 6. MY ORDERS PAGE
    console.log('\n6. MY ORDERS PAGE');
    const myOrdersLink = await findSelector(page, ['a:has-text("My Order")', 'a:has-text("Orders")', '[href*="order"]']);
    if (myOrdersLink) {
      await page.click(myOrdersLink);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.myOrders = {
        url: page.url(),
        elements: {
          orderTable: await extractOrderTable(page),
          filterStatus: await findSelector(page, ['select[name="status"]', '.status-filter', '[aria-label*="status" i]']),
          searchOrder: await findSelector(page, ['input[placeholder*="Search" i]', 'input[name="search"]'])
        }
      };
    }

    // Save results
    const output = JSON.stringify(allSelectors, null, 2);
    fs.writeFileSync('playwright-tests/public-web-selectors.json', output);
    
    console.log('\n=== RESULTS SAVED ===');
    console.log('File: playwright-tests/public-web-selectors.json');
    console.log('\n' + output);

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

// Helper functions
async function findSelector(page: any, selectors: string[]): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`  ✓ Found: ${selector}`);
        return selector;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  console.log(`  ✗ Not found: ${selectors.join(', ')}`);
  return null;
}

async function extractNavigation(page: any) {
  const navItems = await page.locator('nav a, header a').allTextContents().catch(() => []);
  return {
    items: navItems.filter((text: string) => text.trim().length > 0),
    selector: 'nav a, header a'
  };
}

async function extractVoucherCards(page: any) {
  const possibleSelectors = [
    '.voucher-card',
    '.product-card',
    '[class*="card"]',
    '[role="article"]',
    '.MuiCard-root'
  ];

  for (const selector of possibleSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      const firstCard = page.locator(selector).first();
      const title = await firstCard.locator('h1, h2, h3, h4, .title, [class*="title"]').textContent().catch(() => null);
      const price = await firstCard.locator('.price, [class*="price"]').textContent().catch(() => null);
      
      return {
        cardSelector: selector,
        count: count,
        sampleTitle: title,
        samplePrice: price,
        titleSelector: 'h1, h2, h3, h4, .title, [class*="title"]',
        priceSelector: '.price, [class*="price"]'
      };
    }
  }
  return { cardSelector: null, count: 0 };
}

async function extractPagination(page: any) {
  const hasPagination = await page.locator('[aria-label*="pagination" i], .pagination').isVisible().catch(() => false);
  if (hasPagination) {
    return {
      selector: '[aria-label*="pagination" i], .pagination',
      nextBtn: 'button:has-text("Next"), [aria-label*="next" i]',
      prevBtn: 'button:has-text("Previous"), [aria-label*="previous" i]'
    };
  }
  return null;
}

async function extractCartItems(page: any) {
  const possibleSelectors = [
    '.cart-item',
    '.cart-product',
    '[class*="cart-item"]',
    '[role="listitem"]'
  ];

  for (const selector of possibleSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      return {
        itemSelector: selector,
        count: count,
        removeBtn: 'button:has-text("Remove"), [aria-label*="remove" i]',
        quantityInput: 'input[type="number"]'
      };
    }
  }
  return { itemSelector: null, count: 0 };
}

async function extractOrderTable(page: any) {
  // Check for standard table
  const hasTable = await page.locator('table').isVisible().catch(() => false);
  if (hasTable) {
    const headers = await page.locator('table th').allTextContents();
    return {
      type: 'standard',
      selector: 'table',
      headers: headers,
      rowSelector: 'table tbody tr'
    };
  }

  // Check for MUI table
  const hasMuiTable = await page.locator('[role="table"]').isVisible().catch(() => false);
  if (hasMuiTable) {
    const headers = await page.locator('[role="columnheader"]').allTextContents();
    return {
      type: 'mui',
      selector: '[role="table"]',
      headers: headers,
      rowSelector: '[role="row"]:not(:first-child)'
    };
  }

  return null;
}

explorePublicWeb();
