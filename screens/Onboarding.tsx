import React, { useState } from 'react';
import GlassSurface from '../components/GlassSurface';

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
  { id: 'choose-major', icon: 'school', label: 'Chọn ngành học', desc: 'Tìm hiểu và lựa chọn ngành phù hợp' },
  { id: 'portfolio', icon: 'description', label: 'Chuẩn bị hồ sơ', desc: 'Xây dựng hồ sơ năng lực hoàn chỉnh' },
  { id: 'study-abroad', icon: 'flight_takeoff', label: 'Du học', desc: 'Chuẩn bị kỹ năng và hồ sơ du học' },
  { id: 'scholarship', icon: 'emoji_events', label: 'Học bổng', desc: 'Săn học bổng và giải thưởng' },
];

const interestTags = [
  { tag: 'Lập trình / AI', icon: 'smart_toy' },
  { tag: 'Robotics', icon: 'precision_manufacturing' },
  { tag: 'Sinh học', icon: 'biotech' },
  { tag: 'Toán học', icon: 'calculate' },
  { tag: 'Kỹ thuật', icon: 'engineering' },
  { tag: 'Vật lý', icon: 'science' },
  { tag: 'Hóa học', icon: 'experiment' },
  { tag: 'Khoa học dữ liệu', icon: 'analytics' },
];

