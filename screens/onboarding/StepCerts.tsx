import React, { useRef, useState } from 'react';
import { OnboardingData, OnboardingCert } from './types';

interface StepCertsProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
}

const empty: OnboardingCert = { title: '', score: '', date: '', organisation: '', fileName: '', fileUrl: '' };

export default function StepCerts({ data, setData }: StepCertsProps) {
  const [form, setForm] = useState<OnboardingCert>({ ...empty });
  const [showForm, setShowForm] = useState(data.certs.length === 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Tối đa 5MB.');
      return;
    }
    setForm(f => ({ ...f, fileName: file.name }));
    setPendingFile(file);
    setUploading(false);
  };

  const addCert = () => {
    if (!form.title.trim()) return;
    // Attach the File object as _file for later upload
    const certEntry: any = { ...form };
    if (pendingFile) certEntry._file = pendingFile;
    setData(d => ({ ...d, certs: [...d.certs, certEntry] }));
    setForm({ ...empty });
    setPendingFile(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeCert = (idx: number) => {
    setData(d => ({ ...d, certs: d.certs.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="ob-certs-container">
      {/* Existing certs */}
      {data.certs.length > 0 && (
        <div className="ob-cert-list">
          {data.certs.map((c, i) => (
            <div key={i} className="ob-cert-card">
              <div className="ob-cert-card-icon">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div className="ob-cert-card-info">
                <p className="ob-cert-card-title">{c.title}</p>
                <p className="ob-cert-card-meta">
                  {[c.score, c.organisation, c.date].filter(Boolean).join(' · ')}
                </p>
                {c.fileName && (
                  <p className="ob-cert-card-file">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>attach_file</span>
                    {c.fileName}
                  </p>
                )}
              </div>
              <button className="ob-cert-remove" onClick={() => removeCert(i)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="ob-cert-form">
          <div className="ob-cert-form-grid">
            <div>
              <span className="ob-field-label">Tên chứng chỉ / Thành tích <span style={{ color: '#ef4444' }}>*</span></span>
              <input
                className="ob-input"
                placeholder="VD: IELTS, SAT, Huy chương Vàng..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="ob-cert-form-row">
              <div style={{ flex: 1 }}>
                <span className="ob-field-label">Điểm số / Thành tích</span>
                <input
                  className="ob-input"
                  placeholder="VD: 8.0, 1500, Giải Nhất"
                  value={form.score}
                  onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span className="ob-field-label">Ngày thi / Ngày cấp</span>
                <input
                  className="ob-input"
                  placeholder="VD: Tháng 10, 2025"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <span className="ob-field-label">Tổ chức cấp</span>
              <input
                className="ob-input"
                placeholder="VD: British Council, College Board"
                value={form.organisation}
                onChange={e => setForm(f => ({ ...f, organisation: e.target.value }))}
              />
            </div>
            <div>
              <span className="ob-field-label">Tải file chứng chỉ <span className="ob-field-label-opt">(PDF hoặc ảnh, tối đa 5MB)</span></span>
              <div
                className="ob-cert-upload-zone"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {form.fileName ? (
                  <div className="ob-cert-upload-file">
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1152d4' }}>
                      {form.fileName.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                    </span>
                    <span className="ob-cert-upload-name">{form.fileName}</span>
                    <button
                      className="ob-cert-upload-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm(f => ({ ...f, fileName: '', fileUrl: '' }));
                        setPendingFile(null);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </div>
                ) : (
                  <div className="ob-cert-upload-placeholder">
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#94a3b8' }}>cloud_upload</span>
                    <span>Nhấn để chọn file</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="ob-cert-form-actions">
            {data.certs.length > 0 && (
              <button className="ob-cert-btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
            )}
            <button className="ob-cert-btn-add" onClick={addCert} disabled={!form.title.trim()}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Thêm chứng chỉ
            </button>
          </div>
        </div>
      ) : (
        <button className="ob-cert-add-btn" onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
          Thêm chứng chỉ mới
        </button>
      )}

      {data.certs.length === 0 && !showForm && (
        <p className="ob-cert-skip-hint">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
          Bạn có thể bỏ qua bước này và thêm sau trong Hồ Sơ Năng Lực
        </p>
      )}
    </div>
  );
}
