import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";
import { Rnd } from "react-rnd";
import { Maximize2, Minimize2, X } from "lucide-react";
import FileExplorer from "../apps/FileExplorer";
import NotesApp from "../apps/NotesApp";
import SettingsApp from "../apps/SettingsApp";
import TerminalApp from "../apps/TerminalApp";
import CodeEditorApp from "../apps/CodeEditorApp";
import SystemMonitorApp from "../apps/SystemMonitorApp";
import AppStoreApp from "../apps/AppStoreApp";
import CalculatorApp from "../apps/CalculatorApp";
import PaintApp from "../apps/PaintApp";
import CalendarApp from "../apps/CalendarApp";

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
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const isActive = activeWindowId === win.id;

  if (win.minimized) {
    return null;
  }

  const renderContent = () => {
    switch (win.id) {
      case "files":
        return <FileExplorer />;
      case "notes":
        return (
          <NotesApp
            initialFileId={win.params?.fileId as string | undefined}
            initialFileName={win.params?.fileName as string | undefined}
            initialContent={win.params?.content as string | undefined}
          />
        );
      case "settings":
        return <SettingsApp />;
      case "terminal":
        return <TerminalApp />;
      case "code":
        return <CodeEditorApp />;
      case "monitor":
      case "system-monitor":
        return <SystemMonitorApp />;
      case "store":
      case "appstore":
        return <AppStoreApp />;
      case "calculator":
        return <CalculatorApp />;
      case "paint":
        return <PaintApp />;
      case "calendar":
        return <CalendarApp />;
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
        width: win.maximized ? "100%" : win.width,
        height: win.maximized ? "100%" : win.height,
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
      minHeight={240}
      bounds="parent"
      dragHandleClassName="window-title-bar"
      className={`
        pointer-events-auto
        bg-slate-900/95
        border
        ${isActive ? "border-cyan-500/50 shadow-2xl shadow-cyan-500/10" : "border-slate-800 shadow-xl"}
        ${win.maximized ? "rounded-none" : "rounded-xl"}
        overflow-hidden
        backdrop-blur-2xl
        flex
        flex-col
        transition-[border-color,box-shadow]
        duration-150
      `}
      disableDragging={win.maximized}
      enableResizing={!win.maximized}
      style={{
        zIndex: win.zIndex,
      }}
      onMouseDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className={`
          window-title-bar
          h-10
          flex
          items-center
          justify-between
          px-3
          select-none
          cursor-move
          shrink-0
          border-b
          transition-colors
          duration-150
          ${isActive ? "bg-slate-950/90 border-slate-700/80 text-white" : "bg-slate-950/70 border-slate-800/80 text-slate-300"}
        `}
        onDoubleClick={() => maximizeWindow(win.id)}
      >
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide truncate">
          <span className="truncate">{win.title}</span>
        </div>

        <div
          className="flex items-center gap-1.5 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
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
            {win.maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
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
      <div className="flex-1 overflow-hidden text-left bg-slate-900/40">
        {renderContent()}
      </div>
    </Rnd>
  );
}
