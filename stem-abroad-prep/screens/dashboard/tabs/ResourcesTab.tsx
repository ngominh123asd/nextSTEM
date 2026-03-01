import React, { useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';
import {
  ScholarshipDetailPopup,
  UniversityDetailPopup,
  type ScholarshipData,
  type UniversityData,
} from '../components/ResourceDetailPopup';

import scholarshipsData from '../../../data/scholarships.json';
import universitiesData from '../../../data/universities.json';

export default function ResourcesTab() {
  const [cat, setCat] = useState<'scholarships' | 'universities' | 'guides' | 'ai-guide'>('scholarships');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipData | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityData | null>(null);

  const categories = [
    { id: 'scholarships' as const, icon: 'workspace_premium', label: 'Danh sách Học bổng', count: scholarshipsData.length },
    { id: 'universities' as const, icon: 'school',            label: 'Trường Đại học',      count: universitiesData.length },
    { id: 'guides' as const,       icon: 'auto_stories',      label: 'Cẩm nang Du học',     count: 32 },
    { id: 'ai-guide' as const,     icon: 'smart_toy',         label: 'Hướng dẫn dùng AI',   count: 12 },
  ];

  const scholarships = scholarshipsData as ScholarshipData[];
  const universities = universitiesData as UniversityData[];

  const guides = [
    { title: 'Cẩm nang Du học Mỹ 2026', icon: '🇺🇸', desc: 'Hướng dẫn toàn diện từ chọn trường đến nộp visa', pages: 45 },
    { title: 'Bí quyết viết Personal Statement', icon: '', desc: 'Cách viết bài luận gây ấn tượng với ban tuyển sinh', pages: 28 },
    { title: 'Gap Year — Nên hay Không?', icon: '', desc: 'Phân tích lợi ích & rủi ro của việc gap year trước khi du học', pages: 15 },
    { title: 'Tổng hợp Học bổng 2026', icon: '', desc: 'Danh sách 100+ học bổng toàn phần cho sinh viên Việt Nam', pages: 60 },
  ];

  return (
    <>
      <PageTitle icon="menu_book" title="Tài Liệu & Tài Nguyên" subtitle="Thư viện hướng dẫn và cơ sở dữ liệu du học" />

      {/* Category Tabs */}
      <div className="flex gap-2 mb-8 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 overflow-x-auto">
        {categories.map(c => (
          cat === c.id ? (
            <GlassSurface
              key={c.id}
              width="auto"
              height={42}
              borderRadius={12}
              className="cursor-pointer flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={() => setCat(c.id)}
            >
              <span className="text-white text-sm font-semibold px-4 flex items-center gap-2 whitespace-nowrap">
                <span className="material-symbols-outlined text-lg">{c.icon}</span>{c.label}
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">{c.count}</span>
              </span>
            </GlassSurface>
          ) : (
            <button key={c.id} onClick={() => setCat(c.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all text-slate-500 hover:text-[#1E3A8A] hover:bg-white/50">
              <span className="material-symbols-outlined text-lg">{c.icon}</span>{c.label}
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/60">{c.count}</span>
            </button>
          )
        ))}
      </div>

      {/* Scholarships */}
      {cat === 'scholarships' && (
        <div className="space-y-3">
          {scholarships.map((s, i) => (
            <GlassCard key={s.id} className="hover:shadow-[0_12px_40px_rgba(30,58,138,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={() => setSelectedScholarship(s)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex-1">
                  <h3 className="font-bold text-[#1E3A8A] text-lg">{s.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1.5"><img src={`https://flagcdn.com/w40/${s.countryCode.toLowerCase()}.png`} alt={s.country} className="w-5 h-3.5 rounded-sm object-cover" /> {s.country}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="font-semibold text-emerald-600">{s.value}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{s.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Hạn nộp</p>
                    <p className="text-sm font-bold text-[#1E3A8A]">{s.deadline}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Universities */}
      {cat === 'universities' && (
        <div className="space-y-3">
          {universities.map((u, i) => (
            <GlassCard key={u.id} className="hover:shadow-[0_12px_40px_rgba(30,58,138,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={() => setSelectedUniversity(u)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <img src={`https://flagcdn.com/w40/${u.countryCode.toLowerCase()}.png`} alt={u.country} className="w-5 h-3.5 rounded-sm object-cover" />
                    <h3 className="font-bold text-[#1E3A8A]">{u.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {u.fields.map(f => <span key={f} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-white/80 text-slate-600">{f}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Rank</p>
                    <p className="text-lg font-extrabold text-[#1E3A8A]">{u.rank}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tỷ lệ</p>
                    <p className="text-sm font-bold text-amber-600">{u.acceptRate}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Guides */}
      {cat === 'guides' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map((g, i) => (
            <GlassCard key={i} className="hover:shadow-[0_12px_40px_rgba(30,58,138,0.1)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/60 flex-shrink-0">{g.icon}</div>
                <div>
                  <h3 className="font-bold text-[#1E3A8A] mb-1">{g.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-2">{g.desc}</p>
                  <span className="text-xs font-medium text-slate-400">{g.pages} trang</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* AI Usage Guide */}
      {cat === 'ai-guide' && (
        <GlassCard>
          <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-violet-200/20" />
          <GlassHeader icon="smart_toy" title="Hướng dẫn sử dụng AI Study Coach" />
          <div className="space-y-4 relative z-10">
            {[
              { icon: 'chat', title: 'Chat với AI', desc: 'Nhấn nút AI ở góc phải để mở trợ lý ảo. Hỏi bất kỳ câu hỏi nào về du học, trường, học bổng.' },
              { icon: 'psychology', title: 'AI hiểu ngữ cảnh', desc: 'AI sẽ dựa vào hồ sơ, mục tiêu, sở thích của bạn để đưa ra gợi ý cá nhân hoá.' },
              { icon: 'auto_awesome', title: 'AI trong từng công cụ', desc: 'Mỗi công cụ đều có tab "AI Hỗ trợ" — AI sẽ giúp tìm kiếm, đánh giá, và gợi ý.' },
              { icon: 'edit_note', title: 'AI Writing Assistant', desc: 'Trong Academic Editor, AI sửa lỗi, viết tiếp, và gợi ý văn phong học thuật.' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-lg">{tip.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E3A8A] mb-0.5">{tip.title}</h4>
                  <p className="text-sm text-slate-500">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* ── Detail Popups ────────────────────── */}
      {selectedScholarship && (
        <ScholarshipDetailPopup
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
      {selectedUniversity && (
        <UniversityDetailPopup
          university={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
        />
      )}
    </>
  );
}
