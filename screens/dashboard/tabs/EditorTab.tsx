import React, { useState, useRef, useEffect } from 'react';
import { glass } from '../types';
import { GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';

export default function EditorTab() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Document');
  const [wordCount, setWordCount] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  const aiActions = [
    { icon: 'spellcheck',    label: 'Sửa lỗi', desc: 'Kiểm tra ngữ pháp & chính tả' },
    { icon: 'auto_awesome',  label: 'Viết tiếp', desc: 'AI autocomplete đoạn văn' },
    { icon: 'summarize',     label: 'Tóm tắt', desc: 'Tóm tắt nội dung' },
    { icon: 'style',         label: 'Văn phong', desc: 'Gợi ý văn phong học thuật' },
  ];

  const handleAiAction = (action: string) => {
    const responses: Record<string, string> = {
      'Sửa lỗi': 'Không phát hiện lỗi ngữ pháp. Văn bản của bạn đã chính xác.',
      'Viết tiếp': 'Gợi ý: Tiếp tục bằng cách phát triển ý chính ở đoạn trước...',
      'Tóm tắt': 'Đoạn văn nói về... (Hãy viết nội dung để AI tóm tắt)',
      'Văn phong': 'Gợi ý: Sử dụng cấu trúc câu phức hợp và từ vựng học thuật chuyên ngành.',
    };
    setAiSuggestion(responses[action] || 'AI đang phân tích...');
  };

  return (
    <>
      <PageTitle icon="edit_document" title="Academic Editor" subtitle="Soạn thảo văn bản học thuật với AI Writing Assistant" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3">
          <GlassCard className="!p-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/40">
              <div className="flex items-center gap-3">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="text-lg font-bold text-[#1E3A8A] bg-transparent border-none outline-none w-48 sm:w-auto" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">{wordCount} từ</span>
                <div className="w-px h-4 bg-slate-200" />
                <button className="p-2 rounded-xl hover:bg-white/50 transition-all" title="Xuất Word">
                  <span className="material-symbols-outlined text-slate-500 text-lg">description</span>
                </button>
                <button className="p-2 rounded-xl hover:bg-white/50 transition-all" title="Xuất PDF">
                  <span className="material-symbols-outlined text-slate-500 text-lg">picture_as_pdf</span>
                </button>
                <button className="p-2 rounded-xl hover:bg-white/50 transition-all" title="Plain Text">
                  <span className="material-symbols-outlined text-slate-500 text-lg">text_snippet</span>
                </button>
              </div>
            </div>

            {/* Format bar */}
            <div className="flex items-center gap-1 px-5 py-2 border-b border-white/30">
              {['format_bold', 'format_italic', 'format_underlined', 'format_list_bulleted', 'format_list_numbered', 'format_quote', 'link', 'title'].map(ic => (
                <button key={ic} className="p-1.5 rounded-lg hover:bg-white/50 transition-all">
                  <span className="material-symbols-outlined text-slate-500 text-lg">{ic}</span>
                </button>
              ))}
            </div>

            {/* Text area */}
            <textarea ref={textareaRef} value={content} onChange={e => setContent(e.target.value)}
              placeholder="Bắt đầu viết ở đây... AI sẽ hỗ trợ bạn trong quá trình soạn thảo."
              className="w-full min-h-[500px] p-6 bg-transparent text-slate-800 text-base leading-relaxed resize-none outline-none placeholder:text-slate-300"
            />
          </GlassCard>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-4">
          <GlassCard>
            <GlassHeader icon="auto_awesome" title="AI Assistant" />
            <div className="space-y-2 relative z-10">
              {aiActions.map(a => (
                <button key={a.label} onClick={() => handleAiAction(a.label)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 hover:shadow-sm transition-all text-left">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/15 to-indigo-500/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-base">{a.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A8A]">{a.label}</p>
                    <p className="text-xs text-slate-400">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {aiSuggestion && (
            <GlassCard>
              <GlassHeader icon="lightbulb" title="Gợi ý AI" />
              <p className="text-sm text-slate-600 leading-relaxed relative z-10">{aiSuggestion}</p>
            </GlassCard>
          )}

          <GlassCard>
            <GlassHeader icon="download" title="Xuất bản" />
            <div className="space-y-2 relative z-10">
              {[
                { icon: 'description', label: 'Word (.docx)', desc: 'Microsoft Word' },
                { icon: 'picture_as_pdf', label: 'PDF', desc: 'Portable Document' },
                { icon: 'text_snippet', label: 'Plain Text', desc: 'File .txt' },
              ].map(e => (
                <button key={e.label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all text-left">
                  <span className="material-symbols-outlined text-slate-500">{e.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A8A]">{e.label}</p>
                    <p className="text-xs text-slate-400">{e.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
