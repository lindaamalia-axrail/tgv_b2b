import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function saveLocalStorage(page: Page, filename: string) {
  const localStorage = await page.evaluate(() => {
    // @ts-ignore - window exists in browser context
    return JSON.stringify(window.localStorage);
  });
  const authDir = path.join(process.cwd(), '.auth');
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(authDir, filename), localStorage);
  console.log(`LocalStorage saved to ${filename}`);
}

export async function loadLocalStorage(page: Page, filename: string) {
  const authPath = path.join(process.cwd(), '.auth', filename);
  
  if (fs.existsSync(authPath)) {
    const localStorage = fs.readFileSync(authPath, 'utf-8');
    await page.evaluate((data) => {
      const items = JSON.parse(data);
      for (const key in items) {
        // @ts-ignore - window exists in browser context
        window.localStorage.setItem(key, items[key]);
      }
    }, localStorage);
    console.log(`LocalStorage loaded from ${filename}`);
  } else {
    console.log(`LocalStorage file ${filename} not found`);
  }
}

// Updated tokens from latest session (March 2026)
// Note: These tokens expire quickly. The test code has a fallback to regular login if they're expired.
export const ADMIN_LOCALSTORAGE_TOKENS = {
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.clockDrift': '-1',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.deviceGroupKey': '116914e3-58fa-47af-88f3-5a308adc3b3b',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.deviceKey': 'ap-southeast-5_8ec36d11-9328-4e30-9b58-0835899f7b1b',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.userData': '{"UserAttributes":[{"Name":"email","Value":"adminusertgv01@yopmail.com"},{"Name":"email_verified","Value":"True"},{"Name":"sub","Value":"459d25a8-20c1-70e5-992c-4b1acc62d475"}],"Username":"459d25a8-20c1-70e5-992c-4b1acc62d475"}',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.randomPasswordKey': 'Eyid5N6EhFWJ8jXL2yrqiJ22hlFJTJ6OLVbUSV90djYdoxJKDxFvLw==',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.LastAuthUser': '459d25a8-20c1-70e5-992c-4b1acc62d475',
  'amplify-signin-with-hostedUI': 'false'
};

/**
 * Inject authentication tokens directly into localStorage
 * This bypasses the login UI and is useful for faster test execution
 */
export async function injectAuthTokens(page: Page, tokens: Record<string, string> = ADMIN_LOCALSTORAGE_TOKENS) {
  await page.evaluate((tokensData) => {
    for (const [key, value] of Object.entries(tokensData)) {
      localStorage.setItem(key, value);
    }
  }, tokens);
  console.log('Auth tokens injected into localStorage');
}

/**
 * Login using localStorage injection instead of UI interaction
 * Much faster than filling forms and clicking buttons
 */
export async function loginViaLocalStorage(page: Page, url: string, tokens: Record<string, string> = ADMIN_LOCALSTORAGE_TOKENS) {
  // Navigate to the domain first (required for localStorage to work)
  await page.goto(url);
  
  // Inject the tokens
  await injectAuthTokens(page, tokens);
  
  // Reload to apply the authentication
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  console.log('Login completed via localStorage injection');
}
