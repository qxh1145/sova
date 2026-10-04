'use client';

import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormResponse, formStatusClass } from '@/components/ui/FormResponse';
import { useSubmitAdapter } from '@/lib/forms/SubmitAdapterContext';
import {
  consultSchema,
  zodResolver,
  type ConsultFormValues,
} from '@/lib/forms/schemas';
import { useSubmitStatus } from '@/lib/forms/useSubmitStatus';
import type { Locale, ShellContent } from '@/types/content';

export interface ConsultFormProps {
  labels: ShellContent['consult'];
  locale: Locale;
}

export function ConsultForm({ labels, locale }: ConsultFormProps) {
  const adapter = useSubmitAdapter<ConsultFormValues>();
  const { status, isSubmitting, submit } = useSubmitStatus(adapter);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultFormValues>({
    resolver: zodResolver(
      consultSchema({
        required: labels.required,
        invalid: labels.invalid,
      }),
    ),
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await submit(data);
  });

  const statusClass = formStatusClass(status, Object.keys(errors).length > 0);

  return (
    <div className="wpcf7" id="wpcf7-consult-drawer" lang={locale} dir="ltr">
      <div className="screen-reader-response">
        <p role="status" aria-live="polite" aria-atomic="true" />
        <ul />
      </div>

      <form
        onSubmit={onSubmit}
        className={`wpcf7-form ${statusClass}`}
        noValidate
        data-status={status}
        aria-label={labels.heading}
      >
        <div className="form_tv">
          <p>
            <FormField
              as="span"
              name="tel-827"
              label={labels.placeholder}
              labelHidden
              error={errors.phone?.message}
            >
              <input
                {...register('phone')}
                type="tel"
                size={40}
                className="wpcf7-form-control wpcf7-tel wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-tel"
                aria-required="true"
                placeholder={labels.placeholder}
              />
            </FormField>
            <br />
            <input
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              value={isSubmitting ? labels.submitting : labels.submit}
              className="wpcf7-form-control wpcf7-submit has-spinner"
            />
            <span className="wpcf7-spinner" aria-hidden="true" />
          </p>
        </div>
        <FormResponse status={status} labels={labels} />
      </form>
    </div>
  );
}
