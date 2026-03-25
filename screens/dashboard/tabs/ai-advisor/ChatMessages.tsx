import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, ChatMode, ThinkingStep, QUICK_PROMPTS } from './types';
import { CollapsedThinkingSteps, LiveThinkingSteps } from './ThinkingSteps';

interface Props {
  messages: ChatMessage[];
  activeMode: ChatMode;
  isStreaming: boolean;
  thinkingSteps: ThinkingStep[];
  loading: boolean;
  onSend: (text: string) => void;
  onDeleteMessage: (id: string) => void;
}

export default function ChatMessageList({
  messages, activeMode, isStreaming, thinkingSteps, loading,
  onSend, onDeleteMessage,
}: Props) {
  const chatRef = useRef<HTMLDivElement>(null);
  const [expandedThinking, setExpandedThinking] = useState<Set<number>>(new Set());
  const [hoveredMsg, setHoveredMsg] = useState<number | null>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, thinkingSteps]);

  const toggleThinking = (idx: number) => {
    setExpandedThinking(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-blue-400 animate-spin">progress_activity</span>
          <p className="text-sm text-slate-400">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={chatRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4" style={{ minHeight: 200 }}>
      {/* Empty state with quick prompts */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full py-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-white/60 mb-4">
            <span className="material-symbols-outlined text-3xl text-blue-400">auto_awesome</span>
          </div>
          <h4 className="font-bold text-lg text-[#1E3A8A] mb-1.5">Xin chào! Mình có thể giúp gì?</h4>
          <p className="text-sm text-slate-400 mb-8 text-center max-w-md leading-relaxed">
            Chọn một chủ đề bên dưới để bắt đầu, hoặc nhập câu hỏi bất kỳ
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-xl">
            {QUICK_PROMPTS[activeMode].map((q, idx) => (
              <button key={q.text} onClick={() => onSend(q.text)}
                className="group relative p-3 sm:p-4 rounded-2xl text-left transition-all duration-300 bg-white/90 backdrop-blur-md border border-white shadow-sm hover:bg-white hover:border-blue-300/60 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-0.5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/80 group-hover:to-indigo-50/50 transition-all duration-300" />
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

      {/* Messages */}
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          onMouseEnter={() => setHoveredMsg(i)}
          onMouseLeave={() => setHoveredMsg(null)}
        >
          {m.role === 'ai' && (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-1.5 sm:mr-2 mt-1 flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-white text-xs sm:text-sm">auto_awesome</span>
            </div>
          )}
          <div className={`max-w-[90%] sm:max-w-[75%] relative group ${
            m.role === 'user'
              ? 'p-3 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-md'
              : ''
          }`}>
            {/* Thinking steps for AI messages */}
            {m.role === 'ai' && m.thinkingSteps && m.thinkingSteps.length > 0 && (
              <CollapsedThinkingSteps
                steps={m.thinkingSteps}
                isExpanded={expandedThinking.has(i)}
                onToggle={() => toggleThinking(i)}
              />
            )}

            {/* Message content */}
            {m.role === 'ai' ? (
              <div className="p-3 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line bg-white/90 backdrop-blur-md border border-white shadow-sm text-slate-700 rounded-bl-md">
                {m.text}
              </div>
            ) : m.text}

            {/* Delete button on hover */}
            {m.id && hoveredMsg === i && !isStreaming && (
              <button
                onClick={() => onDeleteMessage(m.id!)}
                className={`absolute ${m.role === 'user' ? '-left-7 sm:-left-8' : '-right-7 sm:-right-8'} top-1 p-1 rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200/50 transition-all duration-200`}
                title="Xoá tin nhắn"
              >
                <span className="material-symbols-outlined text-slate-400 hover:text-red-500" style={{ fontSize: '14px' }}>delete</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Live thinking steps during streaming */}
      <LiveThinkingSteps steps={thinkingSteps} />
    </div>
  );
}