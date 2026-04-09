import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassCard, GlassHeader, BlobDecor } from './SharedUI';
import { apiStreamRecommendations } from '../../../lib/api';

interface Recommendation {
  title: string;
  description: string;
  indicator_code: string;
  competency: string;
  priority: 'high' | 'medium' | 'low';
  action_type: 'project' | 'study' | 'assessment' | 'community';
  estimated_time: string;
}

const priorityConfig = {
  high:   { label: 'Ưu tiên cao', color: 'bg-red-50/60 text-red-600', dot: 'bg-red-400' },
  medium: { label: 'Trung bình',  color: 'bg-amber-50/60 text-amber-600', dot: 'bg-amber-400' },
  low:    { label: 'Bổ sung',     color: 'bg-slate-50/60 text-slate-400', dot: 'bg-slate-300' },
};

const actionConfig = {
  project:    { icon: 'science',      label: 'Dự án', color: 'from-blue-500 to-blue-600' },
  study:      { icon: 'menu_book',    label: 'Học tập', color: 'from-violet-500 to-purple-600' },
  assessment: { icon: 'psychology',   label: 'Đánh giá', color: 'from-indigo-500 to-indigo-600' },
  community:  { icon: 'groups',       label: 'Cộng đồng', color: 'from-emerald-500 to-teal-600' },
};

function tryParseRecos(text: string): Recommendation[] | null {
  const cleaned = text.trim();
  // Try direct parse
  try { return JSON.parse(cleaned); } catch { /**/ }
  // Try extracting JSON array from markdown block
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) || cleaned.match(/(\[[\s\S]*\])/);
  if (match) {
    try { return JSON.parse(match[1]); } catch { /**/ }
  }
  return null;
}

export default function RecommendationPanel() {
  const [recos, setRecos] = useState<Recommendation[]>([]);
  const [streamText, setStreamText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);

  const generate = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(true);
    setLoaded(false);
    setError(null);
    setStreamText('');
    setRecos([]);

    let accumulated = '';
    abortRef.current = apiStreamRecommendations(
      (delta) => {
        accumulated += delta;
        setStreamText(accumulated);
      },
      (fullText) => {
        const parsed = tryParseRecos(fullText);
        if (parsed && Array.isArray(parsed)) {
          setRecos(parsed);
        } else {
          setError('AI không thể tạo khuyến nghị. Hãy thử lại sau.');
        }
        setLoading(false);
        setLoaded(true);
        abortRef.current = null;
      },
      (err) => {
        setError(err.message.includes('503') ? 'Gemini API chưa được cấu hình.' : err.message);
        setLoading(false);
        abortRef.current = null;
      },
    );
  }, []);

  // Auto-load on mount
  useEffect(() => {
    generate();
    return () => abortRef.current?.abort();
  }, [generate]);

  return (
    <GlassCard>
      <BlobDecor className="w-48 h-48 -top-16 -right-16 bg-violet-200/20" />
      <GlassHeader
        icon="auto_awesome"
        title="Khuyến nghị học tập cá nhân hóa"
        extra={
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-indigo-600 transition-colors disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
              {loading ? 'progress_activity' : 'refresh'}
            </span>
            {loading ? 'Đang phân tích...' : 'Làm mới'}
          </button>
        }
      />

      <div className="relative z-10">
        {/* Streaming preview */}
        {loading && streamText && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/40 border border-blue-100/50">
            <p className="text-[11px] font-bold text-blue-500 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm animate-pulse">psychology</span>
              AI đang phân tích hồ sơ năng lực...
            </p>
            <p className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-3">{streamText}</p>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && !streamText && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-gradient-to-r from-slate-100/60 to-slate-50/40 animate-pulse border border-white/60" />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-red-300 mb-2">error_outline</span>
            <p className="text-sm text-slate-500">{error}</p>
            <button onClick={generate} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:opacity-90">
              Thử lại
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && recos.length > 0 && (
          <div className="space-y-3">
            {recos.map((reco, i) => {
              const action = actionConfig[reco.action_type] || actionConfig.study;
              const priority = priorityConfig[reco.priority] || priorityConfig.medium;
              return (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/80 hover:bg-white/70 hover:shadow-md transition-all group"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                    <span className="material-symbols-outlined text-white text-base">{action.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#1E3A8A] leading-tight">{reco.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 ${priority.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{reco.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md">
                        {reco.indicator_code}
                      </span>
                      <span className="text-[10px] text-slate-400">{reco.competency}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 ml-auto">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {reco.estimated_time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state when loaded but no recos */}
        {!loading && loaded && recos.length === 0 && !error && (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-blue-200 mb-2">psychology</span>
            <p className="text-sm text-slate-500">Hoàn thiện thêm hồ sơ năng lực để nhận khuyến nghị cá nhân hóa.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
