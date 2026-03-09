import React from 'react';
import { OnboardingData } from './types';
import { goalOptions } from './constants';

interface StepGoalsProps {
  data: OnboardingData;
  toggle: (id: string) => void;
}

export default function StepGoals({ data, toggle }: StepGoalsProps) {
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
