import React, { useState } from 'react';
import GlassSurface from '../../components/GlassSurface';
import { OnboardingData, OnboardingProps } from './types';
import { TOTAL_STEPS, stepMeta } from './constants';
import StepGoals from './StepGoals';
import StepInfo from './StepInfo';
import StepInterests from './StepInterests';
import './Onboarding.css';

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
                style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)', cursor: canNext ? 'pointer' : 'default' }}
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
    </div>
  );
}
