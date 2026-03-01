import React, { useState, useRef, useEffect } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass } from '../types';
import { GlassCard, PageTitle } from '../components/SharedUI';

export default function AIAdvisorTab({ userData }: { userData: UserData }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'career' | 'university' | 'essay' | 'general'>('general');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const modes = [
    { id: 'general' as const, icon: 'smart_toy', label: 'Tư vấn chung', desc: 'Hỏi bất kỳ câu hỏi nào về du học', color: 'from-blue-500 to-indigo-500' },
    { id: 'career' as const, icon: 'work', label: 'Định hướng nghề nghiệp', desc: 'AI phân tích năng lực & gợi ý ngành', color: 'from-violet-500 to-purple-500' },
    { id: 'university' as const, icon: 'school', label: 'Tìm trường phù hợp', desc: 'So sánh & đề xuất trường đại học', color: 'from-emerald-500 to-teal-500' },
    { id: 'essay' as const, icon: 'edit_note', label: 'Hỗ trợ viết luận', desc: 'AI Coach giúp viết Personal Statement', color: 'from-amber-500 to-orange-500' },
  ];

  const quickPrompts: Record<string, { text: string; icon: string; desc: string }[]> = {
    general: [
      { text: 'Phân tích hồ sơ của tôi', icon: 'person_search', desc: 'AI đánh giá điểm mạnh, yếu & gợi ý cải thiện' },
      { text: 'Lập kế hoạch du học 12 tháng', icon: 'calendar_month', desc: 'Lộ trình chi tiết từng tháng cho hành trình du học' },
      { text: 'So sánh du học Mỹ vs Singapore', icon: 'compare_arrows', desc: 'Phân tích chi phí, cơ hội & yêu cầu đầu vào' },
      { text: 'Học bổng nào phù hợp với tôi?', icon: 'workspace_premium', desc: 'Gợi ý học bổng dựa trên hồ sơ cá nhân' },
    ],
    career: [
      { text: 'Ngành nào phù hợp với tôi?', icon: 'psychology', desc: 'AI phân tích năng lực & đề xuất ngành học' },
      { text: 'Xu hướng nghề nghiệp STEM 2026', icon: 'trending_up', desc: 'Cập nhật thị trường lao động & cơ hội mới' },
      { text: 'So sánh CS vs Data Science', icon: 'balance', desc: 'So sánh chương trình, cơ hội & mức lương' },
      { text: 'Cơ hội việc làm sau du học', icon: 'work', desc: 'Triển vọng nghề nghiệp tại các quốc gia' },
    ],
    university: [
      { text: 'Top trường STEM châu Á', icon: 'school', desc: 'Xếp hạng & thông tin tuyển sinh chi tiết' },
      { text: 'Trường nào có học bổng cao?', icon: 'paid', desc: 'Trường hỗ trợ tài chính tốt nhất cho sinh viên quốc tế' },
      { text: 'Yêu cầu đầu vào MIT', icon: 'checklist', desc: 'Điểm số, bài thi & hoạt động ngoại khoá cần thiết' },
      { text: 'So sánh NUS vs NTU', icon: 'compare', desc: 'Chương trình, chi phí & cơ hội nghề nghiệp' },
    ],
    essay: [
      { text: 'Viết mở bài Personal Statement', icon: 'edit_note', desc: 'AI gợi ý cách mở đầu ấn tượng & thu hút' },
      { text: 'Review bài luận của tôi', icon: 'rate_review', desc: 'Nhận xét chi tiết & gợi ý chỉnh sửa từ AI' },
      { text: 'Cách kể câu chuyện cá nhân', icon: 'auto_stories', desc: 'Kỹ thuật storytelling hiệu quả cho bài luận' },
      { text: 'Lỗi thường gặp khi viết luận', icon: 'error_outline', desc: 'Tránh những sai lầm phổ biến khi viết essay' },
    ],
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');

    setTimeout(() => {
      const modeResponses: Record<string, string> = {
        general: `Dựa trên hồ sơ của ${userData.name?.split(' ').pop()}, đây là phân tích:\n\n📊 **Điểm mạnh:** Nền tảng STEM tốt, đa dạng hoạt động\n🎯 **Gợi ý:** Tập trung phát triển dự án nghiên cứu\n📋 **Tiếp theo:** Hoàn thiện portfolio & bắt đầu viết luận\n\nBạn muốn tìm hiểu sâu hơn về phần nào?`,
        career: `Dựa trên sở thích ${userData.interests.slice(0, 2).join(', ')}:\n\n🔬 **Ngành phù hợp nhất:**\n1. Computer Science & AI\n2. Data Science\n3. Biomedical Engineering\n\n💡 **Lý do:** Kết hợp giữa năng lực kỹ thuật và xu hướng thị trường\n📈 **Mức lương trung bình:** $85,000 - $120,000/năm`,
        university: `🏫 **Top 5 trường phù hợp cho bạn:**\n\n1. 🇺🇸 MIT — CS/AI, tỷ lệ 3.9%\n2. 🇸🇬 NUS — CS, học bổng ASEAN\n3. 🇬🇧 Imperial College — Engineering\n4. 🇨🇭 ETH Zurich — Miễn học phí\n5. 🇯🇵 U of Tokyo — MEXT scholarship\n\n📝 Xem chi tiết trường nào?`,
        essay: `✍️ **Gợi ý cho Personal Statement:**\n\nMở bài nên bắt đầu bằng một khoảnh khắc cụ thể, đáng nhớ liên quan đến đam mê STEM của bạn.\n\n**Ví dụ:**\n_"Lúc 3 giờ sáng, dòng code cuối cùng chạy thành công — chatbot AI đầu tiên của tôi đã có thể trả lời câu hỏi..."_\n\n💡 Câu chuyện cá nhân + kết quả cụ thể = bài luận ấn tượng`,
      };
      setMessages(prev => [...prev, { role: 'ai', text: modeResponses[activeMode] || modeResponses.general }]);
    }, 600);
  };

  return (
    <>
      <PageTitle icon="auto_awesome" title="AI Advisor" subtitle="Trợ lý tư vấn du học thông minh — cá nhân hoá theo hồ sơ của bạn" />

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => { setActiveMode(m.id); setMessages([]); }}
            className={`p-4 rounded-2xl text-left transition-all duration-300 border ${
              activeMode === m.id
                ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-300/50 shadow-md shadow-blue-100/50'
                : 'bg-white/40 backdrop-blur-sm border-white/60 hover:bg-white/60'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-3 shadow-lg`}>
              <span className="material-symbols-outlined text-white text-lg">{m.icon}</span>
            </div>
            <h4 className={`font-bold text-sm mb-0.5 ${activeMode === m.id ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>{m.label}</h4>
            <p className="text-xs text-slate-400">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <GlassCard className="!p-0 min-h-[500px] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/40">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${modes.find(m => m.id === activeMode)?.color} flex items-center justify-center shadow-md`}>
            <span className="material-symbols-outlined text-white text-lg">{modes.find(m => m.id === activeMode)?.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-[#1E3A8A] text-sm">{modes.find(m => m.id === activeMode)?.label}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI sẵn sàng tư vấn
            </p>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ minHeight: 300 }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-white/60 mb-4">
                <span className="material-symbols-outlined text-3xl text-blue-400">auto_awesome</span>
              </div>
              <h4 className="font-bold text-lg text-[#1E3A8A] mb-1.5">Xin chào! Mình có thể giúp gì?</h4>
              <p className="text-sm text-slate-400 mb-8 text-center max-w-md leading-relaxed">
                Chọn một chủ đề bên dưới để bắt đầu, hoặc nhập câu hỏi bất kỳ
              </p>
              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {quickPrompts[activeMode].map((q, idx) => (
                  <button key={q.text} onClick={() => handleSend(q.text)}
                    className="group relative p-4 rounded-2xl text-left transition-all duration-300 bg-white/50 backdrop-blur-sm border border-white/70 hover:bg-white/90 hover:border-blue-200/60 hover:shadow-lg hover:shadow-blue-100/40 hover:-translate-y-0.5">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-300" />
                    <div className="relative flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        idx === 0 ? 'from-blue-500 to-blue-600' : idx === 1 ? 'from-violet-500 to-purple-500' : idx === 2 ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'
                      } flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                        <span className="material-symbols-outlined text-white text-lg">{q.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm text-slate-700 group-hover:text-[#1E3A8A] transition-colors leading-tight mb-1">{q.text}</h5>
                        <p className="text-xs text-slate-400 group-hover:text-slate-500 transition-colors leading-relaxed">{q.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-300 mt-0.5 flex-shrink-0">arrow_forward</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                </div>
              )}
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md'
                  : 'bg-white/60 backdrop-blur-sm border border-white/60 text-slate-700 rounded-bl-md'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && (
          <div className="px-6 py-2.5 flex gap-2 overflow-x-auto border-t border-white/30">
            {quickPrompts[activeMode].slice(0, 3).map(q => (
              <button key={q.text} onClick={() => handleSend(q.text)}
                className="whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200/50 transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-blue-500 text-sm">{q.icon}</span>
                {q.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/40">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">chat</span>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={`Hỏi về ${modes.find(m => m.id === activeMode)?.label.toLowerCase()}...`}
                className={`${glass.input} pl-13`} />
            </div>
            <GlassSurface
              width={48}
              height={48}
              borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={() => handleSend()}
            >
              <span className="material-symbols-outlined text-white text-lg">send</span>
            </GlassSurface>
          </div>
        </div>
      </GlassCard>
    </>
  );
}
