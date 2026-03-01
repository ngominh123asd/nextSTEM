import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

type SupportTab = 'tickets' | 'faq';

const mockTickets = [
  { id: 'T-001', user: 'Nguyễn Văn A', subject: 'Không đăng nhập được', status: 'open', priority: 'high', assignee: 'Admin 1', date: '2026-02-18' },
  { id: 'T-002', user: 'Trần Thị B', subject: 'AI trả lời sai', status: 'in-progress', priority: 'medium', assignee: 'Admin 2', date: '2026-02-17' },
  { id: 'T-003', user: 'Lê Văn C', subject: 'Yêu cầu xóa tài khoản', status: 'resolved', priority: 'low', assignee: 'Admin 1', date: '2026-02-16' },
];

const mockFAQ = [
  { q: 'Làm sao để đổi mật khẩu?', a: 'Vào Cài đặt > Bảo mật > Đổi mật khẩu', views: 245 },
  { q: 'AI token hết thì sao?', a: 'Liên hệ admin để được cấp thêm token', views: 189 },
  { q: 'Cách xuất hồ sơ du học?', a: 'Vào Portfolio > Xuất PDF', views: 156 },
];

const prioColors: Record<string, string> = { high: 'red', medium: 'yellow', low: 'blue' };
const statusColors: Record<string, string> = { open: 'red', 'in-progress': 'yellow', resolved: 'green' };

export default function SupportTools() {
  const [tab, setTab] = useState<SupportTab>('tickets');

  return (
    <div>
      <PageTitle title="Công cụ Hỗ trợ" subtitle="Help Desk & Knowledge Base" icon="support_agent" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon="confirmation_number" label="Ticket mở" value={mockTickets.filter(t => t.status === 'open').length} color="red" />
        <StatCard icon="pending" label="Đang xử lý" value={mockTickets.filter(t => t.status === 'in-progress').length} color="yellow" />
        <StatCard icon="check_circle" label="Đã giải quyết" value={mockTickets.filter(t => t.status === 'resolved').length} color="green" />
      </div>

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setTab('tickets')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'tickets' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>Tickets</button>
        <button onClick={() => setTab('faq')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'faq' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>FAQ / KB</button>
      </div>

      {tab === 'tickets' && (
        <GlassCard className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/50">
                {['ID', 'User', 'Chủ đề', 'Ưu tiên', 'Trạng thái', 'Phân công', 'Ngày', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTickets.map(t => (
                <tr key={t.id} className="border-b border-white/30 hover:bg-white/20 transition cursor-pointer">
                  <td className="px-4 py-3 font-mono text-slate-600">{t.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{t.user}</td>
                  <td className="px-4 py-3 text-slate-700">{t.subject}</td>
                  <td className="px-4 py-3"><Badge text={t.priority} color={prioColors[t.priority]} /></td>
                  <td className="px-4 py-3"><Badge text={t.status} color={statusColors[t.status]} /></td>
                  <td className="px-4 py-3 text-slate-600">{t.assignee}</td>
                  <td className="px-4 py-3 text-slate-500">{t.date}</td>
                  <td className="px-4 py-3">
                    <GlassSurface width="auto" height={28} borderRadius={8} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                      <span className="px-2 text-[10px] font-semibold text-white">Chi tiết</span>
                    </GlassSurface>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === 'faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <GlassHeader icon="quiz" title="FAQ" extra={
              <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                <span className="px-3 text-xs font-semibold text-white">+ Thêm</span>
              </GlassSurface>
            } />
            <div className="space-y-2">
              {mockFAQ.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="text-sm font-semibold text-slate-800">{f.q}</p>
                  <p className="text-xs text-slate-500 mt-1">{f.a}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{f.views} lượt xem</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <GlassHeader icon="menu_book" title="Tài liệu hướng dẫn" />
            <div className="space-y-2">
              {['Hướng dẫn sử dụng cơ bản', 'Hướng dẫn AI Advisor', 'Hướng dẫn Portfolio', 'Video tutorial'].map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 cursor-pointer transition">
                  <span className="material-symbols-outlined text-blue-600">{i === 3 ? 'videocam' : 'article'}</span>
                  <span className="text-sm font-semibold text-slate-700">{d}</span>
                  <span className="material-symbols-outlined text-slate-400 ml-auto text-lg">edit</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
