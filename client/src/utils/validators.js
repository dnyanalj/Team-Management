export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getPasswordIssues(value) {
  const issues = [];
  if (!value || value.length < 8) issues.push('at least 8 characters');
  if (!/[a-z]/.test(value)) issues.push('a lowercase letter');
  if (!/[A-Z]/.test(value)) issues.push('an uppercase letter');
  if (!/\d/.test(value)) issues.push('a number');
  if (!/[^A-Za-z0-9]/.test(value)) issues.push('a special character');
  return issues;
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}
