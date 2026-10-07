import type { CSSProperties, ReactNode } from 'react';

export interface ContainerProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Container({ children, className = '', style }: ContainerProps) {
  return (
    <div className={`container ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
