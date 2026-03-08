import React, { useState, useRef, useEffect, useCallback } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass } from '../types';
import { GlassCard, PageTitle } from '../components/SharedUI';
import { apiCreateChatSession, apiChatAIStream, apiSaveChatAIMessage } from '../../../lib/api';

type ThinkingStep = {
  id: string;
  label: string;
  icon: string;
  status: 'active' | 'done';
  timestamp: number;
};

function mapEventToStep(event: string, data: any): { label: string; icon: string } | null {
  switch (event) {
    case 'start':
      return { label: 'Đang kết nối...', icon: 'cloud_sync' };
    case 'query_classified':
      return { label: `Phân tích câu hỏi${data.complexity ? ` ${data.complexity}` : ''}`, icon: 'psychology' };
    case 'planning':
      return { label: 'Đang lập kế hoạch...', icon: 'event_note' };
    case 'plan_created':
      return { label: `Kế hoạch sẵn sàng (${data.total_agents || data.agents?.length || '?'} chuyên gia)`, icon: 'checklist' };
    case 'executing':
      return { label: 'Bắt đầu thực thi...', icon: 'play_circle' };
    case 'agent_start':
      return { label: `Gọi chuyên gia: ${data.agent_name || data.agent || 'agent'}`, icon: 'support_agent' };
    case 'agent_stage':
      return { label: `${data.agent_name || 'Agent'} đang xử lý...`, icon: 'pending' };
    case 'agent_stage_result':
      return { label: `${data.agent_name || 'Agent'}: hoàn thành bước`, icon: 'task_alt' };
    case 'tool_call':
      return { label: `${data.agent_name || 'Agent'}: ${data.tool_name || data.tool || 'tool'}`, icon: 'build' };
    case 'tool_result':
      return { label: `Kết quả công cụ${data.tool_name ? `: ${data.tool_name}` : ''}`, icon: 'inventory' };
    case 'agent_completed':
      return { label: `${data.agent_name || 'Chuyên gia'} hoàn thành`, icon: 'check_circle' };
    case 'agent_error':
      return { label: `${data.agent_name || 'Agent'}: lỗi`, icon: 'error' };
    case 'synthesizing':
      return { label: 'Đang tổng hợp câu trả lời...', icon: 'auto_awesome' };
    default:
      return null;
  }
}

type ChatMessage = { role: 'user' | 'ai'; text: string; thinkingSteps?: ThinkingStep[] };

