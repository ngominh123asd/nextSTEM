import React, { useEffect, useRef, useState } from 'react';
import { stackingCardsData } from '../types';

const StackingCardsSection = () => {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [scales, setScales] = useState<number[]>(stackingCardsData.map(() => 1));

  useEffect(() => {
    const handleScroll = () => {
      const newScales = stackingCardsData.map((_, i) => {
        const el = cardsRef.current[i];
        if (!el || i >= stackingCardsData.length - 1) return 1;

        const nextEl = cardsRef.current[i + 1];
        if (!nextEl) return 1;

        const nextRect = nextEl.getBoundingClientRect();
        const topPos = 120 + i * 40;
        const cardHeight = el.offsetHeight;
        const nextTop = nextRect.top;

        // When the next card starts overlapping this card
        const overlapStart = topPos + cardHeight;
        const overlapEnd = topPos;

        if (nextTop < overlapStart && nextTop > overlapEnd) {
          const progress = 1 - (nextTop - overlapEnd) / (overlapStart - overlapEnd);
          return 1 - progress * 0.06;
        } else if (nextTop <= overlapEnd) {
          return 0.94;
        }
        return 1;
      });
      setScales(newScales);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className="relative"
      style={{ background: 'linear-gradient(to bottom, #eff6ff, #e0f2fe, #dbeafe)' }}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #93c5fd 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c4b5fd 0%, transparent 50%)' }}></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-4">Công nghệ tạo nên sự khác biệt</h2>
          <p className="text-slate-600 text-lg">5 Công nghệ chính của nền tảng nextSTEM</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {stackingCardsData.map((card, i) => {
          const topPos = 120 + i * 10;
          const isLast = i === stackingCardsData.length - 1;
          return (
            <div
              key={card.number}
              ref={el => { cardsRef.current[i] = el; }}
              className="sticky flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 w-full p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-white/50 bg-gradient-to-br from-blue-50 to-indigo-50 bg-opacity-95 overflow-hidden backdrop-blur-xl min-h-[450px]"
              style={{
                top: `${topPos}px`,
                zIndex: 10 + i,
                transform: `scale(${scales[i]})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                marginBottom: '40vh',
              }}
            >
              {/* Decorative blur circle */}
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-60 rounded-full blur-3xl pointer-events-none"></div>

              {/* Left: Content */}
              <div className="flex-1 flex flex-col z-10">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-8xl md:text-9xl font-black text-white drop-shadow-lg tracking-tight leading-none" style={{ WebkitTextStroke: '2px rgba(30, 58, 138, 0.125)' }}>
                    {card.number}
                  </span>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="w-12 h-12 md:w-16 md:h-16">
                    <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" fill={`url(#sparkle-stack-${i})`} />
                    <defs>
                      <linearGradient id={`sparkle-stack-${i}`} x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#60a5fa" />
                        <stop offset="1" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-[#1e3a8a] mb-6 leading-tight drop-shadow-sm">{card.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">{card.desc}</p>
              </div>

              {/* Right: Image */}
              <div className="flex-1 flex justify-center w-full relative z-10 group">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl rounded-lg"
                  style={{ transform: 'scale(1.05) rotate(2deg)' }}
                />
              </div>
            </div>
          );
        })}
        {/* Spacer inside the sticky container so card 05 has scroll runway */}
        <div style={{ height: '50vh', pointerEvents: 'none' }}></div>
      </div>
      {/* Bottom padding */}
      <div className="h-20"></div>
    </section>
  );
};

export default StackingCardsSection;
