import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';
import * as fs from 'fs';

async function explorePublicWebComplete() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allSelectors: any = {
    pages: {}
  };

  try {
    console.log('=== EXPLORING PUBLIC WEB PORTAL ===\n');

    // 1. HOME PAGE (before login)
    console.log('1. HOME PAGE (Before Login)');
    await page.goto(PUBLIC_WEB.URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    allSelectors.pages.homeBeforeLogin = {
      url: page.url(),
      elements: {
        signInLink: 'a:has-text("Sign In")',
        buyVoucherLink: 'a:has-text("Buy Voucher")',
        sendVoucherLink: 'a:has-text("Send Voucher")',
        voucherCards: await extractVoucherCards(page)
      }
    };

    // 2. LOGIN PAGE
    console.log('\n2. LOGIN PAGE');
    await page.click('a:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Current URL:', page.url());

    // Find login form elements
    const emailInput = await findInputSelector(page, ['email', 'Email', 'username']);
    const passwordInput = await findInputSelector(page, ['password', 'Password']);
    const submitButton = await findButtonSelector(page, ['Sign In', 'Login', 'Submit']);

    allSelectors.pages.login = {
      url: page.url(),
      elements: {
        emailInput: emailInput,
        passwordInput: passwordInput,
        submitButton: submitButton,
        signUpLink: await findSelector(page, ['a:has-text("Sign Up")', 'a:has-text("Register")', 'a:has-text("Create Account")'])
      }
    };

    // Perform login
    console.log('\n3. LOGGING IN...');
    if (emailInput && passwordInput && submitButton) {
      await page.fill(emailInput, PUBLIC_WEB.EXISTING_USER.email);
      await page.fill(passwordInput, PUBLIC_WEB.EXISTING_USER.password);
      await page.click(submitButton);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✓ Logged in successfully');
      console.log('Current URL:', page.url());
    }

    // 4. HOME PAGE (after login)
    console.log('\n4. HOME PAGE (After Login)');
    allSelectors.pages.homeAfterLogin = {
      url: page.url(),
      elements: {
        navigation: await extractNavigation(page),
        userMenu: await findSelector(page, ['.user-menu', 'button:has-text("' + PUBLIC_WEB.EXISTING_USER.email.split('@')[0] + '")', '[aria-label*="user" i]']),
        buyVoucherLink: 'a:has-text("Buy Voucher")',
        sendVoucherLink: 'a:has-text("Send Voucher")',
        myOrderLink: 'a:has-text("My Order")',
        inventoryLink: 'a:has-text("Inventory")',
        voucherCards: await extractVoucherCards(page)
      }
    };

    // 5. BUY VOUCHER PAGE
    console.log('\n5. BUY VOUCHER PAGE');
    await page.click('a:has-text("Buy Voucher")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    allSelectors.pages.buyVoucher = {
      url: page.url(),
      elements: {
        searchInput: await findSelector(page, ['input[placeholder*="Search" i]', 'input[type="search"]', '#search']),
        categoryFilter: await findSelector(page, ['select[name="category"]', '.category-filter', '[aria-label*="category" i]']),
        voucherCards: await extractVoucherCards(page),
        pagination: await extractPagination(page)
      }
    };

    // 6. VOUCHER DETAIL PAGE
    console.log('\n6. VOUCHER DETAIL PAGE');
    const cardSelector = allSelectors.pages.buyVoucher.elements.voucherCards.cardSelector;
    if (cardSelector) {
      await page.locator(cardSelector).first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.voucherDetail = {
        url: page.url(),
        elements: {
          title: await findSelector(page, ['h1', 'h2', '.voucher-title', '.product-title']),
          price: await findSelector(page, ['.price', '[class*="price"]', 'text=/RM\\s*\\d+/']),
          description: await findSelector(page, ['.description', '.voucher-description', 'p']),
          image: await findSelector(page, ['img[alt*="voucher" i]', '.voucher-image img', 'img']),
          quantitySection: await extractQuantityControls(page),
          addToCartBtn: await findButtonSelector(page, ['Add to Cart', 'Add To Cart']),
          buyNowBtn: await findButtonSelector(page, ['Buy Now', 'Buy']),
          backBtn: await findSelector(page, ['button:has-text("Back")', 'a:has-text("Back")', '[aria-label*="back" i]'])
        }
      };

      // Test Add to Cart
      const addToCartBtn = allSelectors.pages.voucherDetail.elements.addToCartBtn;
      if (addToCartBtn) {
        console.log('\n7. TESTING ADD TO CART');
        await page.click(addToCartBtn);
        await page.waitForTimeout(2000);
        
        // Check for success message or notification
        const successMsg = await findSelector(page, ['text=/added.*cart/i', 'text=/success/i', '.notification', '.toast', '.alert-success']);
        allSelectors.pages.voucherDetail.elements.addToCartSuccessMsg = successMsg;
      }

      // Go back to listing
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // 8. CART PAGE
    console.log('\n8. CART PAGE');
    // Look for cart icon/link
    const cartLink = await findSelector(page, ['a:has-text("Cart")', '[href*="cart"]', '.cart-icon', '[aria-label*="cart" i]']);
    if (cartLink) {
      await page.click(cartLink);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.cart = {
        url: page.url(),
        elements: {
          cartItems: await extractCartItems(page),
          subtotal: await findSelector(page, ['text=/subtotal/i', '[class*="subtotal"]']),
          total: await findSelector(page, ['text=/total/i', '[class*="total"]']),
          checkoutBtn: await findButtonSelector(page, ['Checkout', 'Proceed to Checkout', 'Proceed']),
          continueShoppingBtn: await findButtonSelector(page, ['Continue Shopping', 'Back to Shop'])
        }
      };
    }

    // 9. MY ORDER PAGE
    console.log('\n9. MY ORDER PAGE');
    const myOrderLink = await findSelector(page, ['a:has-text("My Order")', 'a:has-text("Orders")', '[href*="order"]']);
    if (myOrderLink) {
      await page.click(myOrderLink);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.myOrder = {
        url: page.url(),
        elements: {
          orderTable: await extractOrderTable(page),
          filterStatus: await findSelector(page, ['select[name="status"]', '.status-filter', '[aria-label*="status" i]']),
          searchOrder: await findSelector(page, ['input[placeholder*="Search" i]', 'input[name="search"]']),
          viewDetailsBtn: await findButtonSelector(page, ['View', 'Details', 'View Details'])
        }
      };
    }

    // 10. SEND VOUCHER PAGE
    console.log('\n10. SEND VOUCHER PAGE');
    const sendVoucherLink = await findSelector(page, ['a:has-text("Send Voucher")', '[href*="send"]']);
    if (sendVoucherLink) {
      await page.click(sendVoucherLink);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      allSelectors.pages.sendVoucher = {
        url: page.url(),
        elements: {
          recipientEmailInput: await findInputSelector(page, ['recipient', 'email', 'to']),
          messageInput: await findInputSelector(page, ['message', 'note']),
          voucherSelect: await findSelector(page, ['select[name*="voucher"]', '.voucher-select']),
          sendBtn: await findButtonSelector(page, ['Send', 'Send Voucher'])
        }
      };
    }

    // Save results
    const output = JSON.stringify(allSelectors, null, 2);
    fs.writeFileSync('playwright-tests/public-web-selectors.json', output);
    
    console.log('\n=== RESULTS SAVED ===');
    console.log('✓ File: playwright-tests/public-web-selectors.json');
    console.log('\n' + output);

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'playwright-tests/screenshots/error.png' });
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
      // Continue
    }
  }
  console.log(`  ✗ Not found: ${selectors[0]}`);
  return null;
}

