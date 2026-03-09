import React from 'react';
import { OnboardingData } from './types';
import { interestTags } from './constants';

interface StepInterestsProps {
  data: OnboardingData;
  toggle: (tag: string) => void;
}

export default function StepInterests({ data, toggle }: StepInterestsProps) {
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
