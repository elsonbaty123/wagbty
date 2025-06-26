
export const whitelistedEmailDomains = new Set([
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'yahoo.com.eg',
  'email.com',
  // 'university.edu', // Example for academic institutions
  // 'yourcompany.com', // Example for corporate use
]);

export const isWhitelistedEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) {
    return false;
  }
  const domain = email.split('@')[1].toLowerCase();
  return whitelistedEmailDomains.has(domain);
};
