import React, { useState } from 'react';
import { mbtiQuestions } from './mbtiData';

interface MBTIQuizProps {
  onComplete: (answers: Record<number, string>) => void;
}

export default function MBTIQuiz({ onComplete }: MBTIQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [animatingOut, setAnimatingOut] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const question = mbtiQuestions[currentIndex];
  // Calculate progress based on how many answers have been submitted
  // Wait, if 1 completed -> 1/30. So max progress is when we are at index 29 (last question) -> 29/30.
  // After final submit it's 100%. We'll just fake 100% locally if finishing.
  const progress = isFinishing ? 100 : (currentIndex / mbtiQuestions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (animatingOut || isFinishing) return;
    
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);
    
    if (currentIndex < mbtiQuestions.length - 1) {
      setAnimatingOut(true);
      setTimeout(() => {
        setCurrentIndex(v => v + 1);
        setAnimatingOut(false);
      }, 350);
    } else {
      // Last question completed
      setIsFinishing(true);
      setTimeout(() => {
        onComplete(newAnswers);
      }, 800); // 800ms loading illusion to look professional
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 animate-in fade-in duration-500 min-h-[500px]">
      <div className="w-full max-w-3xl flex flex-col pt-2 sm:pt-4">
        {!isFinishing ? (
          <>
            <div className="flex flex-col items-center text-center mb-8 sm:mb-12 mt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-blue-100/60 shadow-sm mb-4 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-blue-800 font-extrabold text-[11px] uppercase tracking-widest">AI Profile Setup</span>
              </div>
              <h2 className="text-3xl sm:text-[2.2rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-blue-600 mb-4 tracking-tight leading-tight">
                Đánh giá MBTI & Khám phá bản năng
              </h2>
              <p className="text-slate-600 text-[15px] sm:text-[16px] font-medium px-4 max-w-xl leading-[1.6]">
                Hoàn thành bài trắc nghiệm này để AI Advisor thiết lập một hệ thống tư vấn chuẩn xác nhất dành riêng cho bạn.
              </p>
            </div>
            
            {/* Question Wrapper - Deep Blue Theme */}
            <div className="relative w-full">
              <div className={`w-full bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-[2rem] sm:rounded-[2.5rem] border border-blue-400/30 p-6 sm:p-10 lg:p-12 shadow-[0_24px_60px_-10px_rgba(30,58,138,0.4)] transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden ${animatingOut ? 'opacity-0 scale-[0.98] -translate-x-6' : 'opacity-100 scale-100 translate-x-0'}`}>
                
                {/* Embedded edge Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-[6px] bg-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]" 
                    style={{ width: `${Math.max(progress, 2)}%` }} 
                  />
                </div>

                <div className="flex items-center justify-between mb-8 mt-2">
                  <span className="inline-flex items-center gap-2 py-1.5 px-3 sm:px-4 rounded-xl bg-white/15 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider border border-white/20 backdrop-blur-md shadow-inner">
                    {question.category}
                  </span>
                  <span className="text-blue-100 font-bold text-[12px] sm:text-sm tracking-widest bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                    Câu {currentIndex + 1} / {mbtiQuestions.length}
                  </span>
                </div>

                <h3 className="text-xl sm:text-[1.6rem] font-bold text-white mb-8 sm:mb-10 leading-[1.5] sm:leading-[1.6]">
                  {question.text}
                </h3>
                
                <div className="space-y-4">
                  {question.options.map((opt) => {
                    const isSelected = answers[question.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 sm:gap-5 group hover:-translate-y-0.5
                          ${isSelected 
                            ? 'border-white bg-white shadow-xl shadow-black/10 scale-[1.01]' 
                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/15 backdrop-blur-sm'}`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-[14px] sm:text-[15px] transition-all duration-300
                          ${isSelected ? 'bg-gradient-to-br from-[#1E3A8A] to-blue-600 text-white shadow-md' : 'bg-white/10 border border-white/20 text-white group-hover:bg-white group-hover:text-[#1E3A8A]'}`}>
                          {opt.id}
                        </div>
                        <span className={`text-[15px] sm:text-[16px] leading-snug font-medium transition-colors ${isSelected ? 'text-[#1E3A8A] font-bold' : 'text-blue-50 group-hover:text-white'}`}>
                          {opt.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 relative mb-8">
              <div className="absolute inset-0 border-4 border-[#EAF3FF] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-blue-600 text-4xl">
                psychology
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#1E3A8A] mb-3">Đang phân tích tính cách...</h2>
            <p className="text-slate-500 font-medium">Hệ thống AI đang thiết lập lõi tư vấn dựa trên câu trả lời của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
