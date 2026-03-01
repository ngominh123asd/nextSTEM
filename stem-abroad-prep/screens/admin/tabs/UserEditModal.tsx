import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard, GlassHeader, PageTitle, Badge, Toggle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import {
  apiAdminGetUser, apiAdminUpdateUser, apiAdminDeleteUser,
  apiAdminHardDeleteUser, apiAdminResetPassword, apiAdminSuspendUser, apiAdminBanUser,
  type AdminUser,
} from '../../../lib/api';
import { glass } from '../types';

interface Props { userId: string; onBack: () => void; }

/* ─── Inline confirm dialog (portal) ─── */
function ConfirmDialog({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-white/60" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 transition">Hủy</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition ${confirmColor}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Temp password result dialog ─── */
function TempPasswordDialog({ password, onClose }: { password: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-white/60" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
          <h3 className="text-base font-bold text-slate-800">Mật khẩu đã được reset</h3>
        </div>
        <p className="text-sm text-slate-600 mb-3">Mật khẩu tạm thời (gửi cho người dùng):</p>
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-3 mb-4">
          <code className="text-sm font-mono text-slate-800 flex-1 select-all">{password}</code>
          <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-slate-200 transition" title="Copy">
            <span className="material-symbols-outlined text-slate-500 text-lg">{copied ? 'done' : 'content_copy'}</span>
          </button>
        </div>
        <p className="text-xs text-amber-600 mb-4">⚠ Mật khẩu chỉ hiển thị một lần. Hãy sao chép ngay!</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition">Đóng</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Toast notification ─── */
function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? 'check_circle' : 'error';
  return createPortal(
    <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-2 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-slide-in`}>
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-sm font-medium">{message}</span>
    </div>,
    document.body,
  );
}

export default function UserEditModal({ userId, onBack }: Props) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', is_active: true });

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<null | {
    title: string; message: string; confirmLabel: string; confirmColor: string; action: () => Promise<void>;
  }>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [toast, setToast] = useState<null | { message: string; type: 'success' | 'error' }>(null);

  useEffect(() => {
    apiAdminGetUser(userId)
      .then(u => { setUser(u); setForm({ name: u.name, email: u.email, role: u.role, is_active: u.is_active }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiAdminUpdateUser(userId, form);
      setUser(updated);
      showToast('Cập nhật thành công');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  /* ── Reset Password ── */
  const handleResetPassword = () => {
    setConfirmDialog({
      title: 'Reset mật khẩu',
      message: `Tạo mật khẩu tạm thời mới cho "${user?.name}"? Mật khẩu cũ sẽ bị vô hiệu hóa.`,
      confirmLabel: 'Reset',
      confirmColor: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        try {
          const res = await apiAdminResetPassword(userId);
          setTempPassword(res.temp_password);
        } catch (e: any) { showToast(e.message, 'error'); }
      },
    });
  };

  /* ── Soft Delete ── */
  const handleSoftDelete = () => {
    setConfirmDialog({
      title: 'Soft Delete',
      message: `Đánh dấu "${user?.name}" là Inactive? Tài khoản vẫn còn trong hệ thống.`,
      confirmLabel: 'Inactive',
      confirmColor: 'bg-amber-600 hover:bg-amber-700',
      action: async () => {
        try {
          await apiAdminDeleteUser(userId);
          setForm(f => ({ ...f, is_active: false }));
          setUser(u => u ? { ...u, is_active: false, status: 'deactivated' } : u);
          showToast('Đã chuyển sang Inactive');
        } catch (e: any) { showToast(e.message, 'error'); }
      },
    });
  };

  /* ── Hard Delete ── */
  const handleHardDelete = () => {
    setConfirmDialog({
      title: 'XÓA VĨNH VIỄN',
      message: `Xóa hoàn toàn "${user?.name}" khỏi hệ thống? Hành động KHÔNG THỂ hoàn tác!`,
      confirmLabel: 'Xóa vĩnh viễn',
      confirmColor: 'bg-red-600 hover:bg-red-700',
      action: async () => {
        try {
          await apiAdminHardDeleteUser(userId);
          showToast('Đã xóa vĩnh viễn');
          setTimeout(onBack, 800);
        } catch (e: any) { showToast(e.message, 'error'); }
      },
    });
  };

  /* ── Suspend ── */
  const handleSuspend = () => {
    setConfirmDialog({
      title: 'Suspend tài khoản',
      message: `Tạm ngưng tài khoản "${user?.name}"? Người dùng sẽ không thể đăng nhập.`,
      confirmLabel: 'Suspend',
      confirmColor: 'bg-purple-600 hover:bg-purple-700',
      action: async () => {
        try {
          const res = await apiAdminSuspendUser(userId);
          setForm(f => ({ ...f, is_active: false }));
          setUser(u => u ? { ...u, is_active: false, status: res.status } : u);
          showToast('Tài khoản đã bị tạm ngưng');
        } catch (e: any) { showToast(e.message, 'error'); }
      },
    });
  };

  /* ── Ban ── */
  const handleBan = () => {
    setConfirmDialog({
      title: 'Ban vĩnh viễn',
      message: `Cấm vĩnh viễn "${user?.name}"? Người dùng sẽ không thể sử dụng hệ thống.`,
      confirmLabel: 'Ban',
      confirmColor: 'bg-gray-800 hover:bg-gray-900',
      action: async () => {
        try {
          const res = await apiAdminBanUser(userId);
          setForm(f => ({ ...f, is_active: false }));
          setUser(u => u ? { ...u, is_active: false, status: res.status } : u);
          showToast('Tài khoản đã bị cấm vĩnh viễn');
        } catch (e: any) { showToast(e.message, 'error'); }
      },
    });
  };

  /* ── Confirm dialog handler ── */
  const executeConfirm = async () => {
    if (!confirmDialog) return;
    const action = confirmDialog.action;
    setConfirmDialog(null);
    await action();
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!user) return <div className="text-center py-16 text-slate-400">Không tìm thấy người dùng</div>;

  const statusBadge = user.status === 'active' ? '🟢 Active'
    : user.status === 'suspended' ? '🟡 Suspended'
    : user.status === 'banned' ? '🔴 Banned'
    : '⚪ Inactive';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/50 transition">
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </button>
        <PageTitle title={user.name} subtitle={user.email} icon="person" />
        <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-white/40 text-slate-600">{statusBadge}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <GlassCard className="lg:col-span-2">
          <GlassHeader icon="edit" title="Thông tin cá nhân" />
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tên</label>
              <input className={glass.input} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email</label>
              <input className={glass.input} value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vai trò</label>
              <select className={glass.input} value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <Toggle on={form.is_active} onToggle={() => setForm(f => ({...f, is_active: !f.is_active}))} label="Tài khoản hoạt động" />
            <div className="flex gap-3 pt-2">
              <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={handleSave}>
                <span className="px-5 text-sm font-semibold text-white">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </GlassSurface>
              <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #6b7280, #9ca3af)' }} onClick={handleResetPassword}>
                <span className="px-5 text-sm font-semibold text-white">Reset mật khẩu</span>
              </GlassSurface>
            </div>
          </div>
        </GlassCard>

        {/* Danger zone */}
        <GlassCard>
          <GlassHeader icon="warning" title="Vùng nguy hiểm" />
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Hành động ảnh hưởng đến tài khoản người dùng.</p>
            <GlassSurface width="100%" height={40} borderRadius={12} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} onClick={handleSoftDelete}>
              <span className="px-4 text-sm font-semibold text-white w-full text-center">Soft Delete (Inactive)</span>
            </GlassSurface>
            <GlassSurface width="100%" height={40} borderRadius={12} style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }} onClick={handleHardDelete}>
              <span className="px-4 text-sm font-semibold text-white w-full text-center">Hard Delete (Vĩnh viễn)</span>
            </GlassSurface>
            <GlassSurface width="100%" height={40} borderRadius={12} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }} onClick={handleSuspend}>
              <span className="px-4 text-sm font-semibold text-white w-full text-center">Suspend tài khoản</span>
            </GlassSurface>
            <GlassSurface width="100%" height={40} borderRadius={12} style={{ background: 'linear-gradient(135deg, #374151, #1f2937)' }} onClick={handleBan}>
              <span className="px-4 text-sm font-semibold text-white w-full text-center">Ban vĩnh viễn</span>
            </GlassSurface>
          </div>

          <div className="mt-6 pt-4 border-t border-white/50">
            <GlassHeader icon="info" title="Metadata" />
            <div className="space-y-1 text-xs text-slate-500">
              <p>ID: <span className="font-mono text-slate-700">{user.id}</span></p>
              <p>Status: <span className="font-semibold text-slate-700">{user.status}</span></p>
              <p>Tạo: {new Date(user.created_at).toLocaleString('vi-VN')}</p>
              <p>Cập nhật: {new Date(user.updated_at).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Dialogs */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmColor={confirmDialog.confirmColor}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
      {tempPassword && <TempPasswordDialog password={tempPassword} onClose={() => setTempPassword(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}