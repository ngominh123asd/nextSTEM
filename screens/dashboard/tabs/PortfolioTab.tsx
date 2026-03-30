import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass, getInitials, goalLabels } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';

const activityData = [
  { day: 'T2', tasks: 3 }, { day: 'T3', tasks: 5 }, { day: 'T4', tasks: 2 },
  { day: 'T5', tasks: 7 }, { day: 'T6', tasks: 4 }, { day: 'T7', tasks: 6 }, { day: 'CN', tasks: 1 },
];

const sampleProjects = [
  { title: 'AI Chatbot Tư Vấn Học Tập', status: 'Đang phát triển', category: 'Lập trình / AI', date: 'Tháng 1, 2026', desc: 'Xây dựng chatbot sử dụng GPT-4 để tư vấn chọn ngành và trường đại học cho học sinh THPT.', progress: 65, image: '' },
  { title: 'Nghiên Cứu Chất Lượng Nước Sông Hồng', status: 'Hoàn thành', category: 'Khoa học', date: 'Tháng 11, 2025', desc: 'Thu thập và phân tích mẫu nước tại 12 điểm dọc sông Hồng, đo lường các chỉ số ô nhiễm.', progress: 100, image: '' },
];
const sampleCerts = [
  { title: 'IELTS Academic', score: '7.5', date: '10/2025', org: 'British Council' },
  { title: 'AP Computer Science A', score: '5/5', date: '05/2025', org: 'College Board' },
  { title: 'Google Data Analytics', score: 'Passed', date: '08/2025', org: 'Coursera' },
];
const sampleTimeline = [
  { date: 'Tháng 1, 2026', event: 'Bắt đầu dự án AI Chatbot', icon: 'rocket_launch', color: 'from-blue-500 to-blue-600' },
  { date: 'Tháng 11, 2025', event: 'Hoàn thành nghiên cứu Sông Hồng', icon: 'check_circle', color: 'from-emerald-500 to-emerald-600' },
  { date: 'Tháng 10, 2025', event: 'Đạt IELTS 7.5', icon: 'school', color: 'from-amber-500 to-orange-500' },
  { date: 'Tháng 8, 2025', event: 'Trưởng ban kỹ thuật CLB Robotics', icon: 'groups', color: 'from-violet-500 to-purple-500' },
  { date: 'Hè 2025', event: 'Tình nguyện dạy STEM tại Sapa', icon: 'volunteer_activism', color: 'from-rose-500 to-pink-500' },
];

const STORAGE_KEY = 'nextstem_portfolio_data';
function loadData() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return { projects: sampleProjects, certs: sampleCerts, timeline: sampleTimeline, skillsMap: {} };
}

