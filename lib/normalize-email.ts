/**
 * lib/normalize-email.ts
 * Single source of truth for email normalization. Used by:
 *  - /api/request-vote-link  (lookup + upsert conflict target)
 *  - scripts/dedupe-voters.ts (grouping duplicates)
 *
 * Rules:
 *  - lowercase + trim
 *  - strip "+tag" from the local part — applies to ALL providers, since
 *    plus-addressing is a broadly supported convention (Gmail, Outlook,
 *    Yahoo, ProtonMail, FastMail, etc.)
 *  - strip dots from the local part — ONLY for gmail.com / googlemail.com.
 *    Gmail is the one major provider that truly ignores dots in usernames.
 *    Do NOT extend this to other domains — for most providers a dot is a
 *    real, distinct character (e.g. first.last@company.com is not the same
 *    inbox as firstlast@company.com anywhere except Gmail).
 *  - fold googlemail.com -> gmail.com (same provider, same behavior)
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  const noPlus = local.split("+")[0];
  const isGmail = domain === "gmail.com" || domain === "googlemail.com";
  const cleanedLocal = isGmail ? noPlus.replace(/\./g, "") : noPlus;
  const normalizedDomain = domain === "googlemail.com" ? "gmail.com" : domain;

  return `${cleanedLocal}@${normalizedDomain}`;
}
