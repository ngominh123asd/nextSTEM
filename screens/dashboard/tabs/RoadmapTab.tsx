import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlassSurface from '../../../components/GlassSurface';
import { UserData } from '../types';
import { BlobDecor, GlassCard, GlassHeader, PageTitle } from '../components/SharedUI';
import MBTIQuiz from './ai-advisor/MBTIQuiz';
import {
  apiGetRoadmap, apiSaveAIRoadmap, apiToggleRoadmapTask, apiStreamAIRoadmap,
  type RoadmapData, type RoadmapStep,
} from '../../../lib/api';


/* ── helpers ── */
const stepColors = [
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
];

function getProgress(step: RoadmapStep) {
  if (!step.tasks.length) return 0;
  return Math.round((step.tasks.filter(t => t.done).length / step.tasks.length) * 100);
}

function totalStats(roadmap: RoadmapData) {
  const allTasks = roadmap.steps.flatMap(s => s.tasks);
  const done = allTasks.filter(t => t.done).length;
  return { total: allTasks.length, done, pct: allTasks.length ? Math.round((done / allTasks.length) * 100) : 0 };
}

/* ── Main Component ── */
export default function RoadmapTab({ userData }: { userData: UserData }) {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mbtiCompleted, setMbtiCompleted] = useState<boolean>(
    localStorage.getItem('mbti_completed') === 'true'
  );
  const abortRef = useRef<{ abort: () => void } | null>(null);

  const handleMBTIComplete = (answers: Record<number, string>) => {
    localStorage.setItem('mbti_completed', 'true');
    localStorage.setItem('mbti_answers', JSON.stringify(answers));
    setMbtiCompleted(true);
  };

  /* ── Load existing roadmap (only after MBTI is done) ── */
  useEffect(() => {
    if (!mbtiCompleted) return;
    apiGetRoadmap()
      .then(r => setRoadmap(r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mbtiCompleted]);

  /* ── AI generate + save ── */
  const generateAI = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    setGenerating(true);
    setStreamText('');
    setError(null);

    let fullJson = '';

    abortRef.current = apiStreamAIRoadmap(
      (delta) => {
        fullJson += delta;
        setStreamText(fullJson);
      },
      async (completeJson) => {
        setSaving(true);
        try {
          const saved = await apiSaveAIRoadmap(completeJson);
          setRoadmap(saved);
        } catch {
          setError('Không thể lưu lộ trình. Đang dùng template dự phòng...');
        }
        setSaving(false);
        setGenerating(false);
        setStreamText('');
        abortRef.current = null;
      },
      (err) => {
        setError(err.message.includes('503')
          ? 'Gemini API chưa được cấu hình trên server.'
          : `Lỗi: ${err.message}`);
        setGenerating(false);
        setStreamText('');
        abortRef.current = null;
      },
    );
  }, []);

  /* ── Toggle task ── */
  const toggleTask = useCallback(async (stepId: string, taskId: string, currentDone: boolean) => {
    if (toggling) return;
    setToggling(taskId);

    // Optimistic update
    setRoadmap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(s =>
          s.id === stepId
            ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
            : s
        ),
      };
    });

    try {
      await apiToggleRoadmapTask(taskId, !currentDone);
    } catch {
      // Revert on failure
      setRoadmap(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          steps: prev.steps.map(s =>
            s.id === stepId
              ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, done: currentDone } : t) }
              : s
          ),
        };
      });
    }
    setToggling(null);
  }, [toggling]);

  /* ── Cleanup on unmount ── */
  useEffect(() => () => abortRef.current?.abort(), []);

  /* ── MBTI gate — rendered after all hooks ── */
  if (!mbtiCompleted) {
    return (
      <MBTIQuiz
        onComplete={handleMBTIComplete}
        title="Đánh giá Năng lực & MBTI"
        description="Hoàn thành bài trắc nghiệm ngắn này để AI phân tích và tự động tạo ra lộ trình học tập tối ưu nhất cho riêng bạn."
        badgeText="Roadmap Setup"
      />
    );
  }



  /* ═══ Render ═══ */
  return (
    <>
      <PageTitle icon="map" title="Lộ Trình Học Tập STEM" subtitle="Kế hoạch cá nhân hóa do AI tạo ra từ hồ sơ năng lực của bạn" />

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-gradient-to-r from-slate-100/60 to-slate-50/40 animate-pulse border border-white/60" />
          ))}
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50/60 border border-red-100/60 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-400">error_outline</span>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* ── Empty / Generate state ── */}
      {!loading && !roadmap && !generating && (
        <GlassCard>
          <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-blue-200/30" />
          <BlobDecor className="w-36 h-36 -bottom-12 -left-12 bg-indigo-200/20" />
          <div className="flex flex-col items-center py-16 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm flex items-center justify-center border border-white/60 mb-6 shadow-inner">
              <span className="material-symbols-outlined text-4xl text-blue-400">map</span>
            </div>
            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">Chưa có lộ trình</h3>
            <p className="text-slate-500 text-center max-w-sm mb-8 text-sm leading-relaxed">
              AI sẽ phân tích hồ sơ DTS của bạn và tạo lộ trình học tập STEM
              cá nhân hóa dựa trên các khoảng cách năng lực thực tế.
            </p>
            <GlassSurface
              width="auto" height={52} borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={generateAI}
            >
              <span className="text-white font-bold px-7 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                Tạo lộ trình với AI
              </span>
            </GlassSurface>
          </div>
        </GlassCard>
      )}

      {/* ── AI Generating / Saving ── */}
      {(generating || saving) && (
        <GlassCard>
          <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-indigo-200/20" />
          <div className="py-10 flex flex-col items-center gap-6 relative z-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="material-symbols-outlined text-white text-2xl animate-pulse">auto_awesome</span>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 animate-ping" />
            </div>

            <div className="text-center">
              <p className="font-bold text-[#1E3A8A] text-base">
                {saving ? 'Đang lưu lộ trình...' : 'AI đang thiết kế lộ trình của bạn...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {saving ? 'Hoàn tất trong giây lát' : 'Đang phân tích năng lực STEM và mục tiêu học tập'}
              </p>
            </div>

            {/* Live stream preview */}
            {streamText && !saving && (
              <div className="w-full max-w-lg p-4 rounded-2xl bg-white/50 border border-white/80">
                <p className="text-[10px] font-bold text-blue-500 mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Gemini đang tạo...
                </p>
                <p className="text-xs text-slate-600 font-mono leading-relaxed line-clamp-6 whitespace-pre-wrap">{streamText}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── Roadmap Content ── */}
      {!loading && roadmap && !generating && (
        <div className="space-y-6">
          {/* Progress overview */}
          {(() => {
            const { total, done, pct } = totalStats(roadmap);
            return (
              <GlassCard>
                <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-blue-200/20" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <GlassHeader icon="analytics" title="Tiến độ tổng quan" />
                    <button
                      onClick={generateAI}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      Tạo lại với AI
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                      <p className="text-2xl font-extrabold text-[#1E3A8A]">{roadmap.steps.length}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Giai đoạn</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                      <p className="text-2xl font-extrabold text-[#1E3A8A]">{total}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Nhiệm vụ</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                      <p className="text-2xl font-extrabold text-emerald-600">{done}</p>
                      <p className="text-[11px] text-slate-500 font-medium">Hoàn thành</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60">
                      <p className="text-2xl font-extrabold text-amber-600">{pct}%</p>
                      <p className="text-[11px] text-slate-500 font-medium">Tổng tiến độ</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })()}

          {/* AI-generated badge */}
          {roadmap.title?.includes('AI') && (
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-indigo-400 text-sm">auto_awesome</span>
              <p className="text-xs text-indigo-500 font-semibold">Lộ trình được tạo bởi AI dựa trên hồ sơ DTS của bạn</p>
            </div>
          )}

          {/* Steps timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-indigo-200 via-violet-200 to-amber-200 hidden sm:block" />
            <div className="space-y-5">
              {roadmap.steps.map((step, idx) => {
                const progress = getProgress(step);
                const color = step.color || stepColors[idx % stepColors.length];
                return (
                  <div key={step.id} className="sm:pl-16 relative">
                    {/* Step number bubble */}
                    <div className={`hidden sm:flex absolute left-0 top-6 w-12 h-12 rounded-2xl bg-gradient-to-br ${color} items-center justify-center text-white font-extrabold text-lg shadow-lg z-10`}>
                      {idx + 1}
                    </div>

                    <GlassCard className="hover:shadow-[0_12px_40px_rgba(30,58,138,0.1)] transition-all duration-300">
                      <BlobDecor className="w-32 h-32 -top-10 -right-10 bg-blue-200/15" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md sm:hidden`}>
                              <span className="text-white font-bold text-sm">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-[#1E3A8A] text-base">{step.title}</h3>
                              {step.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {step.duration && (
                              <span className="text-xs font-semibold text-slate-400 bg-white/50 px-3 py-1 rounded-full border border-white/60">
                                {step.duration}
                              </span>
                            )}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              progress === 100 ? 'bg-emerald-50/60 text-emerald-600' :
                              progress > 0    ? 'bg-blue-50/60 text-blue-600' :
                              'bg-slate-50/60 text-slate-400'
                            }`}>
                              {progress}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-4">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {/* Tasks */}
                        <div className="space-y-2">
                          {step.tasks.map(task => (
                            <button
                              key={task.id}
                              onClick={() => toggleTask(step.id, task.id, task.done)}
                              disabled={toggling === task.id}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                task.done
                                  ? 'bg-emerald-50/40 border border-emerald-200/40'
                                  : 'bg-white/40 border border-white/60 hover:bg-white/60'
                              } ${toggling === task.id ? 'opacity-50' : ''}`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                task.done
                                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm'
                                  : 'border-2 border-slate-300'
                              }`}>
                                {task.done && (
                                  <span className="material-symbols-outlined text-white text-sm">check</span>
                                )}
                              </div>
                              <span className={`text-sm font-medium ${
                                task.done ? 'text-emerald-700 line-through' : 'text-[#1E3A8A]'
                              }`}>
                                {task.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regenerate */}
          <div className="flex justify-center pt-4">
            <GlassSurface
              width="auto" height={44} borderRadius={16}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
              onClick={generateAI}
            >
              <span className="text-white text-sm font-semibold px-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                Tạo lại với AI
              </span>
            </GlassSurface>
          </div>
        </div>
      )}
    </>
  );
}