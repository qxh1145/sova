// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_CONTENT=1.
import type { Stat } from '@/types/content';

export const stats: Stat[] = [
  { id: 'stat-clients-vi', value: 500, suffix: '+', label: 'Khách hàng hài lòng' },
  { id: 'stat-projects-vi', value: 50, suffix: '+', label: 'Dự án hoàn thành' },
  { id: 'stat-members-vi', value: 20, suffix: '+', label: 'Thành viên' },
  { id: 'stat-years-vi', value: 3, suffix: '+', label: 'Năm kinh nghiệm' },
  { id: 'stat-clients-en', value: 500, suffix: '+', label: 'Satisfied Clients' },
  { id: 'stat-projects-en', value: 50, suffix: '+', label: 'Projects Completed' },
  { id: 'stat-members-en', value: 20, suffix: '+', label: 'Team members' },
  { id: 'stat-years-en', value: 3, suffix: '+', label: 'Years of experience' },
];
