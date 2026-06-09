/**
 * Lightweight demo "login" (NOT real auth).
 *
 * The learner enters an email; we look up the matching `accounts` row and
 * remember its slug in localStorage. The data bootstrap (accountData.ts) then
 * loads that account instead of the is_active row. No password is verified —
 * this is for prototype/demo use only.
 */
const SLUG_KEY = 'lte_account_slug';
const EMAIL_KEY = 'lte_account_email';
const NAME_KEY = 'lte_account_name';

export function getSessionSlug(): string | null {
  try {
    return localStorage.getItem(SLUG_KEY);
  } catch {
    return null;
  }
}

export function getSessionEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY);
  } catch {
    return null;
  }
}

export function getSessionName(): string | null {
  try {
    return localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getSessionSlug();
}

export function setSession(slug: string, email: string, name: string): void {
  localStorage.setItem(SLUG_KEY, slug);
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(NAME_KEY, name);
}

export function clearSession(): void {
  localStorage.removeItem(SLUG_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(NAME_KEY);
}
