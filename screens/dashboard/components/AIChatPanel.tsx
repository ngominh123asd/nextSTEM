import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import GlassSurface from '../../../components/GlassSurface';
import { streamGemini } from '../../../lib/gemini';
import { getToken } from '../../../lib/api';
import { UserData, TabId } from '../types';

interface ChatMsg { role: 'user' | 'ai'; text: string; time?: string; action?: NavigationAction; }
interface NavigationAction { tabId: TabId; subTab?: string; label: string; confirmed?: boolean; }

/* ── Feature mapping ── */
const FEATURE_MAP: { id: string; keywords: string[]; tabId: TabId; subTab?: string; label: string; description: string }[] = [
  { id: 'roadmap', keywords: ['lộ trình', 'roadmap', 'learning path', 'lên roadmap'], tabId: 'roadmap', label: 'Lộ Trình', description: 'Xem lộ trình học tập cá nhân hóa' },
  { id: 'portfolio', keywords: ['hồ sơ', 'portfolio', 'năng lực', 'profile'], tabId: 'portfolio', label: 'Hồ Sơ Năng Lực', description: 'Quản lý hồ sơ và thành tích' },
  { id: 'portfolio-skills', keywords: ['ma trận kỹ năng', 'skills', 'skill matrix', 'kỹ năng'], tabId: 'portfolio', subTab: 'skills', label: 'Ma trận Kỹ năng', description: 'Xem đánh giá kỹ năng' },
  { id: 'portfolio-certs', keywords: ['chứng chỉ', 'certificates', 'cert'], tabId: 'portfolio', subTab: 'certs', label: 'Chứng chỉ', description: 'Xem danh sách chứng chỉ' },
  { id: 'portfolio-timeline', keywords: ['timeline', 'dòng thời gian', 'hoạt động gần'], tabId: 'portfolio', subTab: 'timeline', label: 'Timeline', description: 'Xem timeline hoạt động' },
  { id: 'tools', keywords: ['công cụ', 'bộ công cụ', 'tools'], tabId: 'tools', label: 'Bộ Công Cụ', description: '7 công cụ AI hỗ trợ du học' },
  { id: 'ai-advisor', keywords: ['ai advisor', 'tư vấn', 'advisor', 'tư vấn ai'], tabId: 'ai-advisor', label: 'AI Advisor', description: 'Tư vấn AI chuyên sâu' },
  { id: 'editor', keywords: ['editor', 'soạn văn', 'viết bài', 'academic editor', 'soạn thảo'], tabId: 'editor', label: 'Academic Editor', description: 'Soạn thảo văn bài luận với AI' },
  { id: 'resources', keywords: ['tài nguyên', 'tài liệu', 'resources', 'thư viện'], tabId: 'resources', label: 'Tài Nguyên', description: 'Thư viện tài liệu học tập' },
  { id: 'resources-scholarships', keywords: ['học bổng', 'scholarship', 'scholarships', 'danh sách học bổng'], tabId: 'resources', subTab: 'scholarships', label: 'Danh sách Học bổng', description: 'Khám phá và tìm kiếm các học bổng' },
  { id: 'resources-universities', keywords: ['trường đại học', 'trường', 'đại học', 'university', 'universities', 'danh sách trường', 'các trường'], tabId: 'resources', subTab: 'universities', label: 'Trường Đại học', description: 'Xem và tìm kiếm các trường đại học' },
  { id: 'resources-guides', keywords: ['cẩm nang', 'hướng dẫn du học', 'guide', 'guides', 'cẩm nang du học'], tabId: 'resources', subTab: 'guides', label: 'Cẩm nang Du học', description: 'Đọc cẩm nang và kinh nghiệm du học' },
  { id: 'resources-aiguide', keywords: ['hướng dẫn dùng ai', 'hướng dẫn ai', 'cách dùng ai', 'tài liệu ai', 'hướng dẫn sử dụng ai'], tabId: 'resources', subTab: 'ai-guide', label: 'Hướng dẫn dùng AI', description: 'Xem hướng dẫn cách sử dụng trợ lý AI' },
  { id: 'settings', keywords: ['cài đặt', 'settings', 'thiết lập'], tabId: 'settings', label: 'Cài Đặt', description: 'Cài đặt tài khoản' },
  { id: 'dashboard', keywords: ['dashboard', 'trang chủ', 'home'], tabId: 'dashboard', label: 'Dashboard', description: 'Trang chủ tổng quan' },
];

function detectNavigation(text: string): { tabId: TabId; subTab?: string; label: string } | null {
  const lower = text.toLowerCase();
  // Check for navigation intent keywords
  const navIntents = ['vào', 'mở', 'đi tới', 'chuyển sang', 'đến', 'xem', 'navigate', 'go to', 'open'];
  const hasNavIntent = navIntents.some(k => lower.includes(k));
  if (!hasNavIntent) return null;

  for (const feat of FEATURE_MAP) {
    if (feat.keywords.some(kw => lower.includes(kw))) {
      return { tabId: feat.tabId, subTab: feat.subTab, label: feat.label };
    }
  }
  return null;
}

