export interface ProjectInfoSidebarProps {
  summary?: string;
}

export function ProjectInfoSidebar({ summary }: ProjectInfoSidebarProps) {
  return (
    <div className="col-inner" style={{ fontSize: '13px' }}>
      <h3>Thông tin dự án</h3> {/* business-text-ok: source sidebar title */}
      {summary ? ` ${summary} ` : null}
    </div>
  );
}
