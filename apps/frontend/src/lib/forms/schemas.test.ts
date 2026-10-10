import { describe, expect, it } from 'vitest';
import { consultSchema, optionalPhoneSchema, phoneSchema, websiteContactSchema } from './schemas';

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
        '++84988606539',
        '0988+606+539',
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

  describe('optionalPhoneSchema', () => {
    const schema = optionalPhoneSchema(messages.invalid);

    it('accepts empty and whitespace-only strings', () => {
      expect(schema.safeParse('').success).toBe(true);
      expect(schema.safeParse('   ').success).toBe(true);
    });

    it('rejects invalid phones when provided', () => {
      const result = schema.safeParse('abc');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(messages.invalid);
      }
    });

    it('accepts valid phones', () => {
      expect(schema.safeParse('0988606539').success).toBe(true);
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
  });

  describe('websiteContactSchema', () => {
    const websiteMessages = {
      nameRequired: 'Vui lòng nhập họ và tên',
      businessRequired: 'Vui lòng nhập lĩnh vực kinh doanh',
      phoneInvalid: 'Số điện thoại không hợp lệ',
    };
    const schema = websiteContactSchema(websiteMessages);

    it('accepts valid inputs with phone omitted or empty', () => {
      const result = schema.safeParse({
        'your-name': 'Nguyễn Văn A',
        'your-lvuc': 'Bán lẻ',
        'your-phone': '',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data['your-name']).toBe('Nguyễn Văn A');
        expect(result.data['your-lvuc']).toBe('Bán lẻ');
      }
    });

    it('accepts empty message', () => {
      const result = schema.safeParse({
        'your-name': 'Nguyễn Văn A',
        'your-lvuc': 'Bán lẻ',
        'your-phone': '0988606539',
        'your-message': '',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty name with nameRequired message', () => {
      const result = schema.safeParse({
        'your-name': '   ',
        'your-lvuc': 'Bán lẻ',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format()['your-name']?._errors[0]).toBe(websiteMessages.nameRequired);
      }
    });

    it('rejects empty business with businessRequired message', () => {
      const result = schema.safeParse({
        'your-name': 'Nguyễn Văn A',
        'your-lvuc': '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format()['your-lvuc']?._errors[0]).toBe(
          websiteMessages.businessRequired,
        );
      }
    });

    it('rejects invalid phone when provided', () => {
      const result = schema.safeParse({
        'your-name': 'Nguyễn Văn A',
        'your-lvuc': 'Bán lẻ',
        'your-phone': '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format()['your-phone']?._errors[0]).toBe(websiteMessages.phoneInvalid);
      }
    });

    it('rejects values over the source maxlength', () => {
      const valid = { 'your-name': 'A', 'your-phone': '', 'your-lvuc': 'B' };
      expect(schema.safeParse({ ...valid, 'your-name': 'a'.repeat(401) }).success).toBe(false);
      expect(schema.safeParse({ ...valid, 'your-lvuc': 'b'.repeat(401) }).success).toBe(false);
      expect(schema.safeParse({ ...valid, 'your-message': 'c'.repeat(2001) }).success).toBe(false);
      expect(schema.safeParse({ ...valid, 'your-message': 'c'.repeat(2000) }).success).toBe(true);
    });
  });
});
