import { Page, expect } from '@playwright/test';

export class AdminLoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://corpvoucher.fam-stg.click/admin/login');
  }

  async login(email: string, password: string) {
    // Admin portal uses 'username' field (can be email or phone)
    await this.page.fill('input[name="username"]', email);
    await this.page.fill('input[name="password"]', password);
    
    // Click the Sign in button (not submit button)
    await this.page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait a bit for the response
    await this.page.waitForTimeout(3000);
    
    // Check if there's an error message
    const errorMessage = await this.page.locator('text=/error|invalid|incorrect/i').textContent().catch(() => null);
    if (errorMessage) {
      throw new Error(`Login failed with error: ${errorMessage}`);
    }
    
    // Check if we're still on login page
    if (this.page.url().includes('login')) {
      // Take a screenshot for debugging
      await this.page.screenshot({ path: 'login-failed.png' });
      throw new Error('Login failed - still on login page after submit');
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginSuccess() {
    // Wait for redirect to dashboard or main page
    await this.page.waitForURL(/.*(?!login).*/);
  }

  async verifyLoginError(errorMessage: string) {
    await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible();
  }

  async clickForgotPassword() {
    await this.page.click('a:has-text("Forgot Password")');
  }

  async resetPassword(email: string) {
    await this.page.fill('input[name="username"]', email);
    await this.page.click('button[type="submit"]');
  }

  async togglePasswordVisibility() {
    await this.page.click('button[aria-label="toggle password visibility"]');
  }
}
