// Guest fingerprint management for anonymous users
const GUEST_FINGERPRINT_KEY = 'guest_fingerprint';

export function getGuestFingerprint(): string {
  let fingerprint = localStorage.getItem(GUEST_FINGERPRINT_KEY);
  
  if (!fingerprint) {
    fingerprint = crypto.randomUUID();
    localStorage.setItem(GUEST_FINGERPRINT_KEY, fingerprint);
  }
  
  return fingerprint;
}

export function clearGuestFingerprint(): void {
  localStorage.removeItem(GUEST_FINGERPRINT_KEY);
}