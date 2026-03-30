import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { glass } from '../types';
import { GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';
import { getToken } from '../../../lib/api';
import { streamGemini } from '../../../lib/gemini';

/* ── Types ── */
interface EditorDocument { id: string; title: string; content: string; createdAt: number; updatedAt: number; }
interface AiMessage { role: 'user' | 'ai'; text: string; tool?: string; }

/* ── Helpers ── */
const genId = () => Math.random().toString(36).slice(2, 10);
const text2html = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; };
const wc = (h: string) => { const t = text2html(h).trim(); return t ? t.split(/\s+/).length : 0; };
const cc = (h: string) => text2html(h).length;

const STORAGE_KEY = 'nextstem_editor_docs';
const loadDocs = (): EditorDocument[] => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } };
const saveDocs = (d: EditorDocument[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

export default function EditorTab() {
  const [docs, setDocs] = useState<EditorDocument[]>(() => loadDocs());
  const [activeId, setActiveId] = useState<string | null>(() => { const d = loadDocs(); return d.length > 0 ? d[0].id : null; });
  const [showDocList, setShowDocList] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [autoSave, setAutoSave] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // AI panel state
  const [aiOpen, setAiOpen] = useState(true);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  const doc = useMemo(() => docs.find(d => d.id === activeId) || null, [docs, activeId]);
  const wordCount = useMemo(() => wc(doc?.content || ''), [doc?.content]);
  const charCount = useMemo(() => cc(doc?.content || ''), [doc?.content]);

  useEffect(() => { saveDocs(docs); }, [docs]);
  useEffect(() => { if (editorRef.current && doc && editorRef.current.innerHTML !== doc.content) editorRef.current.innerHTML = doc.content; }, [activeId]);
  useEffect(() => { if (aiScrollRef.current) aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight; }, [aiMessages]);

  const handleInput = useCallback(() => {
    if (!editorRef.current || !activeId) return;
    const html = editorRef.current.innerHTML;
    setAutoSave('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === activeId ? { ...d, content: html, updatedAt: Date.now() } : d));
      setAutoSave('saved');
    }, 400);
  }, [activeId]);

  const updateFormats = useCallback(() => {
    const f = new Set<string>();
    if (document.queryCommandState('bold')) f.add('bold');
    if (document.queryCommandState('italic')) f.add('italic');
    if (document.queryCommandState('underline')) f.add('underline');
    if (document.queryCommandState('strikeThrough')) f.add('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) f.add('ul');
    if (document.queryCommandState('insertOrderedList')) f.add('ol');
    const b = document.queryCommandValue('formatBlock'); if (b) f.add(b);
    setActiveFormats(f);
  }, []);

  /* ── Doc CRUD ── */
  const createDoc = () => {
    const d: EditorDocument = { id: genId(), title: 'Tài liệu mới', content: '', createdAt: Date.now(), updatedAt: Date.now() };
    setDocs(prev => [d, ...prev]); setActiveId(d.id); setShowDocList(false);
    setTimeout(() => { if (editorRef.current) { editorRef.current.innerHTML = ''; editorRef.current.focus(); } }, 0);
  };
  const deleteDoc = (id: string) => { setDocs(prev => prev.filter(d => d.id !== id)); if (activeId === id) { const r = docs.filter(d => d.id !== id); setActiveId(r.length > 0 ? r[0].id : null); } };
  const updateTitle = useCallback((t: string) => { if (!activeId) return; setDocs(prev => prev.map(d => d.id === activeId ? { ...d, title: t, updatedAt: Date.now() } : d)); }, [activeId]);

  /* ── Formatting ── */
  const exec = (cmd: string, val?: string) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); handleInput(); updateFormats(); };

  const fmtActions = [
    { icon: 'format_bold', tip: 'In đậm', cmd: 'bold', t: 'toggle' },
    { icon: 'format_italic', tip: 'In nghiêng', cmd: 'italic', t: 'toggle' },
    { icon: 'format_underlined', tip: 'Gạch chân', cmd: 'underline', t: 'toggle' },
    { icon: 'strikethrough_s', tip: 'Gạch ngang', cmd: 'strikeThrough', t: 'toggle' },
    { divider: true },
    { icon: 'title', tip: 'H1', cmd: 'formatBlock', val: 'h1', t: 'block' },
    { icon: 'format_h2', tip: 'H2', cmd: 'formatBlock', val: 'h2', t: 'block' },
    { icon: 'format_h3', tip: 'H3', cmd: 'formatBlock', val: 'h3', t: 'block' },
    { divider: true },
    { icon: 'format_list_bulleted', tip: 'List', cmd: 'insertUnorderedList', t: 'toggle' },
    { icon: 'format_list_numbered', tip: 'Số', cmd: 'insertOrderedList', t: 'toggle' },
    { divider: true },
    { icon: 'format_quote', tip: 'Trích dẫn', cmd: 'formatBlock', val: 'blockquote', t: 'block' },
    { icon: 'code', tip: 'Code', cmd: 'formatBlock', val: 'pre', t: 'block' },
    { icon: 'link', tip: 'Link', cmd: 'link', t: 'prompt' },
    { icon: 'horizontal_rule', tip: 'Đường kẻ', cmd: 'insertHorizontalRule', t: 'exec' },
    { icon: 'format_clear', tip: 'Xóa format', cmd: 'removeFormat', t: 'exec' },
  ];

  const handleFmt = (a: typeof fmtActions[number]) => {
    if ('divider' in a && a.divider) return;
    if (a.t === 'prompt' && a.cmd === 'link') { const u = prompt('URL:', 'https://'); if (u) exec('createLink', u); return; }
    if (a.t === 'block' && a.val) { exec(a.cmd!, a.val); return; }
    exec(a.cmd!, a.val);
  };

  const isFmtActive = (a: typeof fmtActions[number]) => {
    if ('divider' in a) return false;
    if (a.t === 'toggle') return activeFormats.has(a.cmd!);
    if (a.t === 'block' && a.val) return activeFormats.has(a.val);
    return false;
  };

  /* ── AI ── */
  const aiTools = [
    { icon: 'spellcheck', label: 'Sửa lỗi', prompt: 'fix_grammar' },
    { icon: 'auto_awesome', label: 'Viết tiếp', prompt: 'continue' },
    { icon: 'summarize', label: 'Tóm tắt', prompt: 'summarize' },
    { icon: 'style', label: 'Văn phong', prompt: 'academic_style' },
    { icon: 'translate', label: 'Dịch Anh', prompt: 'translate' },
    { icon: 'expand_content', label: 'Mở rộng', prompt: 'expand' },
  ];

  const getSelectedOrAll = () => {
    const sel = window.getSelection();
    const selected = sel && editorRef.current?.contains(sel.anchorNode) ? sel.toString() : '';
    return selected || text2html(doc?.content || '');
  };

  const runAiTool = async (promptType: string, toolLabel: string) => {
    const plain = getSelectedOrAll();
    if (!plain.trim()) return;

    const prompts: Record<string, string> = {
      fix_grammar: `Kiểm tra và sửa lỗi ngữ pháp, chính tả trong đoạn văn sau:\n\n${plain}`,
      continue: `Viết tiếp đoạn văn sau tự nhiên, giữ giọng văn:\n\n${plain}`,
      summarize: `Tóm tắt ngắn gọn nội dung sau:\n\n${plain}`,
      academic_style: `Viết lại phong cách học thuật chuyên nghiệp:\n\n${plain}`,
      translate: `Dịch sang tiếng Anh chính xác và tự nhiên:\n\n${plain}`,
      expand: `Mở rộng và phát triển ý sâu hơn:\n\n${plain}`,
    };

    setAiMessages(prev => [...prev, { role: 'user', text: toolLabel, tool: promptType }]);
    await streamAI(prompts[promptType] || plain);
  };

  const sendFreeChat = async () => {
    const msg = aiInput.trim();
    if (!msg || aiLoading) return;

    const plain = getSelectedOrAll();
    const fullPrompt = plain.trim()
      ? `Đây là nội dung văn bản hiện tại:\n\n${plain}\n\nYêu cầu của người dùng: ${msg}`
      : msg;

    setAiMessages(prev => [...prev, { role: 'user', text: msg }]);
    setAiInput('');
    await streamAI(fullPrompt);
  };

  const streamAI = async (userMessage: string) => {
    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: 'ai', text: '' }]);

    if (!getToken()) {
      setTimeout(() => {
        setAiMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text: '💡 Hãy đăng nhập để sử dụng AI Assistant.' }; return u; });
        setAiLoading(false);
      }, 600);
      return;
    }

    let full = '';
    const stream = streamGemini(
      userMessage,
      (chunk) => {
        full += chunk;
        setAiMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text: full }; return u; });
      },
      () => { setAiLoading(false); abortRef.current = null; },
      () => {
        if (!full) setAiMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'ai', text: '❌ AI không phản hồi.' }; return u; });
        setAiLoading(false); abortRef.current = null;
      },
      { systemInstruction: 'Bạn là trợ lý viết bài học thuật chuyên nghiệp. Hãy trả lời bằng tiếng Việt trừ khi được yêu cầu khác. Sử dụng Markdown khi cần.' },
    );
    abortRef.current = stream;
  };

  const insertAiText = (text: string) => {
    if (!editorRef.current) return;
    const html = text.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
    editorRef.current.innerHTML += html;
    handleInput();
  };

  /* ── Export ── */
  const dl = (b: Blob, n: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(a.href); };
  const expDoc = () => {
    const t = doc?.title || 'Tài liệu không tên';
    const htmlContent = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${t}</title></head><body>${doc?.content || ''}</body></html>`;
    dl(new Blob(['\\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' }), `${t}.doc`);
  };
  const expPDF = () => {
    const t = doc?.title || 'Tài liệu không tên';
    const win = window.open('', '', 'width=800,height=900');
    if (!win) { alert('Vui lòng cho phép popup để xuất file PDF'); return; }
    const printHtml = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${t}</title><style>body{font-family:'Times New Roman',serif;line-height:1.5;padding:2cm;color:#000}h1,h2,h3{color:#000}blockquote{border-left:4px solid #ccc;margin-left:0;padding-left:16px;color:#555}pre{background:#f5f5f5;padding:16px;border-radius:4px}</style></head><body>${doc?.content || ''}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};}</script></body></html>`;
    win.document.open();
    win.document.write(printHtml);
    win.document.close();
  };

  /* ── Empty ── */
  if (!doc) {
    return (
      <>
        <PageTitle icon="edit_document" title="Academic Editor" subtitle="Soạn thảo văn bản học thuật với AI Writing Assistant" />
        <GlassCard><div className="flex flex-col items-center py-16 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 flex items-center justify-center border border-white/60 mb-6"><span className="material-symbols-outlined text-4xl text-blue-400">edit_document</span></div>
          <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Bắt đầu soạn thảo</h3>
          <p className="text-slate-500 text-center max-w-md mb-8">Tạo tài liệu mới để viết với AI Writing Assistant</p>
          <button onClick={createDoc} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white font-semibold flex items-center gap-2 hover:opacity-90 shadow-lg"><span className="material-symbols-outlined text-lg">add</span>Tạo tài liệu mới</button>
        </div></GlassCard>
      </>
    );
  }

  return (
    <>
      <PageTitle icon="edit_document" title="Academic Editor" subtitle="Soạn thảo văn bản học thuật với AI Writing Assistant" />

      <div className="flex items-start relative w-full overflow-hidden pb-4">
        {/* ── Editor ── */}
        <div className="flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
          <GlassCard className="!p-0 overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/40 bg-white/30">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative" onMouseLeave={() => setShowDocList(false)}>
                  <button onClick={() => setShowDocList(!showDocList)} className="p-1.5 rounded-lg hover:bg-white/50" title="Tài liệu">
                    <span className="material-symbols-outlined text-slate-500 text-lg">folder_open</span>
                  </button>
                  {showDocList && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50">
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1E3A8A]">Tài liệu</span>
                        <button onClick={createDoc} className="text-xs text-blue-600 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>Mới</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {docs.map(d => (
                          <div key={d.id} className={`flex items-center justify-between px-3 py-2.5 hover:bg-blue-50/50 cursor-pointer group ${d.id === activeId ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                            <div className="flex-1 min-w-0" onClick={() => { setActiveId(d.id); setShowDocList(false); }}>
                              <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                              <p className="text-xs text-slate-400">{wc(d.content)} từ</p>
                            </div>
                            {docs.length > 1 && <button onClick={e => { e.stopPropagation(); deleteDoc(d.id); }} className="p-1 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-red-400 text-sm">delete</span></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input type="text" value={doc.title} onChange={e => updateTitle(e.target.value)} className="text-base font-bold text-[#1E3A8A] bg-transparent border-none outline-none flex-1 min-w-0" />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {autoSave === 'saving' && <span className="text-xs text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>Lưu...</span>}
                {autoSave === 'saved' && <span className="text-xs text-emerald-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">check_circle</span>Đã lưu</span>}
                <span className="text-xs text-slate-400 ml-2">{wordCount} từ</span>
                <span className="text-xs text-slate-300">|</span>
                <span className="text-xs text-slate-400">{charCount} ký tự</span>
                {/* Export */}
                <div className="relative ml-2" onMouseLeave={() => setShowExport(false)}>
                  <button onClick={() => setShowExport(!showExport)} className="p-1.5 rounded-lg hover:bg-white/50" title="Xuất"><span className="material-symbols-outlined text-slate-500 text-lg">download</span></button>
                  {showExport && (
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-1">
                      <button onClick={() => { expDoc(); setShowExport(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm text-slate-700"><span className="material-symbols-outlined text-blue-600 text-base">description</span>Word (.doc)</button>
                      <button onClick={() => { expPDF(); setShowExport(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm text-slate-700"><span className="material-symbols-outlined text-red-500 text-base">picture_as_pdf</span>PDF</button>
                    </div>
                  )}
                </div>
                {/* AI toggle */}
                <button onClick={() => setAiOpen(!aiOpen)} className={`p-1.5 rounded-lg transition-all ml-1 ${aiOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-white/50 text-slate-500'}`} title="AI Assistant">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-white/30 bg-white/20 overflow-x-auto">
              {fmtActions.map((a, i) => {
                if ('divider' in a && a.divider) return <div key={i} className="w-px h-5 bg-slate-200/60 mx-1 flex-shrink-0" />;
                const on = isFmtActive(a);
                return <button key={i} onClick={() => handleFmt(a)} title={a.tip} className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${on ? 'bg-blue-100/80 text-blue-700 shadow-sm' : 'hover:bg-white/50 text-slate-500 hover:text-blue-600'}`}><span className="material-symbols-outlined text-[17px]">{a.icon}</span></button>;
              })}
            </div>

            {/* Editor */}
            <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={handleInput} onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;'); } }}
              onMouseUp={updateFormats} onKeyUp={updateFormats}
              data-placeholder="Bắt đầu viết ở đây..."
              className="editor-content min-h-[500px] p-6 outline-none text-slate-800 text-[15px] leading-[1.85] overflow-y-auto"
              style={{ wordBreak: 'break-word' }} />
          </GlassCard>
        </div>

        {/* ── AI Sidebar (Google Docs style) ── */}
        <div 
          className={`flex-shrink-0 sticky top-4 transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden ${
            aiOpen ? 'w-[340px] opacity-100 ml-4 translate-x-0' : 'w-0 opacity-0 ml-0 translate-x-8'
          }`}
        >
          <div className="w-[340px]">
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(37,99,235,0.12),0_4px_12px_rgba(37,99,235,0.04)] flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 backdrop-blur-md flex items-center justify-center border border-white/80 shadow-[0_4px_12px_rgba(37,99,235,0.06)]">
                    <span className="material-symbols-outlined text-blue-600 text-lg">auto_awesome</span>
                  </div>
                  <span className="text-base font-extrabold text-[#1E3A8A] tracking-tight">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setAiMessages([]); }} className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all" title="Xóa lịch sử">
                    <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
                  </button>
                  <button onClick={() => setAiOpen(false)} className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all" title="Đóng">
                    <span className="material-symbols-outlined text-[17px]">close</span>
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div ref={aiScrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ minHeight: '200px', maxHeight: 'calc(100vh - 380px)' }}>
                {aiMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 border border-blue-100/50">
                      <span className="material-symbols-outlined text-2xl text-blue-400">edit_note</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">Trợ lý viết bài</p>
                    <p className="text-xs text-slate-400 leading-relaxed px-4">Chọn công cụ bên dưới hoặc nhập yêu cầu để AI hỗ trợ soạn thảo văn bản</p>
                  </div>
                )}

                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'user' ? (
                      <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-md bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white text-sm leading-relaxed shadow-md">
                        {m.tool && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-200 mb-0.5"><span className="material-symbols-outlined text-[12px]">build</span>{m.text}</span>}
                        {!m.tool && m.text}
                      </div>
                    ) : (
                      <div className="max-w-[95%] w-full">
                        <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-slate-50/80 border border-slate-100 text-sm">
                          {m.text ? (
                            <div className="prose prose-sm prose-slate max-w-none prose-headings:text-[#1E3A8A] prose-headings:text-base prose-headings:font-bold prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-slate-700 prose-p:my-1.5 prose-code:bg-blue-50 prose-code:text-blue-700 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-strong:text-[#1E3A8A] prose-li:text-[13px] prose-li:text-slate-700 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1 prose-blockquote:border-blue-300 prose-blockquote:text-slate-500 prose-blockquote:text-[13px] prose-pre:text-xs prose-pre:bg-slate-800">
                              <ReactMarkdown>{m.text}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                              Đang xử lý...
                            </div>
                          )}
                        </div>
                        {/* Insert button for AI responses */}
                        {m.text && !aiLoading && i === aiMessages.length - 1 && (
                          <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                            <button onClick={() => insertAiText(m.text)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-all border border-blue-100">
                              <span className="material-symbols-outlined text-[13px]">add_circle</span>Chèn
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(m.text); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100">
                              <span className="material-symbols-outlined text-[13px]">content_copy</span>Copy
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {aiLoading && (
                  <button onClick={() => { if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; } setAiLoading(false); }}
                    className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all">
                    <span className="material-symbols-outlined text-[14px]">stop_circle</span>Dừng
                  </button>
                )}
              </div>

              {/* AI Tool chips */}
              <div className="px-5 py-4 border-t border-white/60">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {aiTools.map(t => (
                    <button key={t.prompt} onClick={() => !aiLoading && runAiTool(t.prompt, t.label)} disabled={aiLoading}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${aiLoading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 hover:shadow-sm'} text-slate-600 bg-white/50 border border-white/80 shadow-[0_2px_6px_rgba(37,99,235,0.04)]`}>
                      <span className="material-symbols-outlined text-[14px]">{t.icon}</span>{t.label}
                    </button>
                  ))}
                </div>

                {/* Free chat input */}
                <div className="flex items-center gap-2 bg-white/50 rounded-2xl border border-white/80 px-4 py-2 shadow-[0_2px_8px_rgba(37,99,235,0.04)]">
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFreeChat(); } }}
                    placeholder="Hỏi AI..."
                    disabled={aiLoading}
                    className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button onClick={sendFreeChat} disabled={aiLoading || !aiInput.trim()}
                    className="w-8 h-8 flex items-center justify-center text-white bg-blue-600 rounded-full disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none hover:bg-blue-700 transition-colors shadow-sm ml-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}