const gradeOptions = ['Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

const stepMeta = [
  { label: 'Mục tiêu', icon: 'flag', heading: 'Xác định mục tiêu', sub: 'Bạn muốn đạt được gì với nextSTEM?' },
  { label: 'Học tập', icon: 'menu_book', heading: 'Thông tin học tập', sub: 'Giúp chúng tôi cá nhân hóa trải nghiệm' },
  { label: 'Sở thích', icon: 'interests', heading: 'Sở thích STEM', sub: 'Chọn các lĩnh vực bạn yêu thích' },
];

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
  const [dir, setDir] = useState<'next' | 'prev'>('next');

  const next = () => {
    if (step < TOTAL_STEPS) { setDir('next'); setStep(s => s + 1); }
    else onComplete(data);
  };
  const prev = () => {
    if (step > 1) { setDir('prev'); setStep(s => s - 1); }
  };

  const toggle = (key: 'goals' | 'interests', val: string) =>
    setData(d => ({
      ...d,
      [key]: (d[key] as string[]).includes(val)
        ? (d[key] as string[]).filter(v => v !== val)
        : [...(d[key] as string[]), val],
    }));

  const canNext = step === 1 ? data.goals.length > 0 : step === 2 ? data.grade.length > 0 : data.interests.length > 0;
  const meta = stepMeta[step - 1];

  return (
    <div className="ob-root">
      {/* ── Left branding panel ── */}
      <aside className="ob-left">
        <div className="ob-left-bg" />
        <div className="ob-left-content">
          <img src="/images/logo_header.png" alt="nextSTEM" className="ob-logo" />
          <h1 className="ob-brand-title">Xây dựng hồ sơ<br/>năng lực STEM</h1>
          <p className="ob-brand-desc">Chỉ cần 3 bước đơn giản để bắt đầu hành trình của bạn</p>

          {/* Visual steps */}
          <div className="ob-steps-visual">
            {stepMeta.map((s, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <div key={i} className={`ob-step-row ${active ? 'ob-step-active' : ''} ${done ? 'ob-step-done' : ''}`}>
                  <div className="ob-step-circle">
                    {done
                      ? <span className="material-symbols-outlined ob-step-icon">check</span>
                      : <span className="material-symbols-outlined ob-step-icon">{s.icon}</span>
                    }
                  </div>
                  <div className="ob-step-text">
                    <span className="ob-step-label">Bước {num}</span>
                    <span className="ob-step-name">{s.label}</span>
                  </div>
                  {i < TOTAL_STEPS - 1 && <div className={`ob-step-line ${done ? 'ob-step-line-done' : ''}`} />}
                </div>
              );
            })}
          </div>

          <button onClick={onClose} className="ob-back-link">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Quay về trang chủ
          </button>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="ob-right">
        {/* Mobile header */}
        <div className="ob-mobile-header">
          <img src="/images/logo_header.png" alt="nextSTEM" className="h-8 w-auto" />
          <button onClick={onClose} className="ob-mobile-close">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Mobile progress */}
        <div className="ob-mobile-progress">
          <div className="ob-mobile-bar">
            <div className="ob-mobile-bar-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <span className="ob-mobile-step-text">Bước {step}/{TOTAL_STEPS}</span>
        </div>

        <div className="ob-form-wrapper">
          {/* Step heading */}
          <div className="ob-heading-area">
            <div className="ob-heading-badge">
              <span className="material-symbols-outlined text-[18px]">{meta.icon}</span>
              {meta.label}
            </div>
            <h2 className="ob-heading">{meta.heading}</h2>
            <p className="ob-subheading">{meta.sub}</p>
          </div>

          {/* Animated step content */}
          <div key={step} className={`ob-step-content ob-slide-${dir}`}>
            {step === 1 && <StepGoals data={data} toggle={id => toggle('goals', id)} />}
            {step === 2 && <StepInfo data={data} setData={setData} />}
            {step === 3 && <StepInterests data={data} toggle={tag => toggle('interests', tag)} />}
          </div>

          {/* Footer nav */}
          <div className="ob-nav">
            <div className={step === 1 ? 'invisible' : ''}>
              <button className="ob-btn-back" onClick={prev}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                Quay lại
              </button>
            </div>
            <div className={!canNext ? 'ob-next-disabled' : ''}>
              <GlassSurface
                width="auto"
                height={42}
                borderRadius={14}
                style={{ background: step === TOTAL_STEPS ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #1152d4, #2E6AE6)', cursor: canNext ? 'pointer' : 'default' }}
                className="hover:opacity-90 transition-opacity shadow-md"
                onClick={canNext ? next : undefined}
              >
                <span className="px-5 text-sm font-semibold text-white flex items-center gap-1.5">
                  {step === TOTAL_STEPS ? 'Hoàn thành' : 'Tiếp theo'}
                  <span className="material-symbols-outlined text-base">{step === TOTAL_STEPS ? 'check' : 'chevron_right'}</span>
                </span>
              </GlassSurface>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        /* ── Layout ── */
        .ob-root {
          display: flex; min-height: 100vh; min-height: 100dvh;
          background: #f8fafc;
        }
        .ob-left {
          position: relative; width: 420px; flex-shrink: 0;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .ob-left-bg {
          position: absolute; inset: 0;
          background: linear-gradient(170deg, #0b3d91 0%, #1152d4 40%, #2e7cf6 70%, #60a5fa 100%);
        }
        .ob-left-bg::after {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(circle 400px at 10% 80%, rgba(96,165,250,0.3), transparent),
            radial-gradient(circle 300px at 80% 20%, rgba(59,130,246,0.25), transparent);
        }
        .ob-left-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          padding: 36px 32px; height: 100%;
        }
        .ob-logo {
          height: 192px; width: auto; object-fit: contain;
          align-self: flex-start;
          margin-left: -10px; margin-top: -24px; margin-bottom: -20px;
          filter: brightness(0) invert(1);
          position: relative; z-index: 2;
        }
        .ob-brand-title {
          font-size: 28px; font-weight: 800; color: #fff;
          line-height: 1.25; margin-bottom: 12px;
        }
        .ob-brand-desc {
          font-size: 14px; color: rgba(255,255,255,0.7);
          line-height: 1.6; margin-bottom: 48px; max-width: 300px;
        }

        /* ── Left step indicators ── */
        .ob-steps-visual {
          display: flex; flex-direction: column; gap: 0; flex: 1;
        }
        .ob-step-row {
          display: flex; align-items: center; gap: 14px;
          position: relative; padding: 14px 0;
        }
        .ob-step-circle {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .ob-step-icon { font-size: 18px; color: rgba(255,255,255,0.5); transition: color 0.3s; }
        .ob-step-active .ob-step-circle {
          background: #fff; border-color: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .ob-step-active .ob-step-icon { color: #1152d4; }
        .ob-step-done .ob-step-circle {
          background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4);
        }
        .ob-step-done .ob-step-icon { color: #fff; }
        .ob-step-text { display: flex; flex-direction: column; }
        .ob-step-label { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .ob-step-name { font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 600; margin-top: 1px; }
        .ob-step-active .ob-step-name { color: #fff; }
        .ob-step-done .ob-step-name { color: rgba(255,255,255,0.85); }
        .ob-step-line {
          position: absolute; left: 19px; top: 54px; width: 2px; height: 28px;
          background: rgba(255,255,255,0.15); border-radius: 1px;
          transition: background 0.3s;
        }
        .ob-step-line-done { background: rgba(255,255,255,0.5); }
        .ob-back-link {
          margin-top: auto;
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
          background: none; border: none; cursor: pointer;
          padding: 8px 0; transition: color 0.2s;
        }
        .ob-back-link:hover { color: rgba(255,255,255,0.9); }

        /* ── Right panel ── */
        .ob-right {
          flex: 1; display: flex; flex-direction: column;
          background: linear-gradient(160deg, #f8fbff 0%, #eef4ff 40%, #e0ebff 80%, #dbeafe 100%);
          overflow-y: auto;
          position: relative;
        }
        .ob-right::before {
          content: ''; position: absolute; top: -120px; right: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%);
          pointer-events: none;
        }
        .ob-right::after {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(17,82,212,0.06), transparent 70%);
          pointer-events: none;
        }
        .ob-mobile-header {
          display: none; /* hidden on desktop */
          align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
        }
        .ob-mobile-close {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc; border: 1px solid #e2e8f0;
          color: #64748b; cursor: pointer; transition: all 0.15s;
        }
        .ob-mobile-close:hover { background: #f1f5f9; color: #334155; }
        .ob-mobile-progress { display: none; padding: 0 20px; padding-top: 12px; }
        .ob-mobile-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
        .ob-mobile-bar-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #1152d4, #3b82f6); transition: width 0.4s ease; }
        .ob-mobile-step-text { font-size: 12px; color: #94a3b8; font-weight: 600; margin-top: 6px; }

        .ob-form-wrapper {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center;
          width: 100%; max-width: 780px;
          padding: 32px 56px 28px;
          margin: 0 auto;
          position: relative; z-index: 1;
        }

        /* ── Heading ── */
        .ob-heading-area { margin-bottom: 20px; }
        .ob-heading-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 16px; border-radius: 100px;
          background: rgba(255,255,255,0.7); color: #1152d4;
          font-size: 12px; font-weight: 700; margin-bottom: 14px;
          letter-spacing: 0.02em;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(17,82,212,0.06);
        }
        .ob-heading {
          font-size: 26px; font-weight: 800; color: #0f172a;
          line-height: 1.2; margin-bottom: 6px;
        }
        .ob-subheading { font-size: 14px; color: #64748b; font-weight: 500; }

        /* ── Content animation ── */
        .ob-step-content { flex: 0 0 auto; }
        @keyframes obSlideNext { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes obSlidePrev { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        .ob-slide-next { animation: obSlideNext 0.28s ease-out; }
        .ob-slide-prev { animation: obSlidePrev 0.28s ease-out; }

        /* ── Footer nav ── */
        .ob-nav {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 28px; padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.6);
        }
        .ob-btn-back {
          display: flex; align-items: center; gap: 6px;
          height: 42px; padding: 0 20px;
          border-radius: 14px; border: 1.5px solid #cbd5e1;
          background: #fff; color: #475569;
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .ob-btn-back:hover {
          border-color: #94a3b8; color: #1e293b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .ob-next-disabled { pointer-events: none; opacity: 0.35; }

        /* ── Goal cards ── */
        .ob-goals { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ob-goal-card {
          position: relative; text-align: left;
          padding: 20px; border-radius: 18px;
          border: 1.5px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          cursor: pointer; transition: all 0.2s;
        }
        .ob-goal-card:hover {
          background: rgba(255,255,255,0.75);
          box-shadow: 0 4px 20px rgba(17,82,212,0.08);
          border-color: rgba(59,130,246,0.25);
        }
        .ob-goal-card[data-sel="true"] {
          border-color: rgba(17,82,212,0.4);
          background: rgba(239,246,255,0.8);
          box-shadow: 0 4px 20px rgba(17,82,212,0.12);
        }
        .ob-goal-check {
          position: absolute; top: 14px; right: 14px;
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(0,0,0,0.08); background: rgba(255,255,255,0.8);
          transition: all 0.2s;
        }
        .ob-goal-card[data-sel="true"] .ob-goal-check {
          border-color: #1152d4; background: #1152d4;
        }
        .ob-goal-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(241,245,249,0.7); margin-bottom: 14px;
          transition: all 0.2s;
        }
        .ob-goal-card[data-sel="true"] .ob-goal-icon-wrap {
          background: linear-gradient(135deg, #1152d4, #3b82f6);
          box-shadow: 0 4px 12px rgba(17,82,212,0.25);
        }
        .ob-goal-card[data-sel="true"] .ob-goal-icon-wrap .material-symbols-outlined { color: #fff !important; }
        .ob-goal-card[data-sel="false"] .ob-goal-icon-wrap .material-symbols-outlined,
        .ob-goal-card .ob-goal-icon-wrap .material-symbols-outlined { color: #94a3b8; font-size: 22px; transition: color 0.2s; }
        .ob-goal-card[data-sel="false"]:hover .ob-goal-icon-wrap .material-symbols-outlined { color: #1152d4; }
        .ob-goal-card:not([data-sel="true"]):hover .ob-goal-icon-wrap .material-symbols-outlined { color: #1152d4; }
        .ob-goal-label { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .ob-goal-card[data-sel="true"] .ob-goal-label { color: #1152d4; }
        .ob-goal-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; }

        /* ── Info step ── */
        .ob-info-fields { display: flex; flex-direction: column; gap: 24px; }
        .ob-field-label { display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; }
        .ob-field-label-opt { font-weight: 400; color: #94a3b8; }
        .ob-grade-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .ob-input {
          width: 100%; padding: 13px 18px; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          font-size: 14px; color: #0f172a;
          transition: all 0.2s; outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .ob-input::placeholder { color: #94a3b8; }
        .ob-input:focus {
          border-color: rgba(17,82,212,0.3); background: rgba(255,255,255,0.85);
          box-shadow: 0 0 0 3px rgba(17,82,212,0.08), 0 4px 12px rgba(17,82,212,0.06);
        }

        /* ── Interest tags ── */
        .ob-interests { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ob-interest-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 16px; border-radius: 16px;
          border: 1.5px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          font-size: 13px; font-weight: 600; color: #475569;
          cursor: pointer; transition: all 0.2s;
        }
        .ob-interest-btn:hover {
          background: rgba(255,255,255,0.75);
          border-color: rgba(59,130,246,0.25);
          box-shadow: 0 4px 16px rgba(17,82,212,0.06);
        }
        .ob-interest-btn[data-sel="true"] {
          border-color: rgba(17,82,212,0.4); background: rgba(239,246,255,0.8); color: #1152d4;
          box-shadow: 0 4px 16px rgba(17,82,212,0.1);
        }
        .ob-interest-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(241,245,249,0.7); transition: all 0.2s;
        }
        .ob-interest-btn[data-sel="true"] .ob-interest-icon {
          background: linear-gradient(135deg, #1152d4, #3b82f6);
          box-shadow: 0 3px 10px rgba(17,82,212,0.2);
        }
        .ob-interest-btn[data-sel="true"] .ob-interest-icon .material-symbols-outlined { color: #fff; }
        .ob-interest-icon .material-symbols-outlined { font-size: 18px; color: #94a3b8; transition: color 0.2s; }
        .ob-interest-btn:hover .ob-interest-icon .material-symbols-outlined { color: #1152d4; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ob-left { display: none; }
          .ob-mobile-header { display: flex; }
          .ob-mobile-progress { display: block; }
          .ob-form-wrapper { padding: 24px 20px 20px; max-width: none; }
          .ob-heading { font-size: 22px; }
          .ob-goals { gap: 10px; }
          .ob-goal-card { padding: 16px; }
        }
        @media (max-width: 480px) {
          .ob-goals { grid-template-columns: 1fr; }
          .ob-interests { grid-template-columns: 1fr; }
          .ob-grade-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

/* ─── Step: Goals ─── */
function StepGoals({ data, toggle }: { data: OnboardingData; toggle: (id: string) => void }) {
  return (
    <div className="ob-goals">
      {goalOptions.map(g => {
        const sel = data.goals.includes(g.id);
        return (
          <button key={g.id} className="ob-goal-card" data-sel={sel} onClick={() => toggle(g.id)}>
            <div className="ob-goal-check">
              {sel && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>check</span>}
            </div>
            <div className="ob-goal-icon-wrap">
              <span className="material-symbols-outlined">{g.icon}</span>
            </div>
            <div className="ob-goal-label">{g.label}</div>
            <div className="ob-goal-desc">{g.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Step: Info ─── */
function StepInfo({ data, setData }: { data: OnboardingData; setData: React.Dispatch<React.SetStateAction<OnboardingData>> }) {
  return (
    <div className="ob-info-fields">
      <div>
        <span className="ob-field-label">Khối lớp</span>
        <div className="ob-grade-grid">
          {gradeOptions.map(g => {
            const sel = data.grade === g;
            return (
              <GlassSurface
                key={g}
                width="auto"
                height={42}
                borderRadius={14}
                style={{
                  background: sel ? 'linear-gradient(135deg, #1152d4, #2E6AE6)' : '#fff',
                  border: sel ? 'none' : '1.5px solid #cbd5e1',
                  cursor: 'pointer',
                  boxShadow: sel ? '0 4px 16px rgba(17,82,212,0.3)' : 'none',
                }}
                className="transition-all hover:opacity-90"
                onClick={() => setData(d => ({ ...d, grade: g }))}
              >
                <span className={`text-sm font-bold ${sel ? 'text-white' : 'text-slate-600'}`}>{g}</span>
              </GlassSurface>
            );
          })}
        </div>
      </div>
      <div>
        <span className="ob-field-label">Trường</span>
        <input
          className="ob-input"
          type="text"
          placeholder="VD: THPT Chuyên Hà Nội – Amsterdam"
          value={data.school}
          onChange={e => setData(d => ({ ...d, school: e.target.value }))}
        />
      </div>
      <div>
        <span className="ob-field-label">Môn học mạnh <span className="ob-field-label-opt">(không bắt buộc)</span></span>
        <input
          className="ob-input"
          type="text"
          placeholder="VD: Toán, Lý, Tin học"
          value={data.subjects}
          onChange={e => setData(d => ({ ...d, subjects: e.target.value }))}
        />
      </div>
    </div>
  );
}

/* ─── Step: Interests ─── */
function StepInterests({ data, toggle }: { data: OnboardingData; toggle: (tag: string) => void }) {
  return (
    <div className="ob-interests">
      {interestTags.map(({ tag, icon }) => {
        const sel = data.interests.includes(tag);
        return (
          <button key={tag} className="ob-interest-btn" data-sel={sel} onClick={() => toggle(tag)}>
            <div className="ob-interest-icon">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            {tag}
          </button>
        );
      })}
    </div>
  );
}
