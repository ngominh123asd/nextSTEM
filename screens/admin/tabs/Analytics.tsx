import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';

const periods = ['7 ngày', '30 ngày', '90 ngày', '1 năm'] as const;

export default function Analytics() {
  const [period, setPeriod] = useState<string>('30 ngày');

  const growthData = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const topUsers = [
    { name: 'Nguyễn Văn A', sessions: 124, tokens: 15200 },
    { name: 'Trần Thị B', sessions: 98, tokens: 12100 },
    { name: 'Lê Văn C', sessions: 87, tokens: 9800 },
    { name: 'Phạm D', sessions: 72, tokens: 8400 },
    { name: 'Hoàng E', sessions: 65, tokens: 7200 },
  ];

  return (
    <div>
      <PageTitle title="Phân tích & Báo cáo" subtitle="Dữ liệu chi tiết về hệ thống" icon="bar_chart" />

      {/* Period selector */}
      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="trending_up" label="Tăng trưởng user" value="+23%" trend="So với kỳ trước" color="green" />
        <StatCard icon="person" label="Active rate" value="78%" color="blue" />
        <StatCard icon="schedule" label="Thời gian TB" value="12 phút" color="purple" />
        <StatCard icon="star" label="Hài lòng" value="4.5/5" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User growth chart */}
        <GlassCard>
          <GlassHeader icon="show_chart" title="Tăng trưởng người dùng" />
          <div className="flex items-end gap-3 h-48">
            {growthData.map((d, i) => {
              const h1 = 30 + Math.random() * 60;
              const h2 = 20 + Math.random() * 40;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5">
                    <div className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400" style={{ height: `${h1 * 1.5}px` }} />
                    <div className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400" style={{ height: `${h2 * 1.5}px` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{d}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Mới đăng ký</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> Active</span>
          </div>
        </GlassCard>

        {/* Active/Inactive pie placeholder */}
        <GlassCard>
          <GlassHeader icon="donut_large" title="Tỷ lệ Active/Inactive" />
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#activeGrad)" strokeWidth="3" strokeDasharray="78 22" strokeLinecap="round" />
                <defs><linearGradient id="activeGrad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-[#1E3A8A]">78%</span>
                <span className="text-[10px] text-slate-400">Active</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500" /><span className="text-sm text-slate-600">Active: 78%</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-300" /><span className="text-sm text-slate-600">Inactive: 22%</span></div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Top users + Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <GlassHeader icon="leaderboard" title="Thành viên tích cực nhất" />
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.name} className="flex items-center gap-3 p-2 rounded-xl bg-white/40">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-300'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.sessions} phiên · {u.tokens.toLocaleString()} tokens</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <GlassHeader icon="download" title="Xuất báo cáo" />
          <p className="text-sm text-slate-500 mb-4">Xuất dữ liệu phân tích dưới nhiều định dạng</p>
          <div className="space-y-2">
            {[
              { label: 'PDF (biểu đồ)', icon: 'picture_as_pdf', grad: 'from-red-500 to-rose-500' },
              { label: 'Excel (dữ liệu thô)', icon: 'table_chart', grad: 'from-emerald-500 to-green-500' },
              { label: 'PowerPoint', icon: 'slideshow', grad: 'from-orange-500 to-amber-500' },
            ].map(f => (
              <GlassSurface key={f.label} width="100%" height={42} borderRadius={14} style={{ background: `linear-gradient(135deg, ${f.grad.replace('from-', '').replace(' to-', ', ').replace(/\w+-\d+/g, m => { const c: Record<string, string> = { 'red-500': '#ef4444', 'rose-500': '#f43f5e', 'emerald-500': '#10b981', 'green-500': '#22c55e', 'orange-500': '#f97316', 'amber-500': '#f59e0b' }; return c[m] || m; })})` }} onClick={() => {}}>
                <div className="flex items-center gap-2 px-4 text-sm font-semibold text-white w-full">
                  <span className="material-symbols-outlined text-lg">{f.icon}</span>
                  {f.label}
                </div>
              </GlassSurface>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-white/40 border border-white/60">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Báo cáo tự động</p>
            <p className="text-sm text-slate-600">Lên lịch gửi email mỗi tuần / tháng</p>
            <GlassSurface width="100%" height={36} borderRadius={10} className="mt-2" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={() => {}}>
              <span className="px-4 text-xs font-semibold text-white">Cấu hình lịch gửi</span>
            </GlassSurface>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
