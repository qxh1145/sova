export const VALID_FORM_VARIANTS = ['success', 'error'] as const;
export type FormVariant = (typeof VALID_FORM_VARIANTS)[number];

export function isFormVariant(v: string): v is FormVariant {
  return (VALID_FORM_VARIANTS as readonly string[]).includes(v);
}

export const FIXTURE_FORM_LABELS = {
  formTitle: 'Yêu cầu tư vấn',
  phoneLabel: 'Số điện thoại',
  phonePlaceholder: 'Nhập số điện thoại...',
  phoneRequired: 'Vui lòng nhập số điện thoại',
  phoneInvalid: 'Số điện thoại không hợp lệ',
  submitButton: 'Gửi thông tin',
  submittingButton: 'Đang gửi...',
  releaseButton: 'Release Gate',
  demoBadge: 'Bản demo — chưa gửi thông tin',
  successMessage: 'Cảm ơn bạn đã gửi yêu cầu. Chúng tôi sẽ liên hệ lại sớm nhất.',
  errorMessage: 'Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại.',
};
