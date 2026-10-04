import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'white' | 'outline' | 'link';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  target?: string;
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  href,
  variant = 'primary',
  size,
  className = '',
  style,
  children,
  type = 'button',
  target,
  rel,
  onClick,
  disabled,
}: ButtonProps) {
  const variantClass =
    variant === 'link'
      ? 'is-link'
      : variant === 'outline'
        ? 'is-outline'
        : variant;
  const sizeClass = size ? `is-${size}` : '';
  const disabledClass = disabled ? 'disabled' : '';
  const classes = `button ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

  if (href) {
    const disabledStyle: CSSProperties = disabled
      ? { pointerEvents: 'none', cursor: 'not-allowed', opacity: 0.6, ...style }
      : (style ?? {});

    return (
      <Link
        href={href}
        className={classes}
        style={disabledStyle}
        target={target}
        rel={rel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      style={style}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span>{children}</span>
    </button>
  );
}
