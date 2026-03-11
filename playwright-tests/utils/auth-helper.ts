import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export async function saveLocalStorage(page: Page, filename: string) {
  const localStorage = await page.evaluate(() => {
    // @ts-ignore - window exists in browser context
    return JSON.stringify(window.localStorage);
  });
  const authDir = path.join(process.cwd(), '.auth');
  
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(authDir, filename), localStorage);
  console.log(`LocalStorage saved to ${filename}`);
}

export async function loadLocalStorage(page: Page, filename: string) {
  const authPath = path.join(process.cwd(), '.auth', filename);
  
  if (fs.existsSync(authPath)) {
    const localStorage = fs.readFileSync(authPath, 'utf-8');
    await page.evaluate((data) => {
      const items = JSON.parse(data);
      for (const key in items) {
        // @ts-ignore - window exists in browser context
        window.localStorage.setItem(key, items[key]);
      }
    }, localStorage);
    console.log(`LocalStorage loaded from ${filename}`);
  } else {
    console.log(`LocalStorage file ${filename} not found`);
  }
}

// Updated tokens from latest session (January 2025)
export const ADMIN_LOCALSTORAGE_TOKENS = {
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.accessToken': 'eyJraWQiOiJEWk5mdnlKYXVcL3hhQlFQUnJYNmxNVGdmYWRtNG00UVg4VnlwWnJQeHkzcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NTlkMjVhOC0yMGMxLTcwZTUtOTkyYy00YjFhY2M2MmQ0NzUiLCJkZXZpY2Vfa2V5IjoiYXAtc291dGhlYXN0LTVfMzhkZmNmYWEtMGFmOS00YTc3LWFmMGEtMzU0NGZlMjRkODQ1IiwiY29nbml0bzpncm91cHMiOlsiTWVyY2hhbnQiXSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC01LmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC01X2Y2bjBRemFIciIsImNsaWVudF9pZCI6IjYyNWZuaXU5Zjg5cDhqa2Nqam4wOXBmNDkwIiwib3JpZ2luX2p0aSI6IjcxMzFmNTdmLTZlNTItNGZlNy05YmM0LWM1ZjU3YTJlMmE1NyIsImV2ZW50X2lkIjoiYjNiMDVkYzItZmIwMC00NDAwLThkNTQtMzZkY2VkOTg3NmE0IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc3MzE5NDA3MSwiZXhwIjoxNzczMTk0MzcxLCJpYXQiOjE3NzMxOTQwNzEsImp0aSI6ImViYjVmNzA1LTljNGUtNDJmZS05N2I3LWYzYzQ5MzFjYzVhZCIsInVzZXJuYW1lIjoiNDU5ZDI1YTgtMjBjMS03MGU1LTk5MmMtNGIxYWNjNjJkNDc1In0.6yB6bGGTS7o6pRRoU2vlROPrMEm_WJrpTrY9ayWlW0HlnF4abh8XcBw3SGqRLWt97v6uhOec7RjV5uaJwPj9faiXsyMKjD6GKo071EGDDbt16hnY0Pae26P7UDL4IeSXMC53F5hU41V2LavIGWq86OADRLWz7RcM2lGcDXNZ4xqkDssciaEC2hYa7j7h6lMJ0mXXL_-qEvaaeUO1rYVwrr-IpN4GHATz5d4JBuOQAVijyJdA7WQ0ISx3_fmO0bOmvRN7HQys1dyNbmO7awFxsVryExjb-i_bEC5qzugv3OvME8GpDMtz0hCa2XtKtqgXgHkKWCFgJKRaULbUVpY-vg',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.clockDrift': '0',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.deviceGroupKey': '116914e3-58fa-47af-88f3-5a308adc3b3b',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.deviceKey': 'ap-southeast-5_38dfcfaa-0af9-4a77-af0a-3544fe24d845',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.idToken': 'eyJraWQiOiJ1OFlRRm1MYk5qd3ZFRktKNHVTME1EYWs3RTdyRTBXcGxsSFwvZWh2VUIydz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NTlkMjVhOC0yMGMxLTcwZTUtOTkyYy00YjFhY2M2MmQ0NzUiLCJjb2duaXRvOmdyb3VwcyI6WyJNZXJjaGFudCJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC01LmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC01X2Y2bjBRemFIciIsImNvZ25pdG86dXNlcm5hbWUiOiI0NTlkMjVhOC0yMGMxLTcwZTUtOTkyYy00YjFhY2M2MmQ0NzUiLCJvcmlnaW5fanRpIjoiNzEzMWY1N2YtNmU1Mi00ZmU3LTliYzQtYzVmNTdhMmUyYTU3IiwiYXVkIjoiNjI1Zm5pdTlmODlwOGprY2pqbjA5cGY0OTAiLCJldmVudF9pZCI6ImIzYjA1ZGMyLWZiMDAtNDQwMC04ZDU0LTM2ZGNlZDk4NzZhNCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzczMTk0MDcxLCJleHAiOjE3NzMxOTQzNzEsImlhdCI6MTc3MzE5NDA3MSwianRpIjoiYTcwNDAxYjYtYmQ3ZC00ZjI3LWI3YjktMGY2MGIyOTQ5YTE4IiwiZW1haWwiOiJhZG1pbnVzZXJ0Z3YwMUB5b3BtYWlsLmNvbSJ9.Pkmbt_Nsnnb6LWD8E9GXqFE7l2S4oSyw09PzmguOs1HsRBjGO27akV_b8fIxybkEc7tWpgSjXQ8ynRkxswyqYonjHuqe0WKqtC7103zaIWstADpnFMPkTnp-ESg3G-6mWIu7DUY-M0P4PfrgUJyPlhDKolhs15MBqlPoTpT7iEg1Ix1RDFyMX2aKCFFG5qIyHkyJ2xIqzhXwxkhR0Eh7QsoUmUn6ML24c2tvs_5lTvUUBnmji0FHtXwT9B4nhQFyQuJjwKOXC8H2I4oCMFRQ29jNbWKFYLBsz4RFjm7B3AP8yJBmp37rlGIZroZp0JAf9bMDwmI7imnt_f2sKGJLbQ',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.randomPasswordKey': 'w7achTdzWPaU4/el84GRdvxtvyNFK4a1xVGNtGgovm6i7ISC7FwzXQ==',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.refreshToken': 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.Jm347-6G-N_Y89G0cbLHskUxRFUp32df2YrH_lonVl0xmh2CH-9pof2LEZeGACvEBEkx4YjQ5Jxgwl4_FK2qk9jVNuJdab7HY96UQoC55UHliXNLIahh41n_kg09R9PM_T9NP79OHdvp3kOZBHptyC5rteqwiJa_a_FUghHUveqi7UWR14js5c0sqC8NJ4q45haChJ0bKIl2ws_Q-_5tA9CpDjOO__ARUVQLZzGQeBL7sXICSaaWNnhhv9S99lz3FGE_3ERhpLqXJ7ewZzjzSzZ-D0cFi9vUlpNFnotDu7t3ZX7slKLaIxSzwsDOjBBPoGj5vgS_chvacTeZOmFZMg.56Z7M7nEB-OUqmQC.YaWegwYUZ8ESOn-iP4BM-zjKrSO8oll487Qc2432G3fwb1IAQmEOKzRmObhIjf-utuWatfjXJCPI6PFUKNVVWoQEhcwxjRFR9GtQ8enPpWWOnZr1xxOXfJOU1KII2wIMO0d_50Ot1us3CR__lj5s-gpCPLw5IwfpD1R-ZubR6fGskxE2tGrOHH1gex_t2P5g8m8S-o5t-oFZwKRPTc7kZ1YrC-Dh-mpegvnuewQ7xmdZ05R9RmUA6hhj64RcYnTXNI-WiVzpgyiFFIXAhYcF63NE66dm0Ec2v-vYnhUVjEt30_I1yQROy8PBF1vt52nAewZ5J5PQw00GEtCrxkAZg4I2WEsBbteMYjUtF9Qug3jMAn7WgS-a4e2YX-MkiS6jDhOfMqlirVXwDb8HCfoWrr5nsIv7-gTs3E6UcgKRwZm8xknZT9Id4lVICHaJnztZg7H_nx1aVzzSlMNnzzdLJz1VmMdAPHHsR3V_WpLILtQX34xS5ecC16CPJvD6PxKJhE48HVXpK4ZGsBxt4B92-O8MePFfNZ_m69FClkefROY1T41QxkyF53J-SOYLytbph7rIOxbQfNrxhawGOfVMGsO2ELP9Ismn_KJ4rRVsVKMDHjWvmHF4hEEmtP6YSjOeGH5NNCdCrjmaLHC2fLJiui2GfhXccaAKM8i8elMtgPSwTWW20vXFZXrt2HCSFAE1lTncqSsXrmO0aECUnAp1Sx3Stgj9k_rlOCyIqzifLey-Z-2GvPtHRQA38GN6z_OrArnhKtEUZfS247RckMZCbpFZAJjHZVa2K3UVq_1MW5KAgNSNfV-5fOsuG-tuL4xwZYbhpFm5AbSDlw7AztMa09Iq2owEGnTUIVW83B01hO1HQGQPtGzyglyCQpEBdrqwEBzCSQOWNCFIC6PFfsvO4cmUJovFT7HlqDVU7b1RXsUeA2j2YpKnS1tgivjo7xnYVw0f3tREE1fruOXLK81dAfbEfROA1jJb1VHuRX71UOryXMLq8_pkslKo8fz1tICt9HJzKdj3HzaT8H_QzZGC3AP4NhY8HtH1tv9TUJgCGpSORMhqQGQXwElbu7iYFwVK9HkAqxNrP2I9E_leli-nBnu4UxZUl23VXpUw_CyjYyFytzmgyHuDF2WsICoKkXYv0qUSy8My-Eb6TaT3JTF-2YZl4am0oeQiMnFi8tu4oDt92ZRpVnvgYcW2hlIvyAg0Fk7iTBI7py0o8wMo_TV2-qtyq0bxYTH6qRFVOnOf0485qvVY71b4G2FYaMYEe-GOD5lvbSeIV7pnVXM6bBaerdW6Q2VmwD2lfCd7bdK-jSd_E3LBpKD11zGOCgHDzmiOeug8wcpQPQKA5DBd4WtzGTol--Y68FU43cwUkbVeLrK6wk21Fr0HM67Ik4M4HxVRxnYPOf1RJW381nVUAapUny9pykFbR34MiZoFj6LWP8ri_6hs7RezpGAUFNsWoDk6xCJO.UcWhGVe-dtXxU3j_rOR-Bw',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.459d25a8-20c1-70e5-992c-4b1acc62d475.userData': '{"UserAttributes":[{"Name":"email","Value":"adminusertgv01@yopmail.com"},{"Name":"email_verified","Value":"True"},{"Name":"sub","Value":"459d25a8-20c1-70e5-992c-4b1acc62d475"}],"Username":"459d25a8-20c1-70e5-992c-4b1acc62d475"}',
  'CognitoIdentityServiceProvider.625fniu9f89p8jkcjjn09pf490.LastAuthUser': '459d25a8-20c1-70e5-992c-4b1acc62d475',
  'amplify-signin-with-hostedUI': 'false'
};

/**
 * Inject authentication tokens directly into localStorage
 * This bypasses the login UI and is useful for faster test execution
 */
export async function injectAuthTokens(page: Page, tokens: Record<string, string> = ADMIN_LOCALSTORAGE_TOKENS) {
  await page.evaluate((tokensData) => {
    for (const [key, value] of Object.entries(tokensData)) {
      localStorage.setItem(key, value);
    }
  }, tokens);
  console.log('Auth tokens injected into localStorage');
}

/**
 * Login using localStorage injection instead of UI interaction
 * Much faster than filling forms and clicking buttons
 */
export async function loginViaLocalStorage(page: Page, url: string, tokens: Record<string, string> = ADMIN_LOCALSTORAGE_TOKENS) {
  // Navigate to the domain first (required for localStorage to work)
  await page.goto(url);
  
  // Inject the tokens
  await injectAuthTokens(page, tokens);
  
  // Reload to apply the authentication
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  console.log('Login completed via localStorage injection');
}
