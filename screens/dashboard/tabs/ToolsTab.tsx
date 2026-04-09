import React, { useEffect, useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle, ToolCard } from '../components/SharedUI';
import {
  apiSearchCareersStream,
  apiSearchScholarshipsStream,
  apiSearchUniversities,
  MajorRecommendation,
  ScholarshipRecommendation,
  UniversityResult,
} from '../../../lib/api';

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

type SavedMajorSearch = {
  id: string;
  createdAt: string;
  query: string;
  grade?: string;
  careerGoal?: string;
  recommendations: MajorRecommendation[];
};

type SavedScholarshipSearch = {
  id: string;
  createdAt: string;
  query: string;
  targetCountry?: string;
  targetMajor?: string;
  recommendations: ScholarshipRecommendation[];
};

function getMajorHistoryKey(userId?: string) {
  return `nextstem_major_history_${userId || 'guest'}`;
}

function loadSavedMajorSearches(userId?: string): SavedMajorSearch[] {
  try {
    const key = getMajorHistoryKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as SavedMajorSearch[];
  } catch {
    return [];
  }
}

function persistSavedMajorSearches(userId: string | undefined, items: SavedMajorSearch[]) {
  const key = getMajorHistoryKey(userId);
  localStorage.setItem(key, JSON.stringify(items));
}

function getScholarshipHistoryKey(userId?: string) {
  return `nextstem_scholarship_history_${userId || 'guest'}`;
}

function loadSavedScholarshipSearches(userId?: string): SavedScholarshipSearch[] {
  try {
    const key = getScholarshipHistoryKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as SavedScholarshipSearch[];
  } catch {
    return [];
  }
}

function persistSavedScholarshipSearches(userId: string | undefined, items: SavedScholarshipSearch[]) {
  const key = getScholarshipHistoryKey(userId);
  localStorage.setItem(key, JSON.stringify(items));
}

