import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

type CommTab = 'broadcast' | 'email' | 'push';

const mockCampaigns = [
  { id: '1', name: 'Chào tháng 2', type: 'email', sent: 1200, open: 45, click: 12, status: 'sent' },
  { id: '2', name: 'Tính năng mới', type: 'push', sent: 800, open: 60, click: 25, status: 'sent' },
  { id: '3', name: 'Sự kiện Study Abroad', type: 'email', sent: 0, open: 0, click: 0, status: 'draft' },
];

export default function Communication() {
  const [tab, setTab] = useState<CommTab>('broadcast');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div>
      <PageTitle title="Truyền thông & Thông báo" subtitle="Broadcast, Email Marketing, Push Notification" icon="campaign" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon="send" label="Đã gửi tháng này" value="2,000" color="blue" />
        <StatCard icon="mark_email_read" label="Tỷ lệ mở" value="52%" color="green" />
        <StatCard icon="ads_click" label="Tỷ lệ click" value="18%" color="purple" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'broadcast' as CommTab, label: 'Broadcast', icon: 'campaign' },
          { id: 'email' as CommTab, label: 'Email', icon: 'email' },
          { id: 'push' as CommTab, label: 'Push/SMS', icon: 'notifications' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>
            <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <GlassHeader icon="send" title="Gửi thông báo" />
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Đối tượng</label>
                <select className={glass.input} value={target} onChange={e => setTarget(e.target.value)}>
                  <option value="all">Tất cả người dùng</option>
                  <option value="admin">Chỉ Admin</option>
                  <option value="active">Người dùng Active</option>
                  <option value="inactive">Người dùng Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nội dung</label>
                <textarea className={`${glass.input} h-32 resize-none`} placeholder="Nhập nội dung thông báo..." value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                  <span className="px-5 text-sm font-semibold text-white">Gửi ngay</span>
                </GlassSurface>
                <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={() => {}}>
                  <span className="px-5 text-sm font-semibold text-white">Lên lịch</span>
                </GlassSurface>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <GlassHeader icon="history" title="Lịch sử gửi" />
            <div className="space-y-2">
              {['Cập nhật hệ thống v2.1', 'Bảo trì 22/02', 'Tính năng mới: AI Essay'].map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="text-sm font-semibold text-slate-700">{m}</p>
                  <p className="text-xs text-slate-400">Gửi tới tất cả · {i + 1} ngày trước</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === 'email' && (
        <GlassCard>
          <GlassHeader icon="email" title="Chiến dịch Email" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Tạo mới</span>
            </GlassSurface>
          } />
          <div className="space-y-2">
            {mockCampaigns.filter(c => c.type === 'email').map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 border border-white/60">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">Gửi: {c.sent} · Mở: {c.open}% · Click: {c.click}%</p>
                </div>
                <Badge text={c.status} color={c.status === 'sent' ? 'green' : 'yellow'} />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {tab === 'push' && (
        <GlassCard>
          <GlassHeader icon="notifications" title="Push Notification & SMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/40 border border-white/60">
              <p className="text-sm font-bold text-slate-700 mb-2">Web Push</p>
              <p className="text-xs text-slate-500 mb-3">Gửi thông báo đẩy tới trình duyệt</p>
              <GlassSurface width="100%" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                <span className="px-4 text-xs font-semibold text-white">Cấu hình Push</span>
              </GlassSurface>
            </div>
            <div className="p-4 rounded-xl bg-white/40 border border-white/60">
              <p className="text-sm font-bold text-slate-700 mb-2">SMS Gateway</p>
              <p className="text-xs text-slate-500 mb-3">OTP, thông báo khẩn cấp qua SMS</p>
              <GlassSurface width="100%" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                <span className="px-4 text-xs font-semibold text-white">Cấu hình SMS</span>
              </GlassSurface>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
