import { useState, useRef, useCallback, useEffect } from 'react';
import {
  apiListChatSessions,
  apiCreateChatSession,
  apiGetChatSession,
  apiDeleteChatSession,
  apiRenameChatSession,
  apiDeleteChatMessage,
  apiChatAIStream,
  apiSaveChatAIMessage,
  ChatSession,
  getToken,
} from '../../../../lib/api';
import { ChatMessage, ChatMode, ThinkingStep, mapEventToStep } from './types';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ChatMode>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const abortRef = useRef<{ abort: () => void } | null>(null);
  const stepsRef = useRef<ThinkingStep[]>([]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = useCallback(async () => {
    if (!getToken()) {
      setLoadingSessions(false);
      return;
    }
    try {
      setLoadingSessions(true);
      const list = await apiListChatSessions();
      setSessions(list);
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const selectSession = useCallback(async (sessionId: string) => {
    if (sessionId === activeSessionId) return;

    // Abort any ongoing stream
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setThinkingSteps([]);
    stepsRef.current = [];

    setActiveSessionId(sessionId);
    setLoadingMessages(true);

    try {
      const session = await apiGetChatSession(sessionId);
      setActiveMode(session.mode as ChatMode);
      setMessages(
        session.messages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'ai',
          text: m.content,
        }))
      );
    } catch (e) {
      console.error('Failed to load session', e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeSessionId]);

  const createNewSession = useCallback(async (mode?: ChatMode) => {
    const m = mode || activeMode;

    // Abort any ongoing stream
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setThinkingSteps([]);
    stepsRef.current = [];

    setActiveMode(m);
    setActiveSessionId(null);
    setMessages([]);
  }, [activeMode]);

  const changeMode = useCallback((mode: ChatMode) => {
    // Abort any ongoing stream
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setThinkingSteps([]);
    stepsRef.current = [];

    setActiveMode(mode);
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await apiDeleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  }, [activeSessionId]);

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    try {
      const updated = await apiRenameChatSession(sessionId, title);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: updated.title } : s));
    } catch (e) {
      console.error('Failed to rename session', e);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!activeSessionId) return;
    try {
      await apiDeleteChatMessage(activeSessionId, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) {
      console.error('Failed to delete message', e);
    }
  }, [activeSessionId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (!getToken()) {
      setMessages(prev => [...prev, { role: 'user', text }]);
      setIsStreaming(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: 'Vui lòng đăng nhập để sử dụng tính năng AI Chatbot.' }]);
        setIsStreaming(false);
      }, 800);
      return;
    }

    // Ensure we have a session
    let sid = activeSessionId;
    if (!sid) {
      try {
        const modeLabel = activeMode.charAt(0).toUpperCase() + activeMode.slice(1);
        const session = await apiCreateChatSession(activeMode, `${modeLabel} - ${new Date().toLocaleDateString('vi-VN')}`);
        sid = session.id;
        setActiveSessionId(sid);
        setSessions(prev => [session, ...prev]);
      } catch (e) {
        console.error('Failed to create session', e);
        setMessages(prev => [...prev, { role: 'ai', text: '❌ Không thể kết nối đến AI. Vui lòng thử lại.' }]);
        return;
      }
    }

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);
    setThinkingSteps([]);
    stepsRef.current = [];

    let fullText = '';

    const stream = apiChatAIStream(
      sid,
      text,
      activeMode,
      (event, data) => {
        if (event === 'text_delta') {
          const delta = data.delta || data.text || data.content || '';
          fullText += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', text: fullText };
            return updated;
          });
        } else if (event === 'final_result') {
          const finalText = data.final_answer || data.text || data.result || data.response || fullText;
          if (finalText && finalText !== fullText) {
            fullText = finalText;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'ai', text: fullText };
              return updated;
            });
          }
        } else if (event === 'error') {
          const errMsg = data.message || data.error || 'Lỗi từ AI service';
          fullText += `\n\n❌ ${errMsg}`;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'ai', text: fullText };
            return updated;
          });
          setThinkingSteps([]);
        } else {
          const step = mapEventToStep(event, data);
          if (step) {
            const newStep: ThinkingStep = {
              id: `${event}-${Date.now()}`,
              label: step.label,
              icon: step.icon,
              status: 'active',
              timestamp: Date.now(),
            };
            stepsRef.current = [
              ...stepsRef.current.map(s => s.status === 'active' ? { ...s, status: 'done' as const } : s),
              newStep,
            ];
            setThinkingSteps([...stepsRef.current]);
          }
        }
      },
      async () => {
        const finalSteps = stepsRef.current.map(s => ({ ...s, status: 'done' as const }));
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'ai' && finalSteps.length > 0) {
            updated[updated.length - 1] = { ...last, thinkingSteps: finalSteps };
          }
          return updated;
        });
        setIsStreaming(false);
        setThinkingSteps([]);
        stepsRef.current = [];
        abortRef.current = null;

        // Update session title with first user message if it's auto-generated
        if (sid) {
          const firstUserMsg = text.slice(0, 60) + (text.length > 60 ? '...' : '');
          const session = sessions.find(s => s.id === sid);
          if (session && session.title?.includes(' - ')) {
            renameSession(sid, firstUserMsg);
          }
        }

        if (fullText && sid) {
          try {
            await apiSaveChatAIMessage(sid, fullText);
            // Update last_message in sidebar
            setSessions(prev => prev.map(s => s.id === sid ? { ...s, last_message: fullText.slice(0, 120) } : s));
          } catch (e) {
            console.error('Failed to save AI message', e);
          }
        }
      },
      (err) => {
        console.error('AI stream error', err);
        const finalSteps = stepsRef.current.map(s => ({ ...s, status: 'done' as const }));
        if (finalSteps.length > 0) {
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'ai') {
              updated[updated.length - 1] = { ...last, thinkingSteps: finalSteps };
            }
            return updated;
          });
        }
        setIsStreaming(false);
        setThinkingSteps([]);
        stepsRef.current = [];
        abortRef.current = null;

        if (!fullText) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'ai',
              text: '❌ Không thể kết nối đến AI. Vui lòng thử lại sau.',
            };
            return updated;
          });
        }
      },
    );

    abortRef.current = stream;
  }, [isStreaming, activeMode, activeSessionId, sessions, renameSession]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    setThinkingSteps([]);
    stepsRef.current = [];
  }, []);

  return {
    sessions,
    activeSessionId,
    activeMode,
    messages,
    isStreaming,
    thinkingSteps,
    loadingSessions,
    loadingMessages,
    selectSession,
    createNewSession,
    changeMode,
    deleteSession,
    renameSession,
    deleteMessage,
    sendMessage,
    stopStreaming,
  };
}