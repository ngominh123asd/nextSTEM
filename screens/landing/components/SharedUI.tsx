import React from 'react';

export const ProblemItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
    <span className="text-slate-600 text-sm">{text}</span>
  </li>
);

export const CompareItem = ({ icon, text, negative, warning, positive, white }: any) => (
  <li className="flex items-center gap-3">
    <span className={`material-symbols-outlined text-lg ${negative ? 'text-red-500' : warning ? 'text-yellow-500' : positive && white ? 'text-white' : 'text-green-500'}`}>
      {icon}
    </span>
    <span className={`text-sm ${white ? 'text-white/90' : 'text-slate-600'}`}>{text}</span>
  </li>
);

export const ImpactCard = ({ title, subtitle, desc }: { title: string; subtitle: string; desc: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200">
    <blockquote className="text-slate-600 italic mb-4">
      "<span className="text-primary font-semibold not-italic">{title}</span>: {desc}"
    </blockquote>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm">verified</span>
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{subtitle}</p>
        <p className="text-xs text-slate-500">{title}</p>
      </div>
    </div>
  </div>
);

export const StarItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <span className="material-symbols-outlined text-primary text-lg">star</span>
    <span className="text-slate-600 text-sm">{text}</span>
  </li>
);

export const CheckItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
    <span className="text-slate-600 text-sm">{text}</span>
  </li>
);

export const CTACard = ({ icon, title, subtitle, desc }: { icon: string; title: string; subtitle: string; desc: string }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    <p className="text-slate-600 text-sm">{desc}</p>
  </div>
);

export const SocialIcon = ({ icon, color }: { icon: string; color: string }) => (
  <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
    <svg width="16" height="16" fill={color} viewBox="0 0 24 24">
      <path d={icon} />
    </svg>
  </a>
);

export const PartnerRow = ({ logos, direction }: { logos: string[]; direction: 'left' | 'right' }) => {
  const [isPaused, setIsPaused] = React.useState(false);
  
  return (
    <div 
      className="relative overflow-hidden py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="flex gap-8"
        style={{
          animation: `scroll-${direction} 40s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-40 h-24 bg-white rounded-xl flex items-center justify-center p-4 shadow-sm border border-slate-200 hover:shadow-lg hover:scale-110 hover:border-primary/50 transition-all duration-300 cursor-pointer"
          >
            <img 
              src={logo} 
              alt={`Partner ${(i % logos.length) + 1}`} 
              className="max-w-full max-h-full object-contain" 
              onError={(e) => { 
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-slate-400 font-semibold text-sm">Partner ${(i % logos.length) + 1}</div>`;
              }} 
            />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
