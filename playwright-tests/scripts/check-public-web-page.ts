import { chromium } from '@playwright/test';
import { PUBLIC_WEB } from '../utils/test-data';

async function checkPublicWebPage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to:', PUBLIC_WEB.URL);
    await page.goto(PUBLIC_WEB.URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\nCurrent URL:', page.url());
    console.log('Page Title:', await page.title());

    // Check if already logged in or on login page
    const pageText = await page.locator('body').textContent();
    console.log('\nPage contains "Login":', pageText?.includes('Login'));
    console.log('Page contains "Sign In":', pageText?.includes('Sign In'));
    console.log('Page contains "Email":', pageText?.includes('Email'));
    console.log('Page contains "Password":', pageText?.includes('Password'));

    // Get all input fields
    console.log('\n=== ALL INPUT FIELDS ===');
    const inputs = await page.locator('input').evaluateAll((inputs) =>
      inputs.map(input => ({
        type: input.getAttribute('type'),
        name: input.getAttribute('name'),
        id: input.getAttribute('id'),
        placeholder: input.getAttribute('placeholder'),
        className: input.className
      }))
    );
    console.log(JSON.stringify(inputs, null, 2));

    // Get all buttons
    console.log('\n=== ALL BUTTONS ===');
    const buttons = await page.locator('button').evaluateAll((btns) =>
      btns.map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.getAttribute('type'),
        className: btn.className
      }))
    );
    console.log(JSON.stringify(buttons.filter(b => b.text), null, 2));

    // Get all links
    console.log('\n=== ALL LINKS ===');
    const links = await page.locator('a').allTextContents();
    console.log(links.filter(text => text.trim().length > 0));

    // Take screenshot
    await page.screenshot({ path: 'playwright-tests/screenshots/public-web-initial.png', fullPage: true });
    console.log('\n✓ Screenshot saved: screenshots/public-web-initial.png');

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkPublicWebPage();
