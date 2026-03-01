import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, TabId, goalLabels } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle, ToolCard } from '../components/SharedUI';

const activityData = [
  { day: 'T2', tasks: 3 }, { day: 'T3', tasks: 5 }, { day: 'T4', tasks: 2 },
  { day: 'T5', tasks: 7 }, { day: 'T6', tasks: 4 }, { day: 'T7', tasks: 6 }, { day: 'CN', tasks: 1 },
];

export default function DashboardTab({ userData, onNav }: { userData: UserData; onNav: (t: TabId) => void }) {
  const radarData = React.useMemo(() => {
    const skills = ['Lập trình', 'Khoa học', 'Giải quyết vấn đề', 'Toán học', 'Làm việc nhóm', 'Nghiên cứu'];
    return skills.map(s => ({ subject: s, value: userData.interests.length > 0 ? Math.floor(Math.random() * 40) + 30 : 20, fullMark: 100 }));
  }, [userData.interests]);

  const recentActivities = [
    { icon: 'school', text: 'Hoàn thành bài test định hướng nghề nghiệp', time: '2 giờ trước', color: 'from-blue-500 to-blue-600' },
    { icon: 'science', text: 'Cập nhật dự án: AI Chatbot Tư Vấn', time: '5 giờ trước', color: 'from-indigo-500 to-indigo-600' },
    { icon: 'emoji_events', text: 'Thêm giải thưởng Olympic Tin học', time: 'Hôm qua', color: 'from-amber-500 to-orange-500' },
    { icon: 'edit_note', text: 'Bắt đầu viết Personal Statement', time: '2 ngày trước', color: 'from-violet-500 to-purple-500' },
  ];

  const searchSuggestions = ['MIT', 'Stanford', 'NUS', 'Cambridge', 'ETH Zurich'];

  return (
    <>
      <PageTitle title={`Xin chào, ${userData.name?.split(' ').pop() || 'bạn'}!`} subtitle="Tổng quan hành trình du học của bạn" />

      {/* ── University Search ── */}
      <GlassCard className="mb-8">
        <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-blue-200/30" />
        <BlobDecor className="w-36 h-36 -bottom-12 -left-12 bg-indigo-200/20" />
        <div className="relative z-10">
          <GlassHeader icon="search" title="Tìm kiếm trường đại học" />
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input type="text" placeholder="Nhập tên trường, quốc gia, hoặc ngành học..."
                className="w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50 focus:bg-white/70 transition-all pl-11" />
            </div>
            <GlassSurface
              width="auto"
              height={48}
              borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
            >
              <span className="text-white font-semibold px-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>AI Tìm kiếm
              </span>
            </GlassSurface>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Gợi ý:</span>
            {searchSuggestions.map(s => (
              <button key={s} className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/80 text-slate-600 hover:bg-white/80 hover:text-blue-600 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ── Quick Tool Suggestions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ToolCard icon="school" iconGrad="from-blue-500 to-blue-600" title="Tìm trường" desc="Tìm trường đại học phù hợp" onClick={() => onNav('tools')} />
        <ToolCard icon="workspace_premium" iconGrad="from-amber-500 to-orange-500" title="Học bổng" desc="Khám phá các cơ hội học bổng" onClick={() => onNav('tools')} />
        <ToolCard icon="edit_note" iconGrad="from-violet-500 to-purple-500" title="Viết luận" desc="AI hỗ trợ viết bài luận" onClick={() => onNav('editor')} />
        <ToolCard icon="account_box" iconGrad="from-emerald-500 to-teal-500" title="Portfolio" desc="Cập nhật hồ sơ năng lực" onClick={() => onNav('portfolio')} />
      </div>

      {/* ── Mentor hướng dẫn (full-width) ── */}
      <GlassCard className="mb-6">
        <BlobDecor className="w-40 h-40 -top-12 -right-12 bg-violet-200/20" />
        <GlassHeader icon="supervisor_account" title="Mentor hướng dẫn" />
        <div className="relative z-10">
          {/* Top: Mentor info + action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                alt="Mentor"
                className="w-13 h-13 rounded-2xl object-cover shadow-md border-2 border-white flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[#1E3A8A] text-base">Dr. Trần Minh Đức</h4>
                <p className="text-xs text-slate-500">PhD Computer Science — Stanford University</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium">Đang hoạt động</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 border border-white/70 text-sm font-semibold text-slate-600 hover:bg-white/80 transition-all">
                <span className="material-symbols-outlined text-lg">chat</span>
                Nhắn tin
              </button>
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={12}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              >
                <span className="text-white font-semibold px-4 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-lg">video_call</span>Gọi Mentor
                </span>
              </GlassSurface>
            </div>
          </div>
          {/* Bottom: 3-col detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50/40 to-blue-50/20 border border-blue-100/50">
              <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-blue-600 text-lg">calendar_today</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#1E3A8A]">Buổi hẹn tiếp theo</p>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full flex-shrink-0">Sắp tới</span>
                </div>
                <p className="text-xs text-slate-500">Thứ 5, 20/02 — 19:00 (GMT+7)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-violet-50/40 to-violet-50/20 border border-violet-100/50">
              <div className="w-9 h-9 rounded-lg bg-violet-100/80 flex items-center justify-center flex-shrink-0 relative">
                <span className="material-symbols-outlined text-violet-600 text-lg">mail</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">1</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E3A8A] mb-0.5">Tin nhắn mới</p>
                <p className="text-xs text-slate-500 line-clamp-2">"Em hoàn thiện phần portfolio nhé, anh sẽ review…"</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-amber-50/40 to-amber-50/20 border border-amber-100/50">
              <div className="w-9 h-9 rounded-lg bg-amber-100/80 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-amber-600 text-lg">task</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#1E3A8A]">Bài tập từ Mentor</p>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-full flex-shrink-0">2 ngày</span>
                </div>
                <p className="text-xs text-slate-500">Viết draft Personal Statement — HSD: 22/02</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Hoạt động & Năng lực ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <GlassCard>
          <GlassHeader icon="history" title="Hoạt động gần đây" extra={<button className="text-xs font-semibold text-blue-600 hover:underline">Xem tất cả</button>} />
          <div className="space-y-3 relative z-10">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-base">{a.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E3A8A] truncate">{a.text}</p>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard>
          <BlobDecor className="w-48 h-48 -top-20 -right-20 bg-indigo-200/20" />
          <GlassHeader icon="trending_up" title="Năng lực hiện tại" />
          <div className="w-full h-[280px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#c7d2fe" strokeWidth={0.5} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="Năng lực" dataKey="value" stroke="#4f46e5" fill="url(#radarGrad)" strokeWidth={2} />
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
