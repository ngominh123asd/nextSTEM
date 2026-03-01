import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';

const mockQueue = [
  { id: '1', user: 'Lê Văn C', type: 'ai-flagged', severity: 'high', content: 'Nội dung có từ ngữ không phù hợp...', date: '2026-02-18', status: 'pending' },
  { id: '2', user: 'Phạm D', type: 'user-report', severity: 'medium', content: 'Spam tin nhắn lặp lại nhiều lần...', date: '2026-02-17', status: 'pending' },
  { id: '3', user: 'Nguyễn E', type: 'ai-flagged', severity: 'low', content: 'Có thể chứa thông tin sai lệch...', date: '2026-02-17', status: 'reviewed' },
];

const sevColors: Record<string, string> = { high: 'red', medium: 'yellow', low: 'blue' };
const typeLabels: Record<string, string> = { 'ai-flagged': 'AI phát hiện', 'user-report': 'Báo cáo' };

export default function ContentModeration() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const items = mockQueue.filter(q => !filter || q.status === filter);
  const item = items.find(q => q.id === selected);

  return (
    <div>
      <PageTitle title="Kiểm duyệt Nội dung" subtitle="Xem xét nội dung được đánh dấu" icon="shield" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="flag" label="Chờ duyệt" value={mockQueue.filter(q => q.status === 'pending').length} color="red" />
        <StatCard icon="check_circle" label="Đã xử lý" value={mockQueue.filter(q => q.status === 'reviewed').length} color="green" />
        <StatCard icon="psychology" label="AI accuracy" value="94%" color="purple" />
        <StatCard icon="trending_up" label="Hôm nay" value="3" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue */}
        <GlassCard className="lg:col-span-1 !p-4">
          <div className="flex gap-1 mb-3">
            {['', 'pending', 'reviewed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/60'}`}>
                {f === 'pending' ? 'Chờ duyệt' : f === 'reviewed' ? 'Đã xử lý' : 'Tất cả'}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {items.map(q => (
              <div key={q.id} onClick={() => setSelected(q.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selected === q.id ? 'bg-blue-50/80 border-blue-200' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">{q.user}</span>
                  <Badge text={q.severity} color={sevColors[q.severity]} />
                </div>
                <p className="text-xs text-slate-500 truncate">{q.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge text={typeLabels[q.type] || q.type} color="gray" />
                  <span className="text-[10px] text-slate-400">{q.date}</span>
                </div>
              </div>
            ))}
            {items.length === 0 && <EmptyState icon="verified" title="Sạch" desc="Không có nội dung cần duyệt" />}
          </div>
        </GlassCard>

        {/* Detail + actions */}
        <GlassCard className="lg:col-span-2">
          {item ? (
            <>
              <GlassHeader icon="report" title={`Chi tiết: ${item.user}`} />
              <div className="p-4 rounded-xl bg-white/40 border border-white/60 mb-4">
                <p className="text-sm text-slate-700">{item.content}</p>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge text={`Mức độ: ${item.severity}`} color={sevColors[item.severity]} />
                <Badge text={typeLabels[item.type] || item.type} color="gray" />
                <Badge text={item.status} color={item.status === 'pending' ? 'yellow' : 'green'} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Hành động</p>
              <div className="flex flex-wrap gap-2">
                <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                  <span className="px-4 text-xs font-semibold text-white">✓ Phê duyệt</span>
                </GlassSurface>
                <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }} onClick={() => {}}>
                  <span className="px-4 text-xs font-semibold text-white">✕ Từ chối</span>
                </GlassSurface>
                <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} onClick={() => {}}>
                  <span className="px-4 text-xs font-semibold text-white">⚠ Cảnh cáo user</span>
                </GlassSurface>
                <GlassSurface width="auto" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={() => {}}>
                  <span className="px-4 text-xs font-semibold text-white">🚫 Ban user</span>
                </GlassSurface>
              </div>

              {/* Moderation rules */}
              <div className="mt-6 pt-4 border-t border-white/50">
                <GlassHeader icon="rule" title="Quy tắc kiểm duyệt" />
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Ngưỡng AI confidence</span><span className="font-semibold">85%</span></div>
                  <div className="flex justify-between"><span>Keyword blacklist</span><span className="font-semibold">24 từ</span></div>
                  <div className="flex justify-between"><span>Tự động ẩn khi severity = high</span><Badge text="BẬT" color="green" /></div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon="shield" title="Chọn nội dung" desc="Nhấp vào mục bên trái để xem chi tiết" />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
