import { useWindowStore } from "../../stores/windowStore";

export default function WindowList() {
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const toggleWindowMinimize = useWindowStore(
    (state) => state.toggleWindowMinimize,
  );

  return (
    <div className="flex items-center gap-1.5 flex-1 overflow-x-auto h-full py-1">
      {windows.map((window) => {
        const isActive = activeWindowId === window.id && !window.minimized;

        return (
          <button
            key={window.id}
            type="button"
            onClick={() => toggleWindowMinimize(window.id)}
            className={`
              relative
              flex
              items-center
              gap-2
              px-3
              h-9
              text-xs
              rounded-lg
              max-w-40
              transition-all
              duration-150
              cursor-pointer
              truncate
              ${
                isActive
                  ? "bg-slate-800/90 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                  : window.minimized
                    ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    : "bg-white/10 text-slate-200 hover:bg-white/15"
              }
            `}
          >
            <span className="truncate">{window.title}</span>
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-cyan-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
