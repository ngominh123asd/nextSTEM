import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Toggle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

export default function SystemSettings() {
  const [brand, setBrand] = useState({ name: 'nextSTEM', contact: 'hello@nextstem.vn' });
  const [backup, setBackup] = useState({ auto: true, interval: 'daily', retention: '30' });

  return (
    <div>
      <PageTitle title="Cấu hình Hệ thống" subtitle="Thiết lập chung, email, sao lưu" icon="settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Settings */}
        <GlassCard>
          <GlassHeader icon="palette" title="Thông tin Brand" />
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tên hệ thống</label>
              <input className={glass.input} value={brand.name} onChange={e => setBrand(b => ({ ...b, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email liên hệ</label>
              <input className={glass.input} value={brand.contact} onChange={e => setBrand(b => ({ ...b, contact: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                </div>
                <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                  <span className="px-4 text-xs font-semibold text-white">Upload Logo</span>
                </GlassSurface>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Favicon</label>
              <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #6b7280, #9ca3af)' }} onClick={() => {}}>
                <span className="px-4 text-xs font-semibold text-white">Upload Favicon</span>
              </GlassSurface>
            </div>
            <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-5 text-sm font-semibold text-white">Lưu cấu hình</span>
            </GlassSurface>
          </div>
        </GlassCard>

        {/* Email Templates */}
        <GlassCard>
          <GlassHeader icon="email" title="Mẫu Email" />
          <div className="space-y-2">
            {[
              { name: 'Welcome Email', desc: 'Gửi khi đăng ký mới', icon: 'waving_hand' },
              { name: 'Reset Password', desc: 'Yêu cầu đặt lại mật khẩu', icon: 'lock_reset' },
              { name: 'Thông báo điểm', desc: 'Cập nhật kết quả', icon: 'grade' },
              { name: 'Nhắc nhở', desc: 'Nhắc nhở hoạt động', icon: 'notifications' },
            ].map(t => (
              <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 cursor-pointer transition">
                <span className="material-symbols-outlined text-blue-600">{t.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.desc}</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-lg">edit</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Backup & Restore */}
        <GlassCard className="lg:col-span-2">
          <GlassHeader icon="backup" title="Sao lưu & Phục hồi" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Toggle on={backup.auto} onToggle={() => setBackup(b => ({ ...b, auto: !b.auto }))} label="Backup tự động" />
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tần suất</label>
                <select className={glass.input} value={backup.interval} onChange={e => setBackup(b => ({ ...b, interval: e.target.value }))}>
                  <option value="hourly">Mỗi giờ</option>
                  <option value="daily">Mỗi ngày</option>
                  <option value="weekly">Mỗi tuần</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Giữ lại (ngày)</label>
                <input type="number" className={glass.input} value={backup.retention} onChange={e => setBackup(b => ({ ...b, retention: e.target.value }))} />
              </div>
              <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                <span className="px-5 text-sm font-semibold text-white">Backup ngay</span>
              </GlassSurface>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Bản sao lưu gần đây</p>
              <div className="space-y-2">
                {['2026-02-18 06:00', '2026-02-17 06:00', '2026-02-16 06:00'].map(d => (
                  <div key={d} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/60">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{d}</p>
                      <p className="text-xs text-slate-400">42.3 MB · Hoàn thành</p>
                    </div>
                    <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                      <span className="px-3 text-xs font-semibold text-white">Restore</span>
                    </GlassSurface>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
