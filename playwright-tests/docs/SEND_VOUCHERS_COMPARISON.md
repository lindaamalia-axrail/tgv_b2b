# Send Vouchers Test Comparison Report

## Summary
This document compares the Excel specification "Send Vouchers.xlsx" with the test file "03-send-vouchers.spec.ts" to identify discrepancies.

## Issues Found

### 1. Test Case Naming and Numbering
- Excel has 67 test scenarios (rows 2-68)
- Test file has 70 test cases (TC_SEND001-010, STC011-070)
- Many test case descriptions don't match Excel scenarios

### 2. Missing Test Scenarios from Excel

The following Excel scenarios are NOT properly implemented:

1. **Row 2**: "Voucher codes allocated after successful purchase" - TC_SEND001 only partially covers this
2. **Row 3**: "Access Send Voucher functionality from multiple endpoints" - TC_SEND002 only checks one endpoint
3. **Row 4**: "Maintain record of purchased vouchers" - TC_SEND003 doesn't verify voucher creditation status
4. **Row 9**: "CSV template populated with correct number of slots" - STC068 added but should be earlier
5. **Row 10**: "Clear instructions for CSV completion" - STC069 added but should be earlier

### 3. Test Cases Not in Excel Specification

The following test cases exist in the file but are NOT in the Excel:
- None identified - all tests attempt to map to Excel rows

### 4. Incorrect Expected Results

Many tests have generic "Expected" comments that don't match the detailed expected results in Excel:

- **STC011-STC070**: Most have simplified expected results compared to Excel
- Missing specific validation details from Excel column "Expected Result"

### 5. Test Steps Mismatch

Many tests don't follow the exact steps from Excel:
- Excel has detailed 13-step processes for some scenarios
- Tests use simplified 5-7 step flows
- Missing intermediate verification steps

### 6. Negative Test Cases

Excel specifies these as "Negative" test type:
- Row 14: Error handling for non-CSV files
- Row 15: Error handling for wrong CSV structure  
- Row 38: Invalid recipient phone number
- Row 39: Invalid recipient email
- Row 40: Invalid phone and email
- Row 42: Vouchers exceed owned
- Row 57: Total recipients = 0
- Row 60: Wrong phone format, correct email
- Row 62: Wrong phone and email format

Tests STC014, STC015, STC033-035, STC037, STC052, STC055-056, STC058, STC060 cover these but need better labeling.

### 7. Missing Spec References

Excel column "Functional Spec Reference Section" shows:
- Most scenarios reference "2.4.4.2 Create Voucher Injection Task"
- Some reference "2.4.4.3 Send Voucher Task Detail"
- Some reference "2.4.5 My Order"
- Tests don't include these references in comments

## Detailed Mapping

