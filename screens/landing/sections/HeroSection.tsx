import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import CardSwap, { Card } from '../../../components/CardSwap';

interface HeroSectionProps {
  onStartDemo: () => void;
}

export default function HeroSection({ onStartDemo }: HeroSectionProps) {
  return (
    <header className="relative overflow-hidden bg-slate-50 pt-12 pb-16 lg:pt-24 lg:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 w-fit">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Study Coach for Global Students</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Du học chưa bao giờ <br className="hidden lg:block"/>
              <span className="text-primary">dễ dàng đến thế</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Nền tảng AI giúp học sinh trung học <strong>định hướng nghề nghiệp</strong>, phát triển dự án STEM và xây dựng hồ sơ du học thông minh.
            </p>
            <p className="text-base text-slate-500">
              <span className="text-primary font-semibold">Cá nhân hoá lộ trình</span> – Xây dựng dự án thật – Chinh phục thế giới bằng năng lực STEAM & AI.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <GlassSurface
                width="auto"
                height={48}
                borderRadius={8}
                className="cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                onClick={onStartDemo}
              >
                <span className="text-base font-semibold text-white px-6 flex items-center gap-2">
                  Trải nghiệm ngay <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </GlassSurface>
              <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-base font-semibold h-12 px-6 rounded-lg transition-colors">
                Xem Demo
              </button>
            </div>
          </div>
          
          {/* Visual – CardSwap */}
          <div className="relative w-full min-h-[420px] lg:min-h-[500px] flex items-center justify-center" style={{ height: 500 }}>
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={true}
              width={520}
              height={380}
            >
              <Card className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop"
                  alt="Students collaborating"
                  className="w-full h-full object-cover rounded-xl"
                />
              </Card>
              <Card className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop"
                  alt="Team working together"
                  className="w-full h-full object-cover rounded-xl"
                />
              </Card>
              <Card className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                  alt="Learning with technology"
                  className="w-full h-full object-cover rounded-xl"
                />
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </header>
  );
}
