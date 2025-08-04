import { validateItemName, validateListName, sanitizeInput } from '../validation';

describe('validation utilities', () => {
  describe('validateItemName', () => {
    test('should validate valid item names', () => {
      const result = validateItemName('Melk');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Melk');
    });

    test('should trim whitespace from valid names', () => {
      const result = validateItemName('  Brood  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Brood');
    });

    test('should reject empty or null names', () => {
      expect(validateItemName('').valid).toBe(false);
      expect(validateItemName(null).valid).toBe(false);
      expect(validateItemName(undefined).valid).toBe(false);
      expect(validateItemName('   ').valid).toBe(false);
    });

    test('should reject non-string inputs', () => {
      expect(validateItemName(123).valid).toBe(false);
      expect(validateItemName({}).valid).toBe(false);
      expect(validateItemName([]).valid).toBe(false);
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      const result = validateItemName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximaal 100 tekens');
    });

    test('should reject names with dangerous characters', () => {
      const dangerousNames = [
        '<script>alert("xss")</script>',
        'Item"name',
        "Item'name",
        'Item&name',
        'Item<name>',
      ];

      dangerousNames.forEach(name => {
        const result = validateItemName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('ongeldige tekens');
      });
    });

    test('should accept names with safe special characters', () => {
      const safeNames = [
        'Melk (vol)',
        'Brood - wit',
        'Appels 1kg',
        'Koffie 500g',
        'Pasta (penne)',
      ];

      safeNames.forEach(name => {
        const result = validateItemName(name);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateListName', () => {
    test('should validate valid list names', () => {
      const result = validateListName('Boodschappenlijst');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Boodschappenlijst');
    });

    test('should trim whitespace from valid names', () => {
      const result = validateListName('  Weekend Boodschappen  ');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Weekend Boodschappen');
    });

    test('should reject empty or null names', () => {
      expect(validateListName('').valid).toBe(false);
      expect(validateListName(null).valid).toBe(false);
      expect(validateListName(undefined).valid).toBe(false);
      expect(validateListName('   ').valid).toBe(false);
    });

    test('should reject non-string inputs', () => {
      expect(validateListName(123).valid).toBe(false);
      expect(validateListName({}).valid).toBe(false);
      expect(validateListName([]).valid).toBe(false);
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      const result = validateListName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximaal 100 tekens');
    });

    test('should reject names with dangerous characters', () => {
      const dangerousNames = [
        '<script>alert("xss")</script>',
        'List"name',
        "List'name",
        'List&name',
        'List<name>',
      ];

      dangerousNames.forEach(name => {
        const result = validateListName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('ongeldige tekens');
      });
    });

    test('should accept names with safe special characters', () => {
      const safeNames = [
        'Boodschappen (week 1)',
        'Vakantie - Frankrijk',
        'Feest 2024',
        'Dagelijkse boodschappen',
      ];

      safeNames.forEach(name => {
        const result = validateListName(name);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('sanitizeInput', () => {
    test('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeInput('Hello"World')).toBe('HelloWorld');
      expect(sanitizeInput("Hello'World")).toBe('HelloWorld');
      expect(sanitizeInput('Hello&World')).toBe('HelloWorld');
      expect(sanitizeInput('Hello<World>')).toBe('HelloWorld');
    });

    test('should trim whitespace', () => {
      expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
      expect(sanitizeInput('\t\nHello\t\n')).toBe('Hello');
    });

    test('should handle non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
      expect(sanitizeInput([])).toBe('');
    });

    test('should preserve safe characters', () => {
      expect(sanitizeInput('Hello World 123 (test)')).toBe('Hello World 123 (test)');
      expect(sanitizeInput('Café-Restaurant')).toBe('Café-Restaurant');
    });

    test('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });
  });
});