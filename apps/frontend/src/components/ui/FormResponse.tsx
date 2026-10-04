import type { ReactNode } from 'react';
import type { SubmitStatus } from '@/lib/forms/useSubmitStatus';

export type FormStatusClass = 'init' | 'invalid' | 'submitting' | 'sent' | 'failed';

export function formStatusClass(
  status: SubmitStatus | string,
  hasErrors = false,
): FormStatusClass {
  if (status === 'submitting') return 'submitting';
  if (status === 'demo-success') return 'sent';
  if (status === 'demo-error') return 'failed';
  if (hasErrors) return 'invalid';
  return 'init';
}

export interface FormResponseLabels {
  success: ReactNode;
  error: ReactNode;
  demoBadge: ReactNode;
}

export interface FormResponseProps {
  status: SubmitStatus | string;
  labels: FormResponseLabels;
}

export function FormResponse({ status, labels }: FormResponseProps) {
  if (status !== 'demo-success' && status !== 'demo-error') {
    return null;
  }

  const isSuccess = status === 'demo-success';
  const isDemo = status.startsWith('demo-');
  const outcomeClass = isSuccess ? 'sent' : 'failed';
  const message = isSuccess ? labels.success : labels.error;

  return (
    <div
      className={`wpcf7-response-output ${outcomeClass}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {' '}
      {isDemo && (
        <span className="wpcf7-demo-badge">{labels.demoBadge}</span>
      )}
    </div>
  );
}
