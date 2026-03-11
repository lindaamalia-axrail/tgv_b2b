import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getOTPFromYopmail(email: string): Promise<string> {
    const yopmailPage = await this.page.context().newPage();
    await yopmailPage.goto('https://yopmail.com');
    
    // Enter email
    await yopmailPage.fill('#login', email);
    await yopmailPage.click('button[type="submit"]');
    
    // Switch to inbox iframe
    const inboxFrame = yopmailPage.frameLocator('#ifinbox');
    await inboxFrame.locator('text=Verification Code').first().click();
    
    // Switch to message iframe
    const messageFrame = yopmailPage.frameLocator('#ifmail');
    const otpText = await messageFrame.locator('body').textContent();
    
    // Extract OTP (assuming 6-digit code)
    const otpMatch = otpText?.match(/\b\d{6}\b/);
    const otp = otpMatch ? otpMatch[0] : '';
    
    await yopmailPage.close();
    return otp;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async fillFormField(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async clickButton(selector: string) {
    await this.page.click(selector);
  }

  async selectDropdown(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  async verifyText(selector: string, expectedText: string) {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  async verifyElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async verifyElementNotVisible(selector: string) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  async waitForNavigation(url: string) {
    await this.page.waitForURL(url);
  }

  generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
}
