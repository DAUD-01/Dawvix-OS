import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";
import { Rnd } from "react-rnd";
import { Maximize2, Minimize2, X } from "lucide-react";

interface WindowProps {
  window: WindowData;
}

export default function Window({ window }: WindowProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow);

  const focusWindow = useWindowStore((state) => state.focusWindow);

  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);

  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);

  if (window.minimized) {
    return null;
  }
  return (
    <Rnd
      default={{
        x: window.x,
        y: window.y,
        width: 500,
        height: 350,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      style={{
        zIndex: window.zIndex,
      }}
      onMouseDown={() => focusWindow(window.id)}
    >
      {/* Title Bar */}

      <div
        className="
          h-10
          bg-slate-900
          flex
          items-center
          justify-between
          px-4
          text-white
        "
      >
        <span>{window.title}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => minimizeWindow(window.id)}
            className="p-2 hover:bg-white/10 rounded"
          >
            <Minimize2 size={14} />
          </button>

          <button
            onClick={() => maximizeWindow(window.id)}
            className="p-2 hover:bg-white/10 rounded"
          >
            <Maximize2 size={14} />
          </button>

          <button
            onClick={() => closeWindow(window.id)}
            className="p-2 hover:bg-red-500 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}

      <div
        className="
          p-4
          text-white
        "
      >
        {window.title} Content
      </div>
    </Rnd>
  );
}