| Excel Row | Test Scenario (Excel) | Test Case ID | Status | Notes |
|-----------|----------------------|--------------|--------|-------|
| 2 | Voucher codes allocated after purchase | TC_SEND001 | ⚠️ Partial | Doesn't verify vouchers credited to account |
| 3 | Access Send Voucher from multiple endpoints | TC_SEND002 | ⚠️ Partial | Only tests one endpoint, not all 4 mentioned |
| 4 | Maintain record of purchased vouchers | TC_SEND003 | ⚠️ Partial | Doesn't verify creditation status |
| 5 | Select specific vouchers to send | TC_SEND004 | ✅ Good | Matches well |
| 6 | Enforce minimum amount requirements | TC_SEND005 | ✅ Good | Matches well |
| 7 | Validate sufficient voucher balance | TC_SEND006 | ⚠️ Partial | Needs better validation |
| 8 | Provide downloadable CSV templates | TC_SEND007 | ✅ Good | Matches well |
| 9 | CSV template with correct slots | STC068 | ⚠️ Misplaced | Should be TC_SEND008 |
| 10 | Clear instructions for CSV | STC069 | ⚠️ Misplaced | Should be TC_SEND009 |
| 11 | Accept CSV file uploads | TC_SEND008 | ⚠️ Wrong order | Should be TC_SEND010 |
| 12 | Validate CSV format and fields | TC_SEND009 | ⚠️ Wrong order | Should be TC_SEND011 |
| 13 | Display summary with invalid inputs | TC_SEND010 | ⚠️ Wrong order | Should be TC_SEND012 |
| 14 | Validate phone numbers | STC011 | ✅ Good | Matches well |
| 15 | Flag invalid phone numbers | STC012 | ✅ Good | Matches well |
| 16 | Allow corrected phone numbers | STC013 | ✅ Good | Matches well |
| 17 | Error handling non-CSV files | STC014 | ✅ Good | Matches well |
| 18 | Error handling wrong CSV structure | STC015 | ✅ Good | Matches well |
| 19 | Link to TGV Help Desk | STC016 | ✅ Good | Matches well |
| 20 | Handle recipients without MVC | STC017 | ✅ Good | Matches well |
| 21 | Alert recipient to create account | STC018 | ✅ Good | Matches well |
| 22 | Inject voucher when user registers | STC019 | ⚠️ Partial | Needs end-to-end flow |
| 23 | Execute voucher sending | STC020 | ✅ Good | Matches well |
| 24 | Inject into TGV MVC wallets | STC021 | ✅ Good | Matches well |
| 25 | Handle successful delivery | STC022 | ✅ Good | Matches well |
| 26 | Comprehensive error messages | STC023 | ✅ Good | Matches well |
| 27 | Allow correction and resubmission | STC024 | ✅ Good | Matches well |
| 28 | Maintain transaction logs | STC025 | ⚠️ Partial | Can't verify backend |
| 29 | Integrate with Zoho Desk | STC026 | ✅ Good | Matches well |
| 30 | Guide through 3-stage process | STC027 | ✅ Good | Matches well |
| 31 | Review and confirm details | STC028 | ✅ Good | Matches well |
| 32 | Clear completion confirmation | STC029 | ✅ Good | Matches well |
| 33 | Secure handling of personal data | STC030 | ⚠️ Partial | Can't verify security |
| 34 | Validate all input data | STC031 | ✅ Good | Matches well |
| 35 | Maintain audit trails | STC032 | ✅ Good | Matches well |
| 36 | Invalid phone number (negative) | STC033 | ✅ Good | Matches well |
| 37 | Invalid email (negative) | STC034 | ✅ Good | Matches well |
| 38 | Invalid phone and email (negative) | STC035 | ✅ Good | Matches well |
| 39 | Identify invalid phone/email | STC036 | ✅ Good | Matches well |
| 40 | Vouchers exceed owned (negative) | STC037 | ✅ Good | Matches well |
| 41 | Vouchers equal owned | STC038 | ✅ Good | Matches well |
| 42 | Vouchers less than owned | STC039 | ✅ Good | Matches well |
| 43 | View injection status | STC040 | ✅ Good | Matches well |
| 44 | Download injection report | STC041 | ✅ Good | Matches well |
| 45 | Withdraw unsuccessful injections | STC042 | ✅ Good | Matches well |
| 46 | Search by phone number | STC043 | ✅ Good | Matches well |
| 47 | Filter Successfully Sent | STC044 | ✅ Good | Matches well |
| 48 | Filter Mobile Not Registered | STC045 | ✅ Good | Matches well |
| 49 | Filter Withdraw | STC046 | ✅ Good | Matches well |
| 50 | Filter System Error | STC047 | ✅ Good | Matches well |
| 51 | Registered phone, wrong email | STC048 | ✅ Good | Matches well |
| 52 | Registered phone, correct email | STC049 | ✅ Good | Matches well |
| 53 | Non-registered phone, wrong email | STC050 | ✅ Good | Matches well |
| 54 | Non-registered phone, correct email | STC051 | ✅ Good | Matches well |
| 55 | Recipients = 0 (negative) | STC052 | ✅ Good | Matches well |
| 56 | Registered phone, no email | STC053 | ✅ Good | Matches well |
| 57 | Non-registered phone, no email | STC054 | ✅ Good | Matches well |
| 58 | Correct phone, wrong email format | STC055 | ✅ Good | Matches well |
| 59 | Wrong phone, correct email format | STC056 | ✅ Good | Matches well |
| 60 | Correct phone and email format | STC057 | ✅ Good | Matches well |
| 61 | Wrong phone and email format | STC058 | ✅ Good | Matches well |
| 62 | Send message to recipients | STC059 | ✅ Good | Matches well |
| 63 | Remaining voucher = 0 (negative) | STC060 | ✅ Good | Matches well |
| 64 | View Mobile Not Registered status | STC061 | ✅ Good | Matches well |
| 65 | SMS template registered recipients | STC062 | ⚠️ Documentation | Can't verify SMS |
| 66 | SMS template non-registered | STC063 | ⚠️ Documentation | Can't verify SMS |
| 67 | Email template registered | STC064 | ⚠️ Documentation | Can't verify email |
| 68 | Email template non-registered | STC065 | ⚠️ Documentation | Can't verify email |
| 69 | Click CLAIM VOUCHER button | STC066 | ⚠️ Documentation | Can't verify email link |
| 70 | Click REGISTER NOW button | STC067 | ⚠️ Documentation | Can't verify email link |

## Recommendations

1. **Reorganize test cases** to match Excel row order
2. **Add spec references** in test comments (e.g., "Ref: 2.4.4.2")
3. **Enhance expected results** to match Excel details
4. **Add test type labels** (Positive/Negative) in test names
5. **Implement missing steps** from Excel detailed test steps
6. **Add CSV test data files** for upload scenarios
7. **Document SMS/Email templates** in separate reference file
8. **Add end-to-end flows** for scenarios requiring account creation

## Status Legend
- ✅ Good: Test matches Excel specification well
- ⚠️ Partial: Test exists but incomplete or missing details
- ❌ Missing: Test not implemented
- 📝 Documentation: Test documents expected behavior but can't verify
