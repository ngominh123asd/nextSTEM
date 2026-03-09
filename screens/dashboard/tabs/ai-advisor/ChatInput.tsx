import React, { useState } from 'react';
import GlassSurface from '../../../../components/GlassSurface';
import { glass } from '../../types';
import { ChatMode, MODES, QUICK_PROMPTS } from './types';

interface Props {
  activeMode: ChatMode;
  isStreaming: boolean;
  hasMessages: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export default function ChatInput({ activeMode, isStreaming, hasMessages, onSend, onStop }: Props) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    onSend(msg);
  };

  return (
    <>
      {/* Quick Actions */}
      {hasMessages && (
        <div className="px-6 py-2.5 flex gap-2 overflow-x-auto border-t border-white/30">
          {QUICK_PROMPTS[activeMode].slice(0, 3).map(q => (
            <button key={q.text} onClick={() => onSend(q.text)}
              disabled={isStreaming}
              className="whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200/50 transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm disabled:opacity-50">
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
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isStreaming && handleSend()}
              disabled={isStreaming}
              placeholder={isStreaming ? 'Đang trả lời...' : `Hỏi về ${MODES.find(m => m.id === activeMode)?.label.toLowerCase()}...`}
              className={`${glass.input} pl-13 ${isStreaming ? 'opacity-50' : ''}`}
            />
          </div>
          {isStreaming ? (
            <GlassSurface
              width={48} height={48} borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              onClick={onStop}
            >
              <span className="material-symbols-outlined text-white text-lg">stop</span>
            </GlassSurface>
          ) : (
            <GlassSurface
              width={48} height={48} borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={handleSend}
            >
              <span className="material-symbols-outlined text-white text-lg">send</span>
            </GlassSurface>
          )}
        </div>
      </div>
    </>
  );
}
