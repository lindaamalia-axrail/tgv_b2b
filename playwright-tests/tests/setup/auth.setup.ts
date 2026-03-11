import { test as setup } from '@playwright/test';
import { ADMIN_PORTAL, PUBLIC_WEB } from '../../utils/test-data';
import { AdminLoginPage } from '../../pages/admin-portal/LoginPage';
import { PublicLoginPage } from '../../pages/public-web/LoginPage';

const adminAuthFile = '.auth/admin.json';
const publicAuthFile = '.auth/public.json';

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new AdminLoginPage(page);
  await loginPage.navigate();
  await loginPage.login(ADMIN_PORTAL.CREDENTIALS.email, ADMIN_PORTAL.CREDENTIALS.password);
  
  console.log('Admin logged in, current URL:', page.url());
  
  // Save auth state
  await page.context().storageState({ path: adminAuthFile });
  console.log('Admin auth state saved');
});

setup('authenticate as public user', async ({ page }) => {
  const loginPage = new PublicLoginPage(page);
  await loginPage.navigate();
  await loginPage.login(PUBLIC_WEB.EXISTING_USER.email, PUBLIC_WEB.EXISTING_USER.password);
  
  console.log('Public user logged in, current URL:', page.url());
  
  await page.context().storageState({ path: publicAuthFile });
  console.log('Public auth state saved');
});
