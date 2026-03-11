import React from 'react';
import { ThinkingStep } from './types';

/** Live thinking progress indicator shown during streaming */
export function LiveThinkingSteps({ steps }: { steps: ThinkingStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="flex justify-start">
      <div className="w-8 flex-shrink-0 mr-2" />
      <div className="max-w-[75%] py-2">
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent" />
          <div className="flex flex-col gap-0.5">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              return (
                <div
                  key={step.id}
                  className="relative flex items-center gap-2 py-[3px]"
                  style={{
                    animation: 'fadeSlideIn 0.3s ease-out forwards',
                    opacity: 0,
                    animationDelay: `${idx * 40}ms`,
                  }}
                >
                  <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {step.status === 'done' ? (
                      <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '14px' }}>check_circle</span>
                    ) : (
                      <span className="w-[14px] h-[14px] rounded-full bg-blue-500 border-2 border-blue-200 animate-pulse shadow-sm shadow-blue-300" />
                    )}
                  </div>
                  <span className={`text-xs font-medium leading-tight ${
                    step.status === 'active' ? 'text-blue-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  {step.status === 'active' && isLast && (
                    <span className="material-symbols-outlined text-blue-400 animate-spin" style={{ fontSize: '12px', animationDuration: '1.5s' }}>progress_activity</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Collapsed thinking steps shown in completed AI messages */
export function CollapsedThinkingSteps({
  steps,
  isExpanded,
  onToggle,
}: {
  steps: ThinkingStep[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (steps.length === 0) return null;

  return (
    <div className="mb-1.5">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-blue-600 hover:bg-blue-50/60 transition-all duration-200 group"
      >
        <span
          className="material-symbols-outlined transition-transform duration-200 group-hover:text-blue-500"
          style={{ fontSize: '14px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          chevron_right
        </span>
        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '13px' }}>check_circle</span>
        Đã suy nghĩ ({steps.length} bước)
      </button>
      {isExpanded && (
        <div className="mt-1.5 ml-1 relative pl-5" style={{ animation: 'fadeSlideIn 0.2s ease-out forwards' }}>
          <div className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
          {steps.map(step => (
            <div key={step.id} className="relative flex items-center gap-2 py-[2px]">
              <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: '13px' }}>check_circle</span>
              </div>
              <span className="text-xs text-slate-400 leading-tight">{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}