async function findInputSelector(page: any, keywords: string[]): Promise<string | null> {
  for (const keyword of keywords) {
    const selectors = [
      `input[name="${keyword.toLowerCase()}"]`,
      `input[id="${keyword.toLowerCase()}"]`,
      `input[placeholder*="${keyword}" i]`,
      `input[aria-label*="${keyword}" i]`
    ];
    
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`  ✓ Found input: ${selector}`);
          return selector;
        }
      } catch (e) {
        // Continue
      }
    }
  }
  console.log(`  ✗ Input not found for: ${keywords.join(', ')}`);
  return null;
}

async function findButtonSelector(page: any, texts: string[]): Promise<string | null> {
  for (const text of texts) {
    const selector = `button:has-text("${text}")`;
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`  ✓ Found button: ${selector}`);
        return selector;
      }
    } catch (e) {
      // Continue
    }
  }
  console.log(`  ✗ Button not found: ${texts[0]}`);
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
    'a[href*="/voucher/"]',
    'a[href*="/product/"]'
  ];

  for (const selector of possibleSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`  ✓ Found ${count} voucher cards with selector: ${selector}`);
      return {
        cardSelector: selector,
        count: count
      };
    }
  }
  console.log(`  ✗ No voucher cards found`);
  return { cardSelector: null, count: 0 };
}

async function extractQuantityControls(page: any) {
  const quantityInput = await findSelector(page, ['input[type="number"]', 'input[name="quantity"]', '.quantity-input']);
  const increaseBtn = await findSelector(page, ['button:has-text("+")', '.increase', '[aria-label*="increase" i]']);
  const decreaseBtn = await findSelector(page, ['button:has-text("-")', '.decrease', '[aria-label*="decrease" i]']);
  
  return {
    quantityInput,
    increaseBtn,
    decreaseBtn
  };
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
    'tr',
    '[role="listitem"]'
  ];

  for (const selector of possibleSelectors) {
    const count = await page.locator(selector).count();
    if (count > 0) {
      console.log(`  ✓ Found ${count} cart items with selector: ${selector}`);
      return {
        itemSelector: selector,
        count: count,
        removeBtn: await findButtonSelector(page, ['Remove', 'Delete', 'X']),
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
    console.log(`  ✓ Found standard table with headers:`, headers);
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
    console.log(`  ✓ Found MUI table with headers:`, headers);
    return {
      type: 'mui',
      selector: '[role="table"]',
      headers: headers,
      rowSelector: '[role="row"]:not(:first-child)'
    };
  }

  console.log(`  ✗ No table found`);
  return null;
}

explorePublicWebComplete();
