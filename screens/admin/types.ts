/* ── Admin Module Shared Types & Styles ── */

export type AdminTab =
  | 'overview' | 'users' | 'user-edit'
  | 'ai-config' | 'ai-agents' | 'ai-tokens'
  | 'chat-mgmt' | 'moderation'
  | 'analytics'
  | 'settings' | 'logs'
  | 'rbac' | 'communication'
  | 'support' | 'data-exchange'
  | 'feature-flags' | 'integrations'
  | 'billing' | 'infra' | 'privacy'
  | 'resources';

export interface SidebarItem {
  icon: string;
  label: string;
  id: AdminTab;
  badge?: number;
}

export interface SidebarSection {
  group: string;
  items: SidebarItem[];
}

export const adminSections: SidebarSection[] = [
  { group: 'TỔNG QUAN', items: [
    { icon: 'dashboard', label: 'Dashboard', id: 'overview' },
    { icon: 'bar_chart', label: 'Phân tích', id: 'analytics' },
  ]},
  { group: 'QUẢN LÝ', items: [
    { icon: 'group', label: 'Người dùng', id: 'users' },
    { icon: 'chat', label: 'Hội thoại', id: 'chat-mgmt' },
    { icon: 'menu_book', label: 'Tài liệu', id: 'resources' },
  ]},
  { group: 'AI', items: [
    { icon: 'auto_awesome', label: 'AI Tổng quan', id: 'ai-config' },
    { icon: 'smart_toy', label: 'AI Agents', id: 'ai-agents' },
    { icon: 'data_usage', label: 'Token AI', id: 'ai-tokens' },
  ]},
  { group: 'KIỂM DUYỆT', items: [
    { icon: 'shield', label: 'Nội dung', id: 'moderation' },
    { icon: 'admin_panel_settings', label: 'RBAC', id: 'rbac' },
    { icon: 'privacy_tip', label: 'Quyền riêng tư', id: 'privacy' },
  ]},
  { group: 'HỆ THỐNG', items: [
    { icon: 'settings', label: 'Cấu hình', id: 'settings' },
    { icon: 'receipt_long', label: 'Nhật ký', id: 'logs' },
    { icon: 'monitor_heart', label: 'Hạ tầng', id: 'infra' },
  ]},
  { group: 'CÔNG CỤ', items: [
    { icon: 'campaign', label: 'Truyền thông', id: 'communication' },
    { icon: 'support_agent', label: 'Hỗ trợ', id: 'support' },
    { icon: 'swap_horiz', label: 'Dữ liệu', id: 'data-exchange' },
  ]},
  { group: 'NÂNG CAO', items: [
    { icon: 'toggle_on', label: 'Feature Flags', id: 'feature-flags' },
    { icon: 'hub', label: 'Tích hợp', id: 'integrations' },
    { icon: 'payments', label: 'Thanh toán', id: 'billing' },
  ]},
];

/* ── Glass design tokens (matching Dashboard.tsx) ── */
export const glass = {
  card: 'bg-white/60 backdrop-blur-2xl rounded-[1.75rem] border border-white/80 shadow-[0_8px_32px_rgba(30,58,138,0.06)] relative overflow-hidden',
  sidebar: 'bg-white/50 backdrop-blur-3xl border-r border-white/60',
  input: 'w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50 focus:bg-white/70 transition-all',
  navItem: 'text-slate-500 hover:bg-white/50 hover:text-[#1E3A8A] backdrop-blur-sm',
  badge: 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white',
};

export function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
