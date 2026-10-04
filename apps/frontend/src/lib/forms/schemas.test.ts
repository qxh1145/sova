import { describe, expect, it } from 'vitest';
import { consultSchema, phoneSchema } from './schemas';

describe('form schemas', () => {
  const messages = {
    required: 'Phone is required',
    invalid: 'Phone is invalid',
  };

  describe('phoneSchema', () => {
    const schema = phoneSchema(messages);

    it('rejects empty and whitespace-only strings with required message', () => {
      const emptyResult = schema.safeParse('');
      expect(emptyResult.success).toBe(false);
      if (!emptyResult.success) {
        expect(emptyResult.error.issues).toHaveLength(1);
        expect(emptyResult.error.issues[0]?.message).toBe(messages.required);
      }

      const spacesResult = schema.safeParse('   ');
      expect(spacesResult.success).toBe(false);
      if (!spacesResult.success) {
        expect(spacesResult.error.issues).toHaveLength(1);
        expect(spacesResult.error.issues[0]?.message).toBe(messages.required);
      }
    });

    it('rejects invalid phone numbers with invalid message', () => {
      const invalidCases = [
        'abc',
        '123',
        '0988606539a',
        'phone: 0988606539',
        '12345678', // only 8 digits
        '1234567890123456', // 16 digits (too long)
      ];

      for (const input of invalidCases) {
        const result = schema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toBe(messages.invalid);
        }
      }
    });

    it('accepts valid phone numbers across multiple formats', () => {
      const validCases = [
        '0988606539',
        '+84988606539',
        '0988 606 539',
        '(+84) 988-606-539',
        '024.3765.4321',
        '+1 555 123 4567',
      ];

      for (const input of validCases) {
        const result = schema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('consultSchema', () => {
    it('validates consult form with required phone', () => {
      const schema = consultSchema({
        required: 'Phone required',
        invalid: 'Phone invalid',
      });

      const invalidResult = schema.safeParse({ phone: '' });
      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues).toHaveLength(1);
        expect(invalidResult.error.format().phone?._errors[0]).toBe('Phone required');
      }

      const validResult = schema.safeParse({ phone: '0988606539' });
      expect(validResult.success).toBe(true);
      if (validResult.success) {
        expect(validResult.data.phone).toBe('0988606539');
      }
    });

    it('supports alternative consult message parameter signatures', () => {
      const schemaNamed = consultSchema({
        phoneRequired: 'Named required',
        phoneInvalid: 'Named invalid',
      });
      const resNamed = schemaNamed.safeParse({ phone: 'bad' });
      expect(resNamed.success).toBe(false);
      if (!resNamed.success) {
        expect(resNamed.error.format().phone?._errors[0]).toBe('Named invalid');
      }

      const schemaNested = consultSchema({
        phone: { required: 'Nested required', invalid: 'Nested invalid' },
      });
      const resNested = schemaNested.safeParse({ phone: '' });
      expect(resNested.success).toBe(false);
      if (!resNested.success) {
        expect(resNested.error.format().phone?._errors[0]).toBe('Nested required');
      }
    });
  });
});
