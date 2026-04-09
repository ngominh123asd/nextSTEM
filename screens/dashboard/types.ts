/* ── Dashboard Module Shared Types & Constants ── */

export interface UserData {
  id?: string;
  name: string;
  email: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
}

export interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  userRole?: string;
  onOpenAdmin?: () => void;
}

export type TabId = 'dashboard' | 'ai-advisor' | 'tools' | 'resources' | 'editor' | 'portfolio' | 'roadmap' | 'settings';

export const sidebarSections = [
  { group: 'TRANG CHỦ', items: [
    { icon: 'space_dashboard', label: 'Dashboard', id: 'dashboard' as TabId },
  ]},
  { group: 'AI TOOL', items: [
    { icon: 'auto_awesome', label: 'AI Advisor', id: 'ai-advisor' as TabId },
  ]},
  { group: 'CÔNG CỤ', items: [
    { icon: 'build',         label: 'Bộ Công Cụ',     id: 'tools' as TabId },
    { icon: 'menu_book',     label: 'Tài Nguyên',     id: 'resources' as TabId },
    { icon: 'edit_document', label: 'Academic Editor', id: 'editor' as TabId },
  ]},
  { group: 'CÁ NHÂN', items: [
    { icon: 'account_box',   label: 'Hồ Sơ Năng Lực', id: 'portfolio' as TabId },
    { icon: 'map',           label: 'Lộ Trình',        id: 'roadmap' as TabId },
    { icon: 'settings',      label: 'Cài Đặt',        id: 'settings' as TabId },
  ]},
];

/*HELPERS*/
export function getInitials(n: string) {
  return n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export const goalLabels: Record<string, string> = {
  'choose-major': 'Chọn ngành học',
  'portfolio': 'Chuẩn bị hồ sơ',
  'study-abroad': 'Du học',
  'scholarship': 'Học bổng',
};

/* Glass styles */
export const glass = {
  card:      'bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(37,99,235,0.12),0_4px_12px_rgba(37,99,235,0.04)] relative overflow-hidden',
  cardSolid: 'bg-white/85 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-[0_12px_40px_rgba(37,99,235,0.1),0_2px_8px_rgba(37,99,235,0.03)] relative overflow-hidden',
  sidebar:   'bg-white/60 backdrop-blur-3xl border-r border-blue-50/50',
  input:     'w-full px-5 py-4 rounded-2xl border border-white/90 bg-white/40 backdrop-blur-md text-slate-900 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-300/60 focus:bg-white/80 transition-all',
  tag:       'px-3.5 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-md border border-white/50',
  btn:       'backdrop-blur-md rounded-2xl font-bold tracking-tight transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.08)] active:shadow-none active:translate-y-0.5 whitespace-nowrap',
  activeNav: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)] backdrop-blur-md',
  navItem:   'text-slate-500 hover:bg-white/60 hover:text-blue-600 backdrop-blur-sm',
}