import type { ReactNode } from 'react';

export interface ProjectBodyLayoutProps {
  title: string;
  children: ReactNode;
  sidebar: ReactNode;
}

export function ProjectBodyLayout({ title, children, sidebar }: ProjectBodyLayoutProps) {
  return (
    <>
      <div className="row row-portcus">
        <div className="col large-9 small-12">
          <h1 className="entry-title">{title}</h1>
        </div>
      </div>
      <div className="row row-portcus">
        <div className="col large-9 small-12">{children}</div>
        <div className="col large-3 small-12">{sidebar}</div>
      </div>
    </>
  );
}
