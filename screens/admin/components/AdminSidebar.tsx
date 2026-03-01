import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { adminSections, glass, getInitials, type AdminTab } from '../types';

interface Props {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onSwitchToUser?: () => void;
}

export default function AdminSidebar({
  activeTab, setActiveTab, sidebarOpen, setSidebarOpen,
  userName, userEmail, onLogout, onSwitchToUser,
}: Props) {
  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] ${glass.sidebar} flex flex-col transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-sm font-bold text-[#1E3A8A]">nextSTEM</span>
            <p className="text-[10px] text-slate-400 font-semibold">ADMIN PANEL</p>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-4 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/30">
              {getInitials(userName || 'A')}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1E3A8A] text-sm truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {adminSections.map(section => (
            <div key={section.group}>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase px-4 mb-1.5">{section.group}</p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  activeTab === item.id ? (
                    <GlassSurface
                      key={item.id}
                      width="100%"
                      height={38}
                      borderRadius={8}
                      className="cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    >
                      <div className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-white">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        {item.label}
                        {item.badge ? <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/30">{item.badge}</span> : null}
                      </div>
                    </GlassSurface>
                  ) : (
                    <button key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${glass.navItem}`}
                    >
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      {item.label}
                      {item.badge ? <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500 text-white">{item.badge}</span> : null}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Switch + Logout */}
        <div className="px-3 py-3 border-t border-white/40 space-y-1.5">
          {onSwitchToUser && (
            <button
              onClick={onSwitchToUser}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50/60 transition-all"
            >
              <span className="material-symbols-outlined text-lg">swap_horiz</span>
              User Dashboard
            </button>
          )}
          <GlassSurface
            width="100%"
            height={38}
            borderRadius={12}
            className="cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
            onClick={onLogout}
          >
            <div className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-white">
              <span className="material-symbols-outlined text-lg">logout</span>
              Đăng xuất
            </div>
          </GlassSurface>
        </div>
      </aside>
    </>
  );
}
