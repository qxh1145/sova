'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormResponse, ScreenReaderResponse, formStatusClass } from '@/components/ui/FormResponse';
import { useSubmitAdapter } from '@/lib/forms/SubmitAdapterContext';
import { contactSchema, zodResolver, type ContactFormValues } from '@/lib/forms/schemas';
import { useHydrated } from '@/lib/forms/useHydrated';
import { useSubmitStatus } from '@/lib/forms/useSubmitStatus';
import type { ContactFormContent, Locale, ShellContent } from '@/types/content';
import { CONTACT_FORM_PRESETS } from '@/components/contact/contactIds';

const THANK_YOU_PATH = '/xin-chan-thanh-cam-on-quy-khach/?demo=1';

export interface ContactFormProps {
  form: ContactFormContent;
  consult: ShellContent['consult'];
  locale: Locale;
}

export function ContactForm({ form, consult, locale }: ContactFormProps) {
  const router = useRouter();
  const adapter = useSubmitAdapter<ContactFormValues>();
  const { status, isSubmitting, submit, reset } = useSubmitStatus(adapter);
  // Submit stays disabled until hydration: a native GET would put the fields in the URL.
  const hydrated = useHydrated();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(
      contactSchema({
        required: form.required,
        emailInvalid: form.emailInvalid,
        phoneInvalid: form.phoneInvalid,
      }),
    ),
    defaultValues: {
      'your-name': '',
      'your-email': '',
      service: '',
      'tel-584': '',
      'your-message': '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await submit(data);
    if (result?.outcome === 'success') {
      router.push(THANK_YOU_PATH);
    }
  }, reset);

  const hasErrors = Object.keys(errors).length > 0;
  const statusClass = formStatusClass(status, hasErrors);
  const { wpcf7Id, unitTag, selectFieldName } = CONTACT_FORM_PRESETS[locale];

  return (
    <div className="wpcf7 no-js" id={wpcf7Id} lang={locale} dir="ltr" data-wpcf7-id={unitTag}>
      <ScreenReaderResponse status={status} labels={consult} />

      <form
        onSubmit={onSubmit}
        className={`wpcf7-form ${statusClass}`}
        noValidate
        data-status={status}
        aria-label="Form liên hệ" // business-text-ok: source CF7 aria-label
      >
        <div className="row ctf7-cus">
          <div className="col large-6 small-12">
            <p>
              <label htmlFor="your-name">
                {' '}
                {form.nameLabel}
                <br />
                <FormField id="your-name" name="your-name" error={errors['your-name']?.message}>
                  <input
                    {...register('your-name')}
                    id="your-name"
                    type="text"
                    size={40}
                    maxLength={400}
                    className="wpcf7-form-control wpcf7-text wpcf7-validates-as-required"
                    autoComplete="name"
                    aria-required="true"
                  />
                </FormField>{' '}
              </label>
            </p>
          </div>

          <div className="col large-6 small-12">
            <p>
              <label htmlFor="your-email">
                {' '}
                {form.emailLabel}
                <br />
                <FormField id="your-email" name="your-email" error={errors['your-email']?.message}>
                  <input
                    {...register('your-email')}
                    id="your-email"
                    type="email"
                    size={40}
                    maxLength={400}
                    className="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-email"
                    autoComplete="email"
                    aria-required="true"
                  />
                </FormField>{' '}
              </label>
            </p>
          </div>

          <div className="col large-6 small-12">
            <p>
              <label htmlFor={selectFieldName}>
                {' '}
                {form.serviceLabel}
                <br />
                <FormField
                  id={selectFieldName}
                  name={selectFieldName}
                  error={errors.service?.message}
                >
                  <select
                    {...register('service')}
                    id={selectFieldName}
                    name={selectFieldName}
                    onChange={(e) => {
                      setValue('service', e.target.value, {
                        shouldValidate: isSubmitted,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    className="wpcf7-form-control wpcf7-select wpcf7dtx wpcf7dtx-select"
                    aria-required="true"
                    size={1}
                  >
                    <option value="">{form.servicePrompt}</option>
                    {form.serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </FormField>
                <br />
              </label>
            </p>
          </div>

          <div className="col large-6 small-12">
            <p>
              <label htmlFor="tel-584">
                {' '}
                {form.phoneLabel}
                <br />
                <FormField id="tel-584" name="tel-584" error={errors['tel-584']?.message}>
                  <input
                    {...register('tel-584')}
                    id="tel-584"
                    type="tel"
                    size={40}
                    maxLength={400}
                    className="wpcf7-form-control wpcf7-tel wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-tel"
                    aria-required="true"
                  />
                </FormField>{' '}
              </label>
            </p>
          </div>

          <div className="col large-12 small-12">
            <p>
              <label htmlFor="your-message">
                {' '}
                {form.messageLabel}
                <br />
                <FormField
                  id="your-message"
                  name="your-message"
                  error={errors['your-message']?.message}
                >
                  <textarea
                    {...register('your-message')}
                    id="your-message"
                    cols={40}
                    rows={10}
                    maxLength={2000}
                    className="wpcf7-form-control wpcf7-textarea wpcf7-validates-as-required"
                    aria-required="true"
                  />
                </FormField>{' '}
              </label>
            </p>
          </div>

          <div className="col large-12 small-12">
            <p>
              <input
                type="submit"
                disabled={!hydrated || isSubmitting}
                aria-busy={isSubmitting}
                value={isSubmitting ? consult.submitting : form.submit}
                className="wpcf7-form-control wpcf7-submit has-spinner"
              />
            </p>
          </div>
        </div>

        <FormResponse status={status} labels={consult} />
      </form>
    </div>
  );
}
