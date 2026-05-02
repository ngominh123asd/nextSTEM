import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassSurface from '../../../components/GlassSurface';
import MarqueeText from '../../../components/MarqueeText';
import { UserData, TabId, goalLabels } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';
import STEMCompetencyPanel from '../components/STEMCompetencyPanel';
import { apiGetDTSProfile, type DTSProfile } from '../../../lib/api';

export default function DashboardTab({ userData, onNav }: { userData: UserData; onNav: (t: TabId, subTab?: string) => void }) {
  const [dtsProfile, setDtsProfile] = useState<DTSProfile | null>(null);
  const [dtsLoading, setDtsLoading] = useState(true);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    apiGetDTSProfile()
      .then(setDtsProfile)
      .catch(() => {})
      .finally(() => setDtsLoading(false));
  }, []);

  const mapActivity = (a: any) => {
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
  };

  const defaultActivities = [
    { icon: 'school', text: 'Hoàn thành bài test định hướng', time: '2 giờ trước', color: 'from-blue-500 to-blue-600' },
    { icon: 'science', text: 'Cập nhật dự án: AI Chatbot', time: '5 giờ trước', color: 'from-indigo-500 to-indigo-600' },
    { icon: 'emoji_events', text: 'Thêm giải thưởng Olympic', time: 'Hôm qua', color: 'from-amber-500 to-orange-500' },
    { icon: 'edit_note', text: 'Bắt đầu viết Personal Statement', time: '2 ngày trước', color: 'from-violet-500 to-purple-500' },
  ];

  const allActivities = dtsProfile?.recent_activities?.length
    ? dtsProfile.recent_activities.map(mapActivity)
    : defaultActivities;

  const recentActivities = showAllActivities ? allActivities : allActivities.slice(0, 4);
  const hasMoreActivities = allActivities.length > 4;

  return (
    <>
      <PageTitle title={`Xin chào, ${userData.name?.split(' ').pop() || 'bạn'}!`} subtitle="Tổng quan năng lực STEM và hành trình học tập" />

      {/* ── Năng lực STEM — đầu trang ── */}
      <div className="mb-6">
        <STEMCompetencyPanel onShowScoreInfo={() => setShowScoreInfo(true)} />
      </div>

      {/* ── Score Info Modal overlay (Using Portal to cover entire screen including Sidebar) ── */}
      {showScoreInfo && createPortal(
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[4px] z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowScoreInfo(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] px-6 py-5 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/20" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/15" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Cách tính Điểm năng lực</h3>
                    <p className="text-[11px] text-blue-100">Khung STEM — Chương trình GDPT 2018</p>
                  </div>
                </div>
                <button onClick={() => setShowScoreInfo(false)} className="p-1.5 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* How it works — 3 steps */}
              <div className="flex items-start gap-4 mb-5">
                {[
                  { num: '1', text: 'Chọn thành tố năng lực', icon: 'category' },
                  { num: '2', text: 'Đánh giá 1–5 mức', icon: 'tune' },
                  { num: '3', text: 'AI phân tích kết quả', icon: 'insights' },
                ].map((step, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm">{step.icon}</span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 leading-tight">{step.text}</p>
                  </div>
                ))}
              </div>

              {/* Level scale */}
              <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Thang đánh giá</p>
                <div className="flex gap-0.5 h-5 rounded-lg overflow-hidden">
                  {[
                    { label: 'Mức 1', bg: '#dbeafe', fg: '#2563eb', w: '20%' },
                    { label: 'Mức 2', bg: '#bfdbfe', fg: '#1d4ed8', w: '20%' },
                    { label: 'Mức 3', bg: '#93c5fd', fg: '#1e40af', w: '20%' },
                    { label: 'Mức 4', bg: '#60a5fa', fg: '#ffffff', w: '20%' },
                    { label: 'Mức 5', bg: '#3b82f6', fg: '#ffffff', w: '20%' },
                  ].map((lv, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center text-[9px] font-bold"
                      style={{ background: lv.bg, color: lv.fg }}>
                      {lv.label}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 px-0.5">
                  <span className="text-[9px] text-slate-400">20 điểm</span>
                  <span className="text-[9px] text-slate-400">100 điểm</span>
                </div>
              </div>

              {/* 5 Components */}
              <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">5 Thành tố × 15 Chỉ số</p>
              <div className="space-y-1.5">
                {[
                  { code: 'TT', name: 'Thu thập thông tin', icon: 'search', desc: 'Xác định vấn đề · Định vị · Thu thập' },
                  { code: 'XL', name: 'Xử lý & Phân tích', icon: 'analytics', desc: 'Phân loại · So sánh · Đánh giá dữ liệu' },
                  { code: 'GQ', name: 'Giải quyết vấn đề', icon: 'lightbulb', desc: 'Đề xuất · Lập kế hoạch · Thực hiện' },
                  { code: 'GT', name: 'Giao tiếp khoa học', icon: 'forum', desc: 'Trình bày · Lập luận · Phản biện' },
                  { code: 'VD', name: 'Vận dụng thực tiễn', icon: 'build', desc: 'Kết nối · Sáng tạo · Ứng dụng' },
                ].map((t, i) => (
                  <div key={t.code} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1152d4] to-[#2E6AE6] flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ opacity: 0.7 + (i * 0.075) }}>
                      <span className="material-symbols-outlined text-white text-sm">{t.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1E3A8A]">{t.name}</p>
                      <p className="text-[10px] text-slate-400 leading-snug">{t.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">×3</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <span className="material-symbols-outlined text-blue-400 text-sm">calculate</span>
                <p className="text-[10px] text-slate-400 flex-1">
                  Điểm tổng = trung bình 15 chỉ số · Tối đa <strong className="text-slate-600">100</strong> điểm
                </p>
              </div>

              <button
                onClick={() => { setShowScoreInfo(false); onNav('portfolio'); }}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                Bắt đầu đánh giá ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* ── Mentor hướng dẫn ── */}
      <GlassCard className="mb-6">
        <BlobDecor className="w-40 h-40 -top-12 -right-12 bg-violet-200/20" />
        <GlassHeader icon="supervisor_account" title="Mentor hướng dẫn" />
        <div className="relative z-10">
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

      {/* ── Hoạt động gần đây ── */}
      <GlassCard>
        <GlassHeader icon="history" title="Hoạt động gần đây" extra={
          hasMoreActivities ? (
            <button onClick={() => setShowAllActivities(!showAllActivities)} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              {showAllActivities ? (
                <><span className="material-symbols-outlined text-sm">expand_less</span>Thu gọn</>
              ) : (
                <><span className="material-symbols-outlined text-sm">expand_more</span>Xem tất cả ({allActivities.length})</>
              )}
            </button>
          ) : null
        } />
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
    </>
  );
}