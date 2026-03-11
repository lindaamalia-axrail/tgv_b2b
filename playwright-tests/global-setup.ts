import { chromium, FullConfig } from '@playwright/test';
import { ADMIN_PORTAL, PUBLIC_WEB } from './utils/test-data';

async function globalSetup(config: FullConfig) {
  // Setup Admin Portal authentication
  const adminBrowser = await chromium.launch();
  const adminContext = await adminBrowser.newContext();
  const adminPage = await adminContext.newPage();
  
  await adminPage.goto(ADMIN_PORTAL.URL);
  await adminPage.fill('input[name="username"]', ADMIN_PORTAL.CREDENTIALS.email);
  await adminPage.fill('input[name="password"]', ADMIN_PORTAL.CREDENTIALS.password);
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForLoadState('networkidle');
  
  // Save admin auth state
  await adminContext.storageState({ path: 'playwright-tests/.auth/admin.json' });
  await adminBrowser.close();

  // Setup Public Web authentication
  const publicBrowser = await chromium.launch();
  const publicContext = await publicBrowser.newContext();
  const publicPage = await publicContext.newPage();
  
  await publicPage.goto(PUBLIC_WEB.LOGIN_URL);
  await publicPage.fill('#email', PUBLIC_WEB.EXISTING_USER.email);
  await publicPage.fill('#password', PUBLIC_WEB.EXISTING_USER.password);
  await publicPage.click('button[type="submit"]');
  await publicPage.waitForLoadState('networkidle');
  
  // Save public web auth state
  await publicContext.storageState({ path: 'playwright-tests/.auth/public.json' });
  await publicBrowser.close();
}

export default globalSetup;
