import React, { useEffect, useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, Badge, EmptyState } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { apiAdminUsers, type AdminUser, type UserListResponse } from '../../../lib/api';
import { glass, type AdminTab } from '../types';

interface Props { onEditUser: (id: string) => void; }

const roleColors: Record<string, string> = { admin: 'purple', super_admin: 'red', user: 'blue' };
const statusColors: Record<string, string> = { active: 'green', inactive: 'gray', suspended: 'yellow', banned: 'red' };

export default function UserManagement({ onEditUser }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiAdminUsers({ page, page_size: 10, search, role: roleFilter, status: statusFilter, sort_by: sortBy, sort_dir: sortDir })
      .then(r => { setUsers(r.items); setTotal(r.total); setTotalPages(r.total_pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, roleFilter, statusFilter, sortBy, sortDir]);

  const handleSearch = () => { setPage(1); load(); };

  return (
    <div>
      <PageTitle title="Quản lý Người dùng" subtitle={`Tổng cộng ${total} người dùng`} icon="group" />

      {/* Filters bar */}
      <GlassCard className="mb-6 !p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input className={glass.input} placeholder="Tìm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <select className={`${glass.input} !w-auto`} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select className={`${glass.input} !w-auto`} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={handleSearch}>
            <span className="px-4 text-sm font-semibold text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">search</span> Tìm
            </span>
          </GlassSurface>
          <GlassSurface width="auto" height={42} borderRadius={14} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
            <span className="px-4 text-sm font-semibold text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">download</span> Export
            </span>
          </GlassSurface>
        </div>
      </GlassCard>

      {/* Users table */}
      <GlassCard className="!p-0 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon="group_off" title="Không có dữ liệu" desc="Không tìm thấy người dùng nào" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/50 text-left">
                {['Tên', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/30 hover:bg-white/30 transition cursor-pointer" onClick={() => onEditUser(u.id)}>
                  <td className="px-5 py-3 font-semibold text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><Badge text={u.role} color={roleColors[u.role] || 'blue'} /></td>
                  <td className="px-5 py-3"><Badge text={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'green' : 'gray'} /></td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3">
                    <span className="material-symbols-outlined text-slate-400 hover:text-blue-600 transition">chevron_right</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/40">
            <span className="text-xs text-slate-500">Trang {page}/{totalPages} · {total} kết quả</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-30">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-white/50 disabled:opacity-30">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
