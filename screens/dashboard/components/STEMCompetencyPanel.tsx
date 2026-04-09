import React, { useState, useEffect } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  apiGetCompetencyRadar, apiGetCompetencyAnalysis, apiGetCompetencyFramework,
  apiUpdateCompetencyScore,
  type CompetencyRadarResponse, type CompetencyAnalysis, type STEMCompetency,
} from '../../../lib/api';
import { GlassCard, GlassHeader, BlobDecor } from './SharedUI';

const levelLabels = ['—', 'Mức 1', 'Mức 2', 'Mức 3', 'Mức 4', 'Mức 5'];
const levelColors = ['#94a3b8', '#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1'];

interface Props {
  compact?: boolean; // compact mode for dashboard, full mode for standalone
}

export default function STEMCompetencyPanel({ compact = false }: Props) {
  const [radar, setRadar] = useState<CompetencyRadarResponse | null>(null);
  const [analysis, setAnalysis] = useState<CompetencyAnalysis | null>(null);
  const [framework, setFramework] = useState<STEMCompetency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessingComp, setAssessingComp] = useState<STEMCompetency | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

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
      const [r, a, f] = await Promise.all([
        apiGetCompetencyRadar().catch(() => null),
        apiGetCompetencyAnalysis().catch(() => null),
        apiGetCompetencyFramework().catch(() => []),
      ]);
      if (r) setRadar(r);
      if (a) setAnalysis(a);
      setFramework(f);
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
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                (radar?.overall_score || 0) >= 60 ? 'bg-emerald-50/60 text-emerald-600' :
                (radar?.overall_score || 0) >= 30 ? 'bg-amber-50/60 text-amber-600' :
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
        <div className="w-full h-[280px] min-h-[280px] relative z-10">
          <ResponsiveContainer width="100%" height="100%" minHeight={280} minWidth={1} debounce={50}>
            <RadarChart data={radarData} outerRadius={isMobile ? "50%" : "70%"}>
              <PolarGrid stroke="#c7d2fe" strokeWidth={0.5} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: isMobile ? 9 : 11, fill: '#475569', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="Năng lực" dataKey="value" stroke="#4f46e5" fill="url(#stemRadarGrad)" strokeWidth={2.5} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', fontSize: 12,
                }}
                formatter={(val: number) => [`${val}/100`, 'Điểm']}
              />
              <defs>
                <linearGradient id="stemRadarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Competency chips — click to assess */}
        {!compact && (
          <div className="flex flex-wrap gap-2 mt-4 relative z-10">
            {framework.map(comp => {
              const rd = radar?.data.find(d => d.competency_code === comp.code);
              return (
                <button key={comp.id} onClick={() => { setAssessingComp(comp); setShowAssessment(true); setScores({}); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/50 backdrop-blur-sm border border-white/80 text-slate-600 hover:bg-white/80 hover:text-blue-600 transition-all group">
                  <span className={`material-symbols-outlined text-sm bg-gradient-to-br ${comp.color || 'from-blue-500 to-blue-600'} bg-clip-text text-transparent`}>
                    {comp.icon || 'star'}
                  </span>
                  <span className="hidden sm:inline">{comp.name}</span>
                  <span className="sm:hidden">{comp.code.split('_').map(w => w[0].toUpperCase()).join('')}</span>
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    (rd?.score || 0) >= 60 ? 'bg-emerald-100 text-emerald-700' :
                    (rd?.score || 0) >= 30 ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {rd?.score || 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </GlassCard>

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
