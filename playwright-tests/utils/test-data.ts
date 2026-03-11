export const ADMIN_PORTAL = {
  URL: 'https://corpvoucher.fam-stg.click/admin/login',
  CREDENTIALS: {
    email: 'adminusertgv01@yopmail.com',
    password: 'Hahahaha123@'
  }
};

// export const ADMIN_PORTAL = {
//   URL: 'https://corpvoucher.fam-stg.click/admin/login',
//   CREDENTIALS: {
//     email: 'lindaamalia+1@axrail.com',
//     password: 'Rahasi@123'
//   }
// };

export const PUBLIC_WEB = {
  URL: 'https://corporate-voucher-stg.fam-stg.click/',
  LOGIN_URL: 'https://corporate-voucher-stg.fam-stg.click/login',
  EXISTING_USER: {
    email: 'lindaamalia@axrail.com',
    password: 'Rahasia567_'
  }
};

export const SIGNUP_DATA = {
  generateEmail: (index: number) => `tgvuser_${String(index).padStart(3, '0')}@yopmail.com`,
  generatePhoneNumber: (lastDigit: number) => `6010441123${lastDigit}`,
  generateNRIC: () => {
    // Generate NRIC in format XXXXXX-XX-XXXX
    const part1 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const part2 = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const part3 = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${part1}-${part2}-${part3}`;
  },
  name: 'TGV USER ONE',
  password: 'P@ssw0rd',
  idType: 'NRIC',
  streetAddress: 'Jaalan Bersama',
  postalCode: '40286',
  state: 'Johor',
  city: 'Johor Bahru',  // Fixed spelling: Bahru not Baru
  country: 'Malaysia'
};

export const YOPMAIL_URL = 'https://yopmail.com';
