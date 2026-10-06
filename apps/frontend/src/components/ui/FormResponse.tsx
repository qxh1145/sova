import type { SubmitStatus } from '@/lib/forms/useSubmitStatus';

export type FormStatusClass = 'init' | 'invalid' | 'submitting' | 'sent' | 'failed';

export function formStatusClass(status: SubmitStatus, hasErrors = false): FormStatusClass {
  if (status === 'submitting') return 'submitting';
  if (hasErrors) return 'invalid';
  if (status === 'demo-success') return 'sent';
  if (status === 'demo-error') return 'failed';
  return 'init';
}

export interface FormResponseLabels {
  success: string;
  error: string;
  demoBadge: string;
}

export interface FormResponseProps {
  status: SubmitStatus;
  labels: FormResponseLabels;
}

const isResult = (status: SubmitStatus) => status === 'demo-success' || status === 'demo-error';

/** CF7 `.screen-reader-response`: always mounted so the live region announces the result text. */
export function ScreenReaderResponse({ status, labels }: FormResponseProps) {
  const message = status === 'demo-success' ? labels.success : labels.error;
  return (
    <div className="screen-reader-response">
      <p role="status" aria-live="polite" aria-atomic="true">
        {isResult(status) ? `${message} ${labels.demoBadge}` : ''}
      </p>
      <ul />
    </div>
  );
}

/** Visible CF7 `.wpcf7-response-output`; aria-hidden like the source, ScreenReaderResponse announces it. */
export function FormResponse({ status, labels }: FormResponseProps) {
  if (!isResult(status)) return null;

  const isSuccess = status === 'demo-success';

  return (
    <div className={`wpcf7-response-output ${isSuccess ? 'sent' : 'failed'}`} aria-hidden="true">
      <span>{isSuccess ? labels.success : labels.error}</span>{' '}
      <span className="wpcf7-demo-badge">{labels.demoBadge}</span>
    </div>
  );
}