/* ── Major Search Component ── */
function MajorSearch({ userData }: { userData: UserData }) {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [strengths, setStrengths] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [studyPreference, setStudyPreference] = useState('du_hoc');
  const [learningStyle, setLearningStyle] = useState('ung_dung');
  const [budgetPreference, setBudgetPreference] = useState('trung_binh');
  const [results, setResults] = useState<MajorRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressMessage, setProgressMessage] = useState('Đang chuẩn bị xử lý yêu cầu...');
  const [streamPreview, setStreamPreview] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedMajorSearch[]>(() => loadSavedMajorSearches(userData.id));
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const fallbackMessages = [
      'Đang phân tích hồ sơ học sinh...',
      'Đang đối chiếu sở thích và năng lực...',
      'Đang xây dựng mức độ phù hợp cho từng ngành...',
      'Đang tạo lộ trình học tập gợi ý...',
    ];
    let idx = 0;
    const timer = window.setInterval(() => {
      idx = (idx + 1) % fallbackMessages.length;
      setProgressMessage((prev) => prev || fallbackMessages[idx]);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [loading]);

  const fitColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-slate-500 to-slate-600';
  };

  const fitLabel = (level: string) => {
    if (level === 'cao') return 'Phù hợp cao';
    if (level === 'trung binh') return 'Phù hợp trung bình';
    return 'Cần cân nhắc';
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMessage('');
    setProgressMessage('Đang phân tích hồ sơ học sinh...');
    setStreamPreview('');
    try {
      const final = await apiSearchCareersStream({
        query,
        grade: grade || undefined,
        age: age ? Number(age) : undefined,
        interests: interests || undefined,
        strengths: strengths || undefined,
        career_goal: careerGoal || undefined,
        study_preference: studyPreference,
        learning_style: learningStyle,
        budget_preference: budgetPreference,
        max_results: 6,
      }, {
        onProgress: (message) => setProgressMessage(message),
        onTextDelta: (delta) => {
          setStreamPreview((prev) => (prev + delta).slice(-1200));
        },
        onFinalResult: (result) => {
          setResults(result.recommendations || []);
          setProgressMessage('Đã hoàn thành phân tích.');
        },
        onError: (message) => {
          setErrorMessage(message);
        },
      });
      if (!final) {
        setResults([]);
      }
    } catch (error) {
      console.error('Career search error:', error);
      setResults([]);
      const message = error instanceof Error ? error.message : 'Không thể kết nối dịch vụ AI.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentResult = () => {
    if (results.length === 0 || !query.trim()) return;

    const record: SavedMajorSearch = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      query: query.trim(),
      grade: grade || undefined,
      careerGoal: careerGoal || undefined,
      recommendations: results,
    };

    const next = [record, ...savedSearches].slice(0, 20);
    setSavedSearches(next);
    persistSavedMajorSearches(userData.id, next);
    setSelectedSavedId(record.id);
  };

  const handleDeleteSaved = (id: string) => {
    const next = savedSearches.filter((item) => item.id !== id);
    setSavedSearches(next);
    persistSavedMajorSearches(userData.id, next);
    if (selectedSavedId === id) setSelectedSavedId(null);
  };

  const selectedSaved = savedSearches.find((item) => item.id === selectedSavedId) || null;

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassHeader icon="category" title={`Gợi ý chuyên ngành cho ${userData.name || 'bạn'}`} />
        <div className="space-y-4 relative z-10">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">explore</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mục tiêu học tập hoặc ngành bạn đang quan tâm"
              className={`${glass.input} pl-11 !h-12`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Lớp hiện tại (VD: 11)"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Độ tuổi"
              className={`${glass.input} !h-11 !text-sm`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Sở thích (cách nhau bằng dấu phẩy) - VD: Toán, Công nghệ, Sinh học"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Điểm mạnh/Kỹ năng (dấu phẩy) - VD: Logic, Làm việc nhóm, Viết lách"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="Nghề nghiệp định hướng (VD: Kỹ sư phần mềm, Data Scientist)"
              className={`${glass.input} !h-11 !text-sm`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={studyPreference}
              onChange={(e) => setStudyPreference(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="du_hoc">Ưu tiên du học</option>
              <option value="trong_nuoc">Ưu tiên trong nước</option>
              <option value="linh_hoat">Linh hoạt</option>
            </select>

            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="ung_dung">Thiên ứng dụng</option>
              <option value="nghien_cuu">Thiên nghiên cứu</option>
              <option value="can_bang">Cân bằng</option>
            </select>

            <select
              value={budgetPreference}
              onChange={(e) => setBudgetPreference(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="thap">Tài chính thấp</option>
              <option value="trung_binh">Tài chính trung bình</option>
              <option value="cao">Tài chính cao</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                Đang phân tích hồ sơ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">psychology</span>
                Gợi ý chuyên ngành phù hợp
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {!loading && searched && results.length === 0 && (
        <GlassCard>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-6xl text-slate-300">sentiment_dissatisfied</span>
            <p className="mt-4 text-slate-500 font-medium">Chưa tìm thấy chuyên ngành phù hợp.</p>
            <p className="text-sm text-slate-400">{errorMessage || 'Bạn hãy mô tả rõ hơn mục tiêu hoặc sở thích để AI gợi ý chính xác hơn.'}</p>
          </div>
        </GlassCard>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Top {results.length} chuyên ngành đề xuất:</p>
            <button
              onClick={handleSaveCurrentResult}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">bookmark_add</span>
              Lưu kết quả này
            </button>
          </div>
          {results.map((item, idx) => (
            <GlassCard key={`${item.major_name}-${idx}`}>
              <div className="space-y-4 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-[#1E3A8A] text-lg">{item.major_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${fitColor(item.fit_score)}`}>
                    {fitLabel(item.fit_level)} - {item.fit_score}/100
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${fitColor(item.fit_score)}`}
                    style={{ width: `${Math.max(8, Math.min(100, item.fit_score))}%` }}
                  />
                </div>

                {item.why_fit.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-2">Vì sao phù hợp</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {item.why_fit.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/70">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Kỹ năng cần có</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.required_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg text-xs bg-white text-slate-700 border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Kỹ năng cần cải thiện</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skill_gaps.length > 0 ? item.skill_gaps.map((gap, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg text-xs bg-white text-slate-700 border border-amber-100">
                          {gap}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-500">Hồ sơ hiện tại đã khá phù hợp với ngành này.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50/70">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Nhóm nghề nghiệp liên quan</p>
                    <div className="space-y-1">
                      {item.related_careers.slice(0, 4).map((career, i) => (
                        <p key={i} className="text-sm text-slate-700">- {career}</p>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Lộ trình học tập sơ bộ</p>
                    <p className="text-sm text-slate-700">{item.roadmap_hint || 'Bắt đầu từ môn nền tảng, kết hợp dự án thực hành và định hướng nghề cụ thể.'}</p>
                    {item.growth_outlook && (
                      <p className="text-xs text-emerald-700 font-medium mt-2">Triển vọng tăng trưởng: {item.growth_outlook}</p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {loading && (
        <GlassCard>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="animate-spin material-symbols-outlined text-blue-600">progress_activity</span>
              <p className="font-semibold text-[#1E3A8A]">{progressMessage}</p>
            </div>

            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${streamPreview.length > 0 ? 85 : 55}%` }}
              />
            </div>

            {streamPreview && (
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Nội dung AI đang tạo (streaming):</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{streamPreview}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 animate-pulse">
                  <div className="h-4 w-2/3 rounded bg-slate-200 mb-2" />
                  <div className="h-3 w-full rounded bg-slate-200 mb-1.5" />
                  <div className="h-3 w-4/5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {savedSearches.length > 0 && (
        <GlassCard>
          <GlassHeader icon="history" title="Lịch sử đã lưu" />
          <div className="space-y-3 relative z-10">
            {savedSearches.map((saved) => (
              <div key={saved.id} className="p-3 rounded-xl border border-white/60 bg-white/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    onClick={() => setSelectedSavedId(saved.id)}
                    className="text-left flex-1"
                  >
                    <p className="font-semibold text-[#1E3A8A]">{saved.query}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(saved.createdAt).toLocaleString('vi-VN')} - {saved.recommendations.length} chuyên ngành
                    </p>
                    {saved.careerGoal && (
                      <p className="text-xs text-slate-500">Mục tiêu nghề nghiệp: {saved.careerGoal}</p>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSaved(saved.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {selectedSaved && (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <p className="font-semibold text-[#1E3A8A] mb-2">Xem nhanh kết quả đã lưu: {selectedSaved.query}</p>
                <div className="space-y-2">
                  {selectedSaved.recommendations.slice(0, 3).map((item, idx) => (
                    <div key={`${selectedSaved.id}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{item.major_name}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${fitColor(item.fit_score)}`}>
                        {item.fit_score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

/* ── Scholarship Search Component ── */
function ScholarshipSearch({ userData }: { userData: UserData }) {
  const [query, setQuery] = useState('');
  const [gpa, setGpa] = useState('');
  const [englishExam, setEnglishExam] = useState('IELTS');
  const [englishScore, setEnglishScore] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [targetSchool, setTargetSchool] = useState('');
  const [extracurriculars, setExtracurriculars] = useState('');
  const [stemProjects, setStemProjects] = useState('');
  const [awards, setAwards] = useState('');
  const [financialNeed, setFinancialNeed] = useState('cần hỗ trợ cao');
  const [supportPreference, setSupportPreference] = useState('toàn phần');
  const [studyLevel, setStudyLevel] = useState('cử nhân');
  const [results, setResults] = useState<ScholarshipRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressMessage, setProgressMessage] = useState('Đang chuẩn bị phân tích học bổng...');
  const [streamPreview, setStreamPreview] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedScholarshipSearch[]>(() => loadSavedScholarshipSearches(userData.id));
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState('');

  const selectedSaved = savedSearches.find((x) => x.id === selectedSavedId) || null;

  const buildScholarshipSignature = (searchQuery: string, recs: ScholarshipRecommendation[]) => {
    const topNames = recs.slice(0, 3).map((x) => x.scholarship_name.trim().toLowerCase()).join('|');
    return `${searchQuery.trim().toLowerCase()}::${topNames}`;
  };

  useEffect(() => {
    if (!loading) return;
    const fallbackMessages = [
      'Đang phân tích hồ sơ học bổng...',
      'Đang đối chiếu điều kiện ứng tuyển và mức hỗ trợ...',
      'Đang xây dựng mức độ phù hợp cho từng học bổng...',
      'Đang tạo gợi ý cải thiện hồ sơ...',
    ];
    let idx = 0;
    const timer = window.setInterval(() => {
      idx = (idx + 1) % fallbackMessages.length;
      setProgressMessage((prev) => prev || fallbackMessages[idx]);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [loading]);

  const fitColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-slate-500 to-slate-600';
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setErrorMessage('');
    setProgressMessage('Đang phân tích hồ sơ học bổng...');
    setStreamPreview('');
    try {
      const final = await apiSearchScholarshipsStream({
        query,
        gpa: gpa ? Number(gpa) : undefined,
        english_exam: englishExam || undefined,
        english_score: englishScore ? Number(englishScore) : undefined,
        target_major: targetMajor || undefined,
        target_country: targetCountry || undefined,
        target_school: targetSchool || undefined,
        extracurriculars: extracurriculars || undefined,
        stem_projects: stemProjects || undefined,
        awards: awards || undefined,
        financial_need: financialNeed || undefined,
        support_preference: supportPreference || undefined,
        study_level: studyLevel || undefined,
        max_results: 6,
      }, {
        onProgress: (message) => setProgressMessage(message),
        onTextDelta: (delta) => setStreamPreview((prev) => (prev + delta).slice(-1200)),
        onFinalResult: (result) => {
          const recs = result.recommendations || [];
          setResults(recs);
          setProgressMessage('Đã hoàn thành phân tích học bổng.');

          if (query.trim() && recs.length > 0) {
            const incomingSignature = buildScholarshipSignature(query, recs);
            const record: SavedScholarshipSearch = {
              id: `${Date.now()}`,
              createdAt: new Date().toISOString(),
              query: query.trim(),
              targetCountry: targetCountry || undefined,
              targetMajor: targetMajor || undefined,
              recommendations: recs,
            };
            setSavedSearches((prev) => {
              const latest = prev[0];
              if (latest) {
                const latestSignature = buildScholarshipSignature(latest.query, latest.recommendations);
                if (latestSignature === incomingSignature) {
                  setSaveNotice('Kết quả này đã có trong lịch sử gần nhất.');
                  setSelectedSavedId(latest.id);
                  return prev;
                }
              }
              const next = [record, ...prev].slice(0, 20);
              persistSavedScholarshipSearches(userData.id, next);
              setSaveNotice('Đã tự động lưu kết quả học bổng mới.');
              return next;
            });
            setSelectedSavedId(record.id);
          }
        },
        onError: (message) => setErrorMessage(message),
      });
      if (!final) setResults([]);
    } catch (error) {
      setResults([]);
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tìm học bổng lúc này.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentResult = () => {
    if (!query.trim() || results.length === 0) return;

    const incomingSignature = buildScholarshipSignature(query, results);
    if (savedSearches.length > 0) {
      const latest = savedSearches[0];
      const latestSignature = buildScholarshipSignature(latest.query, latest.recommendations);
      if (latestSignature === incomingSignature) {
        setSaveNotice('Kết quả hiện tại đã được lưu trước đó rồi.');
        setSelectedSavedId(latest.id);
        return;
      }
    }

    const record: SavedScholarshipSearch = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      query: query.trim(),
      targetCountry: targetCountry || undefined,
      targetMajor: targetMajor || undefined,
      recommendations: results,
    };
    const next = [record, ...savedSearches].slice(0, 20);
    setSavedSearches(next);
    persistSavedScholarshipSearches(userData.id, next);
    setSelectedSavedId(record.id);
    setSaveNotice('Đã lưu kết quả vào lịch sử thành công.');
  };

  const handleDeleteSaved = (id: string) => {
    const next = savedSearches.filter((item) => item.id !== id);
    setSavedSearches(next);
    persistSavedScholarshipSearches(userData.id, next);
    if (selectedSavedId === id) setSelectedSavedId(null);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassHeader icon="workspace_premium" title="Tìm kiếm học bổng phù hợp" />
        <div className="space-y-4 relative z-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mô tả mục tiêu học bổng của bạn (VD: học bổng STEM toàn phần tại Singapore)"
            className={`${glass.input} !h-12`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="number"
              step="0.1"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="GPA hiện tại"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <select
              value={englishExam}
              onChange={(e) => setEnglishExam(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
              <option value="SAT">SAT</option>
              <option value="ACT">ACT</option>
              <option value="Khác">Khác</option>
            </select>
            <input
              type="number"
              step="0.1"
              value={englishScore}
              onChange={(e) => setEnglishScore(e.target.value)}
              placeholder="Điểm chứng chỉ"
              className={`${glass.input} !h-11 !text-sm`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={targetMajor}
              onChange={(e) => setTargetMajor(e.target.value)}
              placeholder="Ngành dự định"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              placeholder="Quốc gia mục tiêu"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              placeholder="Trường mục tiêu (nếu có)"
              className={`${glass.input} !h-11 !text-sm`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={extracurriculars}
              onChange={(e) => setExtracurriculars(e.target.value)}
              placeholder="Hoạt động ngoại khóa"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={stemProjects}
              onChange={(e) => setStemProjects(e.target.value)}
              placeholder="Dự án STEM"
              className={`${glass.input} !h-11 !text-sm`}
            />
            <input
              type="text"
              value={awards}
              onChange={(e) => setAwards(e.target.value)}
              placeholder="Giải thưởng"
              className={`${glass.input} !h-11 !text-sm sm:col-span-2`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={financialNeed}
              onChange={(e) => setFinancialNeed(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="cần hỗ trợ cao">Cần hỗ trợ cao</option>
              <option value="cần hỗ trợ trung bình">Cần hỗ trợ trung bình</option>
              <option value="có thể tự chi trả một phần">Có thể tự chi trả một phần</option>
            </select>
            <select
              value={supportPreference}
              onChange={(e) => setSupportPreference(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="toàn phần">Toàn phần</option>
              <option value="bán phần">Bán phần</option>
              <option value="một phần">Một phần</option>
            </select>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value)}
              className={`${glass.input} !h-11 !text-sm`}
            >
              <option value="THPT hè">THPT hè</option>
              <option value="dự bị đại học">Dự bị đại học</option>
              <option value="cử nhân">Cử nhân</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                Đang phân tích hồ sơ học bổng...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">workspace_premium</span>
                Tìm học bổng phù hợp
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {!loading && searched && results.length === 0 && (
        <GlassCard>
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-6xl text-slate-300">workspace_premium</span>
            <p className="mt-4 text-slate-500 font-medium">Chưa có học bổng phù hợp với hồ sơ hiện tại.</p>
            <p className="text-sm text-slate-400">{errorMessage || 'Bạn hãy thêm thành tích và mục tiêu cụ thể hơn để AI gợi ý tốt hơn.'}</p>
          </div>
        </GlassCard>
      )}

      {loading && (
        <GlassCard>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className="animate-spin material-symbols-outlined text-amber-600">progress_activity</span>
              <p className="font-semibold text-[#1E3A8A]">{progressMessage}</p>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${streamPreview.length > 0 ? 85 : 55}%` }}
              />
            </div>
            {streamPreview && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Nội dung AI đang tạo (streaming):</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{streamPreview}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">Top {results.length} học bổng đề xuất:</p>
            <button
              onClick={handleSaveCurrentResult}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">bookmark_add</span>
              Lưu kết quả này
            </button>
          </div>
          {saveNotice && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700">
              {saveNotice}
            </div>
          )}
          {results.map((item, idx) => (
            <GlassCard key={`${item.scholarship_name}-${idx}`}>
              <div className="space-y-4 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-[#1E3A8A] text-lg">{item.scholarship_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${fitColor(item.fit_score)}`}>
                    {item.fit_level} - {item.fit_score}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/70">
                    <p className="text-xs text-slate-500">Quốc gia</p>
                    <p className="font-semibold text-[#1E3A8A]">{item.country || 'Đa quốc gia'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50/70">
                    <p className="text-xs text-slate-500">Giá trị học bổng</p>
                    <p className="font-semibold text-[#1E3A8A]">{item.support_value || item.support_type || 'Đang cập nhật'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/70">
                    <p className="text-xs text-slate-500">Hạn nộp hồ sơ</p>
                    <p className="font-semibold text-[#1E3A8A]">{item.deadline || 'Cần kiểm tra trang chính thức'}</p>
                  </div>
                </div>

                {item.main_requirements.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-2">Điều kiện ứng tuyển chính</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.main_requirements.map((req, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg text-xs bg-white text-slate-700 border border-slate-200">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.why_fit.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-2">Vì sao phù hợp</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {item.why_fit.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.profile_improvements.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-50/70">
                    <p className="text-sm font-semibold text-slate-500 mb-2">Gợi ý cải thiện hồ sơ</p>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {item.profile_improvements.map((tip, i) => (
                        <li key={i}>- {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    Trang thông tin học bổng
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {savedSearches.length > 0 && (
        <GlassCard>
          <GlassHeader icon="history" title="Lịch sử học bổng đã lưu" />
          <div className="space-y-3 relative z-10">
            {savedSearches.map((saved) => (
              <div key={saved.id} className="p-3 rounded-xl border border-white/60 bg-white/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button onClick={() => setSelectedSavedId(saved.id)} className="text-left flex-1">
                    <p className="font-semibold text-[#1E3A8A]">{saved.query}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(saved.createdAt).toLocaleString('vi-VN')} - {saved.recommendations.length} học bổng
                    </p>
                    {(saved.targetCountry || saved.targetMajor) && (
                      <p className="text-xs text-slate-500">
                        {saved.targetCountry ? `Quốc gia: ${saved.targetCountry}` : ''}
                        {saved.targetCountry && saved.targetMajor ? ' | ' : ''}
                        {saved.targetMajor ? `Ngành: ${saved.targetMajor}` : ''}
                      </p>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSaved(saved.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            {selectedSaved && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="font-semibold text-[#1E3A8A] mb-2">Xem nhanh kết quả đã lưu: {selectedSaved.query}</p>
                <div className="space-y-2">
                  {selectedSaved.recommendations.slice(0, 3).map((item, idx) => (
                    <div key={`${selectedSaved.id}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">{item.scholarship_name}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${fitColor(item.fit_score)}`}>
                        {item.fit_score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

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
        ) : item.id === 'major' ? (
          <MajorSearch userData={userData} />
        ) : item.id === 'scholarship' ? (
          <ScholarshipSearch userData={userData} />
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

