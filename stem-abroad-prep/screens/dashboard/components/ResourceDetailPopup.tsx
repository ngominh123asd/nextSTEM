import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlassSurface from '../../../components/GlassSurface';

/* ─── Types ─────────────────────────────────────────── */
export interface ScholarshipData {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  value: string;
  level: string;
  deadline: string;
  image: string;
  description: string;
  benefits: string[];
  requirements: string[];
  fields: string[];
  applicationUrl: string;
  hostInstitution: string;
  duration: string;
  openDate: string;
  status: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface UniversityData {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  city: string;
  rank: string;
  acceptRate: string;
  fields: string[];
  image: string;
  description: string;
  founded: number;
  type: string;
  studentCount: string;
  internationalRate: string;
  tuitionFee: string;
  financialAid: string;
  topPrograms: string[];
  campusLife: string;
  admissionTips: string[];
  website: string;
  lastUpdated: string;
  updatedBy: string;
}

/* ─── Flag Image Helper ─────────────────────────────── */
function FlagImg({ code, size = 24 }: { code: string; size?: number }) {
  const flagCode = code.toLowerCase();
  // flagcdn doesn't have EU flag — use flagpedia/wikimedia for EU
  const src = flagCode === 'eu'
    ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/320px-Flag_of_Europe.svg.png'
    : `https://flagcdn.com/w80/${flagCode}.png`;
  return (
    <img
      src={src}
      alt={code}
      className="rounded-sm object-cover flex-shrink-0"
      style={{ width: size, height: size * 0.67 }}
    />
  );
}

/* ─── Status Badge Helper ───────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const color = status === 'Đang mở đơn'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : status === 'Sắp mở đơn'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ─── Scholarship Detail Popup ──────────────────────── */
export function ScholarshipDetailPopup({
  scholarship,
  onClose,
}: {
  scholarship: ScholarshipData;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const s = scholarship;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/80 w-full max-w-[1020px] max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-[popIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center hover:bg-white transition shadow-lg"
        >
          <span className="material-symbols-outlined text-slate-600 text-lg">close</span>
        </button>

        {/* ── Left: Image + Name ──────────────── */}
        <div className="relative md:w-[440px] w-full h-[240px] md:h-auto md:min-h-[560px] flex-shrink-0 overflow-hidden">
          <img
            src={s.image}
            alt={s.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Text on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <StatusBadge status={s.status} />
            <div className="flex items-center gap-2.5 mt-2">
              <FlagImg code={s.countryCode} size={28} />
              <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">{s.name}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="material-symbols-outlined text-white/60 text-base leading-none">location_on</span>
              <span className="text-white/80 text-sm font-medium">{s.country}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Details ──────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          {/* Key stats - 2 rows x 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'school', label: 'Bậc học', val: s.level },
              { icon: 'payments', label: 'Giá trị', val: s.value },
              { icon: 'schedule', label: 'Thời gian', val: s.duration },
              { icon: 'event', label: 'Hạn nộp', val: s.deadline },
            ].map((st) => (
              <div key={st.label} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-xl leading-none">{st.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold leading-none">{st.label}</p>
                  <p className="text-sm font-bold text-[#1E3A8A] mt-1 leading-none truncate">{st.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-blue-500">info</span>
              <span>Giới thiệu</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-emerald-500">redeem</span>
              <span>Quyền lợi</span>
            </h3>
            <div className="space-y-2">
              {s.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-emerald-500 text-base leading-none flex-shrink-0">check_circle</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-amber-500">checklist</span>
              <span>Yêu cầu</span>
            </h3>
            <div className="space-y-2">
              {s.requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-amber-500 text-base leading-none flex-shrink-0">arrow_right</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-violet-500">category</span>
              <span>Lĩnh vực</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {s.fields.map((f) => (
                <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-700">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Host & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/80 p-4">
              <p className="text-[10px] text-slate-400 font-semibold">Đơn vị tổ chức</p>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">{s.hostInstitution}</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/80 p-4">
              <p className="text-[10px] text-slate-400 font-semibold">Thời gian mở đơn</p>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">{s.openDate} → {s.deadline}</p>
            </div>
          </div>

          {/* Apply button - Glass style */}
          <a href={s.applicationUrl} target="_blank" rel="noopener noreferrer" className="block">
            <GlassSurface
              width="100%"
              height={48}
              borderRadius={16}
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              className="cursor-pointer hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <span className="text-white font-bold text-sm flex items-center justify-center gap-2 h-full px-4">
                <span className="material-symbols-outlined text-lg leading-none">open_in_new</span>
                Truy cập trang nộp đơn
              </span>
            </GlassSurface>
          </a>

          {/* Last updated */}
          <p className="text-[10px] text-slate-400 text-center">
            Cập nhật lần cuối: {new Date(s.lastUpdated).toLocaleDateString('vi-VN')} bởi {s.updatedBy}
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}

/* ─── University Detail Popup ───────────────────────── */
export function UniversityDetailPopup({
  university,
  onClose,
}: {
  university: UniversityData;
  onClose: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const u = university;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/80 w-full max-w-[1020px] max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-[popIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center hover:bg-white transition shadow-lg"
        >
          <span className="material-symbols-outlined text-slate-600 text-lg">close</span>
        </button>

        {/* ── Left: Image + Name ──────────────── */}
        <div className="relative md:w-[440px] w-full h-[240px] md:h-auto md:min-h-[560px] flex-shrink-0 overflow-hidden">
          <img
            src={u.image}
            alt={u.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Text on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                {u.rank} Thế giới
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                {u.type}
              </span>
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <FlagImg code={u.countryCode} size={28} />
              <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">{u.shortName || u.name}</h2>
            </div>
            <p className="text-sm text-white/70 font-medium mt-0.5">{u.name}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="material-symbols-outlined text-white/60 text-base leading-none">location_on</span>
              <span className="text-white/80 text-sm font-medium">{u.city}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Details ──────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
          {/* Key stats - 2 rows x 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'groups', label: 'Sinh viên', val: u.studentCount },
              { icon: 'public', label: 'Quốc tế', val: u.internationalRate },
              { icon: 'percent', label: 'Tỷ lệ nhận', val: u.acceptRate },
              { icon: 'calendar_month', label: 'Thành lập', val: String(u.founded) },
            ].map((st) => (
              <div key={st.label} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-xl leading-none">{st.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold leading-none">{st.label}</p>
                  <p className="text-sm font-bold text-[#1E3A8A] mt-1 leading-none truncate">{st.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-blue-500">info</span>
              <span>Giới thiệu</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{u.description}</p>
          </div>

          {/* Tuition & Aid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/80 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-base leading-none text-amber-500">payments</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-none">Học phí</p>
              </div>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">{u.tuitionFee}</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/80 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-base leading-none text-emerald-500">redeem</span>
                <p className="text-[10px] text-slate-400 font-semibold leading-none">Hỗ trợ tài chính</p>
              </div>
              <p className="text-sm font-bold text-[#1E3A8A] mt-1">{u.financialAid}</p>
            </div>
          </div>

          {/* Top Programs */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-violet-500">stars</span>
              <span>Chương trình nổi bật</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {u.topPrograms.map((p) => (
                <span key={p} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50/80 backdrop-blur-sm border border-violet-100 text-violet-700">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Campus Life */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-rose-500">apartment</span>
              <span>Đời sống sinh viên</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{u.campusLife}</p>
          </div>

          {/* Admission Tips */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-amber-500">lightbulb</span>
              <span>Tips tuyển sinh</span>
            </h3>
            <div className="space-y-2">
              {u.admissionTips.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-amber-500 text-base leading-none flex-shrink-0">tips_and_updates</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div>
            <h3 className="text-sm font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-base leading-none text-blue-500">category</span>
              <span>Lĩnh vực mạnh</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {u.fields.map((f) => (
                <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-700">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Visit website button - Glass style */}
          <a href={u.website} target="_blank" rel="noopener noreferrer" className="block">
            <GlassSurface
              width="100%"
              height={48}
              borderRadius={16}
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              className="cursor-pointer hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              <span className="text-white font-bold text-sm flex items-center justify-center gap-2 h-full px-4">
                <span className="material-symbols-outlined text-lg leading-none">open_in_new</span>
                Truy cập website trường
              </span>
            </GlassSurface>
          </a>

          {/* Last updated */}
          <p className="text-[10px] text-slate-400 text-center">
            Cập nhật lần cuối: {new Date(u.lastUpdated).toLocaleDateString('vi-VN')} bởi {u.updatedBy}
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
