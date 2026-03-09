import React from 'react';
import GlassSurface from '../../components/GlassSurface';
import { OnboardingData } from './types';
import { gradeOptions } from './constants';

interface StepInfoProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

export default function StepInfo({ data, setData }: StepInfoProps) {
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
