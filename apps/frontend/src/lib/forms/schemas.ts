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

function requiredText(message: string, max?: number) {
  const schema = z.string().trim().min(1, { message });
  return typeof max === 'number' ? schema.max(max) : schema;
}

export function websiteContactSchema(messages: WebsiteContactValidationMessages) {
  return z.object({
    // max() mirrors the source inputs' maxlength (400 / textarea 2000)
    'your-name': requiredText(messages.nameRequired, 400),
    'your-phone': optionalPhoneSchema(messages.phoneInvalid),
    'your-lvuc': requiredText(messages.businessRequired, 400),
    'your-message': z.string().trim().max(2000).optional(),
  });
}

export type WebsiteContactFormValues = z.infer<ReturnType<typeof websiteContactSchema>>;

export interface ContactValidationMessages {
  required: string;
  emailInvalid: string;
  phoneInvalid: string;
}

export function contactSchema(messages: ContactValidationMessages) {
  return z.object({
    'your-name': requiredText(messages.required, 400),
    'your-email': requiredText(messages.required, 400).pipe(
      z.string().email({ message: messages.emailInvalid }),
    ),
    service: requiredText(messages.required),
    'tel-584': phoneSchema({
      required: messages.required,
      invalid: messages.phoneInvalid,
    }),
    'your-message': requiredText(messages.required, 2000),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof contactSchema>>;

export interface LoginValidationMessages {
  usernameRequired: string;
  passwordRequired: string;
}

export function loginSchema(messages: LoginValidationMessages) {
  return z.object({
    log: z.string().trim().min(1, { message: messages.usernameRequired }),
    pwd: z.string().min(1, { message: messages.passwordRequired }),
    rememberme: z.boolean().optional(),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;
