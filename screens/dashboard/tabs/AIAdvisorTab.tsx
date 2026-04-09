import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { GlassCard, PageTitle } from '../components/SharedUI';
import GlassSurface from '../../../components/GlassSurface';
import { MODES } from './ai-advisor/types';
import { useChatSessions } from './ai-advisor/useChatSessions';
import SessionSidebar from './ai-advisor/SessionSidebar';
import ChatMessageList from './ai-advisor/ChatMessages';
import ChatInput from './ai-advisor/ChatInput';
import MBTIQuiz from './ai-advisor/MBTIQuiz';

export default function AIAdvisorTab({ userData }: { userData: UserData }) {
  const chat = useChatSessions();
  const currentMode = MODES.find(m => m.id === chat.activeMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasDoneMBTI, setHasDoneMBTI] = useState<boolean>(() => {
    return localStorage.getItem('mbti_completed') === 'true';
  });

  const handleMBTIComplete = (answers: Record<number, string>) => {
    localStorage.setItem('mbti_completed', 'true');
    localStorage.setItem('mbti_answers', JSON.stringify(answers));
    setHasDoneMBTI(true);
  };

  return (
    <>
      <PageTitle icon="auto_awesome" title="AI Advisor" subtitle="Trợ lý tư vấn du học thông minh — cá nhân hoá theo hồ sơ của bạn" />

      {/* Main Layout Area */}
      {!hasDoneMBTI ? (
        // Quiz View
        <div className="w-full flex justify-center py-4">
          <MBTIQuiz onComplete={handleMBTIComplete} />
        </div>
      ) : (
        // Chat View
        <GlassCard className="!p-0 min-h-[400px] sm:min-h-[560px] flex overflow-hidden relative !bg-white/60 shadow-xl border-white/80 animate-in fade-in duration-700">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Session Sidebar */}
          <SessionSidebar
            sessions={chat.sessions}
            activeSessionId={chat.activeSessionId}
            activeMode={chat.activeMode}
            loading={chat.loadingSessions}
            onSelect={(id) => { chat.selectSession(id); setSidebarOpen(false); }}
            onNewChat={() => { chat.createNewSession(); setSidebarOpen(false); }}
            onDelete={chat.deleteSession}
            onRename={chat.renameSession}
            onChangeMode={chat.changeMode}
            mobileOpen={sidebarOpen}
          />

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/40">
            {/* Chat Header */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/60 bg-white/50 backdrop-blur-sm z-10">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '20px' }}>menu</span>
              </button>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${currentMode?.color} flex items-center justify-center shadow-md`}>
                <span className="material-symbols-outlined text-white text-base sm:text-lg">{currentMode?.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1E3A8A] text-xs sm:text-sm">{currentMode?.label}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full ${chat.isStreaming ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                  {chat.isStreaming ? 'Đang phân tích dữ liệu...' : 'AI đã kết nối thành công'}
                </p>
              </div>

              <div className="hidden sm:block ml-2">
                <GlassSurface
                  width="auto"
                  height={32}
                  borderRadius={10}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #1152d4, #2E6AE6)' }}
                  onClick={() => setHasDoneMBTI(false)}
                >
                  <div className="flex items-center gap-1.5 px-3 h-full text-white text-xs font-bold whitespace-nowrap">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                    Làm lại MBTI
                  </div>
                </GlassSurface>
              </div>
              <button
                onClick={() => setHasDoneMBTI(false)}
                className="sm:hidden p-1.5 ml-1 rounded-lg text-blue-600 bg-blue-50 border border-blue-100 transition-all flex-shrink-0"
                title="Làm lại MBTI"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
              </button>

              {chat.activeSessionId && (
                <button
                  onClick={() => chat.createNewSession()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-white border border-blue-100 hover:text-[#1E3A8A] hover:bg-[#EAF3FF] transition-all ml-2 flex-shrink-0"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  <span className="hidden sm:inline">Chat mới</span>
                </button>
              )}
            </div>

            {/* Messages */}
            <ChatMessageList
              messages={chat.messages}
              activeMode={chat.activeMode}
              isStreaming={chat.isStreaming}
              thinkingSteps={chat.thinkingSteps}
              loading={chat.loadingMessages}
              onSend={chat.sendMessage}
              onDeleteMessage={chat.deleteMessage}
            />

            {/* Input Area */}
            <ChatInput
              activeMode={chat.activeMode}
              isStreaming={chat.isStreaming}
              hasMessages={chat.messages.length > 0}
              onSend={chat.sendMessage}
              onStop={chat.stopStreaming}
            />
          </div>
        </GlassCard>
      )}
    </>
  );
}