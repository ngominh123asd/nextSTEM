import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass, getInitials, goalLabels } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';
import {
  apiListProjects, apiCreateProject, apiDeleteProject,
  apiListCertificates, apiCreateCertificate, apiDeleteCertificate, apiUploadCertFile,
  apiListActivities, apiCreateActivity, apiDeleteActivity,
  getToken,
  type ProjectItem, type CertItem, type ActivityItem,
} from '../../../lib/api';

/* ── Shared input component ── */
const Input = ({ label, val, set, type = 'text', ph }: {
  label: string; val: any; set: (v: any) => void; type?: string; ph?: string;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">{label}</label>
    <input
      type={type} placeholder={ph || label} value={val}
      onChange={e => set(e.target.value)}
      className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner"
    />
  </div>
);

/* ── Skills stored locally (self-assessment) ── */
const SKILLS_KEY = 'nextstem_skills_map';
function loadSkills(): Record<string, number> {
  try { const s = localStorage.getItem(SKILLS_KEY); if (s) return JSON.parse(s); } catch { }
  return {};
}
function saveSkills(map: Record<string, number>) {
  localStorage.setItem(SKILLS_KEY, JSON.stringify(map));
}

/* ── Activity chart (uses real activities count per day) ── */
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
function buildActivityChart(activities: ActivityItem[]) {
  const counts: Record<string, number> = {};
  DAYS.forEach(d => { counts[d] = 0; });
  activities.forEach(a => {
    const dayIdx = new Date(a.created_at).getDay(); // 0=Sun
    const mapIdx = dayIdx === 0 ? 6 : dayIdx - 1;
    const key = DAYS[mapIdx];
    counts[key] = (counts[key] || 0) + 1;
  });
  return DAYS.map(day => ({ day, tasks: counts[day] }));
}

export default function PortfolioTab({ userData, initialTab }: { userData: UserData; initialTab?: string }) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'certs'>(
    (initialTab as any) || 'overview'
  );
  useEffect(() => { if (initialTab) setTab(initialTab as any); }, [initialTab]);

  /* ── Data state ── */
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certs, setCerts] = useState<CertItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [skillsMap, setSkillsMap] = useState<Record<string, number>>(loadSkills());
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ── Form state ── */
  const [showProjForm, setShowProjForm] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', status: 'Đang phát triển', category: '', date_label: '', description: '', progress: 0 });
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', score: '', date: '', organisation: '' });
  const [certFile, setCertFile] = useState<File | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertItem | null>(null);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [newTime, setNewTime] = useState({ event: '', date_label: '', icon: 'star', color: 'from-blue-500 to-indigo-500' });
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState(50);

  const isLoggedIn = !!getToken();

  /* ── Load all data ── */
  const loadAll = useCallback(async () => {
    if (!isLoggedIn) { setLoadingData(false); return; }
    setLoadingData(true);
    try {
      const [p, c, a] = await Promise.all([
        apiListProjects(),
        apiListCertificates(),
        apiListActivities(),
      ]);
      setProjects(p);
      setCerts(c);
      setActivities(a);
    } catch (e) {
      console.error('Portfolio load failed', e);
    }
    setLoadingData(false);
  }, [isLoggedIn]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Handlers ── */
  const addProject = async () => {
    if (!newProj.title.trim()) return;
    setSaving(true);
    try {
      const created = await apiCreateProject({
        title: newProj.title,
        description: newProj.description || null,
        category: newProj.category || null,
        status: newProj.status,
        progress: newProj.progress,
        date_label: newProj.date_label || null,
      });
      setProjects(prev => [created, ...prev]);
      setShowProjForm(false);
      setNewProj({ title: '', status: 'Đang phát triển', category: '', date_label: '', description: '', progress: 0 });
    } catch (e) { console.error('Create project failed', e); }
    setSaving(false);
  };

  const delProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id)); // optimistic
    try { await apiDeleteProject(id); } catch { loadAll(); }
  };

  const addCert = async () => {
    if (!newCert.title.trim()) return;
    setSaving(true);
    try {
      let fileUrl: string | null = null;
      if (certFile) {
        try {
          const uploaded = await apiUploadCertFile(certFile);
          fileUrl = uploaded.file_url;
        } catch (e) { console.warn('File upload failed', e); }
      }
      const created = await apiCreateCertificate({
        title: newCert.title,
        score: newCert.score || null,
        date: newCert.date || null,
        organisation: newCert.organisation || null,
        file_url: fileUrl,
      });
      setCerts(prev => [created, ...prev]);
      setShowCertForm(false);
      setNewCert({ title: '', score: '', date: '', organisation: '' });
      setCertFile(null);
    } catch (e) { console.error('Create cert failed', e); }
    setSaving(false);
  };

  const delCert = async (id: string) => {
    setCerts(prev => prev.filter(c => c.id !== id));
    try { await apiDeleteCertificate(id); } catch { loadAll(); }
  };

  const addActivity = async () => {
    if (!newTime.event.trim()) return;
    setSaving(true);
    try {
      const created = await apiCreateActivity({
        event: newTime.event,
        icon: newTime.icon,
        color: newTime.color,
        date_label: newTime.date_label || null,
      });
      setActivities(prev => [created, ...prev]);
      setShowTimeForm(false);
      setNewTime({ event: '', date_label: '', icon: 'star', color: 'from-blue-500 to-indigo-500' });
    } catch (e) { console.error('Create activity failed', e); }
    setSaving(false);
  };

  const delActivity = async (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    try { await apiDeleteActivity(id); } catch { loadAll(); }
  };

  const saveSkill = (skill: string) => {
    const updated = { ...skillsMap, [skill]: skillLevel };
    setSkillsMap(updated);
    saveSkills(updated);
    setEditingSkill(null);
  };

  const allSkills = userData.interests.length > 0
    ? userData.interests
    : ['Logic & Thuật toán', 'Nghiên cứu Khoa học', 'Toán học Ứng dụng'];

  const activityChart = buildActivityChart(activities);
  const totalThisWeek = activityChart.reduce((s, d) => s + d.tasks, 0);

  const tabs = [
    { id: 'overview' as const, icon: 'person', label: 'Tổng quan' },
    { id: 'timeline' as const, icon: 'timeline', label: 'Timeline' },
    { id: 'certs' as const, icon: 'verified', label: 'Chứng chỉ' },
  ];

  /* ── Skeleton loader ── */
  const Skeleton = ({ h = 'h-24', n = 3 }: { h?: string; n?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`${h} rounded-2xl bg-gradient-to-r from-slate-100/60 to-slate-50/40 animate-pulse border border-white/60`} />
      ))}
    </div>
  );

  /* ════════════════════════════════════════════════════════ */
  return (
    <>
      <PageTitle icon="account_box" title="Hồ Sơ Năng Lực" subtitle="Xây dựng thương hiệu cá nhân & lưu trữ thành tích" />

      {/* Profile header */}
      <GlassCard className="mb-6">
        <BlobDecor className="w-56 h-56 -top-20 -right-20 bg-blue-200/20" />
        <BlobDecor className="w-40 h-40 -bottom-16 -left-16 bg-indigo-200/15" />
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-blue-500/30">
            {getInitials(userData.name || 'U')}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-extrabold text-[#1E3A8A]">{userData.name}</h2>
            <p className="text-slate-500 text-sm">{userData.grade} · {userData.school}</p>
            <p className="text-slate-400 text-xs mt-1">{userData.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {userData.interests.slice(0, 3).map(i => (
                <span key={i} className={`${glass.tag} text-xs bg-white/50 backdrop-blur-sm border border-white/60 text-blue-700`}>{i}</span>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="flex gap-3 text-center">
            <div className="px-4 py-3 rounded-2xl bg-white/50 border border-white/60 backdrop-blur-sm">
              <p className="text-xl font-extrabold text-[#1E3A8A]">{projects.length}</p>
              <p className="text-[10px] text-slate-400 font-medium">Dự án</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/50 border border-white/60 backdrop-blur-sm">
              <p className="text-xl font-extrabold text-[#1E3A8A]">{certs.length}</p>
              <p className="text-[10px] text-slate-400 font-medium">Chứng chỉ</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/50 border border-white/60 backdrop-blur-sm">
              <p className="text-xl font-extrabold text-[#1E3A8A]">{activities.length}</p>
              <p className="text-[10px] text-slate-400 font-medium">Hoạt động</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tab nav */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 w-fit overflow-x-auto max-w-full shadow-sm">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${tab === t.id
              ? 'bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white shadow-md'
              : 'text-slate-500 hover:text-[#1E3A8A] hover:bg-white/50'
              }`}>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ══ Overview ══ */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <GlassHeader icon="flag" title="Mục tiêu du học" />
              <div className="relative z-10 flex flex-wrap gap-2 mt-2">
                {userData.goals.map(g => (
                  <span key={g} className={`${glass.tag} bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-[#1E3A8A] border border-blue-200/40`}>
                    {goalLabels[g] || g}
                  </span>
                ))}
                {userData.goals.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn mục tiêu</p>}
              </div>
            </GlassCard>
            <GlassCard>
              <GlassHeader icon="interests" title="Sở thích" />
              <div className="relative z-10 flex flex-wrap gap-2 mt-2">
                {userData.interests.map(i => (
                  <span key={i} className={`${glass.tag} bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-indigo-700 border border-indigo-200/40`}>{i}</span>
                ))}
                {userData.interests.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn sở thích</p>}
              </div>
            </GlassCard>
          </div>

          {/* Projects */}
          <GlassCard>
            <GlassHeader
              icon="science" title="Dự án nổi bật"
              extra={
                isLoggedIn ? (
                  <button onClick={() => setShowProjForm(!showProjForm)}
                    className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">{showProjForm ? 'close' : 'add'}</span>
                    {showProjForm ? 'Đóng' : 'Dự án mới'}
                  </button>
                ) : null
              }
            />
            <div className="space-y-4 relative z-10 mt-3">
              {showProjForm && (
                <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-200 shadow-xl space-y-4 mb-6">
                  <h4 className="font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-blue-100 pb-2">
                    <span className="material-symbols-outlined text-blue-500 text-lg">edit_document</span>Thêm dự án cá nhân
                  </h4>
                  <Input label="Tên dự án" ph="Vd: Hệ thống lọc nước năng lượng mặt trời" val={newProj.title} set={v => setNewProj({ ...newProj, title: v })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Lĩnh vực / Môn học" ph="Vd: Khoa học môi trường" val={newProj.category} set={v => setNewProj({ ...newProj, category: v })} />
                    <Input label="Thời gian thực hiện" ph="Vd: 09/2025 - Nay" val={newProj.date_label} set={v => setNewProj({ ...newProj, date_label: v })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Tiến độ (%)" type="number" val={newProj.progress} set={v => setNewProj({ ...newProj, progress: parseInt(v) || 0 })} />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Trạng thái</label>
                      <select value={newProj.status} onChange={e => setNewProj({ ...newProj, status: e.target.value })}
                        className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
                        <option>Đang phát triển</option>
                        <option>Hoàn thành</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Mô tả ngắn gọn</label>
                    <textarea placeholder="Nêu bật vai trò, kết quả hoặc hướng đi của dự án..." value={newProj.description}
                      onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none h-20 shadow-inner focus:ring-2 focus:ring-blue-400/50" />
                  </div>
                  <button onClick={addProject} disabled={saving}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-60">
                    <span className="material-symbols-outlined text-base">{saving ? 'progress_activity' : 'save'}</span>
                    {saving ? 'Đang lưu...' : 'Lưu dự án'}
                  </button>
                </div>
              )}

              {loadingData && <Skeleton n={2} />}
              {!loadingData && projects.length === 0 && !showProjForm && (
                <div className="p-8 text-center text-slate-400 border-2 border-dashed border-white/60 rounded-2xl bg-white/20">
                  {isLoggedIn ? "Chưa có dự án nào. Bấm 'Dự án mới' để thêm." : 'Đăng nhập để xem dự án.'}
                </div>
              )}
              {projects.map(p => (
                <div key={p.id} className="p-4 sm:p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white group hover:shadow-lg transition-all pr-12 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-[#1E3A8A] text-base">{p.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        {p.category && <span className="font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{p.category}</span>}
                        {p.date_label && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{p.date_label}</span></>}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${p.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'Tạm dừng' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                  </div>
                  {p.description && <p className="text-sm text-slate-600 mb-4 bg-white/40 p-3 rounded-xl border border-white leading-relaxed">{p.description}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#1E3A8A] min-w-[30px]">{p.progress}%</span>
                  </div>
                  <button onClick={() => delProject(p.id)}
                    className="absolute top-4 right-4 p-2 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Activity chart - moved to bottom */}
          <GlassCard>
            <BlobDecor className="w-36 h-36 -bottom-12 -right-12 bg-blue-200/20" />
            <GlassHeader icon="bar_chart" title="Hoạt động tuần này" />
            <div className="w-full h-[200px] relative z-10 mt-2">
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <AreaChart data={activityChart}>
                  <defs>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: 12 }} />
                  <Area type="monotone" dataKey="tasks" stroke="#4f46e5" fill="url(#actGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-3 relative z-10">
              <span className="text-sm font-semibold text-slate-500">Tổng hoạt động: <strong className="text-[#1E3A8A]">{totalThisWeek}</strong></span>
              {activities.length > 0 && (
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50/60 px-2.5 py-1 rounded-full">
                  {activities.length} sự kiện
                </span>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ══ Timeline ══ */}
      {tab === 'timeline' && (
        <GlassCard>
          <GlassHeader
            icon="timeline" title="Timeline hoạt động"
            extra={
              isLoggedIn ? (
                <button onClick={() => setShowTimeForm(!showTimeForm)}
                  className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">{showTimeForm ? 'close' : 'add'}</span>
                  {showTimeForm ? 'Đóng' : 'Thêm sự kiện'}
                </button>
              ) : null
            }
          />
          <div className="relative z-10 mt-4">
            {showTimeForm && (
              <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-200 shadow-xl space-y-4 mb-8 ml-4">
                <h4 className="font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-blue-100 pb-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">add_task</span>Ghi nhận Cột mốc
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Tên cột mốc / Sự kiện" ph="Vd: Đạt giải Nhất HSG Thành phố" val={newTime.event} set={v => setNewTime({ ...newTime, event: v })} />
                  <Input label="Thời gian" ph="Vd: Tháng 10, 2025" val={newTime.date_label} set={v => setNewTime({ ...newTime, date_label: v })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Icon đại diện</label>
                    <select value={newTime.icon} onChange={e => setNewTime({ ...newTime, icon: e.target.value })}
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
                      <option value="emoji_events">🏆 Cúp / Giải thưởng</option>
                      <option value="school">🎓 Học thuật</option>
                      <option value="rocket_launch">🚀 Dự án</option>
                      <option value="volunteer_activism">❤️ Tình nguyện</option>
                      <option value="groups">👥 Ngoại khóa / CLB</option>
                      <option value="star">⭐ Khác</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Màu sắc</label>
                    <select value={newTime.color} onChange={e => setNewTime({ ...newTime, color: e.target.value })}
                      className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
                      <option value="from-blue-500 to-indigo-600">Xanh dương</option>
                      <option value="from-amber-400 to-orange-500">Vàng Cam</option>
                      <option value="from-emerald-400 to-green-600">Xanh lá</option>
                      <option value="from-rose-400 to-pink-500">Hồng</option>
                      <option value="from-violet-500 to-purple-600">Tím</option>
                    </select>
                  </div>
                </div>
                <button onClick={addActivity} disabled={saving}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-60">
                  <span className="material-symbols-outlined text-base">{saving ? 'progress_activity' : 'save'}</span>
                  {saving ? 'Đang lưu...' : 'Lưu cột mốc'}
                </button>
              </div>
            )}

            {loadingData && <Skeleton h="h-16" n={4} />}
            {!loadingData && activities.length === 0 && !showTimeForm && (
              <div className="text-sm text-slate-400 p-8 text-center border-2 border-dashed border-white/60 rounded-2xl bg-white/20">
                {isLoggedIn ? 'Chưa có hoạt động nào. Bấm "Thêm sự kiện" để ghi nhận.' : 'Đăng nhập để xem hoạt động.'}
              </div>
            )}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-transparent" />
            <div className="space-y-6 pl-12 pb-4">
              {activities.map(a => (
                <div key={a.id} className="relative group">
                  <div className={`absolute -left-12 top-0 w-10 h-10 rounded-xl bg-gradient-to-br ${a.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-md z-10 border border-white/40 ring-4 ring-white/50`}>
                    <span className="material-symbols-outlined text-white text-base">{a.icon || 'star'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">{a.date_label || new Date(a.created_at).toLocaleDateString('vi-VN')}</p>
                    <p className="font-bold text-[#1E3A8A] text-base pr-8">{a.event}</p>
                    <button onClick={() => delActivity(a.id)}
                      className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* ══ Certificates ══ */}
      {tab === 'certs' && (
        <GlassCard>
          <GlassHeader
            icon="verified" title="Chứng chỉ & Thành tích"
            extra={
              isLoggedIn ? (
                <button onClick={() => setShowCertForm(!showCertForm)}
                  className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">{showCertForm ? 'close' : 'add'}</span>
                  {showCertForm ? 'Đóng' : 'Thêm mới'}
                </button>
              ) : null
            }
          />
          <div className="space-y-4 relative z-10 mt-3">
            {/* Add form */}
            {showCertForm && (
              <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-200 shadow-xl space-y-4 mb-2">
                <h4 className="font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-blue-100 pb-2">
                  <span className="material-symbols-outlined text-blue-500 text-lg">card_membership</span>Nhập Chứng chỉ Mới
                </h4>
                <Input label="Tên chứng chỉ" ph="Vd: IELTS, SAT, Huy chương Vàng..." val={newCert.title} set={v => setNewCert({ ...newCert, title: v })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Điểm số / Thành tích" ph="Vd: 8.0, 1500, Giải Nhất" val={newCert.score} set={v => setNewCert({ ...newCert, score: v })} />
                  <Input label="Ngày thi / Ngày cấp" ph="Vd: Tháng 10, 2025" val={newCert.date} set={v => setNewCert({ ...newCert, date: v })} />
                </div>
                <Input label="Tổ chức cấp" ph="Vd: British Council, College Board" val={newCert.organisation} set={v => setNewCert({ ...newCert, organisation: v })} />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Tải file chứng chỉ <span className="text-slate-400 font-normal">(PDF hoặc ảnh, tối đa 5MB)</span></label>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-blue-200/50 bg-white/50 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    onClick={() => document.getElementById('cert-file-input')?.click()}
                  >
                    <input
                      id="cert-file-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && f.size > 5 * 1024 * 1024) { alert('File quá lớn. Tối đa 5MB.'); return; }
                        setCertFile(f || null);
                      }}
                    />
                    {certFile ? (
                      <>
                        <span className="material-symbols-outlined text-blue-500">{certFile.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}</span>
                        <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{certFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setCertFile(null); }} className="text-slate-400 hover:text-red-500">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                        <span className="text-sm text-slate-400">Nhấn để chọn file</span>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={addCert} disabled={saving}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-60">
                  <span className="material-symbols-outlined text-base">{saving ? 'progress_activity' : 'save'}</span>
                  {saving ? 'Đang lưu...' : 'Lưu chứng chỉ'}
                </button>
              </div>
            )}

            {loadingData && <Skeleton h="h-20" n={3} />}
            {!loadingData && certs.length === 0 && !showCertForm && (
              <div className="p-8 text-center text-slate-400 border-2 border-dashed border-white/60 rounded-2xl bg-white/20">
                {isLoggedIn ? "Chưa có chứng chỉ nào. Bấm 'Thêm mới' để khai báo." : 'Đăng nhập để xem chứng chỉ.'}
              </div>
            )}

            {/* Cert cards */}
            {certs.map(c => (
              <div key={c.id} onClick={() => setSelectedCert(c)}
                className="group relative rounded-2xl bg-white/60 backdrop-blur-sm border border-white overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-l-2xl" />
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl group-hover:bg-blue-200/40 transition-colors" />

                <div className="p-4 sm:p-5 pl-6 flex items-center gap-4 relative z-10">
                  {/* Medal icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white flex-shrink-0">
                    <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
                  </div>

                  {/* Info block */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1E3A8A] text-[15px] sm:text-base leading-tight">{c.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                      {c.organisation && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[12px] text-slate-400">apartment</span>
                          {c.organisation}
                        </span>
                      )}
                      {c.date && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <span className="material-symbols-outlined text-[12px] text-slate-400">schedule</span>
                          {c.date}
                        </span>
                      )}
                      {c.file_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[12px]">description</span>
                          Có file
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="flex-shrink-0 text-center">
                    <div className="min-w-[56px] px-3 py-2.5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60">
                      <p className="text-lg sm:text-xl font-black text-blue-700 leading-none">{c.score || '—'}</p>
                      <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1">Thành tích</p>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button onClick={(e) => { e.stopPropagation(); delCert(c.id); }}
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
      {/* ── Certificate Detail Modal ── */}
      {selectedCert && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-all" onClick={() => setSelectedCert(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-white relative" style={{ animation: 'modalIn .25s ease-out' }} onClick={e => e.stopPropagation()}>
            {/* Context & Info (Left Panel) */}
            <div className="w-full md:w-1/3 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-xl" />
              <button onClick={() => setSelectedCert(null)} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full md:hidden">
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-6 ring-2 ring-white/20">
                  <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug">{selectedCert.title}</h3>
                <p className="text-sm font-semibold text-blue-200 mb-8">{selectedCert.organisation}</p>

                <div className="space-y-6">
                  <div>
                    <p className="text-[11px] font-bold text-blue-300/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">military_tech</span> Kết quả / Điểm số</p>
                    <p className="text-2xl font-black text-white">{selectedCert.score || 'Ghi nhận'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-blue-300/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span> Thời gian</p>
                    <p className="text-base font-bold text-white bg-white/15 inline-block px-3 py-1.5 rounded-lg">{selectedCert.date || 'Chưa xác định'}</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-auto pt-6 space-y-3">
                <button onClick={() => { delCert(selectedCert.id); setSelectedCert(null); }}
                  className="hidden md:flex py-3 w-full items-center justify-center gap-2 bg-white/10 border border-red-300/40 rounded-xl font-bold text-red-200 hover:bg-red-500/30 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Xóa chứng chỉ
                </button>
                <button onClick={() => setSelectedCert(null)} className="hidden md:flex py-3 w-full items-center justify-center gap-2 border-2 border-white/30 rounded-xl font-bold text-white hover:bg-white/10 transition-colors">
                  Đóng lại
                </button>
              </div>
            </div>

            {/* Document Preview (Right Panel) */}
            <div className="w-full md:w-2/3 bg-slate-100/50 flex flex-col relative h-[400px] md:h-auto">
              <div className="flex-1 p-4 sm:p-6 overflow-hidden">
                {selectedCert.file_url ? (
                  <div className="w-full h-full bg-slate-200/50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
                    {selectedCert.file_url.toLowerCase().endsWith('.pdf') ? (
                      <iframe src={selectedCert.file_url} className="w-full h-full" title="PDF Preview" />
                    ) : (
                      <img src={selectedCert.file_url} alt="Content" className="w-full h-full object-contain" />
                    )}

                    {/* Action overlay */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <a href={selectedCert.file_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded-xl shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span> Phóng to
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                    <span className="material-symbols-outlined text-[64px] mb-4 opacity-30">description</span>
                    <p className="font-semibold text-slate-500">Người dùng chưa tải lên file đính kèm</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}