/* ── Build system instruction with user context ── */
function buildSystemInstruction(userName: string, userData: UserData): string {
  const featureList = FEATURE_MAP.map(f => `- "${f.label}" (${f.description})`).join('\n');

  return `Bạn là AI Study Coach của nextSTEM — trợ lý học tập thông minh, thân thiện.

THÔNG TIN NGƯỜI DÙNG:
- Tên: ${userName}
- Lớp: ${userData.grade}
- Trường: ${userData.school}
- Mục tiêu: ${userData.goals.join(', ') || 'Chưa chọn'}
- Sở thích: ${userData.interests.join(', ') || 'Chưa chọn'}

CÁC TÍNH NĂNG TRÊN WEB:
${featureList}

BỘ LỆNH ĐIỀU HƯỚNG (BẮT BUỘC SỬ DỤNG):
Mỗi khi người dùng yêu cầu mở một trang, HOẶC đồng ý "Có" khi bạn gợi ý chuyển trang, BẠN PHẢI SINH RA MÃ KÍCH HOẠT Ở CUỐI TIN NHẮN: [NAV:id]
Ví dụ nếu bạn đưa người dùng tới học bổng, bạn PHẢI in ra: [NAV:resources-scholarships]

Danh sách id hợp lệ duy nhất:
- roadmap (Lộ Trình)
- portfolio (Hồ Sơ Năng Lực tổng)
- portfolio-skills (Ma trận Kỹ năng)
- resources (Tài Nguyên)
- resources-scholarships (Danh sách Học bổng)
- resources-universities (Danh sách Trường Đại học)
- resources-guides (Cẩm nang du học)
- resources-aiguide (Hướng dẫn dùng AI)
- tools (Bộ công cụ)
- ai-advisor (AI Advisor)
- editor (Soạn thảo / Editor)
- settings (Cài đặt)
- dashboard (Trang chủ)

QUY TẮC:
1. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt
2. Khi người dùng hỏi về thông tin cá nhân, hãy trả lời dựa trên thông tin có sẵn ở trên
3. KHI NGƯỜI DÙNG MỚI HỎI NÊN BẮT ĐẦU TỪ ĐÂU: TUYỆT ĐỐI KHÔNG KHUYÊN HỌ Ở LẠI DASHBOARD. Hãy định hướng rõ ràng theo lộ trình sau:
   - Bước 1: Vào "Hồ Sơ Năng Lực" (Mã mở: [NAV:portfolio]) để lưu trữ thành tích và cập nhật các kỹ năng nền tảng.
   - Bước 2: Xem danh sách học bổng, các trường đại học hoặc tìm hiểu cẩm nang du học ở phần "Tài Nguyên" (Mã mở: [NAV:resources]).
   - Bước 3: Vào "AI Advisor" (Mã mở: [NAV:ai-advisor]) để đặt câu hỏi tư vấn chuyên sâu về ngành nghề.
4. NẾU KHÔNG CÓ THẺ [NAV:id], HỆ THỐNG SẼ BỊ LIỆT. ĐỪNG QUÊN NÓ!
5. Sử dụng emoji phù hợp
6. Nếu không chắc người dùng muốn gì, hãy hỏi lại`;
}

interface Props {
  onClose: () => void;
  userName: string;
  userData: UserData;
  onNavigate: (tab: TabId, subTab?: string) => void;
}

