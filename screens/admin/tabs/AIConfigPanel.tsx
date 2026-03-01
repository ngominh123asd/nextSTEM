import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Toggle, Badge } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

/* ── AI Widget config (maps to AIChatPanel in Dashboard.tsx) ── */
const defaultWidgetConfig = {
  enabled: true,
  name: 'AI Study Coach',
  greeting: 'Xin chào {user}! 👋\n\nMình là AI Study Coach của nextSTEM.',
  position: 'bottom-right' as 'bottom-right' | 'bottom-left',
  primaryColor: '#1152d4',
  quickActions: [
    { label: 'Tìm trường', icon: 'school', enabled: true },
    { label: 'Học bổng', icon: 'workspace_premium', enabled: true },
    { label: 'Đánh giá hồ sơ', icon: 'assessment', enabled: true },
    { label: 'Lập kế hoạch', icon: 'calendar_month', enabled: true },
  ],
  maxHistory: 50,
  showTypingIndicator: true,
  autoOpen: false,
  apiEndpoint: '/api/v1/chat/sessions/{session_id}/messages',
};

/* ── AI Advisor config (maps to AIAdvisorTab in Dashboard.tsx) ── */
const defaultAdvisorModes = [
  { id: 'general', icon: 'smart_toy', label: 'Tư vấn chung', enabled: true, systemPrompt: 'Bạn là trợ lý tư vấn du học...' },
  { id: 'career', icon: 'work', label: 'Định hướng nghề nghiệp', enabled: true, systemPrompt: 'Bạn là chuyên gia tư vấn career...' },
  { id: 'university', icon: 'school', label: 'Tìm trường phù hợp', enabled: true, systemPrompt: 'Bạn là advisor tuyển sinh...' },
  { id: 'essay', icon: 'edit_note', label: 'Hỗ trợ viết luận', enabled: true, systemPrompt: 'Bạn là writing coach chuyên essay...' },
];

