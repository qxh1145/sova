'use client';

import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormResponse, ScreenReaderResponse, formStatusClass } from '@/components/ui/FormResponse';
import { useSubmitAdapter } from '@/lib/forms/SubmitAdapterContext';
import {
  websiteContactSchema,
  zodResolver,
  type WebsiteContactFormValues,
} from '@/lib/forms/schemas';
import { useSubmitStatus } from '@/lib/forms/useSubmitStatus';
import type { Locale, WebsiteContactFormLabels } from '@/types/content';

export interface WebsiteContactFormProps {
  labels: WebsiteContactFormLabels;
  locale: Locale;
}

export function WebsiteContactForm({ labels, locale }: WebsiteContactFormProps) {
  const adapter = useSubmitAdapter<WebsiteContactFormValues>();
  const { status, isSubmitting, submit, reset } = useSubmitStatus(adapter);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WebsiteContactFormValues>({
    resolver: zodResolver(
      websiteContactSchema({
        nameRequired: labels.nameRequired,
        businessRequired: labels.businessRequired,
        phoneInvalid: labels.phoneInvalid,
      }),
    ),
    defaultValues: {
      'your-name': '',
      'your-phone': '',
      'your-lvuc': '',
      'your-message': '',
    },
  });


  // A failed validation clears earlier demo result per CF7 behavior
  const onSubmit = handleSubmit(async (data) => {
    await submit(data);
  }, reset);

  const statusClass = formStatusClass(status, Object.keys(errors).length > 0);
  const wpcf7Id = locale === 'en' ? 'wpcf7-f6823-p7372-o1' : 'wpcf7-f6818-p7233-o1';
  const unitTag = locale === 'en' ? '6823' : '6818';

  return (
    <div className="wpcf7 no-js" id={wpcf7Id} lang={locale} dir="ltr" data-wpcf7-id={unitTag}>
      <ScreenReaderResponse status={status} labels={labels} />

      <form
        onSubmit={onSubmit}
        className={`wpcf7-form ${statusClass}`}
        noValidate
        data-status={status}
        aria-label={labels.heading}
      >
        <div className="custom-contact-form">
          <p>
            <span className="form-label">{labels.nameLabel}</span>
            <br />
            <FormField
              as="span"
              name="your-name"
              label={labels.nameLabel}
              labelHidden
              error={errors['your-name']?.message}
            >
              <input
                {...register('your-name')}
                type="text"
                size={40}
                maxLength={400}
                className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                aria-required="true"
                placeholder={labels.namePlaceholder}
              />
            </FormField>
          </p>

          <p>
            <span className="form-label">{labels.phoneLabel}</span>
            <br />
            <FormField
              as="span"
              name="your-phone"
              label={labels.phoneLabel}
              labelHidden
              error={errors['your-phone']?.message}
            >
              <input
                {...register('your-phone')}
                type="tel"
                size={40}
                maxLength={400}
                className="wpcf7-form-control wpcf7-tel wpcf7-text wpcf7-validates-as-tel"
                placeholder={labels.phonePlaceholder}
              />
            </FormField>
          </p>

          <p>
            <span className="form-label">{labels.businessLabel}</span>
            <br />
            <FormField
              as="span"
              name="your-lvuc"
              label={labels.businessLabel}
              labelHidden
              error={errors['your-lvuc']?.message}
            >
              <input
                {...register('your-lvuc')}
                type="text"
                size={40}
                maxLength={400}
                className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                aria-required="true"
                placeholder={labels.businessPlaceholder}
              />
            </FormField>
          </p>

          <p>
            <span className="form-label">{labels.messageLabel}</span>
            <br />
            <FormField
              as="span"
              name="your-message"
              label={labels.messageLabel}
              labelHidden
              error={errors['your-message']?.message}
            >
              <textarea
                {...register('your-message')}
                cols={40}
                rows={10}
                maxLength={2000}
                className="wpcf7-form-control wpcf7-textarea"
                placeholder={labels.messagePlaceholder}
              />
            </FormField>


            <br />
            <input
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              value={isSubmitting ? labels.submitting : labels.submit}
              className="wpcf7-form-control wpcf7-submit has-spinner lienhe"
            />
          </p>
        </div>

        <FormResponse status={status} labels={labels} />
      </form>
    </div>
  );
}
