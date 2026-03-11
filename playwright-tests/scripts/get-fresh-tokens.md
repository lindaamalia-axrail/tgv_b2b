# How to Get Fresh Authentication Tokens

The current tokens in `utils/auth-helper.ts` are expired. Follow these steps to get fresh tokens:

## Steps:

1. **Open Chrome/Firefox in Incognito/Private mode**

2. **Navigate to the admin portal:**
   ```
   https://corpvoucher.fam-stg.click/login
   ```

3. **Login with your credentials:**
   - Email: `lindaamalia+1@axrail.com`
   - Password: `Rahasia123@`

4. **Open Developer Tools:**
   - Press `F12` or right-click → Inspect
   - Go to the "Console" tab

5. **Run this command in the console:**
   ```javascript
   JSON.stringify(localStorage, null, 2)
   ```

6. **Copy the entire output** (it will be a JSON object with all the Cognito tokens)

7. **Update the tokens in `playwright-tests/utils/auth-helper.ts`:**
   - Replace the `ADMIN_LOCALSTORAGE_TOKENS` object with the new tokens
   - Make sure to keep the same format (key-value pairs)

## Example of what you'll see:

```json
{
  "CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.758d25e8-3001-7005-f274-fa2b4c945541.idToken": "eyJraWQiOiJ1OFlRRm1MYk5qd3ZFRktKNHVTME1EYWs3RTdyRTBXcGxsSFwvZWh2VUIydz0iLCJhbGciOiJSUzI1NiJ9...",
  "CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.758d25e8-3001-7005-f274-fa2b4c945541.accessToken": "eyJraWQiOiJEWk5mdnlKYXVcL3hhQlFQUnJYNmxNVGdmYWRtNG00UVg4VnlwWnJQeHkzcz0iLCJhbGciOiJSUzI1NiJ9...",
  ...
}
```

## Alternative: Use Playwright's built-in auth

Instead of localStorage tokens, we can use Playwright's authentication setup. Let me know if you'd prefer this approach.

## Note:
Tokens typically expire after 1 hour. You'll need to refresh them periodically during development.