const Input = ({ label, val, set, type = 'text', ph }: { label: string, val: any, set: (v: any) => void, type?: string, ph?: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">{label}</label>
    <input type={type} placeholder={ph || label} value={val} onChange={e => set(e.target.value)} className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner" />
  </div>
);

export default function PortfolioTab({ userData, initialTab }: { userData: UserData, initialTab?: string }) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'certs' | 'skills'>((initialTab as any) || 'overview');
  useEffect(() => { if (initialTab) setTab(initialTab as any); }, [initialTab]);

  const [data, setData] = useState(loadData());
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);

  const [showProjForm, setShowProjForm] = useState(false);
  const [newProj, setNewProj] = useState({ title: '', status: 'Đang phát triển', category: '', date: '', desc: '', progress: 0 });
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', score: '', date: '', org: '' });
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [newTime, setNewTime] = useState({ date: '', event: '', icon: 'star', color: 'from-blue-500 to-indigo-500' });
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState(50);

  const tabs = [
    { id: 'overview' as const, icon: 'person', label: 'Tổng quan' },
    { id: 'timeline' as const, icon: 'timeline', label: 'Timeline' },
    { id: 'certs' as const,    icon: 'verified', label: 'Chứng chỉ' },
    { id: 'skills' as const,   icon: 'psychology', label: 'Kỹ năng' },
  ];

  /* ── Handlers ── */
  const addProject = () => { if (!newProj.title) return; setData((prev: any) => ({ ...prev, projects: [newProj, ...prev.projects] })); setShowProjForm(false); setNewProj({ title: '', status: 'Đang phát triển', category: '', date: '', desc: '', progress: 0 }); };
  const addCert = () => { if (!newCert.title) return; setData((prev: any) => ({ ...prev, certs: [newCert, ...prev.certs] })); setShowCertForm(false); setNewCert({ title: '', score: '', date: '', org: '' }); };
  const addTime = () => { if (!newTime.event) return; setData((prev: any) => ({ ...prev, timeline: [newTime, ...prev.timeline] })); setShowTimeForm(false); setNewTime({ date: '', event: '', icon: 'star', color: 'from-blue-500 to-indigo-500' }); };
  const delProj = (i: number) => setData((prev: any) => ({ ...prev, projects: prev.projects.filter((_: any, idx: number) => idx !== i) }));
  const delCert = (i: number) => setData((prev: any) => ({ ...prev, certs: prev.certs.filter((_: any, idx: number) => idx !== i) }));
  const delTime = (i: number) => setData((prev: any) => ({ ...prev, timeline: prev.timeline.filter((_: any, idx: number) => idx !== i) }));
  const saveSkill = (skill: string) => { setData((prev: any) => ({ ...prev, skillsMap: { ...prev.skillsMap, [skill]: skillLevel } })); setEditingSkill(null); };

  const allSkills = userData.interests.length > 0 ? userData.interests : ['Logic & Thuật toán', 'Nghiên cứu Khoa học', 'Toán học Ứng dụng'];

  return (
    <>
      <PageTitle icon="account_box" title="Hồ Sơ Năng Lực" subtitle="Xây dựng thương hiệu cá nhân & lưu trữ thành tích" />

      {/* Header */}
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
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 hover:opacity-90">
              <span className="material-symbols-outlined text-base">share</span>Chia sẻ
            </button>
            <button className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/60 text-[#1E3A8A] text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-white/80 transition-colors">
              <span className="material-symbols-outlined text-base">download</span>PDF
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Nav */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 w-fit overflow-x-auto max-w-full shadow-sm">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${tab === t.id ? 'bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white shadow-md' : 'text-slate-500 hover:text-[#1E3A8A] hover:bg-white/50'}`}>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <GlassHeader icon="flag" title="Mục tiêu du học" />
              <div className="relative z-10 flex flex-wrap gap-2 mt-2">
                {userData.goals.map(g => <span key={g} className={`${glass.tag} bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-[#1E3A8A] border border-blue-200/40`}>{goalLabels[g] || g}</span>)}
                {userData.goals.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn mục tiêu</p>}
              </div>
            </GlassCard>
            <GlassCard>
              <GlassHeader icon="interests" title="Sở thích STEM" />
              <div className="relative z-10 flex flex-wrap gap-2 mt-2">
                {userData.interests.map(i => <span key={i} className={`${glass.tag} bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-indigo-700 border border-indigo-200/40`}>{i}</span>)}
                {userData.interests.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn sở thích</p>}
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <BlobDecor className="w-36 h-36 -bottom-12 -right-12 bg-blue-200/20" />
            <GlassHeader icon="bar_chart" title="Hoạt động tuần này" />
            <div className="w-full h-[200px] relative z-10 mt-2">
              <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={1}>
                <AreaChart data={activityData}>
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
              <span className="text-sm font-semibold text-slate-500">Tổng: <strong className="text-[#1E3A8A]">28</strong> nhiệm vụ</span>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50/60 backdrop-blur-sm px-2.5 py-1 rounded-full">↑ 15%</span>
            </div>
          </GlassCard>

          <GlassCard>
            <GlassHeader icon="science" title="Dự án nổi bật" extra={<button onClick={() => setShowProjForm(!showProjForm)} className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{showProjForm ? 'close' : 'add'}</span>{showProjForm ? 'Đóng' : 'Dự án mới'}</button>} />
            <div className="space-y-4 relative z-10 mt-3">
              {showProjForm && (
                <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-200 shadow-xl shadow-blue-900/5 space-y-4 mb-6">
                  <h4 className="font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-blue-100 pb-2"><span className="material-symbols-outlined text-blue-500 text-lg">edit_document</span>Thêm dự án cá nhân</h4>
                  <Input label="Tên dự án" ph="Vd: Hệ thống lọc nước năng lượng mặt trời" val={newProj.title} set={v => setNewProj({...newProj, title: v})} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Lĩnh vực / Môn học" ph="Vd: Khoa học môi trường" val={newProj.category} set={v => setNewProj({...newProj, category: v})} />
                    <Input label="Thời gian thực hiện" ph="Vd: 09/2025 - Nay" val={newProj.date} set={v => setNewProj({...newProj, date: v})} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Tiến độ hoàn thành (%)" type="number" val={newProj.progress} set={v => setNewProj({...newProj, progress: parseInt(v)||0})} />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Trạng thái</label>
                      <select value={newProj.status} onChange={e => setNewProj({...newProj, status: e.target.value})} className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
                        <option>Đang phát triển</option>
                        <option>Hoàn thành</option>
                        <option>Tạm dừng</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Mô tả ngắn gọn</label>
                    <textarea placeholder="Nêu bật vai trò, kết quả hoặc hướng đi của dự án..." value={newProj.desc} onChange={e => setNewProj({...newProj, desc: e.target.value})} className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none h-20 shadow-inner focus:ring-2 focus:ring-blue-400/50" />
                  </div>
                  <button onClick={addProject} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-90 transition-all flex justify-center items-center gap-2"><span className="material-symbols-outlined text-base">save</span>Lưu dự án</button>
                </div>
              )}
              {data.projects.length === 0 && !showProjForm && <div className="p-8 text-center text-slate-400 border-2 border-dashed border-white/60 rounded-2xl bg-white/20">Chưa có dự án nào. Bấm 'Dự án mới' để thêm.</div>}
              {data.projects.map((p: any, i: number) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white top-0 relative group hover:shadow-lg transition-all pr-12">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-[#1E3A8A] text-base">{p.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{p.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{p.date}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${p.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Tạm dừng' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 bg-white/40 p-3 rounded-xl border border-white leading-relaxed">{p.desc}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#1E3A8A] min-w-[30px]">{p.progress}%</span>
                  </div>
                  <button onClick={() => delProj(i)} className="absolute top-4 right-4 p-2 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <GlassCard>
          <GlassHeader icon="timeline" title="Timeline hoạt động" extra={<button onClick={() => setShowTimeForm(!showTimeForm)} className="text-xs font-semibold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{showTimeForm ? 'close' : 'add'}</span>{showTimeForm ? 'Đóng' : 'Thêm sự kiện'}</button>} />
          <div className="relative z-10 mt-4">
            {showTimeForm && (
              <div className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-200 shadow-xl shadow-blue-900/5 space-y-4 mb-8 ml-4">
                <h4 className="font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-blue-100 pb-2"><span className="material-symbols-outlined text-blue-500 text-lg">add_task</span>Ghi nhận Cột mốc</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Tên cột mốc / Sự kiện" ph="Vd: Đạt giải Nhất HSG Thành phố" val={newTime.event} set={v => setNewTime({...newTime, event: v})} />
                  <Input label="Thời gian" ph="Vd: Tháng 10, 2025" val={newTime.date} set={v => setNewTime({...newTime, date: v})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#1E3A8A] ml-1">Icon đại diện</label>
                    <select value={newTime.icon} onChange={e => setNewTime({...newTime, icon: e.target.value})} className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
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
                    <select value={newTime.color} onChange={e => setNewTime({...newTime, color: e.target.value})} className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner">
                      <option value="from-blue-500 to-indigo-600">Xanh dương</option>
                      <option value="from-amber-400 to-orange-500">Vàng Cam</option>
                      <option value="from-emerald-400 to-green-600">Xanh lá</option>
                      <option value="from-rose-400 to-pink-500">Hồng viền</option>
                      <option value="from-violet-500 to-purple-600">Tím mộng mơ</option>
                    </select>
                  </div>
                </div>
                <button onClick={addTime} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 flex justify-center items-center gap-2"><span className="material-symbols-outlined text-base">save</span>Lưu cột mốc</button>
              </div>
            )}
            
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-transparent" />
            <div className="space-y-6 pl-12 pb-4">
              {data.timeline.length === 0 && !showTimeForm && <div className="text-sm text-slate-400 p-4">Chưa có hoạt động nào.</div>}
              {data.timeline.map((t: any, i: number) => (
                <div key={i} className="relative group">
                  <div className={`absolute -left-12 top-0 w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md z-10 border border-white/40 ring-4 ring-white/50`}><span className="material-symbols-outlined text-white text-base">{t.icon}</span></div>
                  <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white relative shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">{t.date}</p>
                    <p className="font-bold text-[#1E3A8A] text-base pr-8">{t.event}</p>
                    <button onClick={() => delTime(i)} className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm"><span className="material-symbols-outlined text-sm">close</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Certificates */}
      {tab === 'certs' && (
        <div className="space-y-4">
          {showCertForm ? (
            <GlassCard className="!p-6 !bg-white/80">
              <h4 className="font-bold text-[#1E3A8A] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">card_membership</span>Nhập Chứng chỉ Mới</h4>
              <div className="space-y-4">
                <Input label="Tên chứng chỉ" ph="Vd: IELTS, SAT, Huy chương Vàng..." val={newCert.title} set={v => setNewCert({...newCert, title: v})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Điểm số / Thành tích" ph="Vd: 8.0, 1500, Giải Nhất" val={newCert.score} set={v => setNewCert({...newCert, score: v})} />
                  <Input label="Ngày thi / Ngày cấp" ph="Vd: Tháng 10, 2025" val={newCert.date} set={v => setNewCert({...newCert, date: v})} />
                </div>
                <Input label="Tổ chức cấp" ph="Vd: British Council, College Board" val={newCert.org} set={v => setNewCert({...newCert, org: v})} />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCertForm(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50">Hủy bỏ</button>
                  <button onClick={addCert} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90">Lưu chứng chỉ</button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard onClick={() => setShowCertForm(true)} className="!p-5 text-center cursor-pointer hover:bg-blue-50/50 transition-colors border-dashed border-2 border-blue-200/60 shadow-none">
              <div className="flex flex-col items-center relative z-10 opacity-70">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2"><span className="material-symbols-outlined text-blue-600">add</span></div>
                <p className="font-bold text-[#1E3A8A]">Khai báo chứng chỉ mới</p>
                <p className="text-xs text-slate-400 mt-1">GPA, Chứng chỉ Tiếng Anh, AP, Giải thưởng học thuật</p>
              </div>
            </GlassCard>
          )}

          {data.certs.length === 0 && !showCertForm && <div className="text-center p-6 text-slate-400">Chưa có dữ liệu.</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.certs.map((c: any, i: number) => (
              <GlassCard key={i} className="group relative pr-12 hover:shadow-lg transition-all border border-white">
                <div className="flex items-center gap-4 relative z-10 w-full mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center border border-amber-200 flex-shrink-0">
                    <span className="material-symbols-outlined text-amber-600 text-[26px]">verified</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#1E3A8A] text-sm sm:text-base truncate" title={c.title}>{c.title}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">{c.org}</p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2 border-l border-slate-100">
                    <p className="text-lg sm:text-xl font-extrabold text-[#1E3A8A] tracking-tight">{c.score}</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-blue-500">{c.date}</p>
                  </div>
                </div>
                <button onClick={() => delCert(i)} className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Skills Matrix */}
      {tab === 'skills' && (
        <GlassCard>
          <GlassHeader icon="psychology" title="Bảng Giá Trị Kỹ Năng" />
          <p className="text-xs text-slate-500 mb-4 relative z-10 -mt-2">Tự đánh giá năng lực để AI lên lộ trình chính xác</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mt-2">
            {allSkills.map((skill: string, i: number) => {
              // Extract default pseudo-random value if not stored explicitly
              let defaultLevel = 0;
              for(let charIdx=0; charIdx<skill.length; charIdx++) defaultLevel += skill.charCodeAt(charIdx);
              defaultLevel = (defaultLevel % 50) + 40; 
              
              const level = data.skillsMap[skill] !== undefined ? data.skillsMap[skill] : defaultLevel;
              const labels = ['Sơ cấp', 'Căn bản', 'Khá giỏi', 'Cứng cáp', 'Chuyên gia'];
              const labelIdx = Math.min(Math.floor(level / 20), 4);
              const colors = ['from-sky-400', 'from-blue-500', 'from-indigo-500', 'from-violet-500', 'from-fuchsia-500'];
              
              const isEditing = editingSkill === skill;

              return (
                <div key={i} className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white relative group shadow-sm transition-all hover:shadow-md h-[90px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#1E3A8A] text-sm">{skill}</span>
                    {isEditing ? (
                      <button onClick={() => saveSkill(skill)} className="text-[11px] font-extrabold text-white bg-emerald-500 px-3 py-1 rounded-full shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 transition-colors">LƯU LẠI</button>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wide">{labels[labelIdx]}</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-3 w-full animate-in fade-in slide-in-from-top-1">
                      <input type="range" min="0" max="100" value={skillLevel} onChange={e => setSkillLevel(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 min-w-[36px] text-center">{skillLevel}</span>
                    </div>
                  ) : (
                    <div className="group-hover:opacity-90 transition-opacity">
                      <div className="w-full h-2 bg-white/80 border border-slate-100 rounded-full overflow-hidden cursor-pointer shadow-inner" onClick={() => { setEditingSkill(skill); setSkillLevel(level); }}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${colors[labelIdx]} to-blue-400 transition-all duration-300 ease-out`} style={{ width: `${level}%` }} />
                      </div>
                      <div className="flex justify-between mt-1.5 px-0.5">
                        <span className="text-[10px] font-medium text-slate-400">0</span>
                        <span className="text-[10px] font-bold text-slate-500">{level}/100</span>
                      </div>
                      <button onClick={() => { setEditingSkill(skill); setSkillLevel(level); }} className="absolute -top-2 -right-2 p-1.5 bg-white shadow-md border border-slate-100 rounded-xl text-blue-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50"><span className="material-symbols-outlined text-sm">edit</span></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </>
  );
}