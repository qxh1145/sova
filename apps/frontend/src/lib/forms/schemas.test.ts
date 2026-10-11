import { describe, expect, it } from 'vitest';
import {
  contactSchema,
  consultSchema,
  loginSchema,
  optionalPhoneSchema,
  phoneSchema,
  websiteContactSchema,
} from './schemas';

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

  describe('contactSchema', () => {
    const contactMessages = {
      required: 'Vui lòng điền vào trường này.',
      emailInvalid: 'Địa chỉ email không hợp lệ.',
      phoneInvalid: 'Số điện thoại không hợp lệ',
    };
    const schema = contactSchema(contactMessages);

    const validPayload = {
      'your-name': 'Nguyễn Văn A',
      'your-email': 'vana@example.com',
      service: 'Dịch Vụ Thiết Kế Website',
      'tel-584': '0988606539',
      'your-message': 'Mô tả dự án chi tiết',
    };

    it('accepts valid inputs for all 5 required fields', () => {
      const result = schema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data['your-name']).toBe('Nguyễn Văn A');
        expect(result.data['your-email']).toBe('vana@example.com');
        expect(result.data.service).toBe('Dịch Vụ Thiết Kế Website');
        expect(result.data['tel-584']).toBe('0988606539');
        expect(result.data['your-message']).toBe('Mô tả dự án chi tiết');
      }
    });

    it('rejects each field when empty or whitespace with required message', () => {
      // your-name
      const badName = schema.safeParse({ ...validPayload, 'your-name': '' });
      expect(badName.success).toBe(false);
      if (!badName.success) {
        expect(badName.error.format()['your-name']?._errors[0]).toBe(contactMessages.required);
      }

      const spacesName = schema.safeParse({ ...validPayload, 'your-name': '   ' });
      expect(spacesName.success).toBe(false);
      if (!spacesName.success) {
        expect(spacesName.error.format()['your-name']?._errors[0]).toBe(contactMessages.required);
      }

      // your-email
      const badEmail = schema.safeParse({ ...validPayload, 'your-email': '' });
      expect(badEmail.success).toBe(false);
      if (!badEmail.success) {
        expect(badEmail.error.format()['your-email']?._errors[0]).toBe(contactMessages.required);
      }

      // service
      const badService = schema.safeParse({ ...validPayload, service: '' });
      expect(badService.success).toBe(false);
      if (!badService.success) {
        expect(badService.error.format().service?._errors[0]).toBe(contactMessages.required);
      }

      // tel-584
      const badPhone = schema.safeParse({ ...validPayload, 'tel-584': '' });
      expect(badPhone.success).toBe(false);
      if (!badPhone.success) {
        expect(badPhone.error.format()['tel-584']?._errors[0]).toBe(contactMessages.required);
      }

      // your-message
      const badMessage = schema.safeParse({ ...validPayload, 'your-message': '' });
      expect(badMessage.success).toBe(false);
      if (!badMessage.success) {
        expect(badMessage.error.format()['your-message']?._errors[0]).toBe(contactMessages.required);
      }
    });

    it('rejects invalid email formats with emailInvalid message', () => {
      const invalidEmails = ['abc', 'user@', '@example.com', 'user@.com'];
      for (const email of invalidEmails) {
        const result = schema.safeParse({ ...validPayload, 'your-email': email });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.format()['your-email']?._errors[0]).toBe(
            contactMessages.emailInvalid,
          );
        }
      }
    });

    it('rejects invalid phone numbers with phoneInvalid message', () => {
      const invalidPhones = ['12', 'abc', '12345678', '++84988606539'];
      for (const phone of invalidPhones) {
        const result = schema.safeParse({ ...validPayload, 'tel-584': phone });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.format()['tel-584']?._errors[0]).toBe(contactMessages.phoneInvalid);
        }
      }
    });

    it('validates 2000 character limit on message (2000 ok, 2001 fails)', () => {
      const ok2000 = schema.safeParse({ ...validPayload, 'your-message': 'm'.repeat(2000) });
      expect(ok2000.success).toBe(true);

      const fail2001 = schema.safeParse({ ...validPayload, 'your-message': 'm'.repeat(2001) });
      expect(fail2001.success).toBe(false);
    });

    it('rejects name and email over 400 characters', () => {
      expect(schema.safeParse({ ...validPayload, 'your-name': 'a'.repeat(401) }).success).toBe(
        false,
      );
      expect(
        schema.safeParse({
          ...validPayload,
          'your-email': `${'a'.repeat(395)}@b.com`, // 401 chars
        }).success,
      ).toBe(false);
    });
  });

  describe('loginSchema', () => {
    const loginMessages = {
      usernameRequired: 'Lỗi: Trường tên người dùng đang trống.',
      passwordRequired: 'Lỗi: Mục mật khẩu đang trống.',
    };
    const schema = loginSchema(loginMessages);

    it('rejects when both fields are blank with two error messages', () => {
      const result = schema.safeParse({ log: '', pwd: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues[0]?.message).toBe(loginMessages.usernameRequired);
        expect(result.error.issues[1]?.message).toBe(loginMessages.passwordRequired);
      }
    });

    it('rejects whitespace-only username', () => {
      const result = schema.safeParse({ log: '   ', pwd: 'mypassword' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0]?.message).toBe(loginMessages.usernameRequired);
      }
    });

    it('does not trim password, keeping leading and trailing whitespace', () => {
      const resultSpace = schema.safeParse({ log: 'myuser', pwd: ' ' });
      expect(resultSpace.success).toBe(true);
      if (resultSpace.success) {
        expect(resultSpace.data.pwd).toBe(' ');
      }

      const result = schema.safeParse({ log: 'myuser', pwd: ' password with spaces ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pwd).toBe(' password with spaces ');
      }
    });

    it('accepts valid credentials with and without rememberme', () => {
      const resultWithRemember = schema.safeParse({
        log: '  myuser  ',
        pwd: 'mypassword',
        rememberme: true,
      });
      expect(resultWithRemember.success).toBe(true);
      if (resultWithRemember.success) {
        expect(resultWithRemember.data.log).toBe('myuser');
        expect(resultWithRemember.data.pwd).toBe('mypassword');
        expect(resultWithRemember.data.rememberme).toBe(true);
      }

      const resultDefault = schema.safeParse({
        log: 'myuser',
        pwd: 'mypassword',
      });
      expect(resultDefault.success).toBe(true);
      if (resultDefault.success) {
        expect(resultDefault.data.rememberme).toBeUndefined();
      }
    });
  });
});
