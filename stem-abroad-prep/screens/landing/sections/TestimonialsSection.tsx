import React, { useEffect, useRef, useState } from 'react';
import { testimonials, type Testimonial } from '../types';

const TestimonialCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <div
    className={`p-5 rounded-2xl shadow-sm border w-full max-w-[320px] transition-all duration-300 hover:shadow-md ${
      t.highlighted
        ? 'bg-[#DDEBFF] border-[#A8CBFF]'
        : 'bg-white/95 backdrop-blur-sm border-white'
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
      <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 h-[600px]">
        {/* Background gradient card */}
        <div className="absolute inset-x-4 md:inset-x-6 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-br from-[#EAF3FF] via-[#DDEBFF] to-[#BFD9FF] rounded-[2.5rem] shadow-xl shadow-blue-100/80 border border-white z-0"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center h-full">
          {/* Left: Heading + description */}
          <div className="flex flex-col justify-center max-w-lg pl-8 lg:pl-16">
            <h3 className="text-4xl md:text-[2.75rem] font-extrabold text-[#1E3A8A] leading-[1.25] mb-6">
              Được đánh giá <br />
              cao từ
              <span className="inline-block bg-white text-[#1E3A8A] px-3 py-1 rounded-lg border-2 border-[#1E3A8A] shadow-sm transform -rotate-2 mx-2 mt-2">
                500+
              </span>
              <br />
              người dùng đã <br />
              và đang sử dụng
            </h3>
            <p className="text-lg text-gray-700 font-medium leading-relaxed border-t border-blue-900/10 pt-6">
              Đây thực sự là sự khích lệ to lớn nhất giúp nextSTEM có động lực hoàn thiện không ngừng nghỉ và đạt đến trải nghiệm sử dụng tốt nhất dành cho bạn.
            </p>
          </div>

          {/* Right: Scrolling testimonial columns */}
          <div
            className="w-full h-[600px] overflow-hidden grid grid-cols-2 gap-6 relative justify-items-center -mt-12"
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
