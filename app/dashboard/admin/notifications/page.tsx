"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import { useAuth } from "@/lib/context/AuthContext";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { authService } from "@/services/authService";
import {
  Bell, RefreshCw, Check, CheckCheck, Trash2,
  Search, BookOpen, FileText, Award,
  AlertTriangle, Info, Megaphone, Users, X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  announcement:       { icon: Megaphone,      color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/30" },
  assessment_due:     { icon: FileText,       color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30" },
  assessment_graded:  { icon: Award,          color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  course_update:      { icon: BookOpen,       color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30" },
  enrollment:         { icon: Users,          color: "text-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/30" },
  warning:            { icon: AlertTriangle,  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30" },
  info:               { icon: Info,           color: "text-gray-400",    bg: "bg-gray-500/10 border-gray-500/30" },
};

const getTypeConfig = (type?: string) =>
  TYPE_CONFIG[type?.toLowerCase() ?? ""] ?? TYPE_CONFIG.info;

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

// ✅ Uses authService.getToken() — same as AuthContext and the hook
async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = authService.getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  return res.json();
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { refetch: refetchBadge } = useNotificationCount();

  const [rows,        setRows]        = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [unreadOnly,  setUnreadOnly]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const limit = 15;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/notifications?page=${page}&limit=${limit}${unreadOnly ? "&unreadOnly=true" : ""}`
      );
      if (res.success) {
        setRows(res.data || []);
        setTotal(res.total || 0);
        // ✅ Backend always returns unreadCount on every response
        setUnreadCount(res.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/dashboard"); return; }
    void fetchAll();
  }, [authLoading, isAuthenticated, user?.role, fetchAll]);

  const markRead = async (id: string) => {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    void fetchAll(); void refetchBadge();
  };
  const markAllRead = async () => {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
    void fetchAll(); void refetchBadge();
  };
  const remove = async (id: string) => {
    await apiFetch(`/notifications/${id}`, { method: "DELETE" });
    void fetchAll(); void refetchBadge();
  };

  const pages    = Math.max(1, Math.ceil(total / limit));
  const readCount = total - unreadCount;

  const filtered = search.trim()
    ? rows.filter(n =>
        (n.title  ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (n.message ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  const groups = filtered.reduce<Record<string, any[]>>((acc, n) => {
    const d = new Date(n.createdAt), now = new Date();
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const bucket = d.toDateString() === now.toDateString() ? "Today"
      : d.toDateString() === yesterday.toDateString() ? "Yesterday"
      : d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    acc[bucket] = acc[bucket] ?? [];
    acc[bucket].push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">

        {/* ── Header ── */}
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* ✅ Bell with unread badge */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Bell size={24} className="text-purple-400" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {total} total
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => void fetchAll()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 rounded-xl text-white flex items-center gap-2 text-sm transition-all">
                <RefreshCw size={14} /> Refresh
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all">
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Total",  value: total,       color: "text-white",         bg: "from-slate-800/60 to-slate-800/40",     border: "border-slate-700/50" },
              { label: "Unread", value: unreadCount, color: "text-purple-400",    bg: "from-purple-900/20 to-purple-900/10",   border: "border-purple-500/30" },
              { label: "Read",   value: readCount,   color: "text-emerald-400",   bg: "from-emerald-900/20 to-emerald-900/10", border: "border-emerald-500/30" },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl p-4`}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </header>

        {/* ── Filters ── */}
        <div className="bg-slate-800/40 border border-gray-700/50 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <label className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-gray-700 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all">
            <input type="checkbox" checked={unreadOnly} onChange={e => { setUnreadOnly(e.target.checked); setPage(1); }} className="accent-purple-500 w-4 h-4" />
            <span className="text-sm text-gray-300 whitespace-nowrap">Unread only</span>
          </label>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
            <Bell size={40} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {search || unreadOnly ? "No notifications match your filters" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-2">{dateLabel}</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
                <div className="bg-slate-800/40 border border-gray-700/50 rounded-2xl overflow-hidden">
                  <ul className="divide-y divide-gray-700/50">
                    {items.map(n => {
                      const cfg = getTypeConfig(n.type);
                      const Icon = cfg.icon;
                      return (
                        <li key={n._id} className={`group flex items-start gap-4 p-5 transition-all hover:bg-slate-800/50 ${!n.isRead ? "border-l-2 border-purple-500" : "border-l-2 border-transparent"}`}>
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cfg.bg}`}>
                            <Icon size={18} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <p className={`text-sm font-semibold leading-snug ${n.isRead ? "text-gray-300" : "text-white"}`}>{n.title || "Notification"}</p>
                                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />}
                                </div>
                                <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                              </div>
                              <span className="text-xs text-gray-600 whitespace-nowrap shrink-0">{timeAgo(n.createdAt)}</span>
                            </div>
                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.isRead && (
                                <button onClick={() => markRead(n._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-purple-600/30 border border-gray-600 hover:border-purple-500/50 rounded-lg text-xs text-gray-300 hover:text-purple-300 transition-all">
                                  <Check size={12} /> Mark read
                                </button>
                              )}
                              <button onClick={() => remove(n._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-red-600/20 border border-gray-600 hover:border-red-500/50 rounded-lg text-xs text-gray-300 hover:text-red-400 transition-all">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-400 bg-slate-800/40 border border-gray-700/50 rounded-2xl px-5 py-4">
            <span>Page {page} of {pages} · {total} total</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-40 transition-all">Prev</button>
              <button disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-40 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}