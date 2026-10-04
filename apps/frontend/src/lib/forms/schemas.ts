import { z } from 'zod';

export { zodResolver } from '@hookform/resolvers/zod';
export { z } from 'zod';

export interface PhoneValidationMessages {
  required: string;
  invalid: string;
}

const PHONE_CHARS_REGEX = /^[+\d\s().-]+$/;

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

export type ConsultValidationMessages =
  | PhoneValidationMessages
  | { phoneRequired: string; phoneInvalid: string }
  | { phone: PhoneValidationMessages };

export function consultSchema(messages: ConsultValidationMessages) {
  let phoneMessages: PhoneValidationMessages;
  if ('phone' in messages) {
    phoneMessages = messages.phone;
  } else if ('phoneRequired' in messages) {
    phoneMessages = {
      required: messages.phoneRequired,
      invalid: messages.phoneInvalid,
    };
  } else {
    phoneMessages = messages;
  }

  return z.object({
    phone: phoneSchema(phoneMessages),
  });
}

export type ConsultFormValues = z.infer<ReturnType<typeof consultSchema>>;
