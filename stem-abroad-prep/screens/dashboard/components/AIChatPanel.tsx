import React, { useState, useRef, useEffect } from 'react';
import GlassSurface from '../../../components/GlassSurface';

interface ChatMsg { role: 'user' | 'ai'; text: string; time: string; }

export default function AIChatPanel({ onClose, userName }: { onClose: () => void; userName: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: `Xin chào ${userName?.split(' ').pop()}! 👋\n\nMình là AI Study Coach của nextSTEM. Mình có thể giúp bạn:\n\n - Tìm trường đại học phù hợp\n - Gợi ý viết bài luận\n - Tìm kiếm học bổng\n - Đánh giá hồ sơ\n - Lập kế hoạch du học\n\nBạn muốn bắt đầu từ đâu?`, time: 'Vừa xong' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const quickActions = [
    { label: 'Tìm trường', icon: 'school' },
    { label: 'Học bổng', icon: 'workspace_premium' },
    { label: 'Đánh giá hồ sơ', icon: 'assessment' },
    { label: 'Lập kế hoạch', icon: 'calendar_month' },
  ];

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const now = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, time: now }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const responses: Record<string, string> = {
        'Tìm trường': `Dựa trên hồ sơ của bạn, mình gợi ý:\n\n1. 🇺🇸 **MIT** — #1 STEM, tỷ lệ 3.9%\n2. 🇸🇬 **NUS** — #8 thế giới, học bổng ASEAN\n3. 🇬🇧 **Cambridge** — Top 5, ngành Science\n4. 🇨🇭 **ETH Zurich** — Miễn học phí\n\nBạn muốn tìm hiểu trường nào chi tiết hơn?`,
        'Học bổng': `Học bổng phù hợp với bạn:\n\n**Fulbright Vietnam** — 100% học phí (Mỹ)\n**ASEAN Scholarship** — Toàn phần (Singapore)\n**Chevening** — 100% học phí (UK)\n**MEXT** — Toàn phần (Nhật Bản)\n\nHạn nộp gần nhất: ASEAN — 01/03/2026`,
        'Đánh giá hồ sơ': `Đánh giá nhanh hồ sơ:\n\nDự án STEM: Tốt (2 dự án)\nChứng chỉ: Cần thêm SAT/AP\nNgoại khoá: Đa dạng\nBài luận: Chưa có\n\nĐiểm tổng: **72/100** — Khá\nGợi ý: Bắt đầu viết Personal Statement!`,
        'Lập kế hoạch': `Kế hoạch 12 tháng:\n\n**T1-2:** Hoàn thành test định hướng\n**T3-5:** Xây dựng dự án STEM\n**T6-8:** Viết bài luận + Portfolio\n**T9-12:** Nộp hồ sơ + Phỏng vấn\n\nBạn muốn xem chi tiết giai đoạn nào?`,
      };
      const aiReply = responses[msg] || `Cảm ơn câu hỏi! Mình đang phân tích...\n\nDựa trên hồ sơ và mục tiêu của bạn, mình sẽ đưa ra gợi ý cá nhân hoá.\n\nHãy thử hỏi cụ thể hơn nhé!`;
      setMessages(prev => [...prev, { role: 'ai', text: aiReply, time: new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[120] w-full sm:w-[440px] h-full sm:h-[640px] sm:max-h-[85vh] flex flex-col bg-white/80 backdrop-blur-3xl sm:rounded-3xl border border-white/60 shadow-2xl shadow-blue-900/15 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1152d4 0%, #2E6AE6 50%, #4F46E5 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">AI Study Coach</p>
            <p className="text-[11px] text-white/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              Sẵn sàng tư vấn 24/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button className="p-2 rounded-xl hover:bg-white/15 transition-all" title="Mở rộng">
            <span className="material-symbols-outlined text-lg">open_in_full</span>
          </button>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/15 transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #f0f4ff 100%)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
              </div>
            )}
            <div className={`max-w-[82%] p-3.5 text-[13px] leading-relaxed whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-500/20'
                : 'bg-white/90 backdrop-blur-sm border border-white/80 text-slate-700 rounded-2xl rounded-bl-md shadow-sm'
            }`}>
              {m.text}
              <p className={`text-[10px] mt-2 ${m.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
            </div>
            <div className="bg-white/90 border border-white/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2.5 flex gap-2 overflow-x-auto border-t border-white/40 bg-white/50">
        {quickActions.map(a => (
          <button key={a.label} onClick={() => handleSend(a.label)}
            className="whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 text-slate-600 hover:text-blue-600 hover:border-blue-200/60 hover:bg-blue-50/50 transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-sm text-blue-500">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-white/40 bg-white/60">
        <div className="flex gap-2.5 items-center">
          <button className="p-2 rounded-xl hover:bg-white/60 transition-all flex-shrink-0" title="Đính kèm">
            <span className="material-symbols-outlined text-slate-400 text-lg">attach_file</span>
          </button>
          <div className="flex-1 relative">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi..."
              className="w-full px-4 py-2.5 rounded-2xl border border-white/80 bg-white/60 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50 focus:bg-white/90 transition-all" />
          </div>
          <GlassSurface
            width={40}
            height={40}
            borderRadius={14}
            className="cursor-pointer hover:opacity-90 hover:scale-105 transition-all flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #1152d4, #2E6AE6)' : 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }}
            onClick={() => handleSend()}
          >
            <span className="material-symbols-outlined text-white text-lg">send</span>
          </GlassSurface>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">AI có thể đưa ra thông tin không chính xác. Kiểm tra lại các thông tin quan trọng.</p>
      </div>
    </div>
  );
}
