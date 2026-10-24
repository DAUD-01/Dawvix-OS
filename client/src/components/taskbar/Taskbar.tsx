import Clock from "./Clock";
import WindowList from "./WindowList";
import type { RefObject } from "react";

interface TaskbarProps {
  onStartClick: () => void;
  isStartOpen?: boolean;
  startButtonRef?: RefObject<HTMLButtonElement | null>;
}

export default function Taskbar({
  onStartClick,
  isStartOpen,
  startButtonRef,
}: TaskbarProps) {
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

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <WindowList />
      </div>

      <div className="flex items-center gap-2">
        <Clock />
      </div>
    </div>
  );
}
