import React, { useState } from 'react';
import { UserData } from '../types';
import { GlassCard, PageTitle } from '../components/SharedUI';
import { MODES } from './ai-advisor/types';
import { useChatSessions } from './ai-advisor/useChatSessions';
import SessionSidebar from './ai-advisor/SessionSidebar';
import ChatMessageList from './ai-advisor/ChatMessages';
import ChatInput from './ai-advisor/ChatInput';

export default function AIAdvisorTab({ userData }: { userData: UserData }) {
  const chat = useChatSessions();
  const currentMode = MODES.find(m => m.id === chat.activeMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <PageTitle icon="auto_awesome" title="AI Advisor" subtitle="Trợ lý tư vấn du học thông minh — cá nhân hoá theo hồ sơ của bạn" />

      {/* Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => chat.changeMode(m.id)}
            className={`p-2.5 sm:p-4 rounded-2xl text-left transition-all duration-300 border ${
              chat.activeMode === m.id
                ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-300/50 shadow-md shadow-blue-100/50'
                : 'bg-white/40 backdrop-blur-sm border-white/60 hover:bg-white/60'
            }`}
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
              <span className="material-symbols-outlined text-white text-base sm:text-lg">{m.icon}</span>
            </div>
            <h4 className={`font-bold text-xs sm:text-sm mb-0.5 ${chat.activeMode === m.id ? 'text-[#1E3A8A]' : 'text-slate-700'}`}>{m.label}</h4>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Main Chat Layout: Sidebar + Content */}
      <GlassCard className="!p-0 min-h-[400px] sm:min-h-[560px] flex overflow-hidden relative">
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/40">
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
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${chat.isStreaming ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                {chat.isStreaming ? 'Đang trả lời...' : 'AI sẵn sàng tư vấn'}
              </p>
            </div>
            {chat.activeSessionId && (
              <button
                onClick={() => chat.createNewSession()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                Mới
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
    </>
  );
}