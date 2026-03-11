import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function extractAllSelectors() {
  console.log('🔍 Complete selector extraction from TGV platforms...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const selectors: any = {
    publicWeb: {},
    adminPortal: {}
  };

  try {
    // ===== PUBLIC WEB LOGIN PAGE =====
    console.log('📍 Public Web Login Page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const publicLoginHTML = await page.content();
    selectors.publicWeb.login = {
      emailInput: '#email',
      passwordInput: '#password',
      submitButton: 'button[type="submit"]',
      signUpLink: 'a[href="/signup"]',
      forgotPasswordLink: 'a:has-text("Forgot Password")'
    };
    console.log('✅ Public Login selectors ready');

    // ===== PUBLIC WEB SIGN UP PAGE =====
    console.log('📍 Public Web Sign Up Page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Extract form field info
    const signUpFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select'));
      return inputs.map(input => ({
        tag: input.tagName.toLowerCase(),
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        id: input.getAttribute('id'),
        placeholder: input.getAttribute('placeholder'),
        className: input.className
      }));
    });
    
    console.log('Sign up form fields found:', signUpFields.length);
    selectors.publicWeb.signup = {
      fields: signUpFields,
      nameInput: 'input[placeholder*="Name" i], input[name*="name" i]',
      emailInput: 'input[type="email"]',
      phoneInput: 'input[type="tel"], input[placeholder*="Phone" i]',
      passwordInput: 'input[type="password"]',
      confirmPasswordInput: 'input[placeholder*="confirm" i], input[placeholder*="re-enter" i]',
      idTypeSelect: 'select',
      addressInput: 'input[placeholder*="address" i]',
      postalCodeInput: 'input[placeholder*="postal" i]',
      stateSelect: 'select[name*="state" i]',
      citySelect: 'select[name*="city" i]',
      countrySelect: 'select[name*="country" i]',
      submitButton: 'button[type="submit"]',
      nextButton: 'button:has-text("Next")'
    };
    console.log('✅ Public Sign Up selectors ready');

    // ===== PUBLIC WEB HOMEPAGE =====
    console.log('📍 Public Web Homepage...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a'));
      return links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href')
      }));
    });
    
    console.log('Navigation links found:', navLinks.length);
    selectors.publicWeb.homepage = {
      buyVoucherLink: 'a[href="/buy"]',
      loginButton: 'a[href="/login"]',
      signUpButton: 'a[href="/signup"]',
      cartIcon: '[class*="cart"]',
      voucherCards: '[class*="card"], [class*="product"]',
      navLinks: navLinks
    };
    console.log('✅ Public Homepage selectors ready');

    // ===== ADMIN PORTAL LOGIN =====
    console.log('📍 Admin Portal Login...');
    await page.goto('https://corpvoucher.fam-stg.click/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const adminInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        id: input.getAttribute('id'),
        placeholder: input.getAttribute('placeholder')
      }));
    });
    
    console.log('Admin login inputs found:', adminInputs.length);
    selectors.adminPortal.login = {
      inputs: adminInputs,
      emailInput: 'input[type="email"], input[name*="email" i]',
      passwordInput: 'input[type="password"]',
      submitButton: 'button[type="submit"]',
      loginButton: 'button:has-text("Login"), button:has-text("Sign In")'
    };
    console.log('✅ Admin Login selectors ready');

    // Save to file
    fs.writeFileSync(
      'test-results/complete-selectors.json',
      JSON.stringify(selectors, null, 2)
    );
    
    console.log('\n✅ All selectors extracted!');
    console.log('📄 Saved to: test-results/complete-selectors.json\n');
    
    // Print summary
    console.log('📊 Summary:');
    console.log('  Public Web Login: ✅');
    console.log('  Public Web Sign Up: ✅');
    console.log('  Public Web Homepage: ✅');
    console.log('  Admin Portal Login: ✅');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

extractAllSelectors();
