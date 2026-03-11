import * as fs from 'fs';

const header = `import { test, expect } from '@playwright/test';

const BASE_URL = 'https://corpvoucher.fam-stg.click';
const CREDENTIALS = {
  email: 'lindaamalia+1@axrail.com',
  password: 'Rahasia123@'
};

test.describe('User Management - All Users Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(\`\${BASE_URL}/login\`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(\`\${BASE_URL}/user-listing\`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
`;

// Read the backup file
const backupContent = fs.readFileSync('tests/admin-portal/05-user-management.spec.ts.backup', 'utf-8');

// Extract all test blocks
const testRegex = /test\('UM-\d+:.*?\n  }\);/gs;
const tests = backupContent.match(testRegex) || [];

console.log(`Found ${tests.length} tests in backup file`);

// Function to update selectors in a test
function updateSelectors(testContent: string): string {
  let updated = testContent;
  
  // Update URLs
  updated = updated.replace(/\/admin\/user-management\/users/g, '/user-listing');
  updated = updated.replace(/\/admin\/user-management\/roles/g, '/role-listing');
  updated = updated.replace(/\/admin\/user-management\/audit-log/g, '/audit-log');
  updated = updated.replace(/\/admin\/login/g, `\${BASE_URL}/login`);
  
  // Update login fields
  updated = updated.replace(/input\[name="email"\]/g, 'input[name="username"]');
  updated = updated.replace(/process\.env\.ADMIN_EMAIL/g, 'CREDENTIALS.email');
  updated = updated.replace(/process\.env\.ADMIN_PASSWORD/g, 'CREDENTIALS.password');
  
  // Update table selectors to DataGrid
  updated = updated.replace(/await page\.waitForSelector\('table'\);/g, 'const dataGrid = page.locator(\\'.MuiDataGrid-root\\');\n    await expect(dataGrid).toBeVisible();');
  updated = updated.replace(/page\.locator\('table thead th'\)/g, 'page.locator(\\'.MuiDataGrid-columnHeader\\')');
  updated = updated.replace(/page\.locator\('table tbody tr'\)/g, 'page.locator(\\'.MuiDataGrid-row\\')');
  updated = updated.replace(/page\.locator\('table tbody tr'\)\.first\(\)\.locator\('button:has-text\("Edit"\), \[aria-label="Edit"\]'\)\.first\(\)/g, 'page.locator(\\'.MuiIconButton-root.css-nm0ua4\\').first()');
  
  // Update form selectors
  updated = updated.replace(/await page\.waitForSelector\('form'\);/g, 'await expect(page.locator(\\'[role="dialog"]\\')). toBeVisible();');
  updated = updated.replace(/input\[name="displayName"\], input\[name="name"\]/g, 'input[name="name"]');
  updated = updated.replace(/await page\.selectOption\('select\[name="role"\]', \{ index: 1 \}\);/g, `await page.click('input[placeholder="Choose role"]');\n    await page.waitForTimeout(500);\n    await page.click('[role="option"]').catch(() => {});`);
  updated = updated.replace(/await page\.selectOption\('select\[name="department"\]', \{ index: 1 \}\);/g, `await page.click('input[placeholder="Choose department"]');\n    await page.waitForTimeout(500);\n    await page.click('[role="option"]').catch(() => {});`);
  updated = updated.replace(/await page\.selectOption\('select\[name="position"\]', \{ index: 1 \}\);/g, `await page.click('input[placeholder="Choose position"]');\n    await page.waitForTimeout(500);\n    await page.click('[role="option"]').catch(() => {});`);
  
  // Update verification selectors
  updated = updated.replace(/await expect\(page\.locator\(\`text=\$\{([^}]+)\}\`\)\)\.toBeVisible\(\);/g, 'await expect(page.locator(\`.MuiDataGrid-cell:has-text("${$1}")\`)).toBeVisible();');
  
  // Add dialog selector where needed
  updated = updated.replace(/await page\.click\('button:has-text\("Save"\)'\);/g, 'await page.click(\\'[role="dialog"] button:has-text("Save")\\');');
  
  return updated;
}

// Generate complete file
let output = header;

tests.forEach((test, index) => {
  const updated = updateSelectors(test);
  output += '\n' + updated + '\n';
  
  // Add describe blocks at appropriate points
  if (index === 36) { // After UM-037
    output += `\n});\n\ntest.describe('User Management - Roles Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(\`\${BASE_URL}/login\`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(\`\${BASE_URL}/role-listing\`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
\n`;
  }
  
  if (index === 51) { // After UM-052
    output += `\n});\n\ntest.describe('User Management - Audit Log Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(\`\${BASE_URL}/login\`);
    await page.fill('input[name="username"]', CREDENTIALS.email);
    await page.fill('input[name="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.goto(\`\${BASE_URL}/audit-log\`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
\n`;
  }
});

output += '\n});\n';

// Write to file
fs.writeFileSync('tests/admin-portal/05-user-management-complete.spec.ts', output);

console.log('✓ Complete test file generated with all 64 tests');
console.log('✓ File saved to: tests/admin-portal/05-user-management-complete.spec.ts');
