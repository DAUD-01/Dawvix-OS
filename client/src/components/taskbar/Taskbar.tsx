import Clock from "./Clock";
import WindowList from "./WindowList";
import { Search, Bell, Wifi, Volume2 } from "lucide-react";
import type { RefObject } from "react";
import { useNotificationStore } from "../../stores/notificationStore";

interface TaskbarProps {
  onStartClick: () => void;
  isStartOpen?: boolean;
  startButtonRef?: RefObject<HTMLButtonElement | null>;
  onSearchClick?: () => void;
}

export default function Taskbar({
  onStartClick,
  isStartOpen,
  startButtonRef,
  onSearchClick,
}: TaskbarProps) {
  const { isCenterOpen, toggleCenter, unreadCount } = useNotificationStore();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        fixed
        bottom-0
        left-0
        w-full
        h-12
        bg-slate-950/70
        backdrop-blur-xl
        border-t
        border-slate-800/80
        flex
        items-center
        justify-between
        px-2
        z-40
        select-none
      "
    >
      <div className="flex items-center gap-2 flex-1 h-full py-1">
        {/* Start Button */}
        <button
          ref={startButtonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartClick();
          }}
          className={`
            flex items-center gap-2 px-3 h-9 rounded-lg font-medium text-xs transition duration-150 cursor-pointer
            ${
              isStartOpen
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
            }
          `}
        >
          <div className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-tr from-cyan-500 to-indigo-500 text-[10px] font-bold text-slate-950">
            D
          </div>
          <span>Start</span>
        </button>

        {/* Spotlight Search Trigger */}
        <button
          type="button"
          onClick={onSearchClick}
          title="Search files, apps & settings (Ctrl + Space)"
          className="flex items-center gap-2 px-2.5 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs border border-white/5 transition cursor-pointer"
        >
          <Search size={14} className="text-cyan-400" />
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Search...
          </span>
          <span className="hidden lg:inline text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            Ctrl+Space
          </span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <WindowList />
      </div>

      {/* System Tray */}
      <div className="flex items-center gap-1.5 text-slate-400 pr-1">
        <div className="hidden sm:flex items-center gap-1.5 px-1 py-1 text-slate-400">
          <Wifi size={14} className="hover:text-cyan-400 transition cursor-default" />
          <Volume2 size={14} className="hover:text-cyan-400 transition cursor-default" />
        </div>

        <button
          type="button"
          onClick={toggleCenter}
          title="Notifications & Quick Settings"
          className={`relative p-1.5 rounded-lg transition duration-150 flex items-center justify-center cursor-pointer ${
            isCenterOpen
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "hover:bg-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        <button
          type="button"
          onClick={toggleCenter}
          className="hover:bg-white/5 rounded-md transition cursor-pointer"
        >
          <Clock />
        </button>
      </div>
    </div>
  );
}
