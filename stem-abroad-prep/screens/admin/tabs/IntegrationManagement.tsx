import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, Toggle, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockIntegrations = [
  { id: '1', name: 'Google OAuth', type: 'SSO', status: 'active', icon: 'login' },
  { id: '2', name: 'OpenAI API', type: 'AI', status: 'active', icon: 'smart_toy' },
  { id: '3', name: 'SendGrid', type: 'Email', status: 'active', icon: 'email' },
  { id: '4', name: 'Stripe', type: 'Payment', status: 'inactive', icon: 'payments' },
  { id: '5', name: 'Google Analytics', type: 'Analytics', status: 'active', icon: 'analytics' },
];

const mockWebhooks = [
  { id: '1', url: 'https://hooks.example.com/user-events', events: ['user.created', 'user.deleted'], status: 'active', lastDelivery: '2 phút trước' },
  { id: '2', url: 'https://hooks.example.com/payments', events: ['payment.success'], status: 'inactive', lastDelivery: 'N/A' },
];

export default function IntegrationManagement() {
  const [tab, setTab] = useState<'integrations' | 'webhooks' | 'api'>('integrations');

  return (
    <div>
      <PageTitle title="Tích hợp & API" subtitle="Quản lý kết nối bên thứ ba" icon="hub" />

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'integrations' as const, label: 'Tích hợp', icon: 'extension' },
          { id: 'webhooks' as const, label: 'Webhooks', icon: 'webhook' },
          { id: 'api' as const, label: 'API Gateway', icon: 'api' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'integrations' && (
        <GlassCard>
          <GlassHeader icon="extension" title="Dịch vụ đã tích hợp" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Thêm</span>
            </GlassSurface>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockIntegrations.map(i => (
              <div key={i.id} className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/60">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">{i.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{i.name}</p>
                  <p className="text-xs text-slate-500">{i.type}</p>
                </div>
                <Badge text={i.status} color={i.status === 'active' ? 'green' : 'gray'} />
                <button className="p-1.5 rounded-lg hover:bg-white/60">
                  <span className="material-symbols-outlined text-slate-400 text-base">settings</span>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === 'webhooks' && (
        <GlassCard>
          <GlassHeader icon="webhook" title="Webhooks" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Webhook</span>
            </GlassSurface>
          } />
          <div className="space-y-3">
            {mockWebhooks.map(w => (
              <div key={w.id} className="p-4 rounded-xl bg-white/40 border border-white/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-slate-700 truncate">{w.url}</span>
                  <Badge text={w.status} color={w.status === 'active' ? 'green' : 'gray'} />
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {w.events.map(e => <Badge key={e} text={e} color="blue" />)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Gửi gần nhất: {w.lastDelivery}</span>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-white/60"><span className="material-symbols-outlined text-slate-400 text-sm">edit</span></button>
                    <button className="p-1 rounded hover:bg-red-50"><span className="material-symbols-outlined text-red-400 text-sm">delete</span></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <GlassHeader icon="key" title="API Keys" extra={
              <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                <span className="px-3 text-xs font-semibold text-white">+ Tạo key</span>
              </GlassSurface>
            } />
            <div className="space-y-2">
              {[
                { name: 'Mobile App', key: 'nst_live_****7a3f', calls: '12,400/day', limit: '50,000/day' },
                { name: 'Partner API', key: 'nst_live_****9b2c', calls: '340/day', limit: '5,000/day' },
              ].map(k => (
                <div key={k.name} className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-800">{k.name}</span>
                    <span className="font-mono text-xs text-slate-500">{k.key}</span>
                  </div>
                  <p className="text-xs text-slate-500">{k.calls} · Limit: {k.limit}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <GlassHeader icon="speed" title="Rate Limiting" />
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Global rate limit</label>
                <input className={glass.input} defaultValue="1000 requests/minute" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Per-key limit</label>
                <input className={glass.input} defaultValue="50000 requests/day" />
              </div>
              <GlassSurface width="auto" height={40} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                <span className="px-5 text-sm font-semibold text-white">Lưu cấu hình</span>
              </GlassSurface>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
