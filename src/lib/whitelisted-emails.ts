
// This file can be used to define a set of email domains that are explicitly allowed,
// for example, if you wanted to restrict signups to specific organizations.
// By default, it is empty and not used.

export const whitelistedEmailDomains = new Set<string>([]);

export const isWhitelistedEmail = (email: string): boolean => {
  if (whitelistedEmailDomains.size === 0) {
    // If the whitelist is empty, all emails are considered okay by this check.
    return true;
  }
  if (!email || !email.includes('@')) {
    return false;
  }
  const domain = email.split('@')[1].toLowerCase();
  return whitelistedEmailDomains.has(domain);
};
