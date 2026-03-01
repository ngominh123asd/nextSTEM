import React, { useEffect, useState } from 'react';
import { StatCard, GlassCard, GlassHeader, PageTitle, BlobDecor, Badge } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { apiAdminStats, type DashboardStats } from '../../../lib/api';

/* Mock trend data for the line chart placeholder */
const weekData = ['Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'CN'];

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiAdminStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  const s = stats;
  const roleEntries = s ? Object.entries(s.users_by_role) as [string, number][] : [];
  const totalByRole = roleEntries.reduce((a, [, v]) => a + v, 0) || 1;

  return (
    <div>
      <PageTitle title="Dashboard" subtitle="Tổng quan hệ thống nextSTEM" icon="dashboard" />

      {/* Key metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="group" label="Tổng người dùng" value={s?.total_users ?? 0} trend="+12% tuần này" color="blue" />
        <StatCard icon="person" label="Đang hoạt động" value={s?.active_users ?? 0} color="green" />
        <StatCard icon="person_off" label="Không hoạt động" value={s?.inactive_users ?? 0} color="orange" />
        <StatCard icon="person_add" label="Mới hôm nay" value={s?.new_users_today ?? 0} trend={`+${s?.new_users_week ?? 0} tuần`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Role distribution (pie placeholder) */}
        <GlassCard>
          <GlassHeader icon="pie_chart" title="Phân bố vai trò" />
          <div className="space-y-3">
            {roleEntries.map(([role, count]) => (
              <div key={role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700 capitalize">{role}</span>
                  <span className="text-slate-500">{count} ({Math.round(count / totalByRole * 100)}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${(count / totalByRole * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Registration trend (line chart placeholder) */}
        <GlassCard>
          <GlassHeader icon="trending_up" title="Xu hướng đăng ký" />
          <div className="flex items-end gap-3 h-40">
            {weekData.map((d, i) => {
              const h = 20 + Math.random() * 80;
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-blue-500 to-indigo-400 transition-all" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-slate-400 font-semibold">{d}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Activity Feed */}
      <GlassCard>
        <GlassHeader icon="timeline" title="Hoạt động gần đây" extra={
          <GlassSurface width="auto" height={32} borderRadius={10} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
            <span className="px-3 text-xs font-semibold text-white">Xem tất cả</span>
          </GlassSurface>
        } />
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {[
            { icon: 'person_add', text: 'Người dùng mới đăng ký', time: '2 phút trước', color: 'text-blue-600' },
            { icon: 'token', text: 'AI Token: 1,200 tokens đã dùng', time: '5 phút trước', color: 'text-purple-600' },
            { icon: 'login', text: 'Admin đăng nhập thành công', time: '10 phút trước', color: 'text-green-600' },
            { icon: 'warning', text: 'Cảnh báo: Token gần đạt giới hạn', time: '30 phút trước', color: 'text-amber-600' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60">
              <span className={`material-symbols-outlined ${a.color}`}>{a.icon}</span>
              <span className="flex-1 text-sm text-slate-700 font-medium">{a.text}</span>
              <span className="text-xs text-slate-400">{a.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
