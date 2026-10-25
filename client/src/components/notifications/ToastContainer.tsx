import { useNotificationStore, type NotificationType } from "../../stores/notificationStore";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />;
      case "error":
        return <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />;
      default:
        return <Info size={18} className="text-sky-400 shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 bg-emerald-950/20";
      case "warning":
        return "border-amber-500/30 bg-amber-950/20";
      case "error":
        return "border-rose-500/30 bg-rose-950/20";
      default:
        return "border-sky-500/30 bg-sky-950/20";
    }
  };

  return (
    <aside aria-label="Notifications" className="fixed bottom-14 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-xl border ${getBorderColor(
            toast.type
          )} shadow-2xl shadow-black/50 text-white flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right-4 fade-in`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-semibold text-slate-100 tracking-wide">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition shrink-0"
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </aside>
  );
}
