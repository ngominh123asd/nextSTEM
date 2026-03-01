import React from 'react';
import GlassSurface from '../components/GlassSurface';

interface AboutProps {
  onClose: () => void;
  onStartDemo: () => void;
}

export default function AboutScreen({ onClose, onStartDemo }: AboutProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <img src="/images/logo.png" alt="nextSTEM logo" className="w-[12rem] h-[12rem] object-contain" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <GlassSurface
                width="auto"
                height={38}
                borderRadius={8}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                onClick={onStartDemo}
              >
                <span className="text-sm font-semibold text-white px-4">Dùng thử miễn phí</span>
              </GlassSurface>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero banner */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#2E4DA7] to-[#4361C4] py-20 lg:py-28">
        <div className="absolute w-72 h-72 -top-20 -right-20 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute w-56 h-56 bottom-10 -left-16 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
            <span className="material-symbols-outlined text-base">info</span>
            Về chúng tôi
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Nền tảng AI Study Coach<br className="hidden lg:block" />
            <span className="text-blue-200">toàn diện cho du học sinh</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Tìm hiểu thêm về nextSTEM – sứ mệnh, giải pháp và cách chúng tôi giúp học sinh Việt Nam chinh phục thế giới
          </p>
        </div>
      </header>

      {/* What is nextSTEM Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wide">nextSTEM là gì?</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-6">Nền tảng AI Study Coach toàn diện cho du học sinh</h2>
              <p className="text-slate-600 mb-6">
                <strong>nextSTEM</strong> là nền tảng EdTech được thiết kế riêng cho học sinh Việt Nam muốn du học, kết hợp <span className="text-primary font-semibold">AI Coach thông minh + Mentor thật + Portfolio Builder</span> để giúp bạn:
              </p>
              <ul className="space-y-4 mb-6">
                <CheckItem text="Định hướng nghề nghiệp – AI gợi ý ngành học, quốc gia phù hợp dựa trên GPA, sở thích, điểm mạnh cá nhân" />
                <CheckItem text="Phát triển dự án STEM – Hướng dẫn xây dựng dự án nghiên cứu mini để làm nổi bật hồ sơ" />
                <CheckItem text="Xây dựng Portfolio quốc tế – Tự động sinh CV, Personal Statement theo chuẩn CommonApp, UCAS" />
                <CheckItem text="Kết nối Mentor thật – Học từ Mentor từ Ivy League, A*STAR, các trường top thế giới" />
                <CheckItem text="Tối ưu hồ sơ du học – AI phản hồi bài luận, phỏng vấn với phân tích chuyên sâu" />
              </ul>
              <GlassSurface
                width="auto"
                height={48}
                borderRadius={8}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                onClick={onStartDemo}
              >
                <span className="text-base font-semibold text-white px-6">Khám phá tính năng</span>
              </GlassSurface>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl text-center border border-slate-100">
                  <span className="text-2xl mb-2 block">🤖</span>
                  <p className="text-sm font-semibold text-slate-900">AI Coach</p>
                  <p className="text-xs text-slate-500">Hướng dẫn 24/7</p>
                </div>
                <div className="bg-white p-4 rounded-xl text-center border border-slate-100">
                  <span className="text-2xl mb-2 block">👨‍🏫</span>
                  <p className="text-sm font-semibold text-slate-900">Mentor thật</p>
                  <p className="text-xs text-slate-500">Từ top universities</p>
                </div>
                <div className="bg-white p-4 rounded-xl text-center border border-slate-100">
                  <span className="text-2xl mb-2 block">📋</span>
                  <p className="text-sm font-semibold text-slate-900">Portfolio</p>
                  <p className="text-xs text-slate-500">Chuẩn quốc tế</p>
                </div>
                <div className="bg-white p-4 rounded-xl text-center border border-slate-100">
                  <span className="text-2xl mb-2 block">⚡</span>
                  <p className="text-sm font-semibold text-slate-900">Dự án STEM</p>
                  <p className="text-xs text-slate-500">Độc đáo & nổi bật</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems & Solutions */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wide">Vấn đề & Giải pháp</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-6">Vì sao học sinh cần nextSTEM?</h2>

              <div className="mb-8">
                <p className="font-semibold text-slate-900 mb-4">Vấn đề hiện nay:</p>
                <ul className="space-y-3">
                  <ProblemItem text="Không biết chọn ngành, trường phù hợp" />
                  <ProblemItem text="Không có định hướng dự án học thuật rõ ràng" />
                  <ProblemItem text="Hồ sơ du học thiếu điểm nhấn cá nhân" />
                  <ProblemItem text="Tư vấn truyền thống tốn kém" />
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <blockquote className="text-slate-600 italic mb-4">
                  "<span className="text-primary font-semibold not-italic">nextSTEM mang lại giải pháp:</span> AI định hướng học tập & nghề nghiệp dựa trên hồ sơ cá nhân. AI gợi ý & hướng dẫn dự án STEM cá nhân hoá. Kết hợp Mentor thật + AI Coach. Xây dựng Portfolio quốc tế chỉ trong vài cú click."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">smart_toy</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">AI Study Coach</p>
                    <p className="text-xs text-slate-500">nextSTEM Platform</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="aspect-video w-full bg-slate-200 rounded-2xl overflow-hidden relative group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="Dashboard" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl ml-1">play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1E3A8A] to-[#4361C4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng bắt đầu hành trình?</h2>
          <p className="text-white/80 text-lg mb-8">Trải nghiệm ngay nền tảng AI Study Coach đầu tiên tại Việt Nam</p>
          <div className="flex flex-wrap justify-center gap-4">
            <GlassSurface
              width="auto"
              height={48}
              borderRadius={8}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={onStartDemo}
            >
              <span className="font-semibold text-white px-8">Dùng thử miễn phí</span>
            </GlassSurface>
            <button
              onClick={onClose}
              className="border border-white/40 hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
const CheckItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
    <span className="text-slate-600 text-sm">{text}</span>
  </li>
);

const ProblemItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
    <span className="text-slate-600 text-sm">{text}</span>
  </li>
);
