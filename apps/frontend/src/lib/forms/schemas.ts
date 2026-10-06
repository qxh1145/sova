import { z } from 'zod';

export { zodResolver } from '@hookform/resolvers/zod';

export interface PhoneValidationMessages {
  required: string;
  invalid: string;
}

// Single optional leading `+`, bare or as `(+`.
const PHONE_CHARS_REGEX = /^(?:\+|\(\+)?[\d\s().-]+$/;

export function phoneSchema(messages: PhoneValidationMessages) {
  return z
    .string()
    .trim()
    .min(1, { message: messages.required })
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        if (!PHONE_CHARS_REGEX.test(val)) return false;
        const digits = val.replace(/\D/g, '');
        return digits.length >= 9 && digits.length <= 15;
      },
      { message: messages.invalid },
    );
}

export function consultSchema(messages: PhoneValidationMessages) {
  return z.object({
    phone: phoneSchema(messages),
  });
}

export type ConsultFormValues = z.infer<ReturnType<typeof consultSchema>>;
