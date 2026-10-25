import { useEffect } from "react";
import { useWindowStore } from "../../stores/windowStore";

interface WindowSwitcherProps {
  isOpen: boolean;
  selectedIndex: number;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function WindowSwitcher({
  isOpen,
  selectedIndex,
  onSelect,
}: WindowSwitcherProps) {
  const windows = useWindowStore((state) => state.windows);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.key === "Meta") {
        if (windows.length > 0 && windows[selectedIndex]) {
          onSelect(windows[selectedIndex].id);
        }
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [isOpen, selectedIndex, windows, onSelect]);

  if (!isOpen || windows.length === 0) return null;

  const getWindowIcon = (id: string) => {
    switch (id) {
      case "files":
        return "📁";
      case "notes":
        return "📝";
      case "code":
        return "⚡";
      case "terminal":
        return "💻";
      case "settings":
        return "⚙️";
      case "monitor":
        return "📊";
      case "store":
        return "🛍️";
      case "calculator":
        return "🧮";
      case "paint":
        return "🎨";
      case "calendar":
        return "📅";
      default:
        return "🪟";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/20 shadow-2xl shadow-black/80 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Switch Window (Alt + Tab)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Release Alt to focus
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {windows.map((win, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={win.id}
                onClick={() => onSelect(win.id)}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-600/40 border-2 border-indigo-400 scale-105 shadow-xl shadow-indigo-500/20"
                    : "bg-slate-800/40 border border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="text-3xl filter drop-shadow">
                  {getWindowIcon(win.id)}
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {win.title}
                </span>
                <span className="text-[9px] text-slate-400">
                  {win.minimized ? "Minimized" : "Active"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
