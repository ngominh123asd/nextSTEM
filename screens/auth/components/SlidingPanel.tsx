import React from 'react';
import type { SlidingPanelProps } from '../types';

export default function SlidingPanel({ isRegister, onClose }: SlidingPanelProps) {
  return (
    <div className={`absolute inset-y-0 w-1/2 z-20
      transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]
      ${isRegister ? 'translate-x-full' : 'translate-x-0'}`}
      style={{ willChange: 'transform' }}>

      <div className="relative w-full h-full overflow-hidden bg-[#1E3A8A]">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#2E4DA7] to-[#4361C4]" />

        {/* Decorative elements */}
        <div className="absolute w-72 h-72 -top-20 -right-20 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute w-56 h-56 bottom-10 -left-16 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/10 blur-xl" />

        {/* Floating decorative shapes */}
        <div className="absolute top-16 left-12 w-3 h-3 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-32 right-16 w-2 h-2 rounded-full bg-blue-300/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-4 h-4 rounded-full bg-indigo-300/20 animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Floating graduation caps / books deco */}
        <div className="absolute top-12 right-12 opacity-20">
          <span className="material-symbols-outlined text-white text-5xl">auto_stories</span>
        </div>
        <div className="absolute top-28 left-8 opacity-10">
          <span className="material-symbols-outlined text-white text-4xl">school</span>
        </div>
        <div className="absolute bottom-32 right-16 opacity-15">
          <span className="material-symbols-outlined text-white text-3xl">science</span>
        </div>

        {/* Back arrow */}
        <button onClick={onClose}
          className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20
            flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white transition-all">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        {/* Mascot / Hero image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Glow behind mascot */}
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-110" />
            <img
              src="/images/about.jpg"
              alt="nextSTEM mascot"
              className="relative w-[320px] h-[320px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#1E3A8A]/80 to-transparent">
          <div className={`transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]
            ${isRegister ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
              Welcome Back
            </h2>
            <p className="text-blue-200/90 font-medium text-sm leading-relaxed">
              Tiếp tục hành trình chinh phục tri thức.
            </p>
          </div>
          <div className={`absolute bottom-8 left-8 right-8 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]
            ${isRegister ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
              Join Us Today
            </h2>
            <p className="text-blue-200/90 font-medium text-sm leading-relaxed">
              Khám phá thế giới tri thức cùng nextSTEM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
