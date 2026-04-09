import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import {
  apiGetCompetencyRadar, apiGetCompetencyAnalysis, apiGetCompetencyFramework,
  apiUpdateCompetencyScore, apiGetDTSTimeline, apiGetCompetencyScores,
  type CompetencyRadarResponse, type CompetencyAnalysis, type STEMCompetency, type DTSTimeline, type CompetencyScore,
} from '../../../lib/api';
import { GlassCard, GlassHeader, BlobDecor } from './SharedUI';

const COMP_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const levelLabels = ['—', 'Mức 1', 'Mức 2', 'Mức 3', 'Mức 4', 'Mức 5'];
const levelColors = ['#94a3b8', '#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];

interface Props {
  compact?: boolean;
  onShowScoreInfo?: () => void;
}

export default function STEMCompetencyPanel({ compact = false, onShowScoreInfo }: Props) {
  const [radar, setRadar] = useState<CompetencyRadarResponse | null>(null);
  const [analysis, setAnalysis] = useState<CompetencyAnalysis | null>(null);
  const [framework, setFramework] = useState<STEMCompetency[]>([]);
  const [timeline, setTimeline] = useState<DTSTimeline | null>(null);
  const [userScores, setUserScores] = useState<CompetencyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessingComp, setAssessingComp] = useState<STEMCompetency | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [popoverComp, setPopoverComp] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, a, f, t, s] = await Promise.all([
        apiGetCompetencyRadar().catch(() => null),
        apiGetCompetencyAnalysis().catch(() => null),
        apiGetCompetencyFramework().catch(() => []),
        apiGetDTSTimeline().catch(() => null),
        apiGetCompetencyScores().catch(() => []),
      ]);
      if (r) setRadar(r);
      if (a) setAnalysis(a);
      setFramework(f);
      if (t) setTimeline(t);
      if (s) setUserScores(s);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSaveAssessment = async () => {
    if (!assessingComp) return;
    setSaving(true);
    try {
      for (const ind of assessingComp.indicators) {
        const score = scores[ind.id];
        if (score !== undefined) {
          await apiUpdateCompetencyScore({
            indicator_id: ind.id,
            score,
            level: Math.max(1, Math.min(5, Math.ceil(score / 20))),
            source: 'self_assessment',
          });
        }
      }
      await loadData();
      setShowAssessment(false);
      setAssessingComp(null);
      setScores({});
    } catch { /* ignore */ }
    setSaving(false);
  };

  // Build radar chart data
  const radarData = radar?.data.map(d => ({
    subject: isMobile
      ? d.competency_name.split(' ').slice(0, 2).join(' ')
      : d.competency_name,
    value: d.score,
    fullMark: 100,
  })) || [];

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  // ── Assessment Modal ──
  if (showAssessment && assessingComp) {
    return (
      <GlassCard className="!bg-white/80">
        <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-blue-200/20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${assessingComp.color || 'from-blue-500 to-blue-600'} flex items-center justify-center shadow-md`}>
                <span className="material-symbols-outlined text-white text-lg">{assessingComp.icon || 'star'}</span>
              </div>
              <div>
                <h3 className="font-bold text-[#1E3A8A] text-lg">Tự đánh giá: {assessingComp.name}</h3>
                <p className="text-xs text-slate-500">{assessingComp.description}</p>
              </div>
            </div>
            <button onClick={() => { setShowAssessment(false); setAssessingComp(null); }}
              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {assessingComp.indicators.map(ind => (
              <div key={ind.id} className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{ind.code}</span>
                  <h4 className="font-bold text-[#1E3A8A] text-sm">{ind.name}</h4>
                </div>
                <p className="text-xs text-slate-500 mb-4">{ind.description}</p>

                {/* Level selector */}
                <div className="space-y-2">
                  {ind.level_descriptors && Object.entries(ind.level_descriptors).map(([levelKey, desc]) => {
                    const levelNum = parseInt(levelKey.replace('level_', ''));
                    const scoreVal = levelNum * 20;
                    const isSelected = scores[ind.id] === scoreVal;
                    return (
                      <button key={levelKey} onClick={() => setScores({ ...scores, [ind.id]: scoreVal })}
                        className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-300 text-[#1E3A8A] shadow-sm ring-2 ring-blue-400/20'
                            : 'bg-white/40 border-white/60 text-slate-600 hover:bg-white/60'
                        }`}>
                        <span className="font-bold mr-2" style={{ color: levelColors[levelNum] }}>
                          {levelLabels[levelNum]}
                        </span>
                        {desc as string}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => { setShowAssessment(false); setAssessingComp(null); }}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">
              Hủy bỏ
            </button>
            <button onClick={handleSaveAssessment} disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">save</span>
              {saving ? 'Đang lưu...' : 'Lưu đánh giá'}
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      {/* Radar Chart */}
      <GlassCard>
        <BlobDecor className="w-48 h-48 -top-20 -right-20 bg-indigo-200/20" />
        <GlassHeader icon="trending_up" title="Năng lực STEM"
          extra={
            <div className="flex items-center gap-2">
              {onShowScoreInfo && (
                <button
                  onClick={onShowScoreInfo}
                  className="p-1 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Cách tính điểm năng lực"
                >
                  <span className="material-symbols-outlined text-slate-400 hover:text-blue-500 text-base transition-colors">info</span>
                </button>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                (radar?.overall_score || 0) >= 60 ? 'bg-emerald-50/60 text-emerald-600' :
                (radar?.overall_score || 0) >= 30 ? 'bg-amber-50/60 text-amber-600' :
                (radar?.overall_score || 0) > 0 ? 'bg-rose-50/60 text-rose-600' :
                'bg-slate-50/60 text-slate-400'
              }`}>
                {radar?.overall_score || 0}/100
              </span>
              {!compact && (
                <span className="text-xs text-slate-400">
                  {radar?.assessed_indicators || 0}/{radar?.total_indicators || 15} chỉ số
                </span>
              )}
            </div>
          }
        />
        {/* Radar chart with integrated competency badges */}
        <div className="relative z-10 mx-auto" style={{ maxWidth: 540 }}>

          <div className="relative" style={{ height: isMobile ? 260 : 280, padding: isMobile ? '28px 12px' : '28px 20px' }}>
            {/* Radar chart */}
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                <RadarChart data={radarData} outerRadius={isMobile ? "65%" : "68%"}>
                  <PolarGrid stroke="#c7d2fe" strokeWidth={0.5} />
                  <PolarAngleAxis dataKey="subject" tick={false} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Năng lực" dataKey="value" stroke="#2563eb" fill="url(#stemRadarGrad)" strokeWidth={2.5} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: 12,
                    }}
                    formatter={(val: number) => [`${val}/100`, 'Điểm']}
                  />
                  <defs>
                    <linearGradient id="stemRadarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Competency badges — tightly positioned at pentagon vertices */}
            {framework.length > 0 && framework.map((comp, i) => {
              const rd = radar?.data.find(d => d.competency_code === comp.code);
              const score = rd?.score || 0;
              const isActive = popoverComp === comp.id;
              // Pentagon vertex positions (top, top-right, bottom-right, bottom-left, top-left)
              const posStyles: React.CSSProperties[] = [
                { top: 0, left: '50%', transform: 'translate(-50%, -50%)' },
                { top: '20%', right: 0, transform: 'translate(30%, 0)' },
                { bottom: '10%', right: '5%', transform: 'translate(20%, 0)' },
                { bottom: '10%', left: '5%', transform: 'translate(-20%, 0)' },
                { top: '20%', left: 0, transform: 'translate(-30%, 0)' },
              ];
              return (
                <button
                  key={comp.id}
                  onClick={() => setPopoverComp(isActive ? null : comp.id)}
                  className={`absolute z-20 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1152d4] text-white border-[#1152d4] shadow-md shadow-blue-500/25 scale-105'
                      : score > 0
                        ? 'bg-white/95 border-blue-200 text-[#1E3A8A] hover:border-blue-400 hover:bg-blue-50 shadow-sm hover:scale-105'
                        : 'bg-white/90 border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 shadow-sm hover:scale-105'
                  }`}
                  style={posStyles[i % 5]}
                >
                  <span className={`material-symbols-outlined text-[13px] ${isActive ? 'text-white' : score > 0 ? 'text-blue-500' : 'text-slate-400'}`}>
                    {comp.icon || 'star'}
                  </span>
                  <span className="hidden sm:inline max-w-[90px] truncate">{comp.name}</span>
                  <span className={`text-[9px] font-bold px-1 rounded ${
                    isActive ? 'bg-white/20 text-white' :
                    score >= 60 ? 'bg-emerald-50 text-emerald-600' :
                    score >= 30 ? 'bg-amber-50 text-amber-600' :
                    score > 0 ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-50 text-slate-400'
                  }`}>{score}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>


      {/* ── Competency Popover (z-[100] to be above sidebar z-50) ── */}
      {popoverComp && (() => {
        const comp = framework.find(c => c.id === popoverComp);
        if (!comp) return null;
        const rd = radar?.data.find(d => d.competency_code === comp.code);
        const score = rd?.score || 0;
        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setPopoverComp(null)}>
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[3px]" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xs overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] px-5 py-4 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">{comp.icon || 'star'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{comp.name}</p>
                    <p className="text-blue-100 text-[10px]">{comp.indicators?.length || 3} chỉ số hành vi</p>
                  </div>
                  <button onClick={() => setPopoverComp(null)} className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              <div className="p-5">
                {/* Overall score */}
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Điểm thành tố</span>
                  <span className={`text-xl font-extrabold ${
                    score >= 60 ? 'text-emerald-600' : 
                    score >= 30 ? 'text-amber-600' : 
                    score > 0 ? 'text-rose-600' : 
                    'text-slate-300'
                  }`}>
                    {score}<span className="text-sm font-bold text-slate-300">/100</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] transition-all duration-500" style={{ width: `${score}%` }} />
                </div>

                {/* Indicators with individual scores */}
                {comp.indicators && comp.indicators.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {comp.indicators.map((ind: any) => {
                      const indScoreObj = userScores.find((s: any) => s.indicator_id === ind.id);
                      const indScore = indScoreObj?.score ?? 0;
                      return (
                        <div key={ind.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50/80">
                          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{ind.code}</span>
                          <span className="text-[11px] text-slate-600 flex-1">{ind.name}</span>
                          <span className={`text-[10px] font-bold min-w-[28px] text-right ${
                            indScore >= 60 ? 'text-emerald-600' : 
                            indScore >= 30 ? 'text-amber-600' : 
                            indScore > 0 ? 'text-rose-500' : 
                            'text-slate-400'
                          }`}>
                            {indScore > 0 ? indScore : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => { setAssessingComp(comp); setShowAssessment(true); setScores({}); setPopoverComp(null); }}
                  className="w-full py-2.5 bg-gradient-to-r from-[#1152d4] to-[#2E6AE6] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  {score > 0 ? 'Đánh giá lại' : 'Đánh giá ngay'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}


      {/* Timeline Chart — năng lực theo thời gian */}
      {!compact && timeline && timeline.points.length >= 2 && (
        <GlassCard className="mt-6">
          <BlobDecor className="w-40 h-40 -top-12 -right-12 bg-indigo-200/15" />
          <GlassHeader
            icon="show_chart"
            title="Tiến triển năng lực theo thời gian"
            extra={
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                timeline.score_change >= 0
                  ? 'bg-emerald-50/60 text-emerald-600'
                  : 'bg-red-50/60 text-red-500'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {timeline.score_change >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                {timeline.score_change >= 0 ? '+' : ''}{timeline.score_change.toFixed(1)} điểm
              </span>
            }
          />
          <div className="w-full h-[240px] relative z-10 mt-3">
            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
              <LineChart data={timeline.points.map(p => ({
                date: new Date(p.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
                'Tổng điểm': Math.round(p.overall_score),
                ...Object.fromEntries(
                  Object.entries(p.competency_scores).map(([k, v]) => [k.replace(/_/g, ' '), Math.round(v)])
                ),
              }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: 11,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line
                  type="monotone" dataKey="Tổng điểm" stroke="#4f46e5"
                  strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }}
                />
                {Object.keys(timeline.points[0]?.competency_scores || {}).map((key, idx) => (
                  <Line
                    key={key} type="monotone"
                    dataKey={key.replace(/_/g, ' ')}
                    stroke={COMP_COLORS[idx % COMP_COLORS.length]}
                    strokeWidth={1.5} dot={false} strokeDasharray="4 2"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 relative z-10">
            Mỗi điểm = 1 lần tạo ảnh chụp DTS · Bấm "Lưu ảnh chụp" để ghi nhận tiến trình hôm nay
          </p>
        </GlassCard>
      )}

      {/* Analysis Panel */}
      {!compact && analysis && analysis.profile_status !== 'not_started' && (
        <GlassCard className="mt-6">
          <GlassHeader icon="insights" title="Phân tích năng lực" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 border border-emerald-100/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-emerald-600 text-lg">thumb_up</span>
                <h4 className="font-bold text-emerald-700 text-sm">Điểm mạnh</h4>
              </div>
              <div className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-emerald-100/40">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1E3A8A] truncate">{s.indicator_name}</p>
                      <p className="text-[10px] text-slate-400">{s.competency_name}</p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600 ml-2">{s.score}</span>
                  </div>
                ))}
                {analysis.strengths.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Chưa đủ dữ liệu</p>
                )}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-50/20 border border-amber-100/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 text-lg">priority_high</span>
                <h4 className="font-bold text-amber-700 text-sm">Cần cải thiện</h4>
              </div>
              <div className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-amber-100/40">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1E3A8A] truncate">{w.indicator_name}</p>
                      <p className="text-[10px] text-slate-400">{w.competency_name}</p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-600 ml-2">{w.score}</span>
                  </div>
                ))}
                {analysis.weaknesses.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Chưa đủ dữ liệu</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50/40 to-indigo-50/30 border border-blue-100/40 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-600 text-sm">lightbulb</span>
                <h4 className="font-bold text-blue-700 text-xs">Khuyến nghị từ hệ thống</h4>
              </div>
              <div className="space-y-1.5">
                {analysis.recommendations.map((r, i) => (
                  <p key={i} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>{r}
                  </p>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </>
  );
}
