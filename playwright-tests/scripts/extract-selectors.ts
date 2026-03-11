import { chromium } from '@playwright/test';

async function extractSelectors() {
  console.log('🔍 Extracting real selectors from TGV platforms...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    publicWeb: {},
    adminPortal: {}
  };

  try {
    // ===== PUBLIC WEB LOGIN PAGE =====
    console.log('📍 Analyzing Public Web Login Page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    selectors.publicWeb.login = await page.evaluate(() => {
      const result: any = {};
      
      // Find email input
      const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('input[name*="email" i]') ||
                        document.querySelector('input[placeholder*="email" i]');
      if (emailInput) {
        result.emailInput = {
          selector: emailInput.getAttribute('name') ? `input[name="${emailInput.getAttribute('name')}"]` : 
                   emailInput.getAttribute('id') ? `#${emailInput.getAttribute('id')}` :
                   'input[type="email"]',
          placeholder: emailInput.getAttribute('placeholder'),
          name: emailInput.getAttribute('name'),
          id: emailInput.getAttribute('id')
        };
      }
      
      // Find password input
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        result.passwordInput = {
          selector: passwordInput.getAttribute('name') ? `input[name="${passwordInput.getAttribute('name')}"]` :
                   passwordInput.getAttribute('id') ? `#${passwordInput.getAttribute('id')}` :
                   'input[type="password"]',
          placeholder: passwordInput.getAttribute('placeholder'),
          name: passwordInput.getAttribute('name'),
          id: passwordInput.getAttribute('id')
        };
      }
      
      // Find submit button
      const submitButton = document.querySelector('button[type="submit"]') ||
                          document.querySelector('button:has-text("Sign In")') ||
                          document.querySelector('button:has-text("Login")');
      if (submitButton) {
        result.submitButton = {
          text: submitButton.textContent?.trim(),
          type: submitButton.getAttribute('type'),
          className: submitButton.className,
          id: submitButton.getAttribute('id')
        };
      }
      
      // Find sign up link
      const signUpLink = document.querySelector('a[href*="signup"]') ||
                        document.querySelector('a:has-text("Sign Up")');
      if (signUpLink) {
        result.signUpLink = {
          href: signUpLink.getAttribute('href'),
          text: signUpLink.textContent?.trim()
        };
      }
      
      return result;
    });
    
    console.log('✅ Public Web Login selectors extracted');
    console.log(JSON.stringify(selectors.publicWeb.login, null, 2));

    // ===== PUBLIC WEB HOMEPAGE =====
    console.log('\n📍 Analyzing Public Web Homepage...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForLoadState('networkidle');
    
    selectors.publicWeb.homepage = await page.evaluate(() => {
      const result: any = {};
      
      // Find navigation links
      const buyVoucherLink = document.querySelector('a[href*="buy"]') ||
                            document.querySelector('a:has-text("Buy")');
      if (buyVoucherLink) {
        result.buyVoucherLink = {
          href: buyVoucherLink.getAttribute('href'),
          text: buyVoucherLink.textContent?.trim()
        };
      }
      
      // Find voucher cards
      const voucherCards = document.querySelectorAll('[class*="card"], [class*="product"], [class*="voucher"]');
      if (voucherCards.length > 0) {
        const firstCard = voucherCards[0];
        result.voucherCard = {
          className: firstCard.className,
          count: voucherCards.length
        };
      }
      
      return result;
    });
    
    console.log('✅ Public Web Homepage selectors extracted');
    console.log(JSON.stringify(selectors.publicWeb.homepage, null, 2));

    // ===== ADMIN PORTAL LOGIN =====
    console.log('\n📍 Analyzing Admin Portal Login...');
    await page.goto('https://corpvoucher.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    selectors.adminPortal.login = await page.evaluate(() => {
      const result: any = {};
      
      // Find email input
      const emailInput = document.querySelector('input[type="email"]') || 
                        document.querySelector('input[name*="email" i]');
      if (emailInput) {
        result.emailInput = {
          selector: emailInput.getAttribute('name') ? `input[name="${emailInput.getAttribute('name')}"]` : 
                   emailInput.getAttribute('id') ? `#${emailInput.getAttribute('id')}` :
                   'input[type="email"]',
          name: emailInput.getAttribute('name'),
          id: emailInput.getAttribute('id')
        };
      }
      
      // Find password input
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        result.passwordInput = {
          selector: passwordInput.getAttribute('name') ? `input[name="${passwordInput.getAttribute('name')}"]` :
                   passwordInput.getAttribute('id') ? `#${passwordInput.getAttribute('id')}` :
                   'input[type="password"]',
          name: passwordInput.getAttribute('name'),
          id: passwordInput.getAttribute('id')
        };
      }
      
      // Find submit button
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        result.submitButton = {
          text: submitButton.textContent?.trim(),
          type: submitButton.getAttribute('type'),
          className: submitButton.className
        };
      }
      
      return result;
    });
    
    console.log('✅ Admin Portal Login selectors extracted');
    console.log(JSON.stringify(selectors.adminPortal.login, null, 2));

    // Save to file
    const fs = require('fs');
    fs.writeFileSync(
      'test-results/extracted-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    
    console.log('\n✅ All selectors extracted and saved to test-results/extracted-selectors.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

extractSelectors();
