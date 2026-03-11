import { chromium } from '@playwright/test';

async function discoverSelectors() {
  console.log('🔍 Discovering selectors from TGV Corporate Voucher platforms...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ===== PUBLIC WEB HOMEPAGE =====
    console.log('📍 Exploring Public Web Homepage...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/');
    await page.waitForLoadState('networkidle');
    
    console.log('\n✅ Public Web Homepage loaded successfully');
    console.log('Page title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/public-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/public-homepage.png');
    
    // Wait for user to see the page
    console.log('\n⏸️  Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

    // ===== PUBLIC WEB LOGIN PAGE =====
    console.log('\n📍 Exploring Public Web Login Page...');
    await page.goto('https://corporate-voucher-stg.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Login page loaded');
    await page.screenshot({ path: 'test-results/public-login.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/public-login.png');
    
    await page.waitForTimeout(10000);

    // ===== ADMIN PORTAL LOGIN =====
    console.log('\n📍 Exploring Admin Portal Login...');
    await page.goto('https://corpvoucher.fam-stg.click/login');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Admin portal loaded');
    await page.screenshot({ path: 'test-results/admin-login.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/admin-login.png');
    
    await page.waitForTimeout(10000);

    console.log('\n✅ Discovery complete! Check test-results/ for screenshots.');
    console.log('\n💡 Next: Use Playwright Codegen to get exact selectors:');
    console.log('   npx playwright codegen https://corporate-voucher-stg.fam-stg.click/');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

discoverSelectors();
