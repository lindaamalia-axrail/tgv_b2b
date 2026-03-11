import { Page, expect } from '@playwright/test';

export class SignUpPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://corporate-voucher-stg.fam-stg.click/signup');
  }

  async fillSignUpForm(data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    idType: string;
    idNumber?: string;
    streetAddress: string;
    postalCode: string;
    state: string;
    city: string;
    country: string;
  }) {
    // Fill basic info
    await this.page.fill('input[name="name"]', data.name);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.fill('input[name="phoneNumber"]', data.phoneNumber);
    await this.page.fill('input[name="password"]', data.password);
    await this.page.fill('input[name="confirmPassword"]', data.password);
    
    // Select ID Type (radio button)
    await this.page.click(`input[name="idType"][value="${data.idType}"]`);
    
    // Fill ID Number if provided
    if (data.idNumber) {
      await this.page.fill('input[name="idNumber"]', data.idNumber);
    }
    
    // Fill address info
    await this.page.fill('input[name="streetAddress"]', data.streetAddress);
    await this.page.fill('input[name="postalCode"]', data.postalCode);
    
    // Country is a text input but may be disabled (pre-filled with Malaysia)
    const countryInput = this.page.locator('input[name="country"]');
    if (await countryInput.isEnabled()) {
      await countryInput.fill(data.country);
    }
    
    // Select state first
    await this.page.selectOption('select[name="state"]', data.state);
    
    // Wait for city dropdown to be populated (it's dependent on state)
    // Wait for at least 2 options (including "Select City" placeholder)
    await this.page.waitForFunction(() => {
      const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement | null;
      return citySelect && citySelect.options.length > 1;
    }, { timeout: 10000 });
    
    // Additional small wait for stability
    await this.page.waitForTimeout(500);
    
    // Try to select city, if it fails, select the first available option
    try {
      await this.page.selectOption('select[name="city"]', data.city, { timeout: 5000 });
    } catch (error) {
      console.log(`City "${data.city}" not found, selecting first available city`);
      // If the exact city name doesn't match, select the first available city
      const citySelect = this.page.locator('select[name="city"]');
      const options = await citySelect.locator('option').all();
      if (options.length > 1) {
        // Select first non-empty option
        const firstValue = await options[1].getAttribute('value');
        if (firstValue) {
          console.log(`Selecting city: "${firstValue}"`);
          await citySelect.selectOption(firstValue);
        }
      }
    }
  }

  async checkEmailAvailability() {
    await this.page.click('button:has-text("Check Availability")');
    await this.page.waitForTimeout(1000);
  }

  async clickNext() {
    await this.page.click('button[type="submit"]');
  }

  async enterOTP(otp: string) {
    // Check if there are multiple OTP input fields (one per digit) or single field
    const otpInputs = this.page.locator('input[type="text"], input[type="number"], input.otp-input, input[name*="otp"]');
    const count = await otpInputs.count();
    
    if (count >= 6) {
      // Multiple inputs - one per digit
      const otpDigits = otp.split('');
      for (let i = 0; i < Math.min(6, otpDigits.length); i++) {
        await otpInputs.nth(i).fill(otpDigits[i]);
        await this.page.waitForTimeout(100);
      }
    } else if (count > 0) {
      // Single input field
      await otpInputs.first().fill(otp);
    } else {
      throw new Error('No OTP input fields found');
    }
  }

  async clickVerifyEmail() {
    const verifyButton = this.page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]');
    await verifyButton.first().click();
    await this.page.waitForTimeout(2000);
  }

  async verifySignUpSuccess() {
    // Check if we've moved away from signup/verify pages
    await expect(this.page).not.toHaveURL(/.*signup.*/);
    await expect(this.page).not.toHaveURL(/.*verify.*/);
  }
}