export default function AIConfigPanel() {
  const [tab, setTab] = useState<'widget' | 'advisor' | 'prompts'>('widget');
  const [widget, setWidget] = useState(defaultWidgetConfig);
  const [modes, setModes] = useState(defaultAdvisorModes);
  const [editPrompt, setEditPrompt] = useState<string | null>(null);

  const toggleMode = (id: string) => {
    setModes(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  return (
    <div>
      <PageTitle title="AI Widget & Advisor" subtitle="Quản lý cấu hình AI Chat Widget và AI Advisor cho user" icon="auto_awesome" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="chat_bubble" label="Widget" value={widget.enabled ? 'Bật' : 'Tắt'} color="blue" />
        <StatCard icon="auto_awesome" label="Advisor modes" value={`${modes.filter(m => m.enabled).length}/${modes.length}`} color="purple" />
        <StatCard icon="quick_phrases" label="Quick Actions" value={`${widget.quickActions.filter(a => a.enabled).length}`} color="green" />
        <StatCard icon="api" label="API Endpoint" value="Connected" color="cyan" />
      </div>

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'widget' as const, label: 'AI Widget', icon: 'chat_bubble' },
          { id: 'advisor' as const, label: 'AI Advisor', icon: 'auto_awesome' },
          { id: 'prompts' as const, label: 'System Prompts', icon: 'psychology' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'widget' && <WidgetTab widget={widget} setWidget={setWidget} />}
      {tab === 'advisor' && <AdvisorTab modes={modes} toggleMode={toggleMode} />}
      {tab === 'prompts' && <PromptsTab modes={modes} setModes={setModes} editPrompt={editPrompt} setEditPrompt={setEditPrompt} />}
    </div>
  );
}

/* ── Widget Settings Tab ── */
function WidgetTab({ widget, setWidget }: { widget: typeof defaultWidgetConfig; setWidget: (w: typeof defaultWidgetConfig) => void }) {
  const update = (patch: Partial<typeof defaultWidgetConfig>) => setWidget({ ...widget, ...patch });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <GlassHeader icon="settings" title="Cài đặt Widget" />
        <div className="space-y-4">
          <Toggle on={widget.enabled} onToggle={() => update({ enabled: !widget.enabled })} label="Hiển thị AI Widget cho user" />
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tên hiển thị</label>
            <input className={glass.input} value={widget.name} onChange={e => update({ name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Lời chào (dùng {'{user}'} cho tên)</label>
            <textarea className={`${glass.input} h-20 resize-none`} value={widget.greeting} onChange={e => update({ greeting: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vị trí</label>
              <select className={glass.input} value={widget.position} onChange={e => update({ position: e.target.value as any })}>
                <option value="bottom-right">Dưới phải</option>
                <option value="bottom-left">Dưới trái</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Lịch sử tối đa</label>
              <input type="number" className={glass.input} value={widget.maxHistory} onChange={e => update({ maxHistory: +e.target.value })} />
            </div>
          </div>
          <Toggle on={widget.showTypingIndicator} onToggle={() => update({ showTypingIndicator: !widget.showTypingIndicator })} label="Hiệu ứng đang gõ" />
          <Toggle on={widget.autoOpen} onToggle={() => update({ autoOpen: !widget.autoOpen })} label="Tự động mở khi vào trang" />
        </div>
      </GlassCard>

      <GlassCard>
        <GlassHeader icon="bolt" title="Quick Actions" extra={
          <Badge text={`${widget.quickActions.filter(a => a.enabled).length} active`} color="green" />
        } />
        <p className="text-xs text-slate-400 mb-4">Các nút gợi ý hiển thị trong AI Widget (AIChatPanel)</p>
        <div className="space-y-2">
          {widget.quickActions.map((a, i) => (
            <div key={a.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
              <span className="material-symbols-outlined text-blue-500">{a.icon}</span>
              <span className="text-sm font-semibold text-slate-800 flex-1">{a.label}</span>
              <Toggle on={a.enabled} onToggle={() => {
                const updated = [...widget.quickActions];
                updated[i] = { ...a, enabled: !a.enabled };
                setWidget({ ...widget, quickActions: updated });
              }} label="" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">API Endpoint (Chat)</label>
          <input className={glass.input} value={widget.apiEndpoint} onChange={e => setWidget({ ...widget, apiEndpoint: e.target.value })} />
          <p className="text-[10px] text-slate-400 mt-1">Endpoint gửi tin nhắn — backend: POST /api/v1/chat/sessions/{'{id}'}/messages</p>
        </div>
      </GlassCard>
    </div>
  );
}

/* ── Advisor Modes Tab ── */
function AdvisorTab({ modes, toggleMode }: { modes: typeof defaultAdvisorModes; toggleMode: (id: string) => void }) {
  const colors = ['from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500'];

  return (
    <div>
      <GlassCard className="mb-6">
        <GlassHeader icon="auto_awesome" title="Chế độ AI Advisor" extra={
          <Badge text={`${modes.filter(m => m.enabled).length}/${modes.length} active`} color="blue" />
        } />
        <p className="text-xs text-slate-400 mb-5">Quản lý các chế độ tư vấn trong AIAdvisorTab — mỗi mode có icon, prompt và logic riêng</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modes.map((m, i) => (
            <div key={m.id} className={`p-4 rounded-2xl border transition-all ${m.enabled ? 'bg-white/60 border-blue-200/60 shadow-sm' : 'bg-white/30 border-white/40 opacity-60'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center shadow-md`}>
                  <span className="material-symbols-outlined text-white text-lg">{m.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#1E3A8A]">{m.label}</h4>
                  <p className="text-[10px] text-slate-400">ID: {m.id}</p>
                </div>
                <Toggle on={m.enabled} onToggle={() => toggleMode(m.id)} label="" />
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{m.systemPrompt}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <GlassHeader icon="tune" title="Quick Prompts mỗi mode" />
        <p className="text-xs text-slate-400 mb-4">Các câu gợi ý hiển thị khi user chọn mode (quickPrompts trong AIAdvisorTab)</p>
        <div className="space-y-3">
          {modes.filter(m => m.enabled).map(m => (
            <div key={m.id} className="p-3 rounded-xl bg-white/40 border border-white/60">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-500 text-base">{m.icon}</span>
                <span className="text-sm font-bold text-slate-800">{m.label}</span>
                <Badge text="4 prompts" color="blue" />
              </div>
              <p className="text-xs text-slate-400">Các quick prompts hiện được cấu hình hardcode — kết nối API để quản lý động</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* ── System Prompts Tab ── */
function PromptsTab({ modes, setModes, editPrompt, setEditPrompt }: {
  modes: typeof defaultAdvisorModes; setModes: (m: typeof defaultAdvisorModes) => void;
  editPrompt: string | null; setEditPrompt: (id: string | null) => void;
}) {
  const editing = modes.find(m => m.id === editPrompt);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <GlassHeader icon="psychology" title="System Prompts" />
        <p className="text-xs text-slate-400 mb-4">System prompt gửi kèm mỗi request tới AI — quyết định hành vi & phong cách trả lời</p>
        <div className="space-y-2">
          {modes.map(m => (
            <button key={m.id} onClick={() => setEditPrompt(m.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${editPrompt === m.id ? 'bg-blue-50/80 border-blue-200' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-base">{m.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{m.label}</span>
                <Badge text={m.enabled ? 'Active' : 'Off'} color={m.enabled ? 'green' : 'gray'} />
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.systemPrompt}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        {editing ? (
          <>
            <GlassHeader icon="edit" title={`Prompt: ${editing.label}`} />
            <textarea
              className={`${glass.input} h-48 resize-none font-mono text-xs mb-4`}
              value={editing.systemPrompt}
              onChange={e => setModes(modes.map(m => m.id === editing.id ? { ...m, systemPrompt: e.target.value } : m))}
            />
            <div className="flex gap-3">
              <GlassSurface width="auto" height={38} borderRadius={12} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => setEditPrompt(null)}>
                <span className="px-4 text-sm font-semibold text-white">Lưu prompt</span>
              </GlassSurface>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200/40">
              <p className="text-xs font-bold text-blue-700 mb-1">💡 Gợi ý</p>
              <p className="text-xs text-blue-600">Prompt nên bao gồm: vai trò AI, ngôn ngữ trả lời, giới hạn chủ đề, format output mong muốn.</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3">touch_app</span>
            <p className="font-semibold">Chọn mode để chỉnh sửa prompt</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
