import React from 'react';

/* ── BlobDecor ── */
export function BlobDecor({ className }: { className?: string }) {
  return <div className={`absolute rounded-full pointer-events-none blur-3xl ${className}`} />;
}

/* ── GlassCard ── */
export function GlassCard({
  children, className = '', onClick, ...rest
}: { children: React.ReactNode; className?: string; onClick?: () => void } & Record<string, any>) {
  return (
    <div onClick={onClick} className={`bg-white/60 backdrop-blur-2xl rounded-[1.75rem] border border-white/80 shadow-[0_8px_32px_rgba(30,58,138,0.06)] relative overflow-hidden p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ── GlassHeader ── */
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

/* ── PageTitle ── */
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

/* ── StatCard ── */
export function StatCard({ icon, label, value, trend, color = 'blue' }: {
  icon: string; label: string; value: string | number; trend?: string; color?: string;
}) {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-teal-500',
    purple: 'from-purple-500 to-violet-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
    cyan: 'from-cyan-500 to-sky-500',
  };
  return (
    <GlassCard>
      <BlobDecor className="w-24 h-24 -top-8 -right-8 bg-blue-200/20" />
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradients[color] || gradients.blue} flex items-center justify-center mb-3 shadow-lg`}>
        <span className="material-symbols-outlined text-white text-xl">{icon}</span>
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-[#1E3A8A] mt-1">{value}</p>
      {trend && <p className="text-xs text-emerald-600 font-semibold mt-1">{trend}</p>}
    </GlassCard>
  );
}

/* ── Toggle ── */
export function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </label>
  );
}

/* ── Badge ── */
export function Badge({ text, color = 'blue', ...rest }: { text: string; color?: string } & Record<string, any>) {
  const cls: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls[color] || cls.blue}`}>
      {text}
    </span>
  );
}

/* ── EmptyState ── */
export function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-slate-400 mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
