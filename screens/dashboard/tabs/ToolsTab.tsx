import React, { useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle, ToolCard } from '../components/SharedUI';
import { apiSearchUniversities, UniversityResult } from '../../../lib/api';

type ToolSubPage = 'home' | 'university' | 'major' | 'scholarship' | 'extracurricular' | 'testprep' | 'essay' | 'visa';

const toolItems: { id: ToolSubPage; icon: string; grad: string; title: string; desc: string; tags: string[] }[] = [
  { id: 'major',           icon: 'category',          grad: 'from-blue-500 to-blue-600',    title: 'Chọn Chuyên Ngành',                desc: 'AI gợi ý ngành học phù hợp dựa trên sở thích & năng lực',          tags: ['AI', 'AI hỗ trợ'] },
  { id: 'university',      icon: 'school',            grad: 'from-indigo-500 to-indigo-600',title: 'Tìm Trường Đại Học',               desc: 'Tìm kiếm & so sánh trường đại học trên toàn thế giới',              tags: ['AI', 'AI hỗ trợ'] },
  { id: 'scholarship',     icon: 'workspace_premium', grad: 'from-amber-500 to-orange-500', title: 'Tìm Kiếm Học Bổng',                desc: 'Khám phá cơ hội học bổng phù hợp với hồ sơ của bạn',               tags: ['AI', 'AI hỗ trợ'] },
  { id: 'extracurricular', icon: 'groups',            grad: 'from-emerald-500 to-teal-500', title: 'Kế Hoạch Ngoại Khoá',              desc: 'Lên kế hoạch hoạt động ngoại khoá & đánh giá AI',                  tags: ['Lập kế hoạch', 'AI'] },
  { id: 'testprep',        icon: 'quiz',              grad: 'from-rose-500 to-pink-500',    title: 'Chuẩn Bị Bài Kiểm Tra',            desc: 'Luyện thi IELTS, TOEFL, SAT, AP với hỗ trợ AI',                    tags: ['IELTS', 'SAT', 'AP'] },
  { id: 'essay',           icon: 'edit_note',         grad: 'from-violet-500 to-purple-500',title: 'Viết Bài Luận Cá Nhân',            desc: 'AI Coach hỗ trợ viết Personal Statement & Essay',                  tags: ['AI Writing', 'CommonApp'] },
  { id: 'visa',            icon: 'flight_takeoff',    grad: 'from-cyan-500 to-sky-500',     title: 'Nộp Đơn Xin Visa',                 desc: 'Hướng dẫn từng bước quy trình xin visa du học',                    tags: ['Checklist', 'Hướng dẫn'] },
];

