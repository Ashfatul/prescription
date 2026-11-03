"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  X,
} from "lucide-react";
import { CustomSelect } from "@/components/common/custom-select";
import { useLanguage } from "@/lib/i18n/language-context";

type ChatConnectionItem = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED";
  requestNote?: string | null;
  createdAt: string;
  updatedAt: string;
  isRequester: boolean;
  partner: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string | null;
    role: { name: string };
    doctor?: { specialization: string } | null;
    patient?: { gender?: string | null } | null;
  };
  lastMessage?: {
    message: string;
    createdAt: string;
  } | null;
};

type ChatMessageItem = {
  id: string;
  message: string;
  attachmentUrl?: string | null;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: { name: string };
  };
};

type UserOption = {
  id: string;
  name: string;
  email: string;
  role: { name: string };
  doctor?: { specialization: string } | null;
};

export function ClinicalChat({ currentUserId }: { currentUserId: string }) {
  const { t } = useLanguage();
  const [connections, setConnections] = useState<ChatConnectionItem[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConnections = useCallback(() => {
    fetch("/api/chat/connections")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setConnections(data.data);
          setActiveConnectionId((prev) => {
            if (prev) return prev;
            const firstApproved = data.data.find((c: ChatConnectionItem) => c.status === "APPROVED");
            return firstApproved ? firstApproved.id : null;
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchMessages = (connId: string) => {
    fetch(`/api/chat/messages?connectionId=${connId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchConnections();
    const interval = setInterval(fetchConnections, 10000);
    return () => clearInterval(interval);
  }, [fetchConnections]);

  useEffect(() => {
    if (!activeConnectionId) return;

    fetchMessages(activeConnectionId);
    const interval = setInterval(() => {
      fetchMessages(activeConnectionId);
    }, 4000); // 4s message polling for active thread

    return () => clearInterval(interval);
  }, [activeConnectionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openNewRequestModal = () => {
    setRequestModalOpen(true);
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Filter out current user
          const available = data.data.filter((u: UserOption) => u.id !== currentUserId);
          setUsersList(available);
          if (available.length > 0) {
            setSelectedRecipientId(available[0].id);
          }
        }
      })
      .catch(() => {});
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) return;

    setRequesting(true);
    setRequestError(null);

    try {
      const res = await fetch("/api/chat/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: selectedRecipientId,
          requestNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestModalOpen(false);
        setRequestNote("");
        fetchConnections();
      } else {
        setRequestError(data.message || "Failed to submit chat request.");
      }
    } catch {
      setRequestError("Network error sending request.");
    } finally {
      setRequesting(false);
    }
  };

  const handleRespondRequest = async (connectionId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/chat/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchConnections();
        if (status === "APPROVED") {
          setActiveConnectionId(connectionId);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConnectionId || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: activeConnectionId,
          message: messageText,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
      }
    } catch {
      // Revert if error
    } finally {
      setSending(false);
    }
  };

  const activeConn = connections.find((c) => c.id === activeConnectionId);

  const pendingIncoming = connections.filter(
    (c) => c.status === "PENDING" && !c.isRequester
  );

  const approvedConnections = connections.filter((c) => c.status === "APPROVED");
  const pendingOutgoing = connections.filter(
    (c) => c.status === "PENDING" && c.isRequester
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.clinicalChatTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {t.clinicalChatSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={openNewRequestModal}
          className="px-4 py-2.5 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newChatRequest}</span>
        </button>
      </div>

      {/* Main Two-Panel Chat Interface */}
      <div className="grid lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Connections & Pending Requests */}
        <div className="lg:col-span-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs p-4 flex flex-col space-y-4">
          {/* Pending Approval Section */}
          {pendingIncoming.length > 0 && (
            <div className="space-y-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-800 dark:text-amber-300 block text-[11px] uppercase tracking-wider">
                {t.pendingRequests} ({pendingIncoming.length})
              </span>
              <div className="space-y-2">
                {pendingIncoming.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-amber-500/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {conn.partner.name}
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {conn.partner.role.name}
                      </span>
                    </div>
                    {conn.requestNote && (
                      <p className="text-[11px] text-slate-500 italic">
                        &quot;{conn.requestNote}&quot;
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(conn.id, "REJECTED")}
                        className="px-2.5 py-1 rounded-lg border border-[var(--border-default)] text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-bold transition cursor-pointer"
                      >
                        {t.decline}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(conn.id, "APPROVED")}
                        className="px-3 py-1 rounded-lg bg-[var(--brand-primary)] text-white text-[10px] font-bold transition hover:opacity-90 cursor-pointer"
                      >
                        {t.approve}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Pending Requests */}
          {pendingOutgoing.length > 0 && (
            <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] space-y-1.5 text-xs">
              <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                {t.awaitingApproval}
              </span>
              {pendingOutgoing.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400"
                >
                  <span className="truncate">{conn.partner.name}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-bold shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{t.pending}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Approved Active Threads */}
          <div className="flex-1 space-y-1 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
              {t.activeConversations}
            </span>

            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
                <span>{t.loadingChats}</span>
              </div>
            ) : approvedConnections.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {t.noActiveChats}
                </p>
                <p>{t.newChatInvitationDesc}</p>
              </div>
            ) : (
              approvedConnections.map((conn) => {
                const isActive = conn.id === activeConnectionId;
                return (
                  <button
                    key={conn.id}
                    type="button"
                    onClick={() => setActiveConnectionId(conn.id)}
                    className={`w-full p-3 rounded-2xl text-left transition flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? "bg-[var(--brand-surface)] border border-[var(--brand-border)] text-[var(--brand-text)] shadow-2xs"
                        : "hover:bg-[var(--bg-subtle)] border border-transparent text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-bold text-xs flex items-center justify-center shrink-0">
                      {conn.partner.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold truncate text-slate-900 dark:text-white">
                          {conn.partner.name}
                        </strong>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[var(--bg-subtle)] text-slate-500 uppercase">
                          {conn.partner.role.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {conn.lastMessage ? conn.lastMessage.message : t.tapToOpenChat}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Conversation Stream */}
        <div className="lg:col-span-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xs flex flex-col justify-between overflow-hidden">
          {activeConn ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-subtle)]/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[var(--brand-surface)] text-[var(--brand-text)] font-bold text-xs flex items-center justify-center">
                    {activeConn.partner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeConn.partner.name}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {activeConn.partner.role.name}
                      {activeConn.partner.doctor?.specialization
                        ? ` • ${activeConn.partner.doctor.specialization}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.approvedThread}</span>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3.5 max-h-[420px] bg-[var(--bg-app)]/30">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    {t.noMessagesExchanged}
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender.id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-[var(--brand-primary)] text-white rounded-tr-none"
                              : "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-slate-900 dark:text-white rounded-tl-none"
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={t.typeYourMessage}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all min-h-[46px] sm:min-h-[48px] h-[46px] sm:h-[48px]"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-3 rounded-2xl bg-[var(--brand-primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">{t.send}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.selectPartnerToChat}
              </h3>
              <p className="text-xs max-w-xs">
                {t.newChatInvitationDesc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl modal-container max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden">
            <div className="modal-header shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t.requestChatConsultation}
              </h3>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {requestError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                    {requestError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.selectRecipientLabel}
                  </label>
                  <CustomSelect
                    value={selectedRecipientId}
                    onChange={(val) => setSelectedRecipientId(val)}
                    options={usersList.map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.role.name}${u.doctor?.specialization ? ` - ${u.doctor.specialization}` : ""})`,
                      badge: u.role.name,
                    }))}
                    placeholder={t.selectRecipientPlaceholder}
                    searchPlaceholder={t.searchRecipientPlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    {t.chatReasonLabel}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder={t.chatRequestPlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="modal-footer shrink-0 flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-slate-600 dark:text-slate-300 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="px-5 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold cursor-pointer hover:opacity-90 disabled:opacity-50 transition shadow-xs"
                >
                  {requesting ? t.submitting : t.sendRequest}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
