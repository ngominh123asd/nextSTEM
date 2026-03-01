import React from 'react';
import { ProblemItem } from '../components/SharedUI';

export default function ProblemsSection() {
  return (
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
          
          <div className="relative">
            <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden relative group cursor-pointer">
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
  );
}
