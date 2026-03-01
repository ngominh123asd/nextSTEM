import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard, GlassHeader, PageTitle, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';
import {
  apiExportUsersCSV, apiExportUsersExcel, apiExportAuditLogsJSON,
  apiExportConversationsJSON, apiExportBackupJSON, apiExportDumpXML,
  apiExportTemplate, apiImportUsersPreview, apiImportUsersCSV,
  type ImportPreviewResult, type ImportResult,
} from '../../../lib/api';

type ExTab = 'import' | 'export';

/* ─── Toast ─── */
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error' | 'info'; onDone: () => void }) {
  React.useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
  return createPortal(
    <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-2 ${bg} text-white px-4 py-3 rounded-xl shadow-lg max-w-sm`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>,
    document.body,
  );
}

export default function DataExchange() {
  const [tab, setTab] = useState<ExTab>('export');
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState('users');
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });

  /* ── Export handler ── */
  const handleExport = async (key: string, fn: () => Promise<void>) => {
    setExporting(key);
    try {
      await fn();
      showToast('Xuất dữ liệu thành công!');
    } catch (e: any) {
      showToast(e.message || 'Lỗi xuất dữ liệu', 'error');
    } finally {
      setExporting(null);
    }
  };

  /* ── Preview handler ── */
  const handlePreview = async () => {
    if (!file) { showToast('Chọn file CSV trước', 'error'); return; }
    setPreviewing(true);
    setPreview(null);
    setImportResult(null);
    try {
      const result = await apiImportUsersPreview(file);
      setPreview(result);
    } catch (e: any) {
      showToast(e.message || 'Lỗi xem trước', 'error');
    } finally {
      setPreviewing(false);
    }
  };

  /* ── Import handler ── */
  const handleImport = async () => {
    if (!file) { showToast('Chọn file CSV trước', 'error'); return; }
    setImporting(true);
    try {
      const result = await apiImportUsersCSV(file);
      setImportResult(result);
      setPreview(null);
      showToast(`Import thành công: ${result.created} người dùng được tạo`);
    } catch (e: any) {
      showToast(e.message || 'Lỗi import', 'error');
    } finally {
      setImporting(false);
    }
  };

  /* ── Download template ── */
  const handleDownloadTemplate = async () => {
    try {
      await apiExportTemplate();
      showToast('Đã tải mẫu CSV');
    } catch (e: any) {
      showToast(e.message || 'Lỗi tải mẫu', 'error');
    }
  };

  /* ── File select ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(null);
    setImportResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      setPreview(null);
      setImportResult(null);
    } else {
      showToast('Chỉ chấp nhận file .csv', 'error');
    }
  };

  const exportCards = [
    { key: 'csv', label: 'Users (CSV)', icon: 'group', desc: 'Danh sách người dùng', format: 'CSV', grad: '#1152d4, #2E6AE6', fn: apiExportUsersCSV },
    { key: 'xlsx', label: 'Users (Excel)', icon: 'group', desc: 'Dữ liệu chi tiết', format: 'XLSX', grad: '#059669, #10b981', fn: apiExportUsersExcel },
    { key: 'audit', label: 'Audit Logs (JSON)', icon: 'receipt_long', desc: 'Nhật ký hệ thống', format: 'JSON', grad: '#7c3aed, #6d28d9', fn: apiExportAuditLogsJSON },
    { key: 'backup', label: 'Full Backup (JSON)', icon: 'backup', desc: 'Toàn bộ database', format: 'JSON', grad: '#dc2626, #ef4444', fn: apiExportBackupJSON },
    { key: 'convo', label: 'Conversations (JSON)', icon: 'chat', desc: 'Dữ liệu hội thoại', format: 'JSON', grad: '#f59e0b, #d97706', fn: apiExportConversationsJSON },
    { key: 'xml', label: 'Data Dump (XML)', icon: 'storage', desc: 'Toàn bộ export XML', format: 'XML', grad: '#374151, #6b7280', fn: apiExportDumpXML },
  ];

  return (
    <div>
      <PageTitle title="Trao đổi Dữ liệu" subtitle="Import/Export dữ liệu hệ thống" icon="swap_horiz" />

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setTab('import')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'import' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-sm">upload</span> Import
        </button>
        <button onClick={() => setTab('export')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === 'export' ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-sm">download</span> Export
        </button>
      </div>

      {/* ═══════════ IMPORT TAB ═══════════ */}
      {tab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GlassCard>
              <GlassHeader icon="upload_file" title="Nhập liệu hàng loạt" />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Loại dữ liệu</label>
                  <select className={glass.input} value={dataType} onChange={e => setDataType(e.target.value)}>
                    <option value="users">Người dùng</option>
                  </select>
                </div>

                {/* Drop zone */}
                <div
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">cloud_upload</span>
                  <p className="text-sm text-slate-500 mb-2">Kéo thả file CSV vào đây hoặc click để chọn</p>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                  {file && (
                    <div className="flex items-center justify-center gap-2 mt-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl w-fit mx-auto">
                      <span className="material-symbols-outlined text-blue-600 text-sm">description</span>
                      <span className="text-xs text-blue-800 font-medium">{file.name}</span>
                      <span className="text-xs text-blue-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setImportResult(null); if (fileRef.current) fileRef.current.value = ''; }}
                        className="ml-1 p-0.5 rounded hover:bg-blue-200 transition"
                      >
                        <span className="material-symbols-outlined text-blue-400 text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <GlassSurface
                    width="auto" height={42} borderRadius={14}
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', opacity: !file || previewing ? 0.5 : 1 }}
                    onClick={file && !previewing ? handlePreview : () => {}}
                  >
                    <span className="px-5 text-sm font-semibold text-white">
                      {previewing ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xử lý...</span>
                      ) : 'Preview dữ liệu'}
                    </span>
                  </GlassSurface>
                  <GlassSurface
                    width="auto" height={42} borderRadius={14}
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', opacity: !file || importing || !preview ? 0.5 : 1 }}
                    onClick={file && !importing && preview ? handleImport : () => {}}
                  >
                    <span className="px-5 text-sm font-semibold text-white">
                      {importing ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang import...</span>
                      ) : 'Import'}
                    </span>
                  </GlassSurface>
                </div>
              </div>
            </GlassCard>

            {/* Import Result */}
            {importResult && (
              <GlassCard>
                <GlassHeader icon="check_circle" title="Kết quả Import" />
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                      <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                      <p className="text-xs text-green-600">Đã tạo</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
                      <p className="text-xs text-amber-600">Bỏ qua</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                      <p className="text-2xl font-bold text-red-700">{importResult.errors.length}</p>
                      <p className="text-xs text-red-600">Lỗi</p>
                    </div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {importResult.errors.map((err, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-100 text-xs">
                          <span className="font-mono text-red-400">Dòng {err.row}</span>
                          <span className="text-red-600">{err.email}</span>
                          <span className="text-red-500 ml-auto">{err.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          <div className="space-y-6">
            {/* Validate Rules */}
            <GlassCard>
              <GlassHeader icon="checklist" title="Quy tắc Validate" />
              <div className="space-y-2 text-sm text-slate-600">
                <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="font-semibold text-slate-700">Email</p>
                  <p className="text-xs text-slate-500">Bắt buộc, duy nhất, định dạng hợp lệ</p>
                </div>
                <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="font-semibold text-slate-700">Tên</p>
                  <p className="text-xs text-slate-500">Bắt buộc, 2-100 ký tự</p>
                </div>
                <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="font-semibold text-slate-700">Vai trò</p>
                  <p className="text-xs text-slate-500">user | admin (mặc định: user)</p>
                </div>
                <div className="p-3 rounded-xl bg-white/40 border border-white/60">
                  <p className="font-semibold text-slate-700">Mật khẩu mặc định</p>
                  <p className="text-xs text-slate-500">ChangeMe@123 (tất cả user mới)</p>
                </div>
              </div>
              <div className="mt-4">
                <GlassSurface width="100%" height={36} borderRadius={12} style={{ background: 'linear-gradient(135deg, #6b7280, #9ca3af)' }} onClick={handleDownloadTemplate}>
                  <span className="px-4 text-xs font-semibold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">download</span> Tải mẫu CSV
                  </span>
                </GlassSurface>
              </div>
            </GlassCard>

            {/* Preview table */}
            {preview && (
              <GlassCard>
                <GlassHeader icon="preview" title={`Preview (${preview.total} dòng)`} />
                <div className="flex gap-3 mb-3">
                  <Badge text={`Hợp lệ: ${preview.valid}`} color="green" />
                  <Badge text={`Trùng: ${preview.duplicates}`} color="amber" />
                  <Badge text={`Lỗi: ${preview.errors}`} color="red" />
                </div>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="py-2 px-2 text-slate-500 font-semibold">#</th>
                        <th className="py-2 px-2 text-slate-500 font-semibold">Tên</th>
                        <th className="py-2 px-2 text-slate-500 font-semibold">Email</th>
                        <th className="py-2 px-2 text-slate-500 font-semibold">Role</th>
                        <th className="py-2 px-2 text-slate-500 font-semibold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map(r => (
                        <tr key={r.row} className={`border-b border-slate-100 ${r.status === 'error' ? 'bg-red-50' : r.status === 'duplicate' ? 'bg-amber-50' : ''}`}>
                          <td className="py-1.5 px-2 font-mono text-slate-400">{r.row}</td>
                          <td className="py-1.5 px-2 text-slate-800">{r.name}</td>
                          <td className="py-1.5 px-2 text-slate-600">{r.email}</td>
                          <td className="py-1.5 px-2">{r.role}</td>
                          <td className="py-1.5 px-2">
                            {r.status === 'ok' && <span className="text-green-600 font-medium">OK</span>}
                            {r.status === 'error' && <span className="text-red-600" title={r.error}>{r.error}</span>}
                            {r.status === 'duplicate' && <span className="text-amber-600" title={r.error}>Trùng</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ EXPORT TAB ═══════════ */}
      {tab === 'export' && (
        <GlassCard>
          <GlassHeader icon="download" title="Xuất dữ liệu" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportCards.map(e => (
              <div key={e.key} className="p-4 rounded-xl bg-white/40 border border-white/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-blue-600">{e.icon}</span>
                  <p className="text-sm font-semibold text-slate-800">{e.label}</p>
                </div>
                <p className="text-xs text-slate-500 mb-3">{e.desc}</p>
                <GlassSurface
                  width="100%" height={34} borderRadius={10}
                  style={{ background: `linear-gradient(135deg, ${e.grad})`, opacity: exporting === e.key ? 0.7 : 1 }}
                  onClick={() => !exporting && handleExport(e.key, e.fn)}
                >
                  <span className="px-4 text-xs font-semibold text-white flex items-center justify-center gap-1.5">
                    {exporting === e.key ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xuất...</>
                    ) : (
                      <>Xuất {e.format}</>
                    )}
                  </span>
                </GlassSurface>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
