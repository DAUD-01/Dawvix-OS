import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";
import { Rnd } from "react-rnd";

interface WindowProps {
  window: WindowData;
}

export default function Window({ window }: WindowProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow);

  const focusWindow = useWindowStore((state) => state.focusWindow);

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

        <button
          onClick={() => closeWindow(window.id)}
          className="
            px-2
            hover:bg-red-500
            rounded
          "
        >
          ✕
        </button>
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
