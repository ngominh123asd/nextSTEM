import React, { useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData, glass } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle, ToolCard } from '../components/SharedUI';

type ToolSubPage = 'home' | 'university' | 'major' | 'scholarship' | 'extracurricular' | 'testprep' | 'essay' | 'visa';

const toolItems: { id: ToolSubPage; icon: string; grad: string; title: string; desc: string; tags: string[] }[] = [
  { id: 'major',           icon: 'category',          grad: 'from-blue-500 to-blue-600',    title: 'Chọn Chuyên Ngành',                desc: 'AI gợi ý ngành học phù hợp dựa trên sở thích & năng lực',          tags: ['AI', 'Trắc nghiệm'] },
  { id: 'university',      icon: 'school',            grad: 'from-indigo-500 to-indigo-600',title: 'Tìm Trường Đại Học',               desc: 'Tìm kiếm & so sánh trường đại học trên toàn thế giới',              tags: ['AI', 'Bộ lọc'] },
  { id: 'scholarship',     icon: 'workspace_premium', grad: 'from-amber-500 to-orange-500', title: 'Tìm Kiếm Học Bổng',                desc: 'Khám phá cơ hội học bổng phù hợp với hồ sơ của bạn',               tags: ['AI', 'Trắc nghiệm'] },
  { id: 'extracurricular', icon: 'groups',            grad: 'from-emerald-500 to-teal-500', title: 'Kế Hoạch Ngoại Khoá',              desc: 'Lên kế hoạch hoạt động ngoại khoá & đánh giá AI',                  tags: ['Lập kế hoạch', 'AI'] },
  { id: 'testprep',        icon: 'quiz',              grad: 'from-rose-500 to-pink-500',    title: 'Chuẩn Bị Bài Kiểm Tra',            desc: 'Luyện thi IELTS, TOEFL, SAT, AP với hỗ trợ AI',                    tags: ['IELTS', 'SAT', 'AP'] },
  { id: 'essay',           icon: 'edit_note',         grad: 'from-violet-500 to-purple-500',title: 'Viết Bài Luận Cá Nhân',            desc: 'AI Coach hỗ trợ viết Personal Statement & Essay',                  tags: ['AI Writing', 'CommonApp'] },
  { id: 'visa',            icon: 'flight_takeoff',    grad: 'from-cyan-500 to-sky-500',     title: 'Nộp Đơn Xin Visa',                 desc: 'Hướng dẫn từng bước quy trình xin visa du học',                    tags: ['Checklist', 'Hướng dẫn'] },
];

function QuizQuestion({ q, options }: { q: string; options: string[] }) {
  const [sel, setSel] = useState(-1);
  return (
    <div className="p-5 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
      <p className="font-bold text-[#1E3A8A] mb-3">{q}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((o, i) => (
          <button key={i} onClick={() => setSel(i)}
            className={`p-3 rounded-xl text-sm font-medium text-left transition-all border ${sel === i ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-300/50 text-[#1E3A8A] shadow-sm' : 'bg-white/30 border-white/60 text-slate-600 hover:bg-white/50'}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolDetail({ item, onBack, userData }: { item: typeof toolItems[0]; onBack: () => void; userData: UserData }) {
  const [mode, setMode] = useState<'guide' | 'ai' | 'quiz'>('guide');

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all mb-4">
        <span className="material-symbols-outlined text-lg">arrow_back</span>Quay lại
      </button>
      <PageTitle icon={item.icon} title={item.title} subtitle={item.desc} />

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-8 p-1.5 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 w-fit">
        {([['guide', 'menu_book', 'Hướng dẫn'], ['ai', 'auto_awesome', 'AI Hỗ trợ'], ['quiz', 'quiz', 'Trắc nghiệm']] as const).map(([id, ic, label]) => (
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
            <button key={id} onClick={() => setMode(id)}
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
        <GlassCard>
          <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-violet-200/20" />
          <GlassHeader icon="auto_awesome" title="AI Hỗ trợ tìm kiếm" />
          <div className="relative z-10">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input type="text" placeholder={`Hỏi AI về ${item.title.toLowerCase()}...`} className={`${glass.input} pl-11`} />
              </div>
              <GlassSurface
                width="auto"
                height={48}
                borderRadius={16}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              >
                <span className="text-white font-semibold px-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">send</span>Gửi
                </span>
              </GlassSurface>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-white/60">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                </div>
                <div>
                  <p className="font-bold text-[#1E3A8A] text-sm mb-1">AI Study Coach</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Xin chào {userData.name?.split(' ').pop()}! Mình là AI Study Coach của nextSTEM. Hãy cho mình biết bạn đang quan tâm đến điều gì, mình sẽ giúp bạn tìm kiếm và gợi ý phù hợp nhất nhé! 🎓
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {mode === 'quiz' && (
        <GlassCard>
          <GlassHeader icon="quiz" title="Bài trắc nghiệm tìm kiếm" />
          <div className="relative z-10 space-y-5">
            <QuizQuestion q="Bạn quan tâm đến lĩnh vực nào nhất?" options={['Công nghệ & Kỹ thuật', 'Khoa học & Nghiên cứu', 'Kinh doanh & Quản trị', 'Nghệ thuật & Sáng tạo']} />
            <QuizQuestion q="Bạn muốn du học ở khu vực nào?" options={['Bắc Mỹ (USA, Canada)', 'Châu Âu (UK, Đức, Hà Lan)', 'Châu Á (Singapore, Nhật, Hàn)', 'Châu Úc (Úc, New Zealand)']} />
            <QuizQuestion q="Ngân sách dự kiến hàng năm?" options={['Dưới 15.000 USD', '15.000 - 30.000 USD', '30.000 - 50.000 USD', 'Trên 50.000 USD / Cần học bổng']} />
            <GlassSurface
              width="100%"
              height={52}
              borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
            >
              <span className="text-white font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>Xem kết quả gợi ý
              </span>
            </GlassSurface>
          </div>
        </GlassCard>
      )}
    </>
  );
}

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
