import React, { useState, useEffect } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import {
  apiUpdateProfile, apiGetPreferences, apiUpdatePreferences,
  type Preferences,
} from '../../../lib/api';
import { UserData, glass } from '../types';
import { GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
      <div>
        <p className="font-semibold text-[#1E3A8A] text-sm">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)} className={`w-12 h-6.5 rounded-full transition-all relative ${checked ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-300'}`} style={{ height: '26px' }}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all ${checked ? 'left-[26px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function SettingsTab({ userData }: { userData: UserData }) {
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [school, setSchool] = useState(userData.school);
  const [grade, setGrade] = useState(userData.grade);
  const [notiEmail, setNotiEmail] = useState(true);
  const [notiPush, setNotiPush] = useState(true);
  const [notiWeekly, setNotiWeekly] = useState(false);
  const [lang, setLang] = useState('vi');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* Load preferences from backend on mount */
  useEffect(() => {
    apiGetPreferences()
      .then((prefs: Preferences) => {
        setNotiEmail(prefs.notify_email);
        setNotiPush(prefs.notify_push);
        setNotiWeekly(prefs.notify_weekly);
        setLang(prefs.language);
      })
      .catch(() => { /* fallback to defaults */ });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await Promise.all([
        apiUpdateProfile({ name, grade, school }),
        apiUpdatePreferences({
          language: lang,
          notify_email: notiEmail,
          notify_push: notiPush,
          notify_weekly: notiWeekly,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setSaveError(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle icon="settings" title="Cài Đặt" subtitle="Quản lý thông tin cá nhân và tuỳ chỉnh trải nghiệm" />

      <GlassCard className="mb-6">
        <GlassHeader icon="person" title="Thông tin cá nhân" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Họ và tên</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={glass.input} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={glass.input} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Trường</label>
            <input type="text" value={school} onChange={e => setSchool(e.target.value)} className={glass.input} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Khối lớp</label>
            <div className="relative">
              <select value={grade} onChange={e => setGrade(e.target.value)} className={`${glass.input} appearance-none`}>
                {['Lớp 9','Lớp 10','Lớp 11','Lớp 12'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <GlassHeader icon="notifications" title="Thông báo" />
        <div className="space-y-3 relative z-10">
          <ToggleRow label="Thông báo Email" desc="Nhận cập nhật qua email" checked={notiEmail} onChange={setNotiEmail} />
          <ToggleRow label="Thông báo đẩy" desc="Nhận thông báo trên trình duyệt" checked={notiPush} onChange={setNotiPush} />
          <ToggleRow label="Báo cáo tuần" desc="Nhận tổng kết tiến độ hàng tuần" checked={notiWeekly} onChange={setNotiWeekly} />
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <GlassHeader icon="translate" title="Ngôn ngữ & Giao diện" />
        <div className="flex gap-3 relative z-10">
          {[{ id: 'vi', label: '🇻🇳 Tiếng Việt' }, { id: 'en', label: '🇺🇸 English' }].map(l => (
            <button key={l.id} onClick={() => setLang(l.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${lang === l.id ? 'border-blue-300/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-[#1E3A8A] shadow-sm backdrop-blur-sm' : 'border-white/60 text-slate-500 hover:border-blue-200/50 bg-white/30'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mb-6">
        <GlassHeader icon="warning" title="Vùng nguy hiểm" />
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-200/50 text-red-500 bg-red-50/20 backdrop-blur-sm hover:bg-red-50/50 transition-all">
            Xoá toàn bộ dữ liệu
          </button>
          <button className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-200/50 text-red-500 bg-red-50/20 backdrop-blur-sm hover:bg-red-50/50 transition-all">
            Xoá tài khoản
          </button>
        </div>
      </GlassCard>

      {saveError && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50/80 border border-red-200/60 text-red-600 text-sm font-medium">
          <span className="material-symbols-outlined text-lg">error</span>
          {saveError}
        </div>
      )}

      <div className="flex justify-end">
        <GlassSurface
          width="auto"
          height={48}
          borderRadius={16}
          className={`cursor-pointer hover:opacity-90 transition-opacity ${saving ? 'opacity-70 pointer-events-none' : ''}`}
          style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
          onClick={handleSave}
        >
          <span className="text-white text-sm font-semibold px-8 flex items-center gap-2">
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
              : saved ? <><span className="material-symbols-outlined text-lg">check_circle</span>Đã lưu!</>
              : <><span className="material-symbols-outlined text-lg">save</span>Lưu thay đổi</>}
          </span>
        </GlassSurface>
      </div>
    </>
  );
}
