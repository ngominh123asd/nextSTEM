import React, { useState } from 'react';
import { ChatSession } from '../../../../lib/api';
import { ChatMode, MODES } from './types';
import GlassSurface from '../../../../components/GlassSurface';

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeMode: ChatMode;
  loading: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onChangeMode: (mode: ChatMode) => void;
  mobileOpen?: boolean;
}

export default function SessionSidebar({
  sessions, activeSessionId, activeMode, loading,
  onSelect, onNewChat, onDelete, onRename, onChangeMode, mobileOpen,
}: Props) {
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const grouped = React.useMemo(() => {
    const today: ChatSession[] = [];
    const week: ChatSession[] = [];
    const older: ChatSession[] = [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

    for (const s of sessions) {
      const d = new Date(s.created_at);
      if (d >= todayStart) today.push(s);
      else if (d >= weekStart) week.push(s);
      else older.push(s);
    }
    return [
      { label: 'Hôm nay', items: today },
      { label: '7 ngày qua', items: week },
      { label: 'Cũ hơn', items: older },
    ].filter(g => g.items.length > 0);
  }, [sessions]);

  const startRename = (s: ChatSession) => {
    setRenamingId(s.id);
    setRenameValue(s.title || '');
    setContextMenu(null);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className={`
      fixed md:static inset-y-0 left-0 z-40
      w-[270px] flex-shrink-0 flex flex-col h-full
      border-r border-white/40 bg-white/90 md:bg-white/30 backdrop-blur-xl
      transform transition-transform duration-300 md:transform-none
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-white/40">
        <GlassSurface
          width="100%"
          height={48}
          borderRadius={16}
          className="cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
          onClick={onNewChat}
        >
          <div className="flex items-center justify-center gap-2.5 px-4 h-full text-white text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">add</span>
            Cuộc trò chuyện mới
          </div>
        </GlassSurface>
      </div>

      {/* Mode Filter */}
      <div className="px-3 py-2 flex gap-1.5 border-b border-white/30">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onChangeMode(m.id)}
            title={m.label}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              activeMode === m.id
                ? `bg-gradient-to-br ${m.color} text-white shadow-md`
                : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{m.icon}</span>
          </button>
        ))}
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <span className="material-symbols-outlined text-slate-300 animate-spin">progress_activity</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">forum</span>
            <p className="text-xs text-slate-400">Chưa có cuộc trò chuyện nào</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.label} className="mb-1">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.label}</span>
              </div>
              {group.items.map(s => (
                <div key={s.id} className="relative px-2">
                  <button
                    onClick={() => onSelect(s.id)}
                    onContextMenu={e => { e.preventDefault(); setContextMenu(contextMenu === s.id ? null : s.id); }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                      activeSessionId === s.id
                        ? 'bg-blue-50/80 border border-blue-200/50'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {renamingId === s.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                          className="w-full text-xs font-medium bg-white/80 rounded-lg px-2 py-1 border border-blue-200/50 outline-none focus:ring-1 focus:ring-blue-400/40"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className={`text-xs font-medium truncate block ${
                          activeSessionId === s.id ? 'text-blue-700' : 'text-slate-600'
                        }`}>
                          {s.title || 'Cuộc trò chuyện'}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </span>
                      {s.last_message && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.last_message}</p>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setContextMenu(contextMenu === s.id ? null : s.id); }}
                      className={`p-1 rounded-lg hover:bg-white/60 transition-all flex-shrink-0 ${
                        activeSessionId === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '16px' }}>more_horiz</span>
                    </button>
                  </button>

                  {/* Context menu */}
                  {contextMenu === s.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setContextMenu(null)} />
                      <div className="absolute right-3 top-full z-20 mt-1 bg-white/95 backdrop-blur-xl rounded-xl border border-white/80 shadow-xl py-1 min-w-[140px]" style={{ animation: 'fadeSlideIn 0.15s ease-out forwards' }}>
                        <button
                          onClick={() => startRename(s)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                          Đổi tên
                        </button>
                        <button
                          onClick={() => { setContextMenu(null); onDelete(s.id); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50/60 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                          Xoá
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}