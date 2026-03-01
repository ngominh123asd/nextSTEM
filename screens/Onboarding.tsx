import React, { useState } from 'react';

interface OnboardingData {
  name: string;
  email: string;
  goals: string[];
  grade: string;
  school: string;
  subjects: string;
  interests: string[];
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onClose: () => void;
  initialData?: Partial<OnboardingData>;
}

const TOTAL_STEPS = 3;

const goalOptions = [
  { id: 'choose-major', icon: 'school', label: 'Chọn ngành học', desc: 'Tìm hiểu và lựa chọn ngành học phù hợp' },
  { id: 'portfolio', icon: 'description', label: 'Chuẩn bị hồ sơ', desc: 'Xây dựng hồ sơ năng lực hoàn chỉnh' },
  { id: 'study-abroad', icon: 'flight_takeoff', label: 'Du học', desc: 'Chuẩn bị hồ sơ và kỹ năng du học' },
  { id: 'scholarship', icon: 'emoji_events', label: 'Học bổng', desc: 'Săn học bổng và giải thưởng' },
];

const interestTags = [
  'Lập trình / AI', 'Robotics', 'Sinh học', 'Toán học',
  'Kỹ thuật', 'Vật lý', 'Hóa học', 'Khoa học dữ liệu',
];

const gradeOptions = ['Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

export default function Onboarding({ onComplete, onClose, initialData }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    goals: initialData?.goals ?? [],
    grade: initialData?.grade ?? '',
    school: initialData?.school ?? '',
    subjects: initialData?.subjects ?? '',
    interests: initialData?.interests ?? [],
  });
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const progress = (step / TOTAL_STEPS) * 100;

  const next = () => {
    if (step < TOTAL_STEPS) {
      setDirection('next');
      setStep(s => s + 1);
    } else {
      onComplete(data);
    }
  };
  const prev = () => {
    if (step > 1) {
      setDirection('prev');
      setStep(s => s - 1);
    }
  };

  const toggleGoal = (id: string) => {
    setData(d => ({
      ...d,
      goals: d.goals.includes(id) ? d.goals.filter(g => g !== id) : [...d.goals, id],
    }));
  };

  const toggleInterest = (tag: string) => {
    setData(d => ({
      ...d,
      interests: d.interests.includes(tag) ? d.interests.filter(t => t !== tag) : [...d.interests, tag],
    }));
  };

  const canNext = () => {
    switch (step) {
      case 1: return data.goals.length > 0;
      case 2: return data.grade.length > 0;
      case 3: return data.interests.length > 0;
      default: return true;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #e0e7ff 100%)' }}
    >
      {/* Decorative blobs — matching landing page gradient style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-sky-100/50 rounded-full blur-2xl" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg shadow-blue-100/50 border border-white flex items-center justify-center hover:bg-white hover:scale-105 transition-all z-10 group"
      >
        <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600 transition-colors">close</span>
      </button>

      <div className="w-full max-w-2xl mx-auto px-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <img src="/images/logo_header.png" alt="nextSTEM logo" className="w-48 h-48 object-contain" />
        </div>
        <p className="text-center text-slate-500 font-medium mb-8 text-sm tracking-wide">Xây dựng hồ sơ năng lực của bạn</p>

        {/* Progress */}
        <div className="flex items-center justify-between mb-2.5 text-sm">
          <span className="font-semibold text-[#1E3A8A]">Bước {step} / {TOTAL_STEPS}</span>
          <span className="font-bold text-[#1E3A8A]">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/60 backdrop-blur-sm rounded-full mb-8 overflow-hidden shadow-inner border border-white/80">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1E3A8A, #3b82f6)' }}
          />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-blue-100/60 border border-white/80 p-8 md:p-10 min-h-[380px] flex flex-col relative overflow-hidden">
          {/* Decorative corner */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-60 pointer-events-none" />

          <div key={step} className={`flex-1 relative z-10 animate-fade-slide-${direction}`}>
            {step === 1 && <Step2 data={data} toggleGoal={toggleGoal} />}
            {step === 2 && <Step3 data={data} setData={setData} />}
            {step === 3 && <Step4 data={data} toggleInterest={toggleInterest} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-blue-900/5 relative z-10">
            <button
              onClick={prev}
              className={`flex items-center gap-2 text-slate-500 hover:text-[#1E3A8A] font-medium transition-all px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 ${step === 1 ? 'invisible' : ''}`}
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Quay lại
            </button>
            <button
              onClick={next}
              disabled={!canNext()}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-7 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              {step === TOTAL_STEPS ? 'Hoàn thành' : 'Tiếp theo'}
              {step < TOTAL_STEPS && <span className="material-symbols-outlined text-lg">chevron_right</span>}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? 'w-8 h-2.5 bg-primary'
                  : i + 1 < step
                  ? 'w-2.5 h-2.5 bg-primary/50'
                  : 'w-2.5 h-2.5 bg-white/70 border border-blue-200/50'
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideNext {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlidePrev {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-slide-next { animation: fadeSlideNext 0.35s ease-out; }
        .animate-fade-slide-prev { animation: fadeSlidePrev 0.35s ease-out; }
      `}</style>
    </div>
  );
}

/* ─── Step Components ────────────────────────────────────────────── */

const inputClasses = "w-full px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/30 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all";

function Step1({ data, setData }: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>> }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#1E3A8A] text-center mb-1">Chào mừng bạn!</h2>
      <p className="text-slate-500 text-center mb-8 font-medium">Hãy cho chúng tôi biết về bạn</p>

      <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Họ và tên</label>
      <input
        type="text"
        placeholder="Nguyễn Văn A"
        value={data.name}
        onChange={e => setData(d => ({ ...d, name: e.target.value }))}
        className={`${inputClasses} mb-5`}
      />

      <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Email</label>
      <input
        type="email"
        placeholder="email@example.com"
        value={data.email}
        onChange={e => setData(d => ({ ...d, email: e.target.value }))}
        className={inputClasses}
      />
    </div>
  );
}

function Step2({ data, toggleGoal }: { data: OnboardingData; toggleGoal: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#1E3A8A] text-center mb-1">Mục tiêu của bạn</h2>
      <p className="text-slate-500 text-center mb-8 font-medium">Bạn muốn làm gì với STEM Portfolio?</p>

      <div className="grid grid-cols-2 gap-4">
        {goalOptions.map(g => {
          const selected = data.goals.includes(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 group ${
                selected
                  ? 'border-primary/40 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-md shadow-blue-100/50'
                  : 'border-blue-100/60 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                selected ? 'bg-primary/10' : 'bg-slate-50 group-hover:bg-blue-50'
              }`}>
                <span className={`material-symbols-outlined text-xl ${selected ? 'text-primary' : 'text-slate-400 group-hover:text-blue-400'}`}>
                  {g.icon}
                </span>
              </div>
              <p className={`font-bold mb-1 text-sm ${selected ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>{g.label}</p>
              <p className="text-xs text-slate-500 leading-snug">{g.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3({ data, setData }: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>> }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#1E3A8A] text-center mb-1">Thông tin học tập</h2>
      <p className="text-slate-500 text-center mb-8 font-medium">Một vài thông tin để cá nhân hóa trải nghiệm</p>

      <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Khối lớp</label>
      <div className="relative mb-5">
        <select
          value={data.grade}
          onChange={e => setData(d => ({ ...d, grade: e.target.value }))}
          className={`${inputClasses} appearance-none`}
        >
          <option value="">Chọn khối lớp</option>
          {gradeOptions.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
      </div>

      <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">Trường</label>
      <input
        type="text"
        placeholder="THPT X..."
        value={data.school}
        onChange={e => setData(d => ({ ...d, school: e.target.value }))}
        className={`${inputClasses} mb-5`}
      />

      <label className="block text-sm font-semibold text-[#1E3A8A] mb-1.5">
        Môn học mạnh <span className="font-normal text-slate-400">(không bắt buộc)</span>
      </label>
      <input
        type="text"
        placeholder="Toán, Lý, Tin..."
        value={data.subjects}
        onChange={e => setData(d => ({ ...d, subjects: e.target.value }))}
        className={inputClasses}
      />
    </div>
  );
}

function Step4({ data, toggleInterest }: { data: OnboardingData; toggleInterest: (tag: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#1E3A8A] text-center mb-1">Sở thích STEM</h2>
      <p className="text-slate-500 text-center mb-8 font-medium">Chọn các lĩnh vực bạn quan tâm</p>

      <div className="flex flex-wrap gap-3">
        {interestTags.map(tag => {
          const selected = data.interests.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleInterest(tag)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                selected
                  ? 'bg-primary text-white shadow-md shadow-blue-500/25 scale-105 border-2 border-primary'
                  : 'bg-white text-slate-600 border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#1E3A8A]'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
