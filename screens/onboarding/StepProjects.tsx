import React, { useState } from 'react';
import { OnboardingData, OnboardingProject } from './types';

interface StepProjectsProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

const emptyProject: OnboardingProject = { title: '', description: '', category: '', status: 'Đang phát triển', progress: 0 };

const STATUS_OPTIONS = [
  { value: 'Đang phát triển', label: 'Đang phát triển', color: '#3b82f6' },
  { value: 'Hoàn thành', label: 'Hoàn thành', color: '#10b981' },
  { value: 'Ý tưởng', label: 'Ý tưởng', color: '#f59e0b' },
];

const CATEGORY_OPTIONS = [
  'AI / Machine Learning', 'Robotics', 'Web / Mobile App', 'IoT', 'Nghiên cứu khoa học',
  'Phân tích dữ liệu', 'Game Development', 'Khác',
];

export default function StepProjects({ data, setData }: StepProjectsProps) {
  const [form, setForm] = useState<OnboardingProject>({ ...emptyProject });
  const [showForm, setShowForm] = useState(data.projects.length === 0);

  const addProject = () => {
    if (!form.title.trim()) return;
    setData(d => ({ ...d, projects: [...d.projects, { ...form }] }));
    setForm({ ...emptyProject });
    setShowForm(false);
  };

  const removeProject = (idx: number) => {
    setData(d => ({ ...d, projects: d.projects.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="ob-projects-container">
      {/* Existing projects */}
      {data.projects.length > 0 && (
        <div className="ob-proj-list">
          {data.projects.map((p, i) => (
            <div key={i} className="ob-proj-card">
              <div className="ob-proj-card-header">
                <div className="ob-proj-card-icon">
                  <span className="material-symbols-outlined">science</span>
                </div>
                <div className="ob-proj-card-info">
                  <p className="ob-proj-card-title">{p.title}</p>
                  <p className="ob-proj-card-meta">
                    {[p.category, p.status].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button className="ob-cert-remove" onClick={() => removeProject(i)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
              {p.description && (
                <p className="ob-proj-card-desc">{p.description}</p>
              )}
              <div className="ob-proj-progress-bar">
                <div className="ob-proj-progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="ob-proj-progress-label">{p.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="ob-cert-form">
          <div className="ob-cert-form-grid">
            <div>
              <span className="ob-field-label">Tên dự án <span style={{ color: '#ef4444' }}>*</span></span>
              <input
                className="ob-input"
                placeholder="VD: AI Chatbot hỗ trợ học tập"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <span className="ob-field-label">Mô tả <span className="ob-field-label-opt">(không bắt buộc)</span></span>
              <input
                className="ob-input"
                placeholder="Mô tả ngắn về dự án..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="ob-cert-form-row">
              <div style={{ flex: 1 }}>
                <span className="ob-field-label">Danh mục</span>
                <select
                  className="ob-input ob-select"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <span className="ob-field-label">Trạng thái</span>
                <select
                  className="ob-input ob-select"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <span className="ob-field-label">Tiến độ: {form.progress}%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                className="ob-proj-slider"
              />
              <div className="ob-proj-slider-labels">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <div className="ob-cert-form-actions">
            {data.projects.length > 0 && (
              <button className="ob-cert-btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
            )}
            <button className="ob-cert-btn-add" onClick={addProject} disabled={!form.title.trim()}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Thêm dự án
            </button>
          </div>
        </div>
      ) : (
        <button className="ob-cert-add-btn" onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
          Thêm dự án mới
        </button>
      )}

      {data.projects.length === 0 && !showForm && (
        <p className="ob-cert-skip-hint">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
          Bạn có thể bỏ qua bước này và thêm sau trong Hồ Sơ Năng Lực
        </p>
      )}
    </div>
  );
}
