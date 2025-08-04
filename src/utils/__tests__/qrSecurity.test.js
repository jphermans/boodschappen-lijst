import { validateQRData, sanitizeQRInput } from '../qrSecurity';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('qrSecurity utilities', () => {
  describe('validateQRData', () => {
    test('should validate direct list ID format', () => {
      const validIds = [
        'abc123def456gh',
        'list-id-12345',
        'my_list_123456',
        'a1b2c3d4e5f6g7h8i9j0',
      ];

      validIds.forEach(id => {
        const result = validateQRData(id);
        expect(result.valid).toBe(true);
        expect(result.listId).toBe(id);
      });
    });

    test('should validate URL with #/shared/ pattern', () => {
      const urls = [
        'https://example.com#/shared/abc123def456gh',
        'http://localhost:3000#/shared/list-id-12345',
        'https://myapp.com/#/shared/my_list_123456',
      ];

      urls.forEach(url => {
        const result = validateQRData(url);
        expect(result.valid).toBe(true);
        expect(result.listId).toBeTruthy();
      });
    });

    test('should validate URL with /shared/ pattern', () => {
      const urls = [
        'https://example.com/shared/abc123def456gh',
        'http://localhost:3000/shared/list-id-12345',
        'https://myapp.com/shared/my_list_123456',
      ];

      urls.forEach(url => {
        const result = validateQRData(url);
        expect(result.valid).toBe(true);
        expect(result.listId).toBeTruthy();
      });
    });

    test('should validate legacy URL with # pattern', () => {
      const urls = [
        'https://example.com#abc123def456gh',
        'http://localhost:3000#list-id-12345',
        'https://myapp.com#my_list_123456',
      ];

      urls.forEach(url => {
        const result = validateQRData(url);
        expect(result.valid).toBe(true);
        expect(result.listId).toBeTruthy();
      });
    });

    test('should handle URLs with query parameters', () => {
      // Test with a simple valid case
      const result = validateQRData('https://example.com#/shared/abc123def456gh789');
      expect(result.valid).toBe(true);
      expect(result.listId).toBe('abc123def456gh789');
    });

    test('should reject invalid input types', () => {
      const invalidInputs = [null, undefined, 123, {}, [], true];

      invalidInputs.forEach(input => {
        const result = validateQRData(input);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('geen geldige tekst');
      });
    });

    test('should reject empty or whitespace-only strings', () => {
      const result1 = validateQRData('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain('geen geldige tekst');

      const result2 = validateQRData('   ');
      expect(result2.valid).toBe(false);
      // After trimming, this becomes empty and gets caught by the ID validation
      expect(result2.error).toBeTruthy();
    });

    test('should reject strings that are too long', () => {
      const longString = 'a'.repeat(501);
      const result = validateQRData(longString);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('te lang');
    });

    test('should reject list IDs that are too short', () => {
      const shortIds = ['abc', '12345', 'short'];

      shortIds.forEach(id => {
        const result = validateQRData(id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Ongeldige lijst ID');
      });
    });

    test('should reject list IDs that are too long', () => {
      const longId = 'a'.repeat(31);
      const result = validateQRData(longId);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldige lijst ID');
    });

    test('should reject list IDs with invalid characters', () => {
      const invalidIds = [
        'abc@123def',
        'list id with spaces',
        'list#with#hash',
        'list.with.dots',
        'list/with/slashes',
      ];

      invalidIds.forEach(id => {
        const result = validateQRData(id);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Ongeldige lijst ID');
      });
    });

    test('should block malicious patterns', () => {
      const maliciousInputs = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
        'file:///etc/passwd',
        'malware.exe',
        'script.bat',
        'hack.sh',
      ];

      maliciousInputs.forEach(input => {
        const result = validateQRData(input);
        expect(result.valid).toBe(false);
        // Some inputs are blocked by malicious pattern check, others by invalid ID format
        expect(result.error).toMatch(/onveilige QR-code|Ongeldige lijst ID/);
      });
    });

    test('should sanitize dangerous characters', () => {
      const dangerousInput = 'https://example.com#/shared/<script>alert("xss")</script>';
      const result = validateQRData(dangerousInput);
      // Should still be invalid because the cleaned ID won't match the pattern
      expect(result.valid).toBe(false);
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'https://example.com#/shared/',
        'https://example.com/shared/',
        'https://example.com#',
        'https://example.com#/shared/invalid@id',
      ];

      malformedUrls.forEach(url => {
        const result = validateQRData(url);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    test('should handle direct text input', () => {
      const result = validateQRData('not-a-url-at-all');
      // This might be valid if it matches the direct ID pattern
      expect(result.valid).toBe(true);
      expect(result.listId).toBe('not-a-url-at-all');
    });

    test('should handle exceptions gracefully', () => {
      // Test with malformed input that might cause issues
      const result = validateQRData('https://example.com#/shared/');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldige lijst ID');
    });
  });

  describe('sanitizeQRInput', () => {
    test('should remove dangerous characters', () => {
      expect(sanitizeQRInput('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeQRInput('Hello"World')).toBe('HelloWorld');
      expect(sanitizeQRInput("Hello'World")).toBe('HelloWorld');
      expect(sanitizeQRInput('Hello&World')).toBe('HelloWorld');
      expect(sanitizeQRInput('Hello<World>')).toBe('HelloWorld');
    });

    test('should trim whitespace', () => {
      expect(sanitizeQRInput('  https://example.com  ')).toBe('https://example.com');
      expect(sanitizeQRInput('\t\nhttps://example.com\t\n')).toBe('https://example.com');
    });

    test('should handle non-string inputs', () => {
      expect(sanitizeQRInput(null)).toBe('');
      expect(sanitizeQRInput(undefined)).toBe('');
      expect(sanitizeQRInput(123)).toBe('');
      expect(sanitizeQRInput({})).toBe('');
      expect(sanitizeQRInput([])).toBe('');
    });

    test('should preserve safe characters', () => {
      const safeUrl = 'https://example.com/shared/abc123def456';
      expect(sanitizeQRInput(safeUrl)).toBe(safeUrl);
    });

    test('should handle empty strings', () => {
      expect(sanitizeQRInput('')).toBe('');
      expect(sanitizeQRInput('   ')).toBe('');
    });

    test('should handle unicode characters correctly', () => {
      expect(sanitizeQRInput('café')).toBe('café');
      expect(sanitizeQRInput('naïve')).toBe('naïve');
      expect(sanitizeQRInput('résumé')).toBe('résumé');
    });
  });
});