export default function AIChatPanel({ onClose, userName, userData, onNavigate }: Props) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: `Xin chào ${userName?.split(' ').pop()}! 👋\n\nMình là **AI Study Coach** của nextSTEM. Mình có thể giúp bạn:\n\n🧭 **Điều hướng** — "Mở lộ trình" hoặc "Vào Ma trận kỹ năng"\n📊 **Tra cứu** — "Timeline gần nhất" hoặc "Kỹ năng của tôi"\n💡 **Tư vấn** — Hỏi bất kỳ điều gì về du học, học tập\n\nBạn muốn bắt đầu từ đâu?`, time: 'Vừa xong' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  const quickActions = [
    { label: 'Mở Lộ trình', icon: 'map' },
    { label: 'Xem kỹ năng', icon: 'psychology' },
    { label: 'Soạn văn bản', icon: 'edit_document' },
    { label: 'Tư vấn du học', icon: 'school' },
  ];

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const now = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, time: now }]);
    setInput('');

    // Check for navigation intent
    const navTarget = detectNavigation(msg);

    if (!getToken()) {
      // Demo mode with navigation support
      setTimeout(() => {
        const aiTime = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
        if (navTarget) {
          setMessages(prev => [...prev, {
            role: 'ai',
            text: `Mình sẽ đưa bạn đến **${navTarget.label}** ngay nhé! 🚀`,
            time: aiTime,
            action: { tabId: navTarget.tabId, subTab: navTarget.subTab, label: navTarget.label },
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'ai',
            text: `Cảm ơn câu hỏi! Hãy đăng nhập để mình có thể hỗ trợ chi tiết hơn nhé 🎓`,
            time: aiTime,
          }]);
        }
      }, 600);
      return;
    }

    // Use Gemini AI
    setIsLoading(true);
    const aiTime = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'ai', text: '', time: aiTime, action: navTarget ? { tabId: navTarget.tabId, subTab: navTarget.subTab, label: navTarget.label } : undefined }]);

    let full = '';
    const systemInstruction = buildSystemInstruction(userName, userData);

    const historyText = messages
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Người dùng' : 'AI'}: ${m.text}`)
      .join('\n\n');

    const promptSuffix = `\n\n(Lưu ý hệ thống: Nếu bạn đồng ý đưa người dùng tới trang nào đó, BẮT BUỘC chèn lệnh [NAV:id] ở cuối câu. Không được quên!)`;
    const msgToSend = historyText 
      ? `Lịch sử chat gần đây:\n${historyText}\n\nNgười dùng nhắn: ${msg}${promptSuffix}`
      : `${msg}${promptSuffix}`;

    const stream = streamGemini(
      msgToSend,
      (chunk) => {
        full += chunk;
        setMessages(prev => {
          const u = [...prev];
          let cleanText = full;
          let foundAction = u[u.length - 1].action;

          const match = full.match(/\[NAV:\s*([a-zA-Z0-9_-]+)\s*\]/i);
          if (match) {
            cleanText = full.replace(/\[NAV:\s*[a-zA-Z0-9_-]+\s*\]/gi, '').trim();
            const featId = match[1].toLowerCase();
            const feat = FEATURE_MAP.find(f => f.id === featId || f.tabId === featId);
            if (feat && !foundAction) {
              foundAction = { tabId: feat.tabId, subTab: feat.subTab, label: feat.label };
            }
          }

          u[u.length - 1] = { ...u[u.length - 1], text: cleanText, action: foundAction };
          return u;
        });
      },
      () => { setIsLoading(false); abortRef.current = null; },
      () => {
        if (!full) {
          setMessages(prev => {
            const u = [...prev];
            u[u.length - 1] = { ...u[u.length - 1], text: 'Xin lỗi, mình không thể trả lời lúc này. Thử lại nhé!' };
            return u;
          });
        }
        setIsLoading(false);
        abortRef.current = null;
      },
      { systemInstruction },
    );
    abortRef.current = stream;
  };

  const handleNavigate = (action: NavigationAction) => {
    onNavigate(action.tabId, action.subTab);
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
              Gemini AI · Sẵn sàng 24/7
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative z-10">
          <button onClick={() => { setMessages(m => [m[0]]); }} className="p-2 rounded-xl hover:bg-white/15 transition-all" title="Xóa lịch sử">
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
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
            <div className="max-w-[82%]">
              <div className={`p-3.5 text-[13px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-500/20'
                  : 'bg-white/90 backdrop-blur-sm border border-white/80 text-slate-700 rounded-2xl rounded-bl-md shadow-sm'
              }`}>
                {m.role === 'ai' && m.text ? (
                  <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-p:text-[13px] prose-p:leading-relaxed prose-strong:text-[#1E3A8A] prose-li:text-[13px] prose-li:my-0.5 prose-headings:text-[#1E3A8A] prose-headings:text-sm prose-code:text-xs prose-code:bg-blue-50 prose-code:text-blue-700 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                ) : m.role === 'ai' && !m.text ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base animate-spin text-blue-400">progress_activity</span>
                    <span className="text-slate-400 text-xs">Đang suy nghĩ...</span>
                  </div>
                ) : (
                  <span className="whitespace-pre-line">{m.text}</span>
                )}
                <p className={`text-[10px] mt-2 ${m.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>{m.time}</p>
              </div>

              {/* Navigation action button */}
              {m.role === 'ai' && m.action && !m.action.confirmed && m.text && (
                <button
                  onClick={() => {
                    // Mark as confirmed
                    setMessages(prev => prev.map((msg, idx) =>
                      idx === i ? { ...msg, action: { ...msg.action!, confirmed: true } } : msg
                    ));
                    handleNavigate(m.action!);
                  }}
                  className="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md shadow-blue-500/20 w-fit"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Đi tới {m.action.label}
                </button>
              )}
              {m.role === 'ai' && m.action?.confirmed && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Đã chuyển đến {m.action.label}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'ai' && (
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
            disabled={isLoading}
            className="whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 text-slate-600 hover:text-blue-600 hover:border-blue-200/60 hover:bg-blue-50/50 transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm disabled:opacity-50">
            <span className="material-symbols-outlined text-sm text-blue-500">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3.5 border-t border-white/40 bg-white/60">
        <div className="flex gap-2.5 items-center">
          <div className="flex-1 relative">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Nhập câu hỏi hoặc yêu cầu..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-2xl border border-white/80 bg-white/60 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300/50 focus:bg-white/90 transition-all disabled:opacity-50" />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center text-white bg-blue-600 rounded-full disabled:bg-slate-200 disabled:text-slate-400 hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">Powered by Gemini AI · Có thể đưa ra thông tin không chính xác</p>
      </div>
    </div>
  );
}