/* ── Dashboard Module Shared Types & Constants ── */

export interface UserData {
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
    { icon: 'menu_book',     label: 'Tài Liệu',       id: 'resources' as TabId },
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
  card:      'bg-white/60 backdrop-blur-2xl rounded-[1.75rem] border border-white/80 shadow-[0_8px_32px_rgba(30,58,138,0.06)] relative overflow-hidden',
  cardSolid: 'bg-white/80 backdrop-blur-xl rounded-[1.75rem] border border-white/70 shadow-[0_4px_24px_rgba(30,58,138,0.05)] relative overflow-hidden',
  sidebar:   'bg-white/50 backdrop-blur-3xl border-r border-white/60',
  input:     'w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50 focus:bg-white/70 transition-all',
  tag:       'px-3.5 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-sm',
  btn:       'backdrop-blur-md rounded-2xl font-semibold transition-all duration-300',
  activeNav: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 backdrop-blur-md',
  navItem:   'text-slate-500 hover:bg-white/50 hover:text-[#1E3A8A] backdrop-blur-sm',
};
