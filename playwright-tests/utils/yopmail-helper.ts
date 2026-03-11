import { Page, BrowserContext } from '@playwright/test';

export class YopmailHelper {
  constructor(private context: BrowserContext) {}

  async getOTPFromEmail(email: string, maxRetries: number = 5): Promise<string | null> {
    console.log(`Getting OTP from Yopmail for: ${email}`);
    
    const yopmailPage = await this.context.newPage();
    
    try {
      // Navigate to Yopmail
      await yopmailPage.goto('https://yopmail.com/en/');
      await yopmailPage.waitForTimeout(2000);
      
      // Enter email
      const emailInput = yopmailPage.locator('input[placeholder*="Enter your inbox"], input#login');
      await emailInput.fill(email);
      await emailInput.press('Enter');
      await yopmailPage.waitForTimeout(3000);
      
      // Retry logic to wait for email to arrive
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Attempt ${attempt}/${maxRetries} to find OTP...`);
        
        // Click refresh button to check for new emails
        if (attempt > 1) {
          const refreshButton = yopmailPage.locator('#refresh');
          if (await refreshButton.count() > 0) {
            await refreshButton.click();
            await yopmailPage.waitForTimeout(2000);
          }
        }
        
        // Switch to email iframe
        const emailFrame = yopmailPage.frameLocator('#ifmail');
        await yopmailPage.waitForTimeout(1000);
        
        // Get email content
        const emailBody = await emailFrame.locator('body').textContent();
        
        if (!emailBody || emailBody.trim().length === 0) {
          console.log(`  No email content found on attempt ${attempt}`);
          if (attempt < maxRetries) {
            await yopmailPage.waitForTimeout(3000); // Wait 3 seconds before retry
            continue;
          }
          return null;
        }
        
        // Extract OTP - look for 6-digit code
        const otpMatch = emailBody.match(/\b\d{6}\b/);
        
        if (otpMatch) {
          const otp = otpMatch[0];
          console.log(`✓ Found OTP: ${otp}`);
          return otp;
        }
        
        // Try other patterns
        const codeMatch = emailBody.match(/code[:\s]+(\d+)/i) || 
                         emailBody.match(/verification[:\s]+(\d+)/i) ||
                         emailBody.match(/OTP[:\s]+(\d+)/i);
        
        if (codeMatch) {
          const otp = codeMatch[1];
          console.log(`✓ Found code: ${otp}`);
          return otp;
        }
        
        console.log(`  No OTP found on attempt ${attempt}`);
        if (attempt < maxRetries) {
          await yopmailPage.waitForTimeout(3000); // Wait 3 seconds before retry
        }
      }
      
      console.log('❌ Could not find OTP in email after all retries');
      return null;
      
    } catch (error) {
      console.error('Error getting OTP from Yopmail:', error);
      return null;
    } finally {
      await yopmailPage.close();
    }
  }
}
