import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";

interface WindowProps {
  window: WindowData;
}

export default function Window({ window }: WindowProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow);

  const focusWindow = useWindowStore((state) => state.focusWindow);

  return (
    <div
      onMouseDown={() => focusWindow(window.id)}
      className="
        absolute
        w-125
        h-87.5
        bg-slate-800
        border
        border-slate-700
        rounded-lg
        shadow-2xl
        overflow-hidden
      "
      style={{
        left: window.x,
        top: window.y,
        zIndex: window.zIndex,
      }}
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
    </div>
  );
}
