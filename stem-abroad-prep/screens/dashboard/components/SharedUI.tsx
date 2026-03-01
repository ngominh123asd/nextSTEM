import React from 'react';
import { glass } from '../types';

/* ─── Decorative Blobs ──────────────────────────────── */
export function BlobDecor({ className }: { className?: string }) {
  return <div className={`absolute rounded-full pointer-events-none blur-3xl ${className}`} />;
}

/* ─── Glass Card ────────────────────────────────────── */
export function GlassCard({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void; key?: React.Key }) {
  return (
    <div onClick={onClick} className={`${glass.card} p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Glass Header ──────────────────────────────────── */
export function GlassHeader({ icon, title, extra }: { icon: string; title: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 backdrop-blur-sm flex items-center justify-center border border-white/50">
          <span className="material-symbols-outlined text-blue-600 text-lg">{icon}</span>
        </div>
        <h2 className="text-lg font-bold text-[#1E3A8A]">{title}</h2>
      </div>
      {extra}
    </div>
  );
}

/* ─── Page Title ────────────────────────────────────── */
export function PageTitle({ title, subtitle, icon }: { title: string; subtitle: string; icon?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        {icon && <span className="material-symbols-outlined text-3xl text-blue-600">{icon}</span>}
        <h1 className="text-2xl font-extrabold text-[#1E3A8A]">{title}</h1>
      </div>
      <p className="text-slate-500 font-medium">{subtitle}</p>
    </div>
  );
}

/* ─── Tool Card (Liquid Glass style) ──────────────── */
export function ToolCard({ icon, iconGrad, title, desc, tags, onClick }: {
  icon: string; iconGrad: string; title: string; desc: string; tags?: string[]; onClick?: () => void; key?: React.Key;
}) {
  return (
    <div onClick={onClick} className={`${glass.card} p-5 group cursor-pointer hover:shadow-[0_12px_40px_rgba(30,58,138,0.12)] hover:-translate-y-1 transition-all duration-300`}>
      <BlobDecor className="w-32 h-32 -top-10 -right-10 bg-blue-200/30" />
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconGrad} flex items-center justify-center mb-4 shadow-lg shadow-blue-500/15 relative z-10`}>
        <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
      </div>
      <h3 className="font-bold text-[#1E3A8A] mb-1.5 relative z-10">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-3 relative z-10">{desc}</p>
      {tags && (
        <div className="flex flex-wrap gap-1.5 relative z-10">
          {tags.map(t => <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-slate-600">{t}</span>)}
        </div>
      )}
      <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 mt-3 group-hover:gap-2 transition-all relative z-10">
        Mở <span className="material-symbols-outlined text-base">arrow_forward</span>
      </div>
    </div>
  );
}
