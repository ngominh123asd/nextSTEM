import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import MentorMasonry, { Item } from '../components/MentorMasonry';
import { mentorsData, Mentor } from '../types';
import { X, ChevronLeft, ChevronRight, Award, GraduationCap, Building } from 'lucide-react';

const MentorModal: React.FC<{ mentor: Mentor | null; onClose: () => void }> = ({ mentor, onClose }) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Auto-slide effect for images
  useEffect(() => {
    if (!mentor) return;
    setCurrentImageIdx(0); // Reset when mentor changes

    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % mentor.images.length);
    }, 3000); // switch every 3 seconds

    return () => clearInterval(interval);
  }, [mentor]);

  if (!mentor) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(30,58,138,0.15)] border-2 border-[#DDEBFF] overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-[#1E3A8A] hover:bg-[#EAF3FF] transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Left: Image Carousel */}
        <div className="relative w-full md:w-[45%] h-64 md:h-full bg-gray-50 flex-shrink-0">
          {mentor.images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-cover bg-center ${idx === currentImageIdx ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {mentor.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIdx(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col overflow-y-auto bg-slate-50">
          <div className="mb-8">
            <h3 className="text-[2rem] font-extrabold text-[#1E3A8A] leading-tight mb-4">
              {mentor.name}
            </h3>
            <div className="flex flex-wrap items-center gap-y-3 gap-x-3 text-sm font-semibold">
              <span className="flex items-center gap-1.5 bg-[#EAF3FF] text-[#1E3A8A] border border-[#BFD9FF] px-4 py-1.5 rounded-xl shadow-sm">
                <GraduationCap size={16} />
                {mentor.school}
              </span>
              <span className="flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 px-4 py-1.5 rounded-xl shadow-[0_2px_4px_rgba(30,58,138,0.05)]">
                <Building size={16} />
                {mentor.role}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="flex items-center gap-3 text-sm uppercase tracking-widest text-[#1E3A8A] font-bold mb-3">
                 <span className="w-5 h-[3px] bg-[#1E3A8A] rounded-full"></span>
                 Về Mentor
              </h4>
              <p className="text-gray-700 font-medium leading-relaxed text-[15px] bg-white p-5 rounded-2xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md hover:border-[#BFD9FF]">
                {mentor.bio}
              </p>
            </section>

            <section>
              <h4 className="flex items-center gap-3 text-sm uppercase tracking-widest text-[#1E3A8A] font-bold mb-4">
                 <span className="w-5 h-[3px] bg-[#1E3A8A] rounded-full"></span>
                 Thành tựu nổi bật
              </h4>
              <ul className="space-y-3">
                {mentor.achievements.map((ach, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#BFD9FF]">
                    <div className="rounded-xl bg-[#F0F5FF] p-2.5 text-[#1E3A8A] flex-shrink-0">
                      <Award size={18} />
                    </div>
                    <span className="text-gray-700 text-[15px] font-medium leading-tight">{ach}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorSection: React.FC = () => {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Thêm height ngẫu nhiên cho layout masonry thêm sinh động
  const masonryItems: Item[] = React.useMemo(() => {
    return mentorsData.map((m, i) => {
      // Fake heights for aesthetic: 300, 400, 500
      const heights = [300, 400, 500, 350, 450];
      const h = heights[i % heights.length];
      return {
        id: m.id,
        img: m.images[0], // Cover image
        url: '#', // We handle click internally
        height: h
      };
    });
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedMentor) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedMentor]);

  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          gsap.fromTo(
            el.querySelectorAll('.mentor-anim'),
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
          );
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50 overflow-hidden" id="mentors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="mentor-anim opacity-0 text-base text-[#1E3A8A] font-bold tracking-wide uppercase">
          Mentor Hub
        </h2>
        <p className="mentor-anim opacity-0 mt-2 text-3xl leading-8 font-extrabold tracking-tight text-[#1E3A8A] sm:text-4xl">
          Đội ngũ Mentor chất lượng
        </p>
        <p className="mentor-anim opacity-0 mt-4 max-w-2xl text-lg text-gray-600 font-medium mx-auto border-t border-blue-900/10 pt-4">
          Kết nối trực tiếp với các anh chị đã có mặt tại những trường đại học hàng đầu thế giới để nhận lộ trình chuẩn và lời khuyên cá nhân.
        </p>
      </div>

      {/* Tăng chiều cao container để Masonry có không gian */}
      <div
        className="mentor-anim opacity-0 w-full h-[600px] md:h-[700px] lg:h-[800px] relative px-4 mx-auto"
        style={{
          maxWidth: '1920px',
          maskImage: 'linear-gradient(transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(transparent, black 10%, black 90%, transparent)'
        }}
      >
        <MentorMasonry
          items={masonryItems}
          onItemClick={(id) => {
            const found = mentorsData.find(m => m.id === id);
            if (found) setSelectedMentor(found);
          }}
          scaleOnHover={true}
          hoverScale={1.03}
          startAnimation={isInView}
        />
      </div>

      {/* Modal */}
      <MentorModal mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
    </section>
  );
};

export default MentorSection;
