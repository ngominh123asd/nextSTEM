import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockConversations = [
  { id: '1', user: 'Nguyễn Văn A', agent: 'Study Coach', messages: 24, tokens: 3200, status: 'active', date: '2026-02-18', sentiment: 'positive' },
  { id: '2', user: 'Trần Thị B', agent: 'Essay Reviewer', messages: 12, tokens: 1800, status: 'archived', date: '2026-02-17', sentiment: 'neutral' },
  { id: '3', user: 'Lê Văn C', agent: 'University Advisor', messages: 8, tokens: 900, status: 'flagged', date: '2026-02-17', sentiment: 'negative' },
  { id: '4', user: 'Phạm D', agent: 'Study Coach', messages: 45, tokens: 5600, status: 'active', date: '2026-02-16', sentiment: 'positive' },
];

const sentimentColors: Record<string, string> = { positive: 'green', neutral: 'blue', negative: 'red' };
const statusColors: Record<string, string> = { active: 'green', archived: 'gray', flagged: 'red' };

export default function ChatManagement() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = mockConversations.filter(c =>
    (!search || c.user.toLowerCase().includes(search.toLowerCase())) &&
    (!filter || c.status === filter)
  );

  const conv = filtered.find(c => c.id === selected);

  return (
    <div>
      <PageTitle title="Quản lý Hội thoại" subtitle="Xem và kiểm duyệt tất cả conversations" icon="chat" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="chat" label="Tổng hội thoại" value={mockConversations.length} color="blue" />
        <StatCard icon="forum" label="Đang hoạt động" value={2} color="green" />
        <StatCard icon="flag" label="Cần kiểm duyệt" value={1} color="red" />
        <StatCard icon="trending_up" label="TB tin nhắn/cuộc" value="22" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation list */}
        <GlassCard className="lg:col-span-1 !p-4">
          <div className="mb-3">
            <input className={glass.input} placeholder="Tìm user, keyword..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 mb-3">
            {['', 'active', 'flagged', 'archived'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${filter === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/60'}`}>
                {f || 'Tất cả'}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selected === c.id ? 'bg-blue-50/80 border-blue-200' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-800">{c.user}</span>
                  <Badge text={c.status} color={statusColors[c.status]} />
                </div>
                <p className="text-xs text-slate-500">{c.agent} · {c.messages} tin · {c.tokens} tokens</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge text={c.sentiment} color={sentimentColors[c.sentiment]} />
                  <span className="text-[10px] text-slate-400">{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Detail */}
        <GlassCard className="lg:col-span-2">
          {conv ? (
            <>
              <GlassHeader icon="forum" title={`Hội thoại: ${conv.user}`} extra={
                <div className="flex gap-2">
                  <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }} onClick={() => {}}>
                    <span className="px-3 text-xs font-semibold text-white">Flag</span>
                  </GlassSurface>
                  <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
                    <span className="px-3 text-xs font-semibold text-white">Export</span>
                  </GlassSurface>
                </div>
              } />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/40 border border-white/60 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tin nhắn</p>
                  <p className="text-lg font-extrabold text-slate-800">{conv.messages}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/40 border border-white/60 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tokens</p>
                  <p className="text-lg font-extrabold text-slate-800">{conv.tokens}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/40 border border-white/60 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Agent</p>
                  <p className="text-sm font-bold text-slate-800">{conv.agent}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/40 border border-white/60 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Sentiment</p>
                  <Badge text={conv.sentiment} color={sentimentColors[conv.sentiment]} />
                </div>
              </div>
              {/* Mock messages */}
              <div className="space-y-2 max-h-64 overflow-y-auto p-3 rounded-xl bg-white/30">
                {[
                  { from: 'user', text: 'Tôi muốn tìm hiểu về học bổng du học Mỹ' },
                  { from: 'ai', text: 'Chào bạn! Tôi sẽ giúp bạn tìm hiểu về các học bổng du học Mỹ...' },
                  { from: 'user', text: 'Các trường nào có học bổng toàn phần?' },
                ].map((m, i) => (
                  <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === 'user' ? 'bg-blue-500 text-white' : 'bg-white/80 text-slate-700 border border-white/60'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="chat_bubble" title="Chọn hội thoại" desc="Nhấp vào hội thoại bên trái để xem chi tiết" />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
