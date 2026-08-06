import disposableEmailDomains from "disposable-email-domains";

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  // Check if domain is in the blocklist
  return (disposableEmailDomains as string[]).includes(domain);
}
