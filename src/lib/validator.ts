export function isValidEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  if (normalizedEmail.length > 254) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(normalizedEmail);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}