// Input validation utilities

export const validateItemName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Naam is verplicht' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Naam mag niet leeg zijn' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Naam mag maximaal 100 tekens zijn' };
  }
  
  // Basic XSS prevention - block obvious script tags and dangerous characters
  if (/[<>"'&]/.test(trimmed)) {
    return { valid: false, error: 'Naam bevat ongeldige tekens' };
  }
  
  return { valid: true, value: trimmed };
};

export const validateListName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Lijstnaam is verplicht' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Lijstnaam mag niet leeg zijn' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Lijstnaam mag maximaal 100 tekens zijn' };
  }
  
  // Basic XSS prevention
  if (/[<>"'&]/.test(trimmed)) {
    return { valid: false, error: 'Lijstnaam bevat ongeldige tekens' };
  }
  
  return { valid: true, value: trimmed };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>"'&]/g, '').trim();
};