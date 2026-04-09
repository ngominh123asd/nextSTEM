import React, { useState, useEffect } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import MarqueeText from '../../../components/MarqueeText';
import { UserData, TabId, goalLabels } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle, ToolCard } from '../components/SharedUI';
import STEMCompetencyPanel from '../components/STEMCompetencyPanel';
import { apiGetDTSProfile, type DTSProfile } from '../../../lib/api';

export default function DashboardTab({ userData, onNav }: { userData: UserData; onNav: (t: TabId) => void }) {
  const [dtsProfile, setDtsProfile] = useState<DTSProfile | null>(null);
  const [dtsLoading, setDtsLoading] = useState(true);

  useEffect(() => {
    apiGetDTSProfile()
      .then(setDtsProfile)
      .catch(() => {})
      .finally(() => setDtsLoading(false));
  }, []);

  const recentActivities = dtsProfile?.recent_activities?.length
    ? dtsProfile.recent_activities.slice(0, 4).map(a => {
        const iconMap: Record<string, string> = {
          project_created: 'science', project_updated: 'edit', cert_added: 'verified',
          skill_assessed: 'psychology', batch_skill_assessed: 'psychology',
          snapshot_created: 'photo_camera', quiz_completed: 'quiz',
        };
        const colorMap: Record<string, string> = {
          project_created: 'from-blue-500 to-blue-600', cert_added: 'from-amber-500 to-orange-500',
          skill_assessed: 'from-violet-500 to-purple-500', batch_skill_assessed: 'from-violet-500 to-purple-500',
          snapshot_created: 'from-emerald-500 to-teal-500',
        };
        const actionLabels: Record<string, string> = {
          project_created: 'Tạo dự án mới', project_updated: 'Cập nhật dự án',
          cert_added: 'Thêm chứng chỉ', skill_assessed: 'Đánh giá năng lực',
          batch_skill_assessed: 'Đánh giá năng lực hàng loạt',
          snapshot_created: 'Tạo ảnh chụp DTS', quiz_completed: 'Hoàn thành bài test',
        };
        const timeDiff = Date.now() - new Date(a.created_at).getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const timeStr = hours < 1 ? 'Vừa xong' : hours < 24 ? `${hours} giờ trước` : `${Math.floor(hours / 24)} ngày trước`;

        return {
          icon: iconMap[a.action] || 'history',
          text: actionLabels[a.action] || a.action,
          time: timeStr,
          color: colorMap[a.action] || 'from-blue-500 to-blue-600',
        };
      })
    : [
        { icon: 'school', text: 'Hoàn thành bài test định hướng', time: '2 giờ trước', color: 'from-blue-500 to-blue-600' },
        { icon: 'science', text: 'Cập nhật dự án: AI Chatbot', time: '5 giờ trước', color: 'from-indigo-500 to-indigo-600' },
        { icon: 'emoji_events', text: 'Thêm giải thưởng Olympic', time: 'Hôm qua', color: 'from-amber-500 to-orange-500' },
        { icon: 'edit_note', text: 'Bắt đầu viết Personal Statement', time: '2 ngày trước', color: 'from-violet-500 to-purple-500' },
      ];

  return (
    <>
      <PageTitle title={`Xin chào, ${userData.name?.split(' ').pop() || 'bạn'}!`} subtitle="Tổng quan năng lực STEM và hành trình học tập" />

      {/* ── DTS Profile Overview ── */}
      {!dtsLoading && dtsProfile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <GlassCard className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1E3A8A]">{Math.round(dtsProfile.profile_completeness)}%</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Hồ sơ DTS</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${dtsProfile.profile_completeness}%` }} />
            </div>
          </GlassCard>
          <GlassCard className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1E3A8A]">{dtsProfile.overall_score || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Điểm năng lực</p>
            <p className="text-[10px] font-bold text-blue-500 mt-1.5">
              {dtsProfile.assessed_indicators}/{dtsProfile.total_indicators} chỉ số
            </p>
          </GlassCard>
          <GlassCard className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1E3A8A]">{dtsProfile.project_count}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dự án STEM</p>
          </GlassCard>
          <GlassCard className="!p-4 text-center">
            <p className="text-2xl font-extrabold text-[#1E3A8A]">{dtsProfile.certificate_count}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Chứng chỉ</p>
          </GlassCard>
        </div>
      )}

      {/* ── Quick Tool Suggestions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ToolCard icon="psychology" iconGrad="from-violet-500 to-purple-500" title="Đánh giá năng lực" desc="Tự đánh giá 15 chỉ số STEM" onClick={() => onNav('portfolio')} />
        <ToolCard icon="workspace_premium" iconGrad="from-amber-500 to-orange-500" title="Học bổng" desc="Khám phá các cơ hội học bổng" onClick={() => onNav('tools')} />
        <ToolCard icon="edit_note" iconGrad="from-blue-500 to-blue-600" title="Viết luận" desc="AI hỗ trợ viết bài luận" onClick={() => onNav('editor')} />
        <ToolCard icon="account_box" iconGrad="from-emerald-500 to-teal-500" title="Hồ sơ DTS" desc="Cập nhật bản sao số" onClick={() => onNav('portfolio')} />
      </div>

      {/* ── Mentor hướng dẫn (full-width) ── */}
      <GlassCard className="mb-6">
        <BlobDecor className="w-40 h-40 -top-12 -right-12 bg-violet-200/20" />
        <GlassHeader icon="supervisor_account" title="Mentor hướng dẫn" />
        <div className="relative z-10">
          {/* Top: Mentor info + action */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                alt="Mentor"
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl object-cover shadow-md border-2 border-white flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <MarqueeText>
                  <h4 className="font-bold text-[#1E3A8A] text-sm sm:text-base">Dr. Trần Minh Đức</h4>
                </MarqueeText>
                <MarqueeText>
                  <p className="text-[10px] sm:text-xs text-slate-500">PhD Computer Science — Stanford University</p>
                </MarqueeText>
                <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-emerald-600 font-medium whitespace-nowrap">Đang hoạt động</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <GlassSurface
                width="auto"
                height={36}
                borderRadius={10}
                className="cursor-pointer hover:opacity-90 transition-opacity sm:!h-[42px] sm:!border-radius-[12px]"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              >
                <span className="text-white font-semibold px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm h-full">
                  <span className="material-symbols-outlined text-base sm:text-lg">chat</span>
                  Nhắn tin
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
                <MarqueeText>
                  <p className="text-xs text-slate-500 whitespace-nowrap sm:whitespace-normal sm:line-clamp-2">"Em hoàn thiện phần portfolio nhé, anh sẽ review…"</p>
                </MarqueeText>
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
                <MarqueeText>
                  <p className="text-xs text-slate-500 whitespace-nowrap sm:whitespace-normal sm:line-clamp-2">Viết draft Personal Statement — HSD: 22/02</p>
                </MarqueeText>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Hoạt động & Năng lực STEM ── */}
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
                  <MarqueeText>
                    <p className="text-sm font-semibold text-[#1E3A8A]">{a.text}</p>
                  </MarqueeText>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* STEM Competency Radar — real data! */}
        <STEMCompetencyPanel compact />
      </div>
    </>
  );
}