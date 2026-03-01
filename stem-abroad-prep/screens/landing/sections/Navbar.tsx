import React from 'react';
import GlassSurface from '../../../components/GlassSurface';
import type { LandingProps } from '../types';

interface NavbarProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
  onOpenSpeed: () => void;
}

export default function Navbar({ onStartDemo, onOpenAuth, onOpenAbout, onOpenSpeed }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <img src="/images/logo_header.png" alt="nextSTEM logo" className="w-[12rem] h-[12rem] object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={onOpenAbout} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Về chúng tôi</button>
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sản phẩm</button>
            <button onClick={onOpenSpeed} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Tốc độ</button>
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">So sánh</button>
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Liên hệ</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onOpenAuth} className="hidden sm:block text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Đăng nhập
            </button>
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
  );
}
