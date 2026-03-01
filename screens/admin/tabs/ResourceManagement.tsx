import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';
import {
  apiAdminListScholarships, apiAdminCreateScholarship, apiAdminUpdateScholarship, apiAdminDeleteScholarship,
  apiAdminListUniversities, apiAdminCreateUniversity, apiAdminUpdateUniversity, apiAdminDeleteUniversity,
  type ScholarshipItem, type UniversityItem,
} from '../../../lib/api';

type ResourceTab = 'scholarships' | 'universities';

/* ── Toast ── */
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 'check_circle' : 'error';
  return createPortal(
    <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-2 ${bg} text-white px-5 py-3 rounded-xl shadow-lg max-w-sm animate-in slide-in-from-top-2`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>,
    document.body,
  );
}

/* ── Confirm Dialog ── */
function ConfirmDialog({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-500/30">Xóa</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Text Input Field ── */
function Field({ label, value, onChange, placeholder, multiline, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className={glass.input + ' resize-none !py-2.5 text-sm'} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={glass.input + ' text-sm !py-2.5'} />
      )}
    </div>
  );
}

/* ── List-of-strings Editor ── */
function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); } };
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {item}
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Thêm mục..."
          className={glass.input + ' text-sm !py-2'} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
        <button onClick={add} className="px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex-shrink-0">+</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ── Main Component
   ══════════════════════════════════════════════════════════════ */
export default function ResourceManagement() {
  const [tab, setTab] = useState<ResourceTab>('scholarships');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Scholarships state
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [editScholarship, setEditScholarship] = useState<ScholarshipItem | null>(null);
  const [newScholarship, setNewScholarship] = useState(false);

  // Universities state
  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [editUniversity, setEditUniversity] = useState<UniversityItem | null>(null);
  const [newUniversity, setNewUniversity] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: ResourceTab; id: string; name: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  /* ── Data fetching ── */
  const loadScholarships = async () => {
    try {
      const data = await apiAdminListScholarships();
      setScholarships(data);
    } catch (e: any) { showToast(e.message || 'Lỗi tải học bổng', 'error'); }
  };

  const loadUniversities = async () => {
    try {
      const data = await apiAdminListUniversities();
      setUniversities(data);
    } catch (e: any) { showToast(e.message || 'Lỗi tải trường', 'error'); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadScholarships(), loadUniversities()]).finally(() => setLoading(false));
  }, []);

  /* ── Handlers ── */
  const handleDeleteScholarship = async (id: string) => {
    try {
      await apiAdminDeleteScholarship(id);
      showToast('Đã xóa học bổng');
      loadScholarships();
    } catch (e: any) { showToast(e.message || 'Lỗi xóa', 'error'); }
    setDeleteConfirm(null);
  };

  const handleDeleteUniversity = async (id: string) => {
    try {
      await apiAdminDeleteUniversity(id);
      showToast('Đã xóa trường đại học');
      loadUniversities();
    } catch (e: any) { showToast(e.message || 'Lỗi xóa', 'error'); }
    setDeleteConfirm(null);
  };

  /* ── Filter ── */
  const filteredScholarships = scholarships.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUniversities = universities.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageTitle title="Quản lý Tài liệu" subtitle="" icon="menu_book" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="workspace_premium" label="Học bổng" value={scholarships.length} color="blue" />
        <StatCard icon="school" label="Trường Đại học" value={universities.length} color="green" />
        <StatCard icon="edit_note" label="Cập nhật gần đây" value={
          [...scholarships, ...universities].filter(i => {
            const d = i.lastUpdated ? new Date(i.lastUpdated) : null;
            return d && (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
          }).length
        } color="purple" />
        <StatCard icon="public" label="Quốc gia" value={
          new Set([...scholarships.map(s => s.countryCode), ...universities.map(u => u.countryCode)]).size
        } color="orange" />
      </div>

      {/* Tab + Search + Add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 p-1 bg-white/40 backdrop-blur-xl rounded-xl border border-white/60">
          {([['scholarships', 'workspace_premium', 'Học bổng'], ['universities', 'school', 'Trường Đại học']] as const).map(([id, icon, label]) => (
            <button key={id} onClick={() => { setTab(id); setSearch(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-white/50 hover:text-[#1E3A8A]'}`}>
              <span className="material-symbols-outlined text-lg">{icon}</span>{label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
              className={glass.input + ' !pl-10 text-sm !py-2.5'} />
          </div>
          <GlassSurface width="auto" height={42} borderRadius={12}
            style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
            className="cursor-pointer flex-shrink-0"
            onClick={() => tab === 'scholarships' ? setNewScholarship(true) : setNewUniversity(true)}
          >
            <span className="text-white text-sm font-semibold px-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">add</span>Thêm mới
            </span>
          </GlassSurface>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Scholarships Table ── */}
          {tab === 'scholarships' && (
            <GlassCard className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/40 border-b border-white/60">
                      {['Tên học bổng', 'Quốc gia', 'Giá trị', 'Bậc học', 'Hạn nộp', 'Trạng thái', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScholarships.map(s => (
                      <tr key={s.id} className="border-b border-white/40 hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#1E3A8A] text-sm">{s.name}</p>
                          {s.hostInstitution && <p className="text-xs text-slate-400 mt-0.5">{s.hostInstitution}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            {s.countryCode && <img src={`https://flagcdn.com/w40/${s.countryCode.toLowerCase()}.png`} className="w-5 h-3.5 rounded-sm object-cover" alt="" />}
                            {s.country}
                          </span>
                        </td>
                        <td className="px-5 py-4"><Badge text={s.value} color="green" /></td>
                        <td className="px-5 py-4 text-sm text-slate-600">{s.level}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-700">{s.deadline}</td>
                        <td className="px-5 py-4"><Badge text={s.status || 'N/A'} color={s.status === 'Đang mở đơn' ? 'blue' : 'gray'} /></td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => setEditScholarship(s)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition">
                              <span className="material-symbols-outlined text-blue-600 text-base">edit</span>
                            </button>
                            <button onClick={() => setDeleteConfirm({ type: 'scholarships', id: s.id, name: s.name })} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                              <span className="material-symbols-outlined text-red-500 text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredScholarships.length === 0 && <EmptyState icon="workspace_premium" title="Không có dữ liệu" desc={search ? 'Không tìm thấy học bổng phù hợp' : 'Chưa có học bổng nào'} />}
              </div>
            </GlassCard>
          )}

          {/* ── Universities Table ── */}
          {tab === 'universities' && (
            <GlassCard className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/40 border-b border-white/60">
                      {['Tên trường', 'Quốc gia', 'Xếp hạng', 'Tỷ lệ chấp nhận', 'Ngành', 'Học phí', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUniversities.map(u => (
                      <tr key={u.id} className="border-b border-white/40 hover:bg-blue-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#1E3A8A] text-sm">{u.name}</p>
                          {u.shortName && <p className="text-xs text-slate-400 mt-0.5">{u.shortName}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-slate-600">
                            {u.countryCode && <img src={`https://flagcdn.com/w40/${u.countryCode.toLowerCase()}.png`} className="w-5 h-3.5 rounded-sm object-cover" alt="" />}
                            {u.country}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-lg font-extrabold text-[#1E3A8A]">{u.rank}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-amber-600">{u.acceptRate}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">{u.fields?.map(f => <Badge key={f} text={f} color="blue" />)}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">{u.tuitionFee || '—'}</td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            <button onClick={() => setEditUniversity(u)} className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition">
                              <span className="material-symbols-outlined text-blue-600 text-base">edit</span>
                            </button>
                            <button onClick={() => setDeleteConfirm({ type: 'universities', id: u.id, name: u.name })} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                              <span className="material-symbols-outlined text-red-500 text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUniversities.length === 0 && <EmptyState icon="school" title="Không có dữ liệu" desc={search ? 'Không tìm thấy trường phù hợp' : 'Chưa có trường nào'} />}
              </div>
            </GlassCard>
          )}
        </>
      )}

      {/* ── Scholarship Form Modal ── */}
      {(editScholarship || newScholarship) && (
        <ScholarshipFormModal
          item={editScholarship}
          onClose={() => { setEditScholarship(null); setNewScholarship(false); }}
          onSaved={() => { setEditScholarship(null); setNewScholarship(false); loadScholarships(); showToast(editScholarship ? 'Cập nhật thành công' : 'Thêm mới thành công'); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* ── University Form Modal ── */}
      {(editUniversity || newUniversity) && (
        <UniversityFormModal
          item={editUniversity}
          onClose={() => { setEditUniversity(null); setNewUniversity(false); }}
          onSaved={() => { setEditUniversity(null); setNewUniversity(false); loadUniversities(); showToast(editUniversity ? 'Cập nhật thành công' : 'Thêm mới thành công'); }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa "${deleteConfirm.name}"? Thao tác này không thể hoàn tác.`}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => deleteConfirm.type === 'scholarships'
            ? handleDeleteScholarship(deleteConfirm.id)
            : handleDeleteUniversity(deleteConfirm.id)
          }
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   ── Scholarship Form Modal
   ══════════════════════════════════════════════════════════════ */
function ScholarshipFormModal({ item, onClose, onSaved, onError }: {
  item: ScholarshipItem | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || '',
    country: item?.country || '',
    countryCode: item?.countryCode || '',
    countryFlag: item?.countryFlag || '',
    value: item?.value || '',
    level: item?.level || '',
    deadline: item?.deadline || '',
    image: item?.image || '',
    description: item?.description || '',
    benefits: item?.benefits || [],
    requirements: item?.requirements || [],
    fields: item?.fields || [],
    applicationUrl: item?.applicationUrl || '',
    hostInstitution: item?.hostInstitution || '',
    duration: item?.duration || '',
    openDate: item?.openDate || '',
    status: item?.status || 'Đang mở đơn',
  });

  const upd = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.country || !form.countryCode || !form.value || !form.level || !form.deadline) {
      onError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await apiAdminUpdateScholarship(item!.id, form);
      } else {
        await apiAdminCreateScholarship(form);
      }
      onSaved();
    } catch (e: any) {
      onError(e.message || 'Lỗi lưu dữ liệu');
    }
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl mx-4 border border-white/80" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-white">workspace_premium</span>
            </div>
            <h2 className="text-lg font-bold text-[#1E3A8A]">{isEdit ? 'Chỉnh sửa Học bổng' : 'Thêm Học bổng mới'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên học bổng" value={form.name} onChange={v => upd('name', v)} placeholder="VD: Fulbright Vietnam" required />
            <Field label="Quốc gia" value={form.country} onChange={v => upd('country', v)} placeholder="VD: USA" required />
            <Field label="Mã quốc gia (2 ký tự)" value={form.countryCode} onChange={v => upd('countryCode', v.toUpperCase())} placeholder="VD: US" required />
            <Field label="Cờ (emoji)" value={form.countryFlag} onChange={v => upd('countryFlag', v)} placeholder="🇺🇸" />
            <Field label="Giá trị" value={form.value} onChange={v => upd('value', v)} placeholder="VD: 100% học phí" required />
            <Field label="Bậc học" value={form.level} onChange={v => upd('level', v)} placeholder="VD: Thạc sĩ" required />
            <Field label="Hạn nộp" value={form.deadline} onChange={v => upd('deadline', v)} placeholder="DD/MM/YYYY" required />
            <Field label="Ngày mở đơn" value={form.openDate} onChange={v => upd('openDate', v)} placeholder="DD/MM/YYYY" />
            <Field label="Thời gian" value={form.duration} onChange={v => upd('duration', v)} placeholder="VD: 2 năm" />
            <Field label="Trạng thái" value={form.status} onChange={v => upd('status', v)} placeholder="VD: Đang mở đơn" />
            <Field label="Đơn vị tài trợ" value={form.hostInstitution} onChange={v => upd('hostInstitution', v)} placeholder="VD: Các trường đại học Mỹ" />
            <Field label="Link nộp đơn" value={form.applicationUrl} onChange={v => upd('applicationUrl', v)} placeholder="https://..." />
          </div>
          <Field label="Ảnh minh họa (URL)" value={form.image} onChange={v => upd('image', v)} placeholder="https://..." />
          <Field label="Mô tả" value={form.description} onChange={v => upd('description', v)} placeholder="Mô tả chi tiết về học bổng..." multiline />
          <ListEditor label="Quyền lợi" items={form.benefits} onChange={v => upd('benefits', v)} />
          <ListEditor label="Yêu cầu" items={form.requirements} onChange={v => upd('requirements', v)} />
          <ListEditor label="Lĩnh vực" items={form.fields} onChange={v => upd('fields', v)} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">Hủy</button>
          <GlassSurface width="auto" height={40} borderRadius={12}
            style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
            className="cursor-pointer" onClick={handleSubmit}
          >
            <span className="text-white text-sm font-semibold px-6 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </span>
          </GlassSurface>
        </div>
      </div>
    </div>,
    document.body,
  );
}


/* ══════════════════════════════════════════════════════════════
   ── University Form Modal
   ══════════════════════════════════════════════════════════════ */
function UniversityFormModal({ item, onClose, onSaved, onError }: {
  item: UniversityItem | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || '',
    shortName: item?.shortName || '',
    country: item?.country || '',
    countryCode: item?.countryCode || '',
    countryFlag: item?.countryFlag || '',
    city: item?.city || '',
    rank: item?.rank || '',
    acceptRate: item?.acceptRate || '',
    fields: item?.fields || [],
    image: item?.image || '',
    description: item?.description || '',
    founded: item?.founded?.toString() || '',
    type: item?.type || '',
    studentCount: item?.studentCount || '',
    internationalRate: item?.internationalRate || '',
    tuitionFee: item?.tuitionFee || '',
    financialAid: item?.financialAid || '',
    topPrograms: item?.topPrograms || [],
    campusLife: item?.campusLife || '',
    admissionTips: item?.admissionTips || [],
    website: item?.website || '',
  });

  const upd = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.country || !form.countryCode) {
      onError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        founded: form.founded ? parseInt(form.founded) : undefined,
      };
      if (isEdit) {
        await apiAdminUpdateUniversity(item!.id, payload);
      } else {
        await apiAdminCreateUniversity(payload as any);
      }
      onSaved();
    } catch (e: any) {
      onError(e.message || 'Lỗi lưu dữ liệu');
    }
    setSaving(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/30 backdrop-blur-sm overflow-y-auto py-8" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl mx-4 border border-white/80" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="material-symbols-outlined text-white">school</span>
            </div>
            <h2 className="text-lg font-bold text-[#1E3A8A]">{isEdit ? 'Chỉnh sửa Trường' : 'Thêm Trường mới'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên trường" value={form.name} onChange={v => upd('name', v)} placeholder="VD: MIT" required />
            <Field label="Tên viết tắt" value={form.shortName} onChange={v => upd('shortName', v)} placeholder="VD: MIT" />
            <Field label="Quốc gia" value={form.country} onChange={v => upd('country', v)} placeholder="VD: USA" required />
            <Field label="Mã quốc gia (2 ký tự)" value={form.countryCode} onChange={v => upd('countryCode', v.toUpperCase())} placeholder="VD: US" required />
            <Field label="Cờ (emoji)" value={form.countryFlag} onChange={v => upd('countryFlag', v)} placeholder="🇺🇸" />
            <Field label="Thành phố" value={form.city} onChange={v => upd('city', v)} placeholder="VD: Cambridge, MA" />
            <Field label="Xếp hạng" value={form.rank} onChange={v => upd('rank', v)} placeholder="VD: #1" />
            <Field label="Tỷ lệ chấp nhận" value={form.acceptRate} onChange={v => upd('acceptRate', v)} placeholder="VD: 3.9%" />
            <Field label="Năm thành lập" value={form.founded} onChange={v => upd('founded', v)} placeholder="VD: 1861" />
            <Field label="Loại trường" value={form.type} onChange={v => upd('type', v)} placeholder="VD: Tư thục" />
            <Field label="Số sinh viên" value={form.studentCount} onChange={v => upd('studentCount', v)} placeholder="VD: 11,934" />
            <Field label="Tỷ lệ SV quốc tế" value={form.internationalRate} onChange={v => upd('internationalRate', v)} placeholder="VD: 33%" />
            <Field label="Học phí" value={form.tuitionFee} onChange={v => upd('tuitionFee', v)} placeholder="VD: $57,986/năm" />
            <Field label="Hỗ trợ tài chính" value={form.financialAid} onChange={v => upd('financialAid', v)} placeholder="VD: 100% need-blind" />
          </div>
          <Field label="Website" value={form.website} onChange={v => upd('website', v)} placeholder="https://..." />
          <Field label="Ảnh minh họa (URL)" value={form.image} onChange={v => upd('image', v)} placeholder="https://..." />
          <Field label="Mô tả" value={form.description} onChange={v => upd('description', v)} placeholder="Mô tả chi tiết..." multiline />
          <Field label="Đời sống campus" value={form.campusLife} onChange={v => upd('campusLife', v)} placeholder="Mô tả đời sống sinh viên..." multiline />
          <ListEditor label="Ngành học" items={form.fields} onChange={v => upd('fields', v)} />
          <ListEditor label="Chương trình nổi bật" items={form.topPrograms} onChange={v => upd('topPrograms', v)} />
          <ListEditor label="Lời khuyên tuyển sinh" items={form.admissionTips} onChange={v => upd('admissionTips', v)} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">Hủy</button>
          <GlassSurface width="auto" height={40} borderRadius={12}
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
            className="cursor-pointer" onClick={handleSubmit}
          >
            <span className="text-white text-sm font-semibold px-6 flex items-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </span>
          </GlassSurface>
        </div>
      </div>
    </div>,
    document.body,
  );
}
