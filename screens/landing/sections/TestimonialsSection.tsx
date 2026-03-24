import React, { useEffect, useRef, useState } from 'react';
import { testimonials, type Testimonial } from '../types';

const TestimonialCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <div
    className={`p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(30,58,138,0.08)] border w-full max-w-[320px] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(30,58,138,0.15)] hover:-translate-y-1 ${
      t.highlighted
        ? 'bg-[#DDEBFF] border-white shadow-[0_20px_50px_rgba(30,58,138,0.15)]'
        : 'bg-white/95 backdrop-blur-md border-white'
    }`}
  >
    <p className="text-gray-700 text-[14px] leading-relaxed mb-4 font-medium">
      "{t.quote}"
    </p>
    <div className="flex items-center gap-3">
      <img
        src={t.avatar}
        alt={t.name}
        className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white flex-shrink-0"
      />
      <div className="text-sm font-bold text-[#1E3A8A] leading-none">
        {t.name}{' '}
        <span className="font-medium text-gray-500 text-xs ml-1">— {t.role}</span>
      </div>
    </div>
  </div>
);

const TestimonialColumn = ({ items, speed }: { items: Testimonial[]; speed: number }) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);

  // Triple the items for seamless looping
  const tripled = [...items, ...items, ...items];

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setOffset((prev) => {
        const next = prev + (speed * delta) / 1000;
        // Reset when we've scrolled through one full set
        const el = columnRef.current;
        if (el) {
          const singleSetHeight = el.scrollHeight / 3;
          if (next >= singleSetHeight) return next - singleSetHeight;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  return (
    <div
      ref={columnRef}
      className="flex flex-col gap-6"
      style={{ transform: `translateY(-${offset}px)` }}
    >
      {tripled.map((t, i) => (
        <TestimonialCard key={i} t={t} />
      ))}
    </div>
  );
};

const TestimonialsSection = () => {
  const col1 = [testimonials[0], testimonials[1], testimonials[2]];
  const col2 = [testimonials[3], testimonials[4], testimonials[5]];

  return (
    <section className="py-0 bg-white">
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 min-h-[600px] lg:h-[600px]">
        {/* Desktop: absolute background card (original layout) */}
        <div className="hidden lg:block absolute inset-x-6 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-br from-[#EAF3FF] via-[#DDEBFF] to-[#BFD9FF] rounded-[3.5rem] shadow-[0_40px_80px_rgba(30,58,138,0.15)] border border-white z-0"></div>

        {/* Mobile: card wraps content for guaranteed inner spacing */}
        <div className="lg:hidden bg-gradient-to-br from-[#EAF3FF] via-[#DDEBFF] to-[#BFD9FF] rounded-[2.5rem] shadow-[0_30px_60px_rgba(30,58,138,0.12)] border border-white p-6 sm:p-8">
          <div className="flex flex-col justify-center max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] leading-[1.25] mb-4">
              Được đánh giá{' '}
              cao từ
              <span className="inline-block bg-white text-[#1E3A8A] px-3 py-1 rounded-lg border-2 border-[#1E3A8A] shadow-sm transform -rotate-2 mx-2 mt-2">
                500+
              </span>
              {' '}người dùng đã
              và đang sử dụng
            </h3>
            <p className="text-base text-gray-700 font-medium leading-relaxed border-t border-blue-900/10 pt-4">
              Đây thực sự là sự khích lệ to lớn nhất giúp nextSTEM có động lực hoàn thiện không ngừng nghỉ và đạt đến trải nghiệm sử dụng tốt nhất dành cho bạn.
            </p>
          </div>
          <div
            className="w-full h-[400px] overflow-hidden grid grid-cols-2 gap-4 relative justify-items-center mt-6"
            style={{
              maskImage:
                'linear-gradient(transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage:
                'linear-gradient(transparent, black 15%, black 85%, transparent)',
            }}
          >
            <TestimonialColumn items={col1} speed={25} />
            <TestimonialColumn items={col2} speed={20} />
          </div>
        </div>

        {/* Desktop: original content layout with z-10 over absolute card */}
        <div className="hidden lg:grid relative z-10 grid-cols-2 gap-16 items-center h-full">
          <div className="flex flex-col justify-center max-w-lg pl-16">
            <h3 className="text-[2.75rem] font-extrabold text-[#1E3A8A] leading-[1.25] mb-6">
              Được đánh giá{' '}
              cao từ
              <span className="inline-block bg-white text-[#1E3A8A] px-3 py-1 rounded-lg border-2 border-[#1E3A8A] shadow-sm transform -rotate-2 mx-2 mt-2">
                500+
              </span>
              {' '}người dùng đã
              và đang sử dụng
            </h3>
            <p className="text-lg text-gray-700 font-medium leading-relaxed border-t border-blue-900/10 pt-6">
              Đây thực sự là sự khích lệ to lớn nhất giúp nextSTEM có động lực hoàn thiện không ngừng nghỉ và đạt đến trải nghiệm sử dụng tốt nhất dành cho bạn.
            </p>
          </div>
          <div
            className="w-full h-[600px] overflow-hidden grid grid-cols-2 gap-6 relative justify-items-center"
            style={{
              maskImage:
                'linear-gradient(transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage:
                'linear-gradient(transparent, black 15%, black 85%, transparent)',
            }}
          >
            <TestimonialColumn items={col1} speed={25} />
            <TestimonialColumn items={col2} speed={20} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
