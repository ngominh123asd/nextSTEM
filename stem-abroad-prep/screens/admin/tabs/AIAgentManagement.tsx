import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, StatCard, Toggle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockAgents = [
  { id: '1', name: 'Study Coach', model: 'GPT-4o', status: 'active', temp: 0.7, maxTokens: 4096, avgLatency: 1.2 },
  { id: '2', name: 'Essay Reviewer', model: 'Claude 3.5', status: 'active', temp: 0.3, maxTokens: 8192, avgLatency: 2.1 },
  { id: '3', name: 'University Advisor', model: 'GPT-4o-mini', status: 'paused', temp: 0.5, maxTokens: 2048, avgLatency: 0.8 },
];

export default function AIAgentManagement() {
  const [selected, setSelected] = useState<string | null>(null);
  const [editAgent, setEditAgent] = useState<typeof mockAgents[0] | null>(null);

  const agent = editAgent || mockAgents.find(a => a.id === selected);

  return (
    <div>
      <PageTitle title="Quản lý AI Agents" subtitle="Cấu hình và giám sát các tác nhân AI" icon="smart_toy" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon="smart_toy" label="Tổng Agents" value={mockAgents.length} color="blue" />
        <StatCard icon="check_circle" label="Đang hoạt động" value={mockAgents.filter(a => a.status === 'active').length} color="green" />
        <StatCard icon="speed" label="Latency TB" value="1.4s" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent list */}
        <GlassCard className="lg:col-span-1">
          <GlassHeader icon="list" title="Danh sách Agents" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Thêm</span>
            </GlassSurface>
          } />
          <div className="space-y-2">
            {mockAgents.map(a => (
              <div key={a.id} onClick={() => { setSelected(a.id); setEditAgent(a); }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selected === a.id ? 'bg-blue-50/80 border-blue-200' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">{a.name}</span>
                  <Badge text={a.status} color={a.status === 'active' ? 'green' : 'yellow'} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{a.model} · {a.avgLatency}s avg</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Agent config */}
        <GlassCard className="lg:col-span-2">
          {agent ? (
            <>
              <GlassHeader icon="tune" title={`Cấu hình: ${agent.name}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Model</label>
                  <select className={glass.input} defaultValue={agent.model}>
                    <option>GPT-4o</option>
                    <option>GPT-4o-mini</option>
                    <option>Claude 3.5</option>
                    <option>Claude 3 Opus</option>
                    <option>Gemini Pro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Temperature</label>
                  <input type="number" step="0.1" min="0" max="2" className={glass.input} defaultValue={agent.temp} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Max Tokens</label>
                  <input type="number" className={glass.input} defaultValue={agent.maxTokens} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">API Key</label>
                  <input type="password" className={glass.input} defaultValue="sk-***" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">System Prompt</label>
                  <textarea className={`${glass.input} h-24 resize-none`} defaultValue="You are a helpful study coach..." />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Toggle on={agent.status === 'active'} onToggle={() => {}} label="Agent đang hoạt động" />
              </div>
              <div className="flex gap-3 mt-4">
                <GlassSurface width="auto" height={40} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                  <span className="px-5 text-sm font-semibold text-white">Lưu cấu hình</span>
                </GlassSurface>
                <GlassSurface width="auto" height={40} borderRadius={14} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }} onClick={() => {}}>
                  <span className="px-5 text-sm font-semibold text-white">Xóa Agent</span>
                </GlassSurface>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">touch_app</span>
              <p className="font-semibold">Chọn agent để xem cấu hình</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
