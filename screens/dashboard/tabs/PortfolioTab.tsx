import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';
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

export default function PortfolioTab({ userData }: { userData: UserData }) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'certs' | 'skills'>('overview');
  const tabs = [
    { id: 'overview' as const, icon: 'person', label: 'Tổng quan' },
    { id: 'timeline' as const, icon: 'timeline', label: 'Timeline' },
    { id: 'certs' as const,    icon: 'verified', label: 'Chứng chỉ' },
    { id: 'skills' as const,   icon: 'psychology', label: 'Kỹ năng' },
  ];

  return (
    <>
      <PageTitle icon="account_box" title="Hồ Sơ Năng Lực" subtitle="Xây dựng thương hiệu cá nhân & lưu trữ thành tích" />

      {/* Profile Header */}
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
            <GlassSurface
              width="auto"
              height={40}
              borderRadius={12}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
            >
              <span className="text-white text-sm font-semibold px-4 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">share</span>Chia sẻ
              </span>
            </GlassSurface>
            <button className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/60 text-[#1E3A8A] text-sm font-semibold rounded-xl flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">download</span>PDF
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 w-fit">
        {tabs.map(t => (
          tab === t.id ? (
            <GlassSurface
              key={t.id}
              width="auto"
              height={38}
              borderRadius={12}
              className="cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={() => setTab(t.id)}
            >
              <span className="text-white text-sm font-semibold px-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
              </span>
            </GlassSurface>
          ) : (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:text-[#1E3A8A] hover:bg-white/50">
              <span className="material-symbols-outlined text-lg">{t.icon}</span>{t.label}
            </button>
          )
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Goals & Interests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <GlassHeader icon="flag" title="Mục tiêu du học" />
              <div className="relative z-10">
                <div className="flex flex-wrap gap-2">
                  {userData.goals.map(g => (
                    <span key={g} className={`${glass.tag} bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-[#1E3A8A] border border-blue-200/40`}>{goalLabels[g] || g}</span>
                  ))}
                  {userData.goals.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn mục tiêu</p>}
                </div>
              </div>
            </GlassCard>
            <GlassCard>
              <GlassHeader icon="interests" title="Sở thích STEM" />
              <div className="relative z-10">
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map(i => (
                    <span key={i} className={`${glass.tag} bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-indigo-700 border border-indigo-200/40`}>{i}</span>
                  ))}
                  {userData.interests.length === 0 && <p className="text-sm text-slate-400 italic">Chưa chọn sở thích</p>}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Weekly Activity Chart */}
          <GlassCard>
            <BlobDecor className="w-36 h-36 -bottom-12 -right-12 bg-blue-200/20" />
            <GlassHeader icon="bar_chart" title="Hoạt động tuần này" />
            <div className="w-full h-[200px] relative z-10 mt-2">
              <ResponsiveContainer width="100%" height="100%">
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

          {/* Featured Projects */}
          <GlassCard>
            <GlassHeader icon="science" title="Dự án nổi bật" extra={<button className="text-xs font-semibold text-blue-600 hover:underline">+ Thêm dự án</button>} />
            <div className="space-y-4 relative z-10">
              {sampleProjects.map((p, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-[#1E3A8A]">{p.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{p.category}</span><span className="w-1 h-1 rounded-full bg-slate-300" /><span>{p.date}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'Hoàn thành' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50' : 'bg-amber-500/10 text-amber-600 border border-amber-200/50'}`}>{p.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{p.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#1E3A8A]">{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <GlassCard>
          <GlassHeader icon="timeline" title="Timeline hoạt động" />
          <div className="relative z-10">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 to-violet-200" />
            <div className="space-y-6 pl-12">
              {sampleTimeline.map((t, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-12 top-0 w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-md z-10`}>
                    <span className="material-symbols-outlined text-white text-base">{t.icon}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                    <p className="text-xs font-semibold text-blue-600 mb-1">{t.date}</p>
                    <p className="font-bold text-[#1E3A8A]">{t.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Certificates */}
      {tab === 'certs' && (
        <div className="space-y-3">
          {sampleCerts.map((c, i) => (
            <GlassCard key={i}>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center border border-amber-100/50 flex-shrink-0">
                  <span className="material-symbols-outlined text-amber-500 text-xl">verified</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#1E3A8A]">{c.title}</h4>
                  <p className="text-sm text-slate-500">{c.org} · {c.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-[#1E3A8A]">{c.score}</p>
                </div>
              </div>
            </GlassCard>
          ))}
          <GlassCard className="!p-10 text-center">
            <div className="flex flex-col items-center relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 flex items-center justify-center border border-white/60 mb-3">
                <span className="material-symbols-outlined text-2xl text-blue-400">add</span>
              </div>
              <p className="font-bold text-[#1E3A8A] mb-1">Thêm chứng chỉ mới</p>
              <p className="text-sm text-slate-400">Cập nhật chứng chỉ để hoàn thiện hồ sơ</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Skills Matrix */}
      {tab === 'skills' && (
        <GlassCard>
          <GlassHeader icon="psychology" title="Ma trận Kỹ năng" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {(userData.interests.length > 0 ? userData.interests : ['Chưa có kỹ năng']).map((skill, i) => {
              const level = userData.interests.length > 0 ? Math.floor(Math.random() * 40) + 40 : 0;
              const labels = ['Cơ bản', 'Trung bình', 'Khá', 'Tốt', 'Xuất sắc'];
              const labelIdx = Math.min(Math.floor(level / 20), 4);
              const colors = ['from-blue-400', 'from-blue-500', 'from-indigo-500', 'from-violet-500', 'from-purple-500'];
              return (
                <div key={i} className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-semibold text-[#1E3A8A] text-sm">{skill}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-full">{labels[labelIdx]}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors[labelIdx]} to-indigo-400`} style={{ width: `${level}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">Tự đánh giá</span>
                    <span className="text-[10px] font-bold text-slate-500">{level}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </>
  );
}
