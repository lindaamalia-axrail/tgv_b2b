# Login & Authentication - Actual Selectors

## Login Page (`/login`)

### Input Fields
- **Email Input**: `input[id="email"]` or `input[type="email"]`
- **Password Input**: `input[id="password"]` or `input[type="password"]`

### Buttons & Links
- **Sign In Button**: `button[type="submit"]` or `button:has-text("Sign In")`
- **Forgot Password Link**: `a:has-text("Forgot Password")`
- **Sign Up Link**: `a:has-text("Sign Up")` or `a[href="/signup"]`
  - Located at the bottom of the login page (need to scroll down)

## Sign Up Page (`/signup`)

### Input Fields
- **Name**: `input[name="name"]`
  - Placeholder: `Company Name / Individual Name`
- **Email**: `input[name="email"]`
  - Placeholder: `sample@email.com`
- **Phone Number**: `input[name="phoneNumber"]`
  - Type: `tel`
  - Placeholder: `+60`
- **Password**: `input[name="password"]`
- **Confirm Password**: `input[name="confirmPassword"]`
- **ID Type** (Radio buttons): `input[name="idType"][type="radio"]`
  - 4 options: NRIC, Passport, Business Registration, Others
- **ID Number**: `input[name="idNumber"]`
  - Placeholder: `ID Number`
- **SST Number**: `input[name="sstNumber"]`
- **TIN**: `input[name="tin"]`
- **Street Address**: `input[name="streetAddress"]`
- **Postal Code**: `input[name="postalCode"]`
- **Country**: `input[name="country"]`
- **State**: `select[name="state"]`
- **City**: `select[name="city"]`

### Buttons
- **Check Availability Button**: `button:has-text("Check Availability")` (type="button")
- **Next Button**: `button:has-text("Next")` (type="submit")

## Navigation
- **Buy Voucher Link**: `a[href="/buy"]`
- **Sign In Button** (from homepage): `button:has-text("Sign In")` or `a:has-text("Sign In")`

## Forgot Password Page
- **Email Input**: `input[type="email"]`
- **Submit Button**: `button[type="submit"]`

## Common Patterns
1. All input fields use `name` attribute for identification
2. Buttons use `type="submit"` or `type="button"` with text-based selectors
3. Links use `href` attribute or text content
4. Radio buttons share the same `name` attribute (`idType`)
5. Dropdowns use `select[name="..."]`
6. Phone input uses `type="tel"`

## Test Credentials
- **Existing User Email**: `lindaamalia@axrail.com`
- **Existing User Password**: `Rahasia567_`
- **New User Email Pattern**: `tgvuser_XXX@yopmail.com`
- **New User Phone Pattern**: `6010441123X`
- **New User Password**: `P@ssw0rd`
- **NRIC**: 16 random digits (use `SIGNUP_DATA.generateNRIC()`)

## URLs
- **Homepage**: `https://corporate-voucher-stg.fam-stg.click/`
- **Login**: `https://corporate-voucher-stg.fam-stg.click/login`
- **Sign Up**: `https://corporate-voucher-stg.fam-stg.click/signup`
- **Buy Page**: `https://corporate-voucher-stg.fam-stg.click/buy`

## Important Notes
1. **Sign Up page access**: 
   - Go to login page
   - Scroll down to bottom
   - Click "Sign Up" link
   - OR navigate directly to `/signup`
2. **ID Type**: Radio buttons with 4 options (NRIC, Passport, Business Registration, Others)
3. **Phone Number**: Uses `tel` input type with placeholder `+60`
4. **State & City**: Dropdown selects (not text inputs)
5. **Password fields**: Two separate fields (password and confirmPassword)
6. **Check Availability**: Button to verify email availability before submission

## Field Validation
- Email: Must be valid email format
- Phone: Must start with country code (+60)
- Postal Code: Numeric only
- Password: Must meet complexity requirements
- Confirm Password: Must match password
- ID Number: 16 digits for NRIC

## Error Messages
- Look for error messages near input fields
- Common selectors: `text=/error/i`, `text=/invalid/i`, `text=/required/i`

## Signup Flow
1. Fill in all required fields
2. Click "Check Availability" to verify email
3. Click "Next" to proceed to OTP verification
4. Enter OTP code
5. Complete registration