/* ── University Detail Modal ── */
function UniversityDetailModal({ 
  university, 
  onClose 
}: { 
  university: UniversityResult; 
  onClose: () => void; 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-4xl">school</span>
                <h2 className="text-2xl font-bold">{university.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">public</span>
                  {university.country}
                </span>
                {university.ranking && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                    #{university.ranking} thế giới
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fields */}
          {university.fields.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-2">Ngành học mạnh</h3>
              <div className="flex flex-wrap gap-2">
                {university.fields.map((field, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Admission Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Yêu cầu tuyển sinh</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {university.gpa_min && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                  <span className="material-symbols-outlined text-2xl text-blue-500 mb-1">school</span>
                  <p className="text-xs text-slate-500">GPA tối thiểu</p>
                  <p className="text-xl font-bold text-[#1E3A8A]">{university.gpa_min}</p>
                </div>
              )}
              {university.sat_min && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                  <span className="material-symbols-outlined text-2xl text-blue-500 mb-1">grade</span>
                  <p className="text-xs text-slate-500">SAT tối thiểu</p>
                  <p className="text-xl font-bold text-[#1E3A8A]">{university.sat_min}</p>
                </div>
              )}
              {university.ielts_min && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
                  <span className="material-symbols-outlined text-2xl text-blue-500 mb-1">translate</span>
                  <p className="text-xs text-slate-500">IELTS tối thiểu</p>
                  <p className="text-xl font-bold text-[#1E3A8A]">{university.ielts_min}</p>
                </div>
              )}
              {university.acceptance_rate && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-center">
                  <span className="material-symbols-outlined text-2xl text-amber-500 mb-1">how_to_reg</span>
                  <p className="text-xs text-slate-500">Tỷ lệ chấp nhận</p>
                  <p className="text-xl font-bold text-[#1E3A8A]">{university.acceptance_rate}%</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Cost */}
          {university.tuition_usd && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Học phí & Tài chính</h3>
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Học phí/năm</p>
                    <p className="text-3xl font-bold text-green-600">${university.tuition_usd.toLocaleString()}</p>
                  </div>
                  {university.scholarships && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                      <span className="material-symbols-outlined text-green-600">workspace_premium</span>
                      <span className="font-semibold text-green-700">Có học bổng</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {university.website && (
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Website trường
              </a>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── University Search Component ── */
function UniversitySearch({ userData }: { userData: UserData }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [field, setField] = useState('');
  const [results, setResults] = useState<UniversityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedUni, setSelectedUni] = useState<UniversityResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const response = await apiSearchUniversities({
        query: query,
        country: country || undefined,
        field: field || undefined,
        max_results: 10,
      });
      setResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <GlassCard>
        <GlassHeader icon="school" title="Tìm kiếm trường đại học" />
        <div className="space-y-4 relative z-10">
          {/* Main Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tên trường, quốc gia... (VD: MIT, Stanford, Singapore)"
              className={`${glass.input} pl-11 !h-12`}
            />
          </div>
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">public</span>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Quốc gia (VD: USA, UK, Singapore)"
                className={`${glass.input} pl-10 !h-11 !text-sm`}
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">science</span>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="Ngành học (VD: Computer Science)"
                className={`${glass.input} pl-10 !h-11 !text-sm`}
              />
            </div>
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                Đang tìm kiếm...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">search</span>
                Tìm kiếm trường đại học
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <GlassCard>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-6xl text-slate-300">school</span>
            <p className="mt-4 text-slate-500 font-medium">Không tìm thấy trường phù hợp.</p>
            <p className="text-sm text-slate-400">Thử thay đổi từ khóa tìm kiếm.</p>
          </div>
        </GlassCard>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-500">Tìm thấy {results.length} trường phù hợp:</p>
          {results.map((uni, idx) => (
            <GlassCard 
              key={idx}
              className={`${uni.source === 'static' ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
              onClick={() => uni.source === 'static' && setSelectedUni(uni)}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-[#1E3A8A] text-lg">{uni.name}</h3>
                      {uni.ranking && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                          #{uni.ranking}
                        </span>
                      )}
                      {/* Source Badge */}
                      {uni.source === 'static' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          Static DB
                        </span>
                      )}
                      {uni.source === 'openalex' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">cloud</span>
                          OpenAlex
                        </span>
                      )}
                      {uni.source === 'ror' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">account_tree</span>
                          ROR
                        </span>
                      )}
                      {uni.source === 'hipo' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">school</span>
                          Hipo
                        </span>
                      )}
                      {uni.source === 'tavily' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">search</span>
                          Tavily
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">public</span>
                        {uni.country}
                      </span>
                      {uni.scholarships && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">workspace_premium</span>
                          Có học bổng
                        </span>
                      )}
                    </div>
                    
                    {uni.fields.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {uni.fields.slice(0, 4).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Requirements Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                      {uni.gpa_min && (
                        <div className="p-2 rounded-lg bg-white/50 text-center">
                          <p className="text-xs text-slate-400">GPA tối thiểu</p>
                          <p className="font-bold text-[#1E3A8A]">{uni.gpa_min}</p>
                        </div>
                      )}
                      {uni.sat_min && (
                        <div className="p-2 rounded-lg bg-white/50 text-center">
                          <p className="text-xs text-slate-400">SAT tối thiểu</p>
                          <p className="font-bold text-[#1E3A8A]">{uni.sat_min}</p>
                        </div>
                      )}
                      {uni.ielts_min && (
                        <div className="p-2 rounded-lg bg-white/50 text-center">
                          <p className="text-xs text-slate-400">IELTS tối thiểu</p>
                          <p className="font-bold text-[#1E3A8A]">{uni.ielts_min}</p>
                        </div>
                      )}
                      {uni.tuition_usd && (
                        <div className="p-2 rounded-lg bg-white/50 text-center">
                          <p className="text-xs text-slate-400">Học phí/năm</p>
                          <p className="font-bold text-[#1E3A8A]">${uni.tuition_usd.toLocaleString()}</p>
                        </div>
                      )}
                      {uni.acceptance_rate && (
                        <div className="p-2 rounded-lg bg-white/50 text-center">
                          <p className="text-xs text-slate-400">Tỷ lệ chấp nhận</p>
                          <p className="font-bold text-[#1E3A8A]">{uni.acceptance_rate}%</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Click hint for static DB */}
                    {uni.source === 'static' && (
                      <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">touch_app</span>
                        Bấm để xem chi tiết
                      </p>
                    )}
                  </div>
                  
                  {uni.website && (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white hover:shadow-lg hover:scale-105 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      
      {/* University Detail Modal */}
      {selectedUni && (
        <UniversityDetailModal 
          university={selectedUni} 
          onClose={() => setSelectedUni(null)} 
        />
      )}
    </div>
  );
}

/* ── Generic AI Chat Mode ── */
function AIGenericMode({ item, userData }: { item: typeof toolItems[0]; userData: UserData }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai'; text: string}[]>([]);

  return (
    <GlassCard>
      <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-violet-200/20" />
      <GlassHeader icon="auto_awesome" title="AI Hỗ trợ tìm kiếm" />
      <div className="relative z-10 space-y-4">
        {/* Chat History */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {chatHistory.length === 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-white/60">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-white text-base">smart_toy</span>
                </div>
                <div>
                  <p className="font-bold text-[#1E3A8A] text-sm mb-1">AI Study Coach</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Xin chào {userData.name?.split(' ').pop()}! Mình là AI Study Coach của nextSTEM. Hãy cho mình biết bạn đang quan tâm đến điều gì, mình sẽ giúp bạn tìm kiếm và gợi ý phù hợp nhất nhé! 🎓
                  </p>
                </div>
              </div>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-50 ml-8' : 'bg-slate-50 mr-8'}`}>
              <p className="text-sm text-slate-700">{msg.text}</p>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">send</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && message.trim() && setChatHistory([...chatHistory, {role: 'user', text: message}])}
              placeholder={`Hỏi AI về ${item.title.toLowerCase()}...`}
              className={`${glass.input} pl-11 !h-12`}
            />
          </div>
          <button
            onClick={() => message.trim() && setChatHistory([...chatHistory, {role: 'user', text: message}])}
            className="px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
      </GlassCard>
  );
}

/* ── Tool Detail ── */
function ToolDetail({ item, onBack, userData }: { item: typeof toolItems[0]; onBack: () => void; userData: UserData }) {
  const [mode, setMode] = useState<'guide' | 'ai'>('ai');

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all mb-4">
        <span className="material-symbols-outlined text-lg">arrow_back</span>Quay lại
      </button>
      <PageTitle icon={item.icon} title={item.title} subtitle={item.desc} />

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-8 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 w-fit">
        {([['guide', 'menu_book', 'Hướng dẫn'], ['ai', 'auto_awesome', 'AI Hỗ trợ']] as const).map(([id, ic, label]) => (
          mode === id ? (
            <GlassSurface
              key={id}
              width="auto"
              height={42}
              borderRadius={12}
              className="cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={() => setMode(id)}
            >
              <span className="text-white text-sm font-semibold px-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">{ic}</span>{label}
              </span>
            </GlassSurface>
          ) : (
            <button key={id} onClick={() => setMode(id as 'guide' | 'ai')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:text-[#1E3A8A] hover:bg-white/50">
              <span className="material-symbols-outlined text-lg">{ic}</span>{label}
            </button>
          )
        ))}
      </div>

      {/* Content */}
      {mode === 'guide' && (
        <GlassCard>
          <GlassHeader icon="menu_book" title="Hướng dẫn sử dụng" />
          <div className="space-y-4 relative z-10">
            {[
              { step: '01', title: 'Tìm hiểu yêu cầu', desc: 'Đọc qua các tiêu chí và điều kiện cần thiết cho mục tiêu của bạn.' },
              { step: '02', title: 'Sử dụng AI để tìm kiếm', desc: 'Chuyển sang tab "AI Hỗ trợ" để nhận gợi ý cá nhân hoá từ AI Coach.' },
              { step: '03', title: 'Làm bài trắc nghiệm', desc: 'Hoàn thành bài trắc nghiệm để AI hiểu rõ hơn về nhu cầu của bạn.' },
              { step: '04', title: 'Xem kết quả & lưu lại', desc: 'Xem kết quả gợi ý và lưu vào Portfolio của bạn.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">{s.step}</div>
                <div>
                  <h4 className="font-bold text-[#1E3A8A] mb-0.5">{s.title}</h4>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {mode === 'ai' && (
        item.id === 'university' ? (
          <UniversitySearch userData={userData} />
        ) : (
          <AIGenericMode item={item} userData={userData} />
        )
      )}
    </>
  );
}

/* ── Main ToolsTab ── */
export default function ToolsTab({ userData }: { userData: UserData }) {
  const [sub, setSub] = useState<ToolSubPage>('home');

  if (sub !== 'home') {
    const item = toolItems.find(t => t.id === sub)!;
    return <ToolDetail item={item} onBack={() => setSub('home')} userData={userData} />;
  }

  return (
    <>
      <PageTitle icon="build" title="Bộ Công Cụ Ứng Dụng" subtitle="7 công cụ AI hỗ trợ toàn diện cho hành trình du học" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {toolItems.map(t => (
          <ToolCard key={t.id} icon={t.icon} iconGrad={t.grad} title={t.title} desc={t.desc} tags={t.tags} onClick={() => setSub(t.id)} />
        ))}
      </div>
    </>
  );
}

