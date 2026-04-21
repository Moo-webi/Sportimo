import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { clearAuth, getAuthUser } from "../utils/auth";

const MessagesPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [authUser, setAuthUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [threadLoading, setThreadLoading] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setAuthUser(getAuthUser());
        loadConversations();
    }, []);

    useEffect(() => {
        const recipientType = searchParams.get("recipientType");
        const recipientId = searchParams.get("recipientId");
        if (recipientType && recipientId) {
            loadThread(recipientType, recipientId);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!thread) {
            const firstConversation = conversations[0];
            if (firstConversation?.counterpart) {
                loadThread(firstConversation.counterpart.type, firstConversation.counterpart.profileId);
            }
        }
    }, [conversations, thread]);

    const loadConversations = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/messages/conversations");
            setConversations(response.data || []);
        } catch (err) {
            setError(extractApiError(err, "Failed to load conversations."));
        } finally {
            setLoading(false);
        }
    };

    const loadThread = async (type, profileId) => {
        if (!type || !profileId) return;
        setThreadLoading(true);
        setError("");
        try {
            const normalizedType = String(type).toUpperCase();
            const endpoint = normalizedType === "CENTER"
                ? `/messages/centers/${profileId}`
                : `/messages/athletes/${profileId}`;
            const response = await api.get(endpoint);
            setThread(response.data);
            navigate(`/messages?recipientType=${normalizedType}&recipientId=${profileId}`, { replace: true });
        } catch (err) {
            setError(extractApiError(err, "Failed to load messages."));
        } finally {
            setThreadLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!thread?.counterpart?.type || !thread?.counterpart?.profileId) return;
        const content = messageText.trim();
        if (!content) return;

        setSending(true);
        try {
            const endpoint = thread.counterpart.type === "CENTER"
                ? `/messages/centers/${thread.counterpart.profileId}`
                : `/messages/athletes/${thread.counterpart.profileId}`;
            const response = await api.post(endpoint, { content });
            setThread(response.data);
            setMessageText("");
            await loadConversations();
        } catch (err) {
            alert(extractApiError(err, "Failed to send message."));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
            {/* NAVBAR */}
            <Navbar 
                authUser={authUser}
                onLogout={handleLogout}
            />

            <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 pt-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
                <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Messages</h1>
                        <button
                            onClick={loadConversations}
                            className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-green-50"
                        >
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <p className="mt-4 text-sm text-slate-600">Loading conversations...</p>
                    ) : conversations.length ? (
                        <div className="mt-4 space-y-3">
                            {conversations.map((conversation) => {
                                const active =
                                    thread?.counterpart?.type === conversation.counterpart.type
                                    && thread?.counterpart?.profileId === conversation.counterpart.profileId;

                                return (
                                    <button
                                        key={`${conversation.counterpart.type}-${conversation.counterpart.profileId}`}
                                        type="button"
                                        onClick={() => loadThread(conversation.counterpart.type, conversation.counterpart.profileId)}
                                        className={`w-full rounded-2xl border p-4 text-left ${
                                            active
                                                ? "border-emerald-300 bg-emerald-50"
                                                : "border-green-100 bg-white hover:bg-green-50"
                                        }`}
                                    >
                                        <p className="font-extrabold text-slate-900">{conversation.counterpart.name}</p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            {conversation.counterpart.type}
                                        </p>
                                        {conversation.counterpart.subtitle && (
                                            <p className="mt-1 text-sm text-slate-600">{conversation.counterpart.subtitle}</p>
                                        )}
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-700">{conversation.lastMessage}</p>
                                        <p className="mt-2 text-xs font-semibold text-slate-500">
                                            {formatDateTime(conversation.lastMessageAt)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-600">No conversations yet.</p>
                    )}
                </section>

                <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
                    {error && (
                        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    {threadLoading ? (
                        <p className="text-slate-600">Loading messages...</p>
                    ) : thread?.counterpart ? (
                        <>
                            <div className="border-b border-green-100 pb-4">
                                <p className="text-2xl font-extrabold tracking-tight text-slate-900">{thread.counterpart.name}</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {thread.counterpart.type}
                                    {thread.counterpart.subtitle ? ` • ${thread.counterpart.subtitle}` : ""}
                                </p>
                            </div>

                            <div className="mt-4 space-y-3">
                                {thread.messages?.length ? (
                                    thread.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                                    message.mine
                                                        ? "bg-emerald-600 text-white"
                                                        : "border border-green-100 bg-green-50 text-slate-800"
                                                }`}
                                            >
                                                <p>{message.content}</p>
                                                <p className={`mt-2 text-xs font-semibold ${message.mine ? "text-emerald-100" : "text-slate-500"}`}>
                                                    {formatDateTime(message.sentAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-600">No messages yet. Start the conversation.</p>
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="mt-6 space-y-3">
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    rows={4}
                                    placeholder="Write your message"
                                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={sending || !messageText.trim()}
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
                                            sending || !messageText.trim()
                                                ? "bg-emerald-300"
                                                : "bg-emerald-600 hover:bg-emerald-700"
                                        }`}
                                    >
                                        {sending ? "Sending..." : "Send Message"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <p className="text-slate-600">Select a conversation to start messaging.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

const extractApiError = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (error?.response?.status) return `${fallback} (HTTP ${error.response.status})`;
    return fallback;
};

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default MessagesPage;
