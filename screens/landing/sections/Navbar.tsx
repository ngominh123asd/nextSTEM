import React, { useState } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import type { LandingProps } from '../types';

interface NavbarProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
  onOpenAbout: () => void;
}

export default function Navbar({ onStartDemo, onOpenAuth, onOpenAbout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">So sánh</button>
            <button className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Liên hệ</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onOpenAuth} className="hidden sm:block text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Đăng nhập
            </button>
            <GlassSurface
              width="auto"
              height={38}
              borderRadius={8}
              className="cursor-pointer hover:opacity-90 transition-opacity flex"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={(e: React.MouseEvent) => { window.innerWidth < 640 ? onOpenAuth() : onStartDemo(); }}
            >
              <span className="text-sm font-semibold text-white px-4 whitespace-nowrap">
                <span className="sm:hidden">Đăng nhập</span>
                <span className="hidden sm:inline">Dùng thử miễn phí</span>
              </span>
            </GlassSurface>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-600" style={{ fontSize: '24px' }}>
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            <button onClick={() => { onOpenAbout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">Về chúng tôi</button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">Sản phẩm</button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">So sánh</button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">Liên hệ</button>
            <div className="border-t border-slate-100 my-2" />
            <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">Đăng nhập</button>
            <GlassSurface
              width="100%"
              height={42}
              borderRadius={8}
              className="cursor-pointer hover:opacity-90 transition-opacity mt-1"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={() => { onStartDemo(); setMobileMenuOpen(false); }}
            >
              <span className="text-sm font-semibold text-white px-4">Dùng thử miễn phí</span>
            </GlassSurface>
          </div>
        </div>
      )}
    </nav>
  );
}
