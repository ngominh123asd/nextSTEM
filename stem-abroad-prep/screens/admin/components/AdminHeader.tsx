import React from 'react';
import { type AdminTab } from '../types';

interface Props {
  activeTab: AdminTab;
  setSidebarOpen: (v: boolean) => void;
}

const titles: Record<AdminTab, { title: string; icon: string }> = {
  overview:        { title: 'Dashboard',       icon: 'dashboard' },
  users:           { title: 'Quản lý Người dùng', icon: 'group' },
  'user-edit':     { title: 'Chi tiết Người dùng', icon: 'person' },
  'ai-config':     { title: 'AI Widget & Advisor', icon: 'auto_awesome' },
  'ai-agents':     { title: 'AI Agents',       icon: 'smart_toy' },
  'ai-tokens':     { title: 'Token AI',         icon: 'data_usage' },
  'chat-mgmt':     { title: 'Quản lý Hội thoại', icon: 'chat' },
  moderation:      { title: 'Kiểm duyệt',     icon: 'shield' },
  analytics:       { title: 'Phân tích',       icon: 'bar_chart' },
  settings:        { title: 'Cấu hình',        icon: 'settings' },
  logs:            { title: 'Nhật ký',          icon: 'receipt_long' },
  rbac:            { title: 'Phân quyền',      icon: 'admin_panel_settings' },
  communication:   { title: 'Truyền thông',    icon: 'campaign' },
  support:         { title: 'Hỗ trợ',          icon: 'support_agent' },
  'data-exchange': { title: 'Trao đổi Dữ liệu', icon: 'swap_horiz' },
  'feature-flags': { title: 'Feature Flags',   icon: 'toggle_on' },
  integrations:    { title: 'Tích hợp',        icon: 'hub' },
  billing:         { title: 'Thanh toán',       icon: 'payments' },
  infra:           { title: 'Hạ tầng',         icon: 'monitor_heart' },
  privacy:         { title: 'Quyền riêng tư',  icon: 'privacy_tip' },
};

export default function AdminHeader({ activeTab, setSidebarOpen }: Props) {
  const t = titles[activeTab] || titles.overview;
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/40 bg-white/30 backdrop-blur-xl flex-shrink-0">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition" onClick={() => setSidebarOpen(true)}>
          <span className="material-symbols-outlined text-slate-600">menu</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">{t.icon}</span>
          <h1 className="text-lg font-bold text-[#1E3A8A]">{t.title}</h1>
        </div>
      </div>

      {/* Right: date + notifications */}
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-sm text-slate-500 font-medium">{dateStr}</span>
        <button className="relative p-2 rounded-xl hover:bg-white/50 transition">
          <span className="material-symbols-outlined text-slate-600">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
        </button>
      </div>
    </header>
  );
}