export default function AIAdvisorTab({ userData }: { userData: UserData }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMode, setActiveMode] = useState<'career' | 'university' | 'essay' | 'general'>('general');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [expandedThinking, setExpandedThinking] = useState<Set<number>>(new Set());
  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const stepsRef = useRef<ThinkingStep[]>([]);

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

  // Ensure a chat session exists for the current mode
  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    try {
      const session = await apiCreateChatSession(activeMode, `AI Advisor - ${activeMode}`);
      setSessionId(session.id);
      return session.id;
    } catch (e) {
      console.error('Failed to create chat session', e);
      return null;
    }
  }, [sessionId, activeMode]);

  // Reset session when mode changes
  useEffect(() => {
    setSessionId(null);
  }, [activeMode]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsStreaming(true);

    const sid = await ensureSession();
    if (!sid) {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Không thể kết nối đến AI. Vui lòng thử lại.' }]);
      setIsStreaming(false);
      return;
    }

    // Add a placeholder AI message that we'll stream into
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);
    setThinkingSteps([]);
    stepsRef.current = [];
    let fullText = '';

    const stream = apiChatAIStream(
      sid,
      msg,
      activeMode,
      (event, data) => {
        if (event === 'text_delta') {
          const delta = data.delta || data.text || data.content || '';
          fullText += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', text: fullText };
            return updated;
          });
        } else if (event === 'final_result') {
          const finalText = data.final_answer || data.text || data.result || data.response || fullText;
          if (finalText && finalText !== fullText) {
            fullText = finalText;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'ai', text: fullText };
              return updated;
            });
          }
          // Steps will be saved into message on stream done
        } else if (event === 'error') {
          const errMsg = data.message || data.error || 'Lỗi từ AI service';
          fullText += `\n\n❌ ${errMsg}`;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', text: fullText };
            return updated;
          });
          setThinkingSteps([]);
        } else {
          // Map progress events to thinking steps
          const step = mapEventToStep(event, data);
          if (step) {
            const newStep: ThinkingStep = {
              id: `${event}-${Date.now()}`,
              label: step.label,
              icon: step.icon,
              status: 'active' as const,
              timestamp: Date.now(),
            };
            stepsRef.current = [
              ...stepsRef.current.map(s => s.status === 'active' ? { ...s, status: 'done' as const } : s),
              newStep,
            ];
            setThinkingSteps([...stepsRef.current]);
          }
        }
      },
      async () => {
        // Stream done — save thinking steps into message then clear live state
        const finalSteps = stepsRef.current.map(s => ({ ...s, status: 'done' as const }));
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'ai' && finalSteps.length > 0) {
            updated[updated.length - 1] = { ...last, thinkingSteps: finalSteps };
          }
          return updated;
        });
        setIsStreaming(false);
        setThinkingSteps([]);
        stepsRef.current = [];
        abortRef.current = null;
        if (fullText) {
          try {
            await apiSaveChatAIMessage(sid, fullText);
          } catch (e) {
            console.error('Failed to save AI message', e);
          }
        }
      },
      (err) => {
        console.error('AI stream error', err);
        const finalSteps = stepsRef.current.map(s => ({ ...s, status: 'done' as const }));
        if (finalSteps.length > 0) {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'ai') {
              updated[updated.length - 1] = { ...last, thinkingSteps: finalSteps };
            }
            return updated;
          });
        }
        setIsStreaming(false);
        setThinkingSteps([]);
        stepsRef.current = [];
        abortRef.current = null;
        if (!fullText) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'ai',
              text: '❌ Không thể kết nối đến AI. Vui lòng thử lại sau.',
            };
            return updated;
          });
        }
      },
    );

    abortRef.current = stream;
  }, [input, isStreaming, activeMode, ensureSession]);

  return (
    <>
      <PageTitle icon="auto_awesome" title="AI Advisor" subtitle="Trợ lý tư vấn du học thông minh — cá nhân hoá theo hồ sơ của bạn" />

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => { setActiveMode(m.id); setMessages([]); setThinkingSteps([]); if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; } setIsStreaming(false); }}
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
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              {isStreaming ? 'Đang trả lời...' : 'AI sẵn sàng tư vấn'}
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
              <div className={`max-w-[75%] ${
                m.role === 'user'
                  ? 'p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md'
                  : ''
              }`}>
                {/* Collapsed thinking steps for completed AI messages */}
                {m.role === 'ai' && m.thinkingSteps && m.thinkingSteps.length > 0 && (
                  <div className="mb-1.5">
                    <button
                      onClick={() => setExpandedThinking(prev => {
                        const next = new Set(prev);
                        next.has(i) ? next.delete(i) : next.add(i);
                        return next;
                      })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-200 group"
                    >
                      <span className="material-symbols-outlined transition-transform duration-200 group-hover:text-blue-500" style={{ fontSize: '14px', transform: expandedThinking.has(i) ? 'rotate(90deg)' : 'rotate(0deg)' }}>chevron_right</span>
                      <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '13px' }}>check_circle</span>
                      Đã suy nghĩ ({m.thinkingSteps.length} bước)
                    </button>
                    {expandedThinking.has(i) && (
                      <div className="mt-1.5 ml-1 relative pl-5" style={{ animation: 'fadeSlideIn 0.2s ease-out forwards' }}>
                        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                        {m.thinkingSteps.map((step) => (
                          <div key={step.id} className="relative flex items-center gap-2 py-[2px]">
                            <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '13px' }}>check_circle</span>
                            </div>
                            <span className="text-xs text-slate-400 leading-tight">{step.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {m.role === 'ai' ? (
                  <div className="p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line bg-white/60 backdrop-blur-sm border border-white/60 text-slate-700 rounded-bl-md">
                    {m.text}
                  </div>
                ) : m.text}
              </div>
            </div>
          ))}

          {/* Thinking Progress Steps — vertical timeline */}
          {thinkingSteps.length > 0 && (
            <div className="flex justify-start">
              <div className="w-8 flex-shrink-0 mr-2" /> {/* spacer to align with AI avatar */}
              <div className="max-w-[75%] py-2">
                <div className="relative pl-5">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />

                  <div className="flex flex-col gap-0.5">
                    {thinkingSteps.map((step, idx) => {
                      const isLast = idx === thinkingSteps.length - 1;
                      return (
                        <div
                          key={step.id}
                          className="relative flex items-center gap-2 py-[3px]"
                          style={{
                            animation: 'fadeSlideIn 0.3s ease-out forwards',
                            opacity: 0,
                            animationDelay: `${idx * 40}ms`,
                          }}
                        >
                          {/* Dot on timeline */}
                          <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            {step.status === 'done' ? (
                              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '14px' }}>check_circle</span>
                            ) : (
                              <span className="w-[14px] h-[14px] rounded-full bg-blue-500 border-2 border-blue-200 animate-pulse shadow-sm shadow-blue-300" />
                            )}
                          </div>

                          {/* Label */}
                          <span className={`text-xs font-medium leading-tight ${
                            step.status === 'active'
                              ? 'text-blue-700'
                              : 'text-slate-400'
                          }`}>
                            {step.label}
                          </span>

                          {/* Spinner for active */}
                          {step.status === 'active' && isLast && (
                            <span className="material-symbols-outlined text-blue-400 animate-spin" style={{ fontSize: '12px', animationDuration: '1.5s' }}>progress_activity</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
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
                onKeyDown={e => e.key === 'Enter' && !isStreaming && handleSend()}
                disabled={isStreaming}
                placeholder={isStreaming ? 'Đang trả lời...' : `Hỏi về ${modes.find(m => m.id === activeMode)?.label.toLowerCase()}...`}
                className={`${glass.input} pl-13 ${isStreaming ? 'opacity-50' : ''}`} />
            </div>
            {isStreaming ? (
              <GlassSurface
                width={48}
                height={48}
                borderRadius={16}
                className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
                onClick={() => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; } setIsStreaming(false); }}
              >
                <span className="material-symbols-outlined text-white text-lg">stop</span>
              </GlassSurface>
            ) : (
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
            )}
          </div>
        </div>
      </GlassCard>
    </>
  );
}
