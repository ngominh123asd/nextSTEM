import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { StarItem } from '../components/SharedUI';

interface DemoSectionProps {
  onStartDemo: () => void;
}

export default function DemoSection({ onStartDemo }: DemoSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop" alt="Demo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wide">Demo</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-2 mb-6">Trải nghiệm nextSTEM ngay</h2>
            <p className="font-semibold text-slate-900 mb-2">Dùng thử ngay: Chat với AI Study Coach</p>
            <p className="text-slate-600 mb-4">Nhận gợi ý ngành học – Dự án STEM – Hồ sơ du học chỉ trong vài phút.</p>
            <p className="text-primary font-semibold mb-6">nextSTEM – Nền tảng giúp học sinh Việt Nam chinh phục thế giới bằng năng lực STEAM và AI.</p>
            
            <ul className="space-y-3 mb-8">
              <StarItem text="AI gợi ý định hướng cá nhân" />
              <StarItem text="Hướng dẫn xây dựng dự án STEM" />
              <StarItem text="Tạo portfolio quốc tế chuẩn" />
            </ul>
            
            <div className="flex flex-wrap gap-4">
              <GlassSurface
                width="auto"
                height={48}
                borderRadius={8}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                onClick={onStartDemo}
              >
                <span className="font-semibold text-white px-6">Dùng thử miễn phí</span>
              </GlassSurface>
              <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors">
                Xem hướng dẫn
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
