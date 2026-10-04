import type { CSSProperties, ReactNode } from 'react';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
  asRow?: boolean;
  style?: CSSProperties;
}

export function Container({ children, className = '', asRow = false, style }: ContainerProps) {
  const baseClass = asRow ? 'row' : 'container';
  return (
    <div className={`${baseClass} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
