import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";
import { Rnd } from "react-rnd";
import { Maximize2, Minimize2, X } from "lucide-react";
import FileExplorer from "../apps/FileExplorer";
import NotesApp from "../apps/NotesApp";
import SettingsApp from "../apps/SettingsApp";

interface WindowProps {
  window: WindowData;
}

export default function Window({ window: win }: WindowProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const updateWindowGeometry = useWindowStore(
    (state) => state.updateWindowGeometry,
  );

  if (win.minimized) {
    return null;
  }

  const renderContent = () => {
    switch (win.id) {
      case "files":
        return <FileExplorer />;
      case "notes":
        return <NotesApp />;
      case "settings":
        return <SettingsApp />;
      default:
        return (
          <div className="flex h-full items-center justify-center p-6 text-slate-400">
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                {win.title}
              </p>
              <p className="text-xs">Application window active</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Rnd
      position={{
        x: win.maximized ? 0 : win.x,
        y: win.maximized ? 0 : win.y,
      }}
      size={{
        width: win.maximized ? "100vw" : win.width,
        height: win.maximized ? "calc(100vh - 48px)" : win.height,
      }}
      onDragStop={(_, data) => {
        updateWindowGeometry(win.id, data.x, data.y, win.width, win.height);
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        updateWindowGeometry(
          win.id,
          position.x,
          position.y,
          parseInt(ref.style.width),
          parseInt(ref.style.height),
        );
      }}
      minWidth={360}
      minHeight={260}
      bounds="parent"
      dragHandleClassName="window-title-bar"
      className="bg-slate-900/90 border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col"
      disableDragging={win.maximized}
      enableResizing={!win.maximized}
      style={{
        zIndex: win.zIndex,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className="window-title-bar h-10 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-3 text-slate-200 select-none cursor-move shrink-0"
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
          <span className="text-slate-100">{win.title}</span>
        </div>

        <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            title="Minimize"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
          >
            <Minimize2 size={13} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(win.id);
            }}
            title={win.maximized ? "Restore" : "Maximize"}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition cursor-pointer"
          >
            <Maximize2 size={13} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            title="Close"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/80 rounded-md transition cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden text-left">
        {renderContent()}
      </div>
    </Rnd>
  );
}
