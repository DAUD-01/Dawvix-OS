import { useEffect, useRef } from "react";
import { useNotificationStore, type NotificationType } from "../../stores/notificationStore";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  X,
  Volume2,
  Wifi,
  Moon,
  Sliders,
  Users,
} from "lucide-react";
import { useWindowStore } from "../../stores/windowStore";
import { useSocketStore } from "../../stores/socketStore";

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { notifications, clearNotification, clearAll } = useNotificationStore();
  const { openWindow } = useWindowStore();
  const { onlineUsers } = useSocketStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />;
      case "error":
        return <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info size={16} className="text-sky-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed bottom-14 right-3 z-50 w-96 max-w-[calc(100vw-24px)] max-h-[82vh] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-sm tracking-wide text-slate-100">
            Action Center
          </h3>
          {notifications.length > 0 && (
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-medium">
              {notifications.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-md hover:bg-white/5 transition flex items-center gap-1"
              title="Clear all notifications"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="p-3 border-b border-white/5 bg-slate-950/40 grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-center">
          <Wifi size={16} />
          <span className="text-[10px] font-medium mt-1">Online</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 text-center">
          <Volume2 size={16} />
          <span className="text-[10px] font-medium mt-1">85%</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 text-center">
          <Moon size={16} />
          <span className="text-[10px] font-medium mt-1">Dark</span>
        </div>
        <button
          onClick={() => {
            openWindow("settings", "Settings");
            onClose();
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 text-slate-300 text-center transition"
        >
          <Sliders size={16} />
          <span className="text-[10px] font-medium mt-1">Config</span>
        </button>
      </div>

      {/* Online Users Presence Bar */}
      <div className="px-3.5 py-2 border-b border-white/5 bg-slate-900/50 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users size={14} className="text-cyan-400" />
          <span className="font-medium text-[11px]">Real-time Presence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-300">
            {onlineUsers.length > 0 ? `${onlineUsers.length} Online` : "Connected"}
          </span>
        </div>
      </div>

      {/* Notification Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[380px]">
        {notifications.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500">
            <Bell size={28} className="opacity-40 stroke-1 mb-2" />
            <p className="text-xs">No new notifications</p>
            <span className="text-[10px] text-slate-600 mt-0.5">All caught up</span>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-white/5 transition flex items-start gap-3 relative"
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed break-words">
                  {item.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 p-1 rounded"
                title="Remove notification"
              >
                <X size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer System Status */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Dawvix OS Core v1.0</span>
        <span className="text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Normal
        </span>
      </div>
    </div>
  );
}
