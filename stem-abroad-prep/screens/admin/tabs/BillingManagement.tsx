import React, { useState } from 'react';
import { GlassCard, GlassHeader, PageTitle, StatCard, Badge, Toggle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { glass } from '../types';

const mockPlans = [
  { id: '1', name: 'Free', price: 0, users: 120, tokens: 5000, features: ['AI Advisor cơ bản', '5 lượt/ngày', 'Hỗ trợ email'] },
  { id: '2', name: 'Pro', price: 9.99, users: 35, tokens: 50000, features: ['AI không giới hạn', 'Essay Review', 'Portfolio PDF', 'Ưu tiên hỗ trợ'] },
  { id: '3', name: 'Enterprise', price: 49.99, users: 5, tokens: 500000, features: ['Tất cả Pro', 'API access', 'Custom AI', 'SLA 99.9%'] },
];

const mockTransactions = [
  { id: 'TXN-001', user: 'Trần Thị B', plan: 'Pro', amount: 9.99, status: 'success', date: '2026-02-18' },
  { id: 'TXN-002', user: 'Phạm D', plan: 'Pro', amount: 9.99, status: 'success', date: '2026-02-17' },
  { id: 'TXN-003', user: 'Hoàng E', plan: 'Enterprise', amount: 49.99, status: 'failed', date: '2026-02-16' },
];

const txColors: Record<string, string> = { success: 'green', failed: 'red', refunded: 'yellow' };

export default function BillingManagement() {
  const [tab, setTab] = useState<'plans' | 'transactions' | 'coupons'>('plans');

  return (
    <div>
      <PageTitle title="Thanh toán & Gói dịch vụ" subtitle="Quản lý subscription, giao dịch, coupon" icon="payments" />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatCard icon="attach_money" label="Doanh thu tháng" value="$459" trend="+18%" color="green" />
        <StatCard icon="people" label="Paid users" value="40" color="blue" />
        <StatCard icon="error" label="Thanh toán lỗi" value="1" color="red" />
        <StatCard icon="redeem" label="Coupon active" value="3" color="purple" />
      </div>

      <div className="flex gap-1 bg-white/40 rounded-xl p-1 w-fit mb-6">
        {[
          { id: 'plans' as const, label: 'Gói dịch vụ' },
          { id: 'transactions' as const, label: 'Giao dịch' },
          { id: 'coupons' as const, label: 'Coupon' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPlans.map(p => (
            <GlassCard key={p.id}>
              <div className="text-center mb-4">
                <h3 className="text-xl font-extrabold text-[#1E3A8A]">{p.name}</h3>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">${p.price}<span className="text-sm text-slate-400 font-normal">/tháng</span></p>
              </div>
              <div className="space-y-2 mb-4">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-emerald-500 text-base">check</span>{f}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span>{p.users} users</span>
                <span>{p.tokens.toLocaleString()} tokens/tháng</span>
              </div>
              <GlassSurface width="100%" height={38} borderRadius={12} style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }} onClick={() => {}}>
                <span className="px-4 text-sm font-semibold text-white">Chỉnh sửa</span>
              </GlassSurface>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'transactions' && (
        <GlassCard className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/50">
              {['ID', 'User', 'Gói', 'Số tiền', 'Trạng thái', 'Ngày'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {mockTransactions.map(t => (
                <tr key={t.id} className="border-b border-white/30 hover:bg-white/20 transition">
                  <td className="px-4 py-3 font-mono text-slate-600">{t.id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{t.user}</td>
                  <td className="px-4 py-3"><Badge text={t.plan} color="blue" /></td>
                  <td className="px-4 py-3 font-semibold text-slate-800">${t.amount}</td>
                  <td className="px-4 py-3"><Badge text={t.status} color={txColors[t.status]} /></td>
                  <td className="px-4 py-3 text-slate-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === 'coupons' && (
        <GlassCard>
          <GlassHeader icon="redeem" title="Mã giảm giá" extra={
            <GlassSurface width="auto" height={30} borderRadius={10} style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }} onClick={() => {}}>
              <span className="px-3 text-xs font-semibold text-white">+ Tạo coupon</span>
            </GlassSurface>
          } />
          <div className="space-y-2">
            {[
              { code: 'WELCOME50', discount: '50%', uses: 23, max: 100, expiry: '2026-03-31' },
              { code: 'NEWYEAR', discount: '$5 off', uses: 45, max: 50, expiry: '2026-02-28' },
            ].map(c => (
              <div key={c.code} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 border border-white/60">
                <span className="font-mono font-bold text-blue-600">{c.code}</span>
                <Badge text={c.discount} color="green" />
                <span className="text-xs text-slate-500">{c.uses}/{c.max} đã dùng</span>
                <span className="text-xs text-slate-400">Hết hạn: {c.expiry}</span>
                <button className="ml-auto p-1 rounded hover:bg-white/60"><span className="material-symbols-outlined text-slate-400 text-sm">edit</span></button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
