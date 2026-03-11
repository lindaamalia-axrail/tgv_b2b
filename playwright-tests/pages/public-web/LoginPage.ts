import { Page } from '@playwright/test';

export class PublicLoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://corporate-voucher-stg.fam-stg.click/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL(/.*(?!login).*/);
  }

  async clickSignUp() {
    await this.page.click('a[href="/signup"]');
  }

  async clickForgotPassword() {
    await this.page.click('a:has-text("Forgot Password")');
  }
}
