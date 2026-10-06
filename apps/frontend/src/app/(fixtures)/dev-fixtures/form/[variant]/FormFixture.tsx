'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { FormResponse, ScreenReaderResponse, formStatusClass } from '@/components/ui/FormResponse';
import { createMockTransport } from '@/lib/forms/mock-transport';
import {
  consultSchema,
  zodResolver,
  type ConsultFormValues,
} from '@/lib/forms/schemas';
import { useSubmitStatus } from '@/lib/forms/useSubmitStatus';
import { FIXTURE_FORM_LABELS, type FormVariant } from './constants';

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export interface FormFixtureProps {
  variant: FormVariant;
}

export function FormFixture({ variant }: FormFixtureProps) {
  const [deferred, setDeferred] = useState(() => createDeferred());

  const handleRelease = () => {
    deferred.resolve();
    setDeferred(createDeferred());
  };

  const adapter = useMemo(() => {
    return createMockTransport<ConsultFormValues>({
      scenario: variant,
      gate: deferred.promise,
    });
  }, [variant, deferred]);

  const { status, isSubmitting, submit, reset } = useSubmitStatus(adapter);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultFormValues>({
    resolver: zodResolver(
      consultSchema({
        required: FIXTURE_FORM_LABELS.phoneRequired,
        invalid: FIXTURE_FORM_LABELS.phoneInvalid,
      }),
    ),
    defaultValues: {
      phone: '',
    },
  });

  // A failed validation clears any earlier demo result, like CF7 swapping to `invalid`.
  const onSubmit = handleSubmit(async (data) => {
    await submit(data);
  }, reset);

  const responseLabels = {
    success: FIXTURE_FORM_LABELS.successMessage,
    error: FIXTURE_FORM_LABELS.errorMessage,
    demoBadge: FIXTURE_FORM_LABELS.demoBadge,
  };

  const statusClass = formStatusClass(status, Object.keys(errors).length > 0);

  return (
    <div className="wpcf7" id="wpcf7-f11-p0-o1" lang="vi" dir="ltr">
      <ScreenReaderResponse status={status} labels={responseLabels} />

      <form
        onSubmit={onSubmit}
        className={`wpcf7-form ${statusClass}`}
        noValidate
        data-status={status}
      >
        <FormField
          name="your-phone"
          label={FIXTURE_FORM_LABELS.phoneLabel}
          error={errors.phone?.message}
        >
          <input
            {...register('phone')}
            type="tel"
            size={40}
            className="wpcf7-form-control wpcf7-tel wpcf7-validates-as-tel"
            aria-required="true"
            placeholder={FIXTURE_FORM_LABELS.phonePlaceholder}
          />
        </FormField>

        <p>
          <input
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            value={
              isSubmitting
                ? FIXTURE_FORM_LABELS.submittingButton
                : FIXTURE_FORM_LABELS.submitButton
            }
            className="wpcf7-form-control has-spinner wpcf7-submit"
          />
          <span className="wpcf7-spinner" aria-hidden="true" />
        </p>

        <FormResponse status={status} labels={responseLabels} />
      </form>

      <button
        type="button"
        data-testid="fixture-release"
        onClick={handleRelease}
      >
        {FIXTURE_FORM_LABELS.releaseButton}
      </button>
    </div>
  );
}
