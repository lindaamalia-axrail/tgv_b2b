import { Page, expect } from '@playwright/test';

export class AdminLoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://corpvoucher.fam-stg.click/admin/login');
    // Wait for loading screen to disappear
    await this.page.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
  }

  async login(email: string, password: string) {
    // Wait for login form to be ready
    await this.page.getByRole('textbox', { name: /robot@gmail.com/i }).waitFor({ state: 'visible', timeout: 15000 });
    
    // Fill email/phone field (placeholder: "0123456789 / robot@gmail.com")
    await this.page.getByRole('textbox', { name: /robot@gmail.com/i }).fill(email);
    // Fill password field
    await this.page.locator('#password').fill(password);
    
    // Click the Sign in button
    await this.page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation away from login
    await this.page.waitForURL(/.*(?!.*login).*/, { timeout: 15000 }).catch(() => {});
    
    // Wait for loading screen
    await this.page.waitForSelector('text=Preparing your experience', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginSuccess() {
    // Wait for redirect away from login page
    await expect(this.page).not.toHaveURL(/.*login.*/);
  }

  async verifyLoginError(errorMessage: string) {
    await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible();
  }

  async clickForgotPassword() {
    await this.page.getByRole('button', { name: /forgot password/i }).click();
  }

  async resetPassword(email: string) {
    await this.page.getByRole('textbox', { name: /robot@gmail.com/i }).fill(email);
    await this.page.getByRole('button', { name: /sign in|submit/i }).click();
  }

  async togglePasswordVisibility() {
    await this.page.getByRole('button', { name: /toggle password visibility/i }).click();
  }
}
