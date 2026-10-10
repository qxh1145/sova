import { z } from 'zod';

export { zodResolver } from '@hookform/resolvers/zod';

export interface PhoneValidationMessages {
  required: string;
  invalid: string;
}

// Single optional leading `+`, bare or as `(+`.
const PHONE_CHARS_REGEX = /^(?:\+|\(\+)?[\d\s().-]+$/;

function validatePhone(val: string | undefined): boolean {
  if (!val || val.length === 0) return true;
  if (!PHONE_CHARS_REGEX.test(val)) return false;
  const digits = val.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function phoneSchema(messages: PhoneValidationMessages) {
  return z
    .string()
    .trim()
    .min(1, { message: messages.required })
    .refine(validatePhone, { message: messages.invalid });
}

export function optionalPhoneSchema(invalidMessage: string) {
  return z.string().trim().refine(validatePhone, { message: invalidMessage });
}

export function consultSchema(messages: PhoneValidationMessages) {
  return z.object({
    phone: phoneSchema(messages),
  });
}

export type ConsultFormValues = z.infer<ReturnType<typeof consultSchema>>;

export interface WebsiteContactValidationMessages {
  nameRequired: string;
  businessRequired: string;
  phoneInvalid: string;
}

export function websiteContactSchema(messages: WebsiteContactValidationMessages) {
  return z.object({
    // max() mirrors the source inputs' maxlength (400 / textarea 2000)
    'your-name': z.string().trim().min(1, { message: messages.nameRequired }).max(400),
    'your-phone': optionalPhoneSchema(messages.phoneInvalid),
    'your-lvuc': z.string().trim().min(1, { message: messages.businessRequired }).max(400),
    'your-message': z.string().trim().max(2000).optional(),
  });
}

export type WebsiteContactFormValues = z.infer<ReturnType<typeof websiteContactSchema>>;
