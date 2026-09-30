'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Task, TaskMessage, UserProfile } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiPaperclip,
  FiCheck,
  FiClock,
  FiUser,
  FiMinimize2,
  FiMaximize2,
  FiChevronLeft,
  FiExternalLink,
  FiRefreshCw
} from 'react-icons/fi';

interface FloatingMessengerWidgetProps {
  currentUser: UserProfile | null;
  tasks: Task[];
  activeTaskId?: string | null;
  isOpen?: boolean;
  onToggle?: () => void;
  onOpenTaskDetails?: (task: Task) => void;
}

export const FloatingMessengerWidget: React.FC<FloatingMessengerWidgetProps> = ({
  currentUser,
  tasks,
  activeTaskId: externalActiveTaskId,
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
  onOpenTaskDetails,
}) => {
  const { t, locale, isRTL } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnToggle || (() => setInternalIsOpen(!internalIsOpen));

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(externalActiveTaskId || null);
  const [messagesByTask, setMessagesByTask] = useState<Record<string, TaskMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'dialogue'>('chats');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync external active task ID
  useEffect(() => {
    if (externalActiveTaskId) {
      setSelectedTaskId(externalActiveTaskId);
      setActiveTab('dialogue');
    }
  }, [externalActiveTaskId]);

  // Tasks relevant to current user (either created by them or assigned to them, or all tasks with messages)
  const userTasks = useMemo(() => {
    if (!currentUser) return tasks.slice(0, 5);
    const myId = currentUser.id;
    const isCustomer = currentUser.activeRole === 'CUSTOMER';

    const relevant = tasks.filter((t) => {
      if (isCustomer) {
        return (
          t.clientId === myId ||
          t.clientName.includes('Vous') ||
          t.clientName.includes('You') ||
          t.status === 'IN_PROGRESS' ||
          t.status === 'UNDER_REVIEW'
        );
      } else {
        return (
          t.assignedToId === myId ||
          t.status === 'IN_PROGRESS' ||
          t.status === 'UNDER_REVIEW' ||
          t.applicantsCount > 0
        );
      }
    });

    return relevant.length > 0 ? relevant : tasks.slice(0, 5);
  }, [tasks, currentUser]);

  // Selected task object
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [selectedTaskId, tasks]);

  // Load messages for a given task
  const loadMessagesForTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/messages?taskId=${taskId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessagesByTask((prev) => ({
          ...prev,
          [taskId]: data.messages,
        }));
      }
    } catch (err) {
      console.warn('Failed to load messages for task:', taskId, err);
    }
  };

  // Preload messages for user tasks on open
  useEffect(() => {
    if (isOpen) {
      setIsSyncing(true);
      const promises = userTasks.slice(0, 8).map((t) => loadMessagesForTask(t.id));
      Promise.all(promises).finally(() => setIsSyncing(false));
    }
  }, [isOpen, userTasks]);

  // Auto-fetch active dialogue messages
  useEffect(() => {
    if (selectedTaskId) {
      loadMessagesForTask(selectedTaskId);
    }
  }, [selectedTaskId]);

  // Scroll to bottom on new messages in active dialogue
  useEffect(() => {
    if (activeTab === 'dialogue' && selectedTaskId) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesByTask, activeTab, selectedTaskId]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedTaskId || !currentUser) return;

    const content = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    const isMyTask = selectedTask
      ? selectedTask.clientId === currentUser.id || selectedTask.clientName.includes('Vous')
      : true;

    const receiverId = isMyTask ? selectedTask?.assignedToId : selectedTask?.clientId;

    const optimisticMsg: TaskMessage = {
      id: `msg_${Date.now()}`,
      taskId: selectedTaskId,
      senderId: currentUser.id,
      senderName: currentUser.fullName || 'Vous',
      senderAvatar: currentUser.avatarUrl || '',
      receiverId,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessagesByTask((prev) => ({
      ...prev,
      [selectedTaskId]: [...(prev[selectedTaskId] || []), optimisticMsg],
    }));

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskId,
          senderId: currentUser.id,
          senderName: currentUser.fullName || 'Vous',
          senderAvatar: currentUser.avatarUrl || '',
          receiverId,
          content,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessagesByTask((prev) => ({
          ...prev,
          [selectedTaskId]: (prev[selectedTaskId] || []).map((m) =>
            m.id === optimisticMsg.id ? data.message : m
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Canned quick replies
  const quickReplies = [
    '👋 Bonjour ! Où en est l’avancement ?',
    '⚡ Tout avance parfaitement, livraison bientôt.',
    '📎 Fichier prêt pour vérification.',
    '👍 Parfait, merci pour votre réactivité !',
  ];

  // Total unread / total messages count badge
  const totalMessagesCount = useMemo(() => {
    return Object.values(messagesByTask).reduce((acc, list) => acc + list.length, 0);
  }, [messagesByTask]);

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (BOTTOM RIGHT) */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggleOpen}
          className={`fixed bottom-5 ${
            isRTL ? 'left-5' : 'right-5'
          } z-40 flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-brand-700 text-white px-4 py-3 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border border-slate-700`}
          title="Messagerie en direct Work-zilla"
        >
          <div className="relative">
            <FiMessageSquare className="text-lg" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-black tracking-wide hidden sm:inline">
            Discussions en direct
          </span>
          {userTasks.length > 0 && (
            <span className="rounded-full bg-brand-600 text-white text-[10px] font-black px-1.5 py-0.2">
              {userTasks.length}
            </span>
          )}
        </button>
      )}

      {/* 2. DOCKED MESSENGER DRAWER WINDOW */}
      {isOpen && (
        <div
          className={`fixed bottom-4 ${
            isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } z-50 flex flex-col w-[94vw] sm:w-96 md:w-[420px] h-[520px] max-h-[85vh] rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150`}
        >
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {activeTab === 'dialogue' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('chats');
                    setSelectedTaskId(null);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Retour aux discussions"
                >
                  <FiChevronLeft className="text-base" />
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black tracking-tight leading-none text-white">
                    {activeTab === 'dialogue' && selectedTask
                      ? selectedTask.title.slice(0, 28) + (selectedTask.title.length > 28 ? '...' : '')
                      : 'Messagerie Tâches.ma'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {activeTab === 'dialogue' && selectedTask
                      ? `Mission #${selectedTask.id.slice(0, 8)} • ${Math.round(selectedTask.reward * 10)} DH`
                      : 'Discussions en direct avec vos freelances & clients'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedTaskId) loadMessagesForTask(selectedTaskId);
                }}
                disabled={isSyncing}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Actualiser"
              >
                <FiRefreshCw className={`text-xs ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>

              <button
                type="button"
                onClick={toggleOpen}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                title="Fermer"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          </div>

          {/* VIEW A: LIST OF TASK CONVERSATIONS */}
          {activeTab === 'chats' && (
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {userTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <FiMessageSquare className="text-3xl mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600">Aucune discussion active</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Dès que vous publiez ou êtes assigné à une tâche, vos échanges apparaîtront ici.
                  </p>
                </div>
              ) : (
                userTasks.map((t) => {
                  const msgs = messagesByTask[t.id] || [];
                  const lastMsg = msgs[msgs.length - 1];
                  const rewardDH = Math.round(t.reward * 10);

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTaskId(t.id);
                        setActiveTab('dialogue');
                      }}
                      className="p-3.5 bg-white hover:bg-amber-50/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={
                              t.clientAvatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'
                            }
                            alt={t.clientName}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200"
                          />
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-900 truncate group-hover:text-brand-700">
                              {t.title}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                            {lastMsg ? (
                              <span>
                                <strong className="text-slate-700">
                                  {lastMsg.senderId === currentUser?.id ? 'Vous: ' : `${lastMsg.senderName}: `}
                                </strong>
                                {lastMsg.content}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Démarrer la discussion...</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700">
                              {rewardDH} DH
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-sm ${
                                t.status === 'IN_PROGRESS'
                                  ? 'bg-amber-100 text-amber-900'
                                  : t.status === 'UNDER_REVIEW'
                                  ? 'bg-purple-100 text-purple-900'
                                  : t.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {msgs.length > 0 ? `${msgs.length} msg` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW B: ACTIVE TASK DIALOGUE */}
          {activeTab === 'dialogue' && selectedTask && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* Task Quick Header Strip */}
              <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-extrabold text-slate-800 truncate">
                    {selectedTask.title}
                  </span>
                </div>
                {onOpenTaskDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenTaskDetails(selectedTask)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline shrink-0 cursor-pointer"
                  >
                    <span>Détails</span>
                    <FiExternalLink className="text-[10px]" />
                  </button>
                )}
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {(!messagesByTask[selectedTask.id] ||
                  messagesByTask[selectedTask.id].length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <FiMessageSquare className="text-3xl text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Aucun message échangé pour le moment</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Posez des questions sur le cahier des charges, partagez vos liens ou validez les étapes.
                    </p>
                  </div>
                )}

                {(messagesByTask[selectedTask.id] || []).map((m) => {
                  const isMe = m.senderId === currentUser?.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 px-1 font-semibold mb-0.5">
                        {isMe ? 'Vous' : m.senderName}
                      </div>

                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs max-w-[85%] leading-relaxed ${
                          isMe
                            ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Reply Chips */}
              <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput(qr);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold whitespace-nowrap transition cursor-pointer"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-700"
                />

                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="rounded-xl bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <FiSend className="text-xs" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
