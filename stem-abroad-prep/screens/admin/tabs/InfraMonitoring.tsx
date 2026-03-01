import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge } from '../components/SharedUI';
import { glass } from '../types';

const mockServers = [
  { id: '1', name: 'web-prod-1', region: 'US-East', cpu: 42, ram: 68, disk: 55, status: 'healthy' },
  { id: '2', name: 'api-prod-1', region: 'US-East', cpu: 78, ram: 82, disk: 40, status: 'warning' },
  { id: '3', name: 'worker-01', region: 'AP-South', cpu: 15, ram: 30, disk: 22, status: 'healthy' },
];

const mockServices = [
  { name: 'OpenAI GPT-4o', status: 'up', latency: '180ms', uptime: '99.98%' },
  { name: 'Stripe', status: 'up', latency: '95ms', uptime: '99.99%' },
  { name: 'SendGrid Email', status: 'degraded', latency: '450ms', uptime: '99.8%' },
  { name: 'Redis Cache', status: 'up', latency: '2ms', uptime: '100%' },
];

const svcColors: Record<string, string> = { up: 'green', degraded: 'yellow', down: 'red' };

function ProgressBar({ value, color = 'blue' }: { value: number; color?: string }) {
  const c = value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : `bg-${color}-500`;
  return (
    <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${c}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default function InfraMonitoring() {
  const [tab, setTab] = useState<'servers' | 'services' | 'alerts'>('servers');

  return (
    <div>
      <PageTitle title="Giám sát hạ tầng" subtitle="Theo dõi server, dịch vụ bên ngoài, cảnh báo" icon="dns" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="dns" label="Servers" value={`${mockServers.length}`} color="blue" />
        <StatCard icon="speed" label="Avg CPU" value="45%" color="green" />
        <StatCard icon="memory" label="Avg RAM" value="60%" color="purple" />
        <StatCard icon="cloud" label="Services" value={`${mockServices.length}`} color="cyan" />
      </div>

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'servers' as const, label: 'Servers' },
          { id: 'services' as const, label: 'Dịch vụ ngoài' },
          { id: 'alerts' as const, label: 'Cảnh báo' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'servers' && (
        <div className="space-y-4">
          {mockServers.map(s => (
            <GlassCard key={s.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-[#1E3A8A]">{s.name}</h4>
                  <span className="text-xs text-slate-400">{s.region}</span>
                </div>
                <Badge text={s.status} color={s.status === 'healthy' ? 'green' : 'yellow'} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'CPU', v: s.cpu },
                  { label: 'RAM', v: s.ram },
                  { label: 'Disk', v: s.disk },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{m.label}</span><span>{m.v}%</span>
                    </div>
                    <ProgressBar value={m.v} />
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'services' && (
        <GlassCard className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/50">
              {['Dịch vụ', 'Trạng thái', 'Latency', 'Uptime'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {mockServices.map(s => (
                <tr key={s.name} className="border-b border-white/30 hover:bg-white/20">
                  <td className="px-4 py-3 font-semibold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3"><Badge text={s.status} color={svcColors[s.status]} /></td>
                  <td className="px-4 py-3 text-slate-600">{s.latency}</td>
                  <td className="px-4 py-3 text-slate-600">{s.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === 'alerts' && (
        <GlassCard>
          <GlassHeader icon="notifications_active" title="Quy tắc cảnh báo" />
          <div className="space-y-3">
            {[
              { metric: 'CPU > 80%', channel: 'Email + Slack', active: true },
              { metric: 'RAM > 90%', channel: 'Email', active: true },
              { metric: 'API Latency > 2s', channel: 'Slack', active: false },
              { metric: 'Disk > 85%', channel: 'SMS + Email', active: true },
            ].map(a => (
              <div key={a.metric} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 border border-white/60">
                <span className={`material-symbols-outlined ${a.active ? 'text-red-500' : 'text-slate-300'}`}>warning</span>
                <span className="text-sm font-semibold text-slate-800 flex-1">{a.metric}</span>
                <span className="text-xs text-slate-400">{a.channel}</span>
                <Badge text={a.active ? 'Active' : 'Off'} color={a.active ? 'green' : 'slate'} />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
