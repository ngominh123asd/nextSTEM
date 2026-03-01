import React, { useEffect, useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { apiAdminLogs, type AuditLogEntry } from '../../../lib/api';
import { glass } from '../types';

type LogTab = 'audit' | 'security' | 'error' | 'performance';

const actionColors: Record<string, string> = {
  login: 'green', logout: 'gray', create: 'blue', update: 'purple',
  delete: 'red', register: 'cyan', error: 'red', warning: 'yellow',
};

export default function SystemLogs() {
  const [tab, setTab] = useState<LogTab>('audit');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    apiAdminLogs({ page, page_size: 15 })
      .then(r => setLogs(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const tabs: { id: LogTab; label: string; icon: string }[] = [
    { id: 'audit', label: 'Audit', icon: 'history' },
    { id: 'security', label: 'Bảo mật', icon: 'security' },
    { id: 'error', label: 'Lỗi', icon: 'error' },
    { id: 'performance', label: 'Hiệu suất', icon: 'speed' },
  ];

  /* Mock security & error logs */
  const securityLogs = [
    { action: 'login_failed', ip: '192.168.1.42', user: 'admin@test.com', time: '2 phút trước', device: 'Chrome/Windows' },
    { action: 'login', ip: '10.0.0.1', user: 'user@test.com', time: '10 phút trước', device: 'Safari/macOS' },
    { action: 'password_reset', ip: '172.16.0.5', user: 'abc@test.com', time: '1 giờ trước', device: 'Mobile/iOS' },
  ];

  const errorLogs = [
    { level: 'error', message: 'Database connection timeout', stack: 'app/database.py:42', time: '5 phút trước', status: 500 },
    { level: 'warning', message: 'Rate limit exceeded', stack: 'app/api/chat.py:118', time: '15 phút trước', status: 429 },
    { level: 'error', message: 'OpenAI API timeout', stack: 'app/services/chat_service.py:55', time: '1 giờ trước', status: 504 },
  ];

  return (
    <div>
      <PageTitle title="Nhật ký Hệ thống" subtitle="Security, Audit, Error & Performance logs" icon="receipt_long" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Audit tab */}
      {tab === 'audit' && (
        <GlassCard className="!p-0">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon="history" title="Không có log" desc="Chưa ghi nhận hoạt động nào" />
          ) : (
            <div className="divide-y divide-white/30">
              {logs.map(l => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/20 transition">
                  <Badge text={l.action} color={actionColors[l.action] || 'blue'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {l.target_type && <span className="font-semibold">{l.target_type}</span>}
                      {l.target_id && <span className="text-xs text-slate-400 ml-1">#{l.target_id.slice(0, 8)}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(l.created_at).toLocaleString('vi-VN')}</span>
                  {l.ip_address && <span className="text-[10px] text-slate-400 font-mono">{l.ip_address}</span>}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/40">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-xs text-blue-600 font-semibold disabled:opacity-30">← Trước</button>
            <span className="text-xs text-slate-500">Trang {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="text-xs text-blue-600 font-semibold">Sau →</button>
          </div>
        </GlassCard>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <GlassCard>
          <GlassHeader icon="security" title="Security Logs" />
          <div className="space-y-2">
            {securityLogs.map((l, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
                <Badge text={l.action} color={l.action.includes('failed') ? 'red' : 'green'} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">{l.user}</p>
                  <p className="text-xs text-slate-400">{l.device}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{l.ip}</span>
                <span className="text-xs text-slate-400">{l.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Error tab */}
      {tab === 'error' && (
        <GlassCard>
          <GlassHeader icon="error" title="Error Logs" />
          <div className="space-y-2">
            {errorLogs.map((l, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/60">
                <div className="flex items-center gap-2 mb-1">
                  <Badge text={l.level} color={l.level === 'error' ? 'red' : 'yellow'} />
                  <Badge text={`HTTP ${l.status}`} color="gray" />
                  <span className="text-xs text-slate-400">{l.time}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{l.message}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{l.stack}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Performance tab */}
      {tab === 'performance' && (
        <GlassCard>
          <GlassHeader icon="speed" title="Performance Monitoring" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'CPU', value: '23%', color: 'text-green-600' },
              { label: 'RAM', value: '61%', color: 'text-amber-600' },
              { label: 'DB Latency', value: '12ms', color: 'text-green-600' },
              { label: 'API Avg', value: '145ms', color: 'text-blue-600' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-white/40 border border-white/60 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">{m.label}</p>
                <p className={`text-xl font-extrabold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
