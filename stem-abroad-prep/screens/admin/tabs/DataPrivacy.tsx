import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, Toggle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockRetention = [
  { type: 'Dữ liệu cá nhân', period: '2 năm', autoDelete: true },
  { type: 'Lịch sử chat', period: '1 năm', autoDelete: true },
  { type: 'Audit logs', period: '5 năm', autoDelete: false },
  { type: 'Token usage', period: '3 năm', autoDelete: true },
];

const mockRequests = [
  { id: 'REQ-001', user: 'user@example.com', type: 'export', status: 'completed', date: '2026-02-18' },
  { id: 'REQ-002', user: 'test@gmail.com', type: 'delete', status: 'pending', date: '2026-02-17' },
  { id: 'REQ-003', user: 'abc@mail.com', type: 'anonymize', status: 'processing', date: '2026-02-16' },
];

const reqColors: Record<string, string> = { completed: 'green', pending: 'yellow', processing: 'blue' };
const typeLabels: Record<string, string> = { export: 'Xuất dữ liệu', delete: 'Xóa dữ liệu', anonymize: 'Ẩn danh hóa' };

export default function DataPrivacy() {
  const [tab, setTab] = useState<'gdpr' | 'retention' | 'pii'>('gdpr');
  const [consentBanner, setConsentBanner] = useState(true);
  const [cookiePolicy, setCookiePolicy] = useState(true);

  return (
    <div>
      <PageTitle title="Bảo mật dữ liệu & GDPR" subtitle="Tuân thủ GDPR, chính sách lưu trữ, PII" icon="shield" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="gavel" label="GDPR Requests" value={`${mockRequests.length}`} color="blue" />
        <StatCard icon="schedule" label="Pending" value="1" color="yellow" />
        <StatCard icon="delete_sweep" label="Auto-deleted" value="128" color="red" />
        <StatCard icon="verified_user" label="Compliance" value="94%" color="green" />
      </div>

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'gdpr' as const, label: 'Yêu cầu GDPR' },
          { id: 'retention' as const, label: 'Lưu trữ dữ liệu' },
          { id: 'pii' as const, label: 'PII & Consent' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gdpr' && (
        <GlassCard className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/50">
              {['ID', 'User', 'Loại', 'Trạng thái', 'Ngày', ''].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {mockRequests.map(r => (
                <tr key={r.id} className="border-b border-white/30 hover:bg-white/20">
                  <td className="px-4 py-3 font-mono text-slate-600">{r.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.user}</td>
                  <td className="px-4 py-3"><Badge text={typeLabels[r.type]} color="blue" /></td>
                  <td className="px-4 py-3"><Badge text={r.status} color={reqColors[r.status]} /></td>
                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">
                      Xử lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === 'retention' && (
        <GlassCard>
          <GlassHeader icon="schedule" title="Chính sách lưu trữ" />
          <div className="space-y-3">
            {mockRetention.map(r => (
              <div key={r.type} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 border border-white/60">
                <span className="material-symbols-outlined text-slate-400">folder</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{r.type}</p>
                  <p className="text-xs text-slate-400">Thời gian lưu: {r.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Auto-delete</span>
                  <Toggle on={r.autoDelete} onToggle={() => {}} label="" />
                </div>
                <button className="p-1 rounded hover:bg-white/60">
                  <span className="material-symbols-outlined text-slate-400 text-sm">edit</span>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === 'pii' && (
        <div className="space-y-6">
          <GlassCard>
            <GlassHeader icon="cookie" title="Consent & Cookie" />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/60">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Consent Banner</p>
                  <p className="text-xs text-slate-400">Hiển thị banner cookie cho người dùng mới</p>
                </div>
                <Toggle on={consentBanner} onToggle={() => setConsentBanner(!consentBanner)} label="" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/60">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cookie Policy</p>
                  <p className="text-xs text-slate-400">Yêu cầu chấp nhận trước khi sử dụng analytics</p>
                </div>
                <Toggle on={cookiePolicy} onToggle={() => setCookiePolicy(!cookiePolicy)} label="" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <GlassHeader icon="fingerprint" title="Công cụ PII" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: 'search', title: 'Quét PII', desc: 'Tìm dữ liệu nhạy cảm trong hệ thống' },
                { icon: 'visibility_off', title: 'Ẩn danh hóa', desc: 'Ẩn danh dữ liệu cụ thể' },
                { icon: 'delete_forever', title: 'Xóa hoàn toàn', desc: 'Xóa vĩnh viễn khỏi hệ thống' },
                { icon: 'download', title: 'Data Portability', desc: 'Xuất toàn bộ dữ liệu user' },
              ].map(t => (
                <button key={t.title} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 transition text-left">
                  <span className="material-symbols-outlined text-blue-500">{t.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
