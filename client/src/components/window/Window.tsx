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

  const updateWindowGeometry = useWindowStore(
    (state) => state.updateWindowGeometry,
  );

  if (window.minimized) {
    return null;
  }
  return (
    <Rnd
      position={{
        x: window.maximized ? 0 : window.x,
        y: window.maximized ? 0 : window.y,
      }}
      size={{
        width: window.maximized ? "100%" : window.width,
        height: window.maximized ? "100%" : window.height,
      }}
      onDragStop={(_, data) => {
        updateWindowGeometry(
          window.id,
          data.x,
          data.y,
          window.width,
          window.height,
        );
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        updateWindowGeometry(
          window.id,
          position.x,
          position.y,
          parseInt(ref.style.width),
          parseInt(ref.style.height),
        );
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      disableDragging={window.maximized}
      enableResizing={!window.maximized}
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
