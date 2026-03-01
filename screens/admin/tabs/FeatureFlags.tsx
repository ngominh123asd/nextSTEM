import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, Toggle, StatCard } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockFlags = [
  { id: '1', name: 'new_chat_ui', desc: 'Giao diện chat mới', enabled: true, rollout: 100, env: 'production' },
  { id: '2', name: 'ai_essay_v2', desc: 'AI Essay Reviewer v2', enabled: true, rollout: 50, env: 'production' },
  { id: '3', name: 'dark_mode', desc: 'Chế độ tối', enabled: false, rollout: 0, env: 'staging' },
  { id: '4', name: 'portfolio_export', desc: 'Xuất portfolio PDF', enabled: true, rollout: 10, env: 'production' },
];

const mockExperiments = [
  { id: '1', name: 'Chat CTA Button', variants: ['Xanh', 'Đỏ', 'Cam'], metric: 'Click rate', status: 'running', winner: null },
  { id: '2', name: 'Onboarding Flow', variants: ['3 bước', '5 bước'], metric: 'Completion rate', status: 'completed', winner: '3 bước' },
];

export default function FeatureFlags() {
  const [tab, setTab] = useState<'flags' | 'ab'>('flags');

  return (
    <div>
      <PageTitle title="Feature Flags & A/B Testing" subtitle="Quản lý tính năng và thử nghiệm" icon="toggle_on" />

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setTab('flags')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'flags' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>Feature Flags</button>
        <button onClick={() => setTab('ab')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'ab' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>A/B Testing</button>
      </div>

      {tab === 'flags' && (
        <GlassCard>
          <GlassHeader icon="toggle_on" title="Feature Flags" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Tạo flag</span>
            </GlassSurface>
          } />
          <div className="space-y-3">
            {mockFlags.map(f => (
              <div key={f.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/40 border border-white/60">
                <Toggle on={f.enabled} onToggle={() => {}} label="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-800 font-mono">{f.name}</span>
                    <Badge text={f.env} color={f.env === 'production' ? 'green' : 'yellow'} />
                  </div>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{f.rollout}%</p>
                  <p className="text-[10px] text-slate-400">Rollout</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-white/60 transition">
                    <span className="material-symbols-outlined text-slate-400 text-base">edit</span>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 transition">
                    <span className="material-symbols-outlined text-red-400 text-base">block</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
              <span className="text-xs text-amber-700 font-semibold">Kill Switch: Click Block icon để tắt ngay lập tức</span>
            </div>
          </div>
        </GlassCard>
      )}

      {tab === 'ab' && (
        <div className="space-y-6">
          <GlassCard>
            <GlassHeader icon="science" title="Thử nghiệm" extra={
              <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={() => {}}>
                <span className="px-3 text-xs font-semibold text-white">+ Tạo thử nghiệm</span>
              </GlassSurface>
            } />
            <div className="space-y-3">
              {mockExperiments.map(e => (
                <div key={e.id} className="p-4 rounded-xl bg-white/40 border border-white/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">{e.name}</span>
                    <Badge text={e.status} color={e.status === 'running' ? 'green' : 'blue'} />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {e.variants.map(v => (
                      <span key={v} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${v === e.winner ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-white/60 text-slate-600 border border-white/80'}`}>
                        {v} {v === e.winner && '(winner)'}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Metric: {e.metric}</p>
                  {e.status === 'running' && (
                    <div className="mt-2 flex gap-2">
                      <GlassSurface width="auto" height={28} borderRadius={8} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                        <span className="px-2 text-[10px] font-semibold text-white">Xem kết quả</span>
                      </GlassSurface>
                      <GlassSurface width="auto" height={28} borderRadius={8} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }} onClick={() => {}}>
                        <span className="px-2 text-[10px] font-semibold text-white">Dừng</span>
                      </GlassSurface>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
