import type { CSSProperties, ReactNode } from 'react';

export type ButtonVariant = 'primary';

export interface ButtonProps {
  variant?: ButtonVariant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  className = '',
  style,
  children,
  onClick,
}: ButtonProps) {
  const classes = `button ${variant} ${className}`.trim();

  return (
    <button type="button" className={classes} style={style} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}
