import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';

const periods = ['Ngày', 'Tuần', 'Tháng'] as const;
const dailyData = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const mockUsage = [
  { agent: 'Study Coach', tokens: 125_400, cost: 12.5, pct: 55 },
  { agent: 'Essay Reviewer', tokens: 67_200, cost: 8.1, pct: 30 },
  { agent: 'University Advisor', tokens: 34_100, cost: 3.4, pct: 15 },
];

export default function AITokenMonitor() {
  const [period, setPeriod] = useState<typeof periods[number]>('Tuần');

  return (
    <div>
      <PageTitle title="Giám sát Token AI" subtitle="Theo dõi lượng token tiêu tốn & chi phí" icon="data_usage" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="token" label="Token hôm nay" value="32,450" trend="+8%" color="blue" />
        <StatCard icon="analytics" label="Token tuần này" value="226,700" color="purple" />
        <StatCard icon="attach_money" label="Chi phí tháng" value="$24.00" color="green" />
        <StatCard icon="warning" label="Giới hạn còn" value="73,300" trend="27%" color="orange" />
      </div>

      {/* Period selector */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <GlassHeader icon="bar_chart" title="Biểu đồ Token" />
          <div className="flex gap-1 bg-white/40 rounded-xl p-1">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-white/60'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3 h-48">
          {dailyData.map((d, i) => {
            const h = 25 + Math.random() * 70;
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-semibold">{Math.round(h * 320)}t</span>
                <div className="w-full rounded-t-xl bg-gradient-to-t from-purple-500 to-blue-400 transition-all" style={{ height: `${h}%` }} />
                <span className="text-[10px] text-slate-400 font-semibold">{d}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By agent breakdown */}
        <GlassCard>
          <GlassHeader icon="smart_toy" title="Token theo Agent" />
          <div className="space-y-4">
            {mockUsage.map(u => (
              <div key={u.agent}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-700">{u.agent}</span>
                  <span className="text-slate-500">{u.tokens.toLocaleString()} ({u.pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${u.pct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Chi phí: ${u.cost}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Alerts & limits */}
        <GlassCard>
          <GlassHeader icon="notifications_active" title="Cảnh báo & Giới hạn" />
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
                <span className="text-sm font-semibold text-amber-800">Token gần đạt giới hạn</span>
              </div>
              <p className="text-xs text-amber-600">Đã dùng 73% giới hạn tháng (226,700/300,000)</p>
            </div>
            <div className="p-3 rounded-xl bg-white/40 border border-white/60">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Giới hạn token</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Giới hạn tháng</span>
                  <span className="font-semibold text-slate-800">300,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Giới hạn/user/ngày</span>
                  <span className="font-semibold text-slate-800">5,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cảnh báo tại</span>
                  <span className="font-semibold text-amber-600">70%</span>
                </div>
              </div>
            </div>
            <GlassSurface width="100%" height={38} borderRadius={12} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
              <span className="px-4 text-sm font-semibold text-white">Cấu hình giới hạn</span>
            </GlassSurface>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
