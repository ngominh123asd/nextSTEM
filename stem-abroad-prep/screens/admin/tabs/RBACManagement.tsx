import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, Toggle, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockRoles = [
  { id: '1', name: 'Super Admin', perms: 42, users: 1, color: 'red', inherits: null },
  { id: '2', name: 'Admin', perms: 30, users: 3, color: 'purple', inherits: 'Super Admin' },
  { id: '3', name: 'Moderator', perms: 15, users: 5, color: 'blue', inherits: 'Admin' },
  { id: '4', name: 'Support Staff', perms: 8, users: 4, color: 'green', inherits: null },
  { id: '5', name: 'User', perms: 5, users: 120, color: 'gray', inherits: null },
];

const permModules = [
  { module: 'Users', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Content', actions: ['create', 'read', 'update', 'delete', 'approve'] },
  { module: 'Settings', actions: ['read', 'update'] },
  { module: 'Logs', actions: ['read'] },
  { module: 'AI Agents', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Analytics', actions: ['read', 'export'] },
];

export default function RBACManagement() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [perms, setPerms] = useState<Record<string, string[]>>({});

  const role = mockRoles.find(r => r.id === selectedRole);

  return (
    <div>
      <PageTitle title="Phân quyền (RBAC)" subtitle="Quản lý vai trò, quyền hạn & bảo mật" icon="admin_panel_settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles list */}
        <GlassCard>
          <GlassHeader icon="badge" title="Vai trò" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Tạo mới</span>
            </GlassSurface>
          } />
          <div className="space-y-2">
            {mockRoles.map(r => (
              <div key={r.id} onClick={() => setSelectedRole(r.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === r.id ? 'bg-blue-50/80 border-blue-200' : 'bg-white/40 border-white/60 hover:bg-white/60'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">{r.name}</span>
                  <Badge text={`${r.users} users`} color={r.color} />
                </div>
                <p className="text-xs text-slate-500 mt-1">{r.perms} quyền {r.inherits && `· Kế thừa từ ${r.inherits}`}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Permissions matrix */}
        <GlassCard className="lg:col-span-2">
          {role ? (
            <>
              <GlassHeader icon="key" title={`Quyền: ${role.name}`} extra={
                <div className="flex gap-2">
                  <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                    <span className="px-3 text-xs font-semibold text-white">Lưu</span>
                  </GlassSurface>
                  <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }} onClick={() => {}}>
                    <span className="px-3 text-xs font-semibold text-white">Xóa vai trò</span>
                  </GlassSurface>
                </div>
              } />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/50">
                      <th className="text-left px-3 py-2 text-xs font-bold text-slate-400 uppercase">Module</th>
                      {['Create', 'Read', 'Update', 'Delete', 'Extra'].map(a => (
                        <th key={a} className="px-3 py-2 text-xs font-bold text-slate-400 uppercase text-center">{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permModules.map(m => (
                      <tr key={m.module} className="border-b border-white/30">
                        <td className="px-3 py-2 font-semibold text-slate-700">{m.module}</td>
                        {['create', 'read', 'update', 'delete', 'approve'].map(action => (
                          <td key={action} className="px-3 py-2 text-center">
                            {m.actions.includes(action) ? (
                              <input type="checkbox" defaultChecked={role.name === 'Super Admin'} className="w-4 h-4 rounded accent-blue-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Security settings */}
              <div className="mt-6 pt-4 border-t border-white/50">
                <GlassHeader icon="security" title="Bảo mật nâng cao" />
                <div className="space-y-3">
                  <Toggle on={true} onToggle={() => {}} label="Bắt buộc 2FA cho vai trò này" />
                  <Toggle on={false} onToggle={() => {}} label="IP Whitelist" />
                  <Toggle on={true} onToggle={() => {}} label="Force logout sau 30 phút không hoạt động" />
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password Policy</label>
                    <select className={glass.input}>
                      <option>Tối thiểu 8 ký tự + chữ hoa + số</option>
                      <option>Tối thiểu 12 ký tự + đặc biệt</option>
                      <option>Tối thiểu 16 ký tự (khuyến nghị)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState icon="admin_panel_settings" title="Chọn vai trò" desc="Nhấp vào vai trò bên trái để xem/sửa quyền" />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
