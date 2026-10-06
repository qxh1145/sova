'use client';

import {
  cloneElement,
  isValidElement,
  useId,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { visuallyHiddenStyle } from './visuallyHidden';

export interface FormFieldControlProps {
  id: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export interface FormFieldProps {
  id?: string;
  name?: string;
  label?: ReactNode;
  labelHidden?: boolean;
  labelClassName?: string;
  className?: string;
  wrapClassName?: string;
  error?: string | ReactNode;
  as?: ElementType;
  children: ReactElement | ((props: FormFieldControlProps) => ReactNode);
}

export function FormField({
  id,
  name,
  label,
  labelHidden = false,
  labelClassName,
  className,
  wrapClassName,
  error,
  as,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const childElement = isValidElement(children) ? children : null;
  const fieldId =
    id ?? (childElement?.props as { id?: string } | undefined)?.id ?? generatedId;
  const tipId = `${fieldId}-not-valid-tip`;

  const existingDescribedBy = (
    childElement?.props as { 'aria-describedby'?: string } | undefined
  )?.['aria-describedby'];

  const describedBy =
    [existingDescribedBy, error ? tipId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const controlProps: FormFieldControlProps = {
    id: fieldId,
    'aria-invalid': error
      ? true
      : (childElement?.props as { 'aria-invalid'?: boolean } | undefined)?.[
          'aria-invalid'
        ],
    'aria-describedby': describedBy,
  };

  let renderedControl: ReactNode;
  if (typeof children === 'function') {
    renderedControl = children(controlProps);
  } else if (isValidElement(children)) {
    renderedControl = cloneElement(children, controlProps);
  } else {
    renderedControl = children;
  }

  const controlWrapClasses = [
    'wpcf7-form-control-wrap',
    name,
    wrapClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const controlWrap = (
    <span className={controlWrapClasses} data-name={name}>
      {renderedControl}
      {error ? (
        <span
          className="wpcf7-not-valid-tip"
          id={tipId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </span>
  );

  if (label) {
    const Component = as ?? 'div';
    return (
      <Component className={className}>
        <label
          htmlFor={fieldId}
          className={labelClassName}
          style={labelHidden ? visuallyHiddenStyle : undefined}
        >
          {label}
        </label>
        {controlWrap}
      </Component>
    );
  }

  if (className || as) {
    const Component = as ?? 'div';
    return <Component className={className}>{controlWrap}</Component>;
  }

  return controlWrap;
}
