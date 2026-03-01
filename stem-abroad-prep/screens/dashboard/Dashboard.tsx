import React, { useState } from 'react';
import GlassSurface from '../../components/GlassSurface';
import { DashboardProps, TabId, sidebarSections, glass, getInitials } from './types';
import { BlobDecor } from './components/SharedUI';
import AIChatPanel from './components/AIChatPanel';
import DashboardTab from './tabs/DashboardTab';
import AIAdvisorTab from './tabs/AIAdvisorTab';
import ToolsTab from './tabs/ToolsTab';
import ResourcesTab from './tabs/ResourcesTab';
import EditorTab from './tabs/EditorTab';
import PortfolioTab from './tabs/PortfolioTab';
import RoadmapTab from './tabs/RoadmapTab';
import SettingsTab from './tabs/SettingsTab';

export default function Dashboard({ userData, onLogout, userRole, onOpenAdmin }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 30%, #f5f0ff 60%, #eef4ff 100%)' }}>
      {/* Ambient blobs */}
      <BlobDecor className="w-[600px] h-[600px] -top-40 -left-40 bg-blue-200/20" />
      <BlobDecor className="w-[500px] h-[500px] top-1/3 right-0 bg-indigo-200/15" />
      <BlobDecor className="w-[400px] h-[400px] bottom-0 left-1/3 bg-violet-200/15" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[270px] ${glass.sidebar} flex flex-col transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/40">
          <img src="/images/logo_header.png" alt="nextSTEM" className="w-40 h-40 object-contain" />
        </div>

        {/* User Card */}
        <div className="mx-3 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-lg border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
              {getInitials(userData.name || 'U')}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1E3A8A] text-sm truncate">{userData.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{userData.grade} · {userData.school}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {sidebarSections.map(section => (
            <div key={section.group}>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase px-4 mb-2">{section.group}</p>
              <div className="space-y-1">
                {section.items.map(item => (
                  activeTab === item.id ? (
                    <GlassSurface
                      key={item.id}
                      width="100%"
                      height={42}
                      borderRadius={8}
                      className="cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    >
                      <div className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-white">
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        {item.label}
                      </div>
                    </GlassSurface>
                  ) : (
                    <button key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${glass.navItem}`}>
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/40">
          {(userRole === 'admin' || userRole === 'super_admin') && onOpenAdmin && (
            <button onClick={onOpenAdmin} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50/50 transition-all mb-1">
              <span className="material-symbols-outlined text-xl">admin_panel_settings</span>Admin Panel
            </button>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50/50 hover:text-red-500 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>Đăng xuất
          </button>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-white/40 backdrop-blur-xl border-b border-white/50 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/50"><span className="material-symbols-outlined text-slate-600">menu</span></button>
          <span className="font-bold text-[#1E3A8A]">nextSTEM</span>
          <button onClick={() => setChatOpen(true)} className="p-1.5 rounded-lg hover:bg-white/50"><span className="material-symbols-outlined text-blue-600">smart_toy</span></button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard'  && <DashboardTab userData={userData} onNav={setActiveTab} />}
          {activeTab === 'ai-advisor' && <AIAdvisorTab userData={userData} />}
          {activeTab === 'tools'      && <ToolsTab userData={userData} />}
          {activeTab === 'resources'  && <ResourcesTab />}
          {activeTab === 'editor'     && <EditorTab />}
          {activeTab === 'portfolio'  && <PortfolioTab userData={userData} />}
          {activeTab === 'roadmap'    && <RoadmapTab userData={userData} />}
          {activeTab === 'settings'   && <SettingsTab userData={userData} />}
        </div>
      </main>

      {/* ─── AI CHAT FAB ─── */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-[110] lg:flex hidden" onClick={() => setChatOpen(true)} style={{ cursor: 'pointer' }}>
          <GlassSurface
            width={56}
            height={56}
            borderRadius={28}
            className="hover:scale-110 transition-transform"
            style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
          >
            <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
          </GlassSurface>
        </div>
      )}

      {/* ─── AI CHAT PANEL ─── */}
      {chatOpen && <AIChatPanel onClose={() => setChatOpen(false)} userName={userData.name} />}
    </div>
  );
}
