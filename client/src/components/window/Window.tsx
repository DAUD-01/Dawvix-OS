import type { WindowData } from "../../types/window";
import { useWindowStore } from "../../stores/windowStore";
import { useAuthStore } from "../../stores/authStore";
import { Rnd } from "react-rnd";
import {
  Maximize2,
  Minimize2,
  X,
  Folder,
  FileText,
  Settings as SettingsIcon,
  HardDrive,
  User as UserIcon,
  Laptop,
} from "lucide-react";
import { useState } from "react";

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
  const user = useAuthStore((state) => state.user);

  const [notesText, setNotesText] = useState(
    "Welcome to Dawvix OS!\n\nThis is your private workspace. You can write your quick thoughts, code snippets, or todo lists here.",
  );

  if (win.minimized) {
    return null;
  }

  const renderContent = () => {
    switch (win.id) {
      case "files":
        return (
          <div className="flex h-full flex-col text-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-700/60 bg-slate-900/40 px-4 py-2 text-xs text-slate-400">
              <HardDrive size={14} className="text-cyan-400" />
              <span>Dawvix File System</span>
              <span className="text-slate-600">/</span>
              <span>home</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-medium">
                {user?.username || "user"}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 overflow-y-auto">
              {[
                "documents",
                "downloads",
                "notes",
                "projects",
                "pictures",
              ].map((folder) => (
                <div
                  key={folder}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-700/30 transition cursor-pointer group"
                >
                  <Folder
                    size={36}
                    className="text-amber-400 group-hover:scale-105 transition"
                  />
                  <span className="text-xs font-medium capitalize text-slate-300 group-hover:text-white">
                    {folder}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="flex h-full flex-col bg-slate-900/60 p-3">
            <div className="mb-2 flex items-center justify-between border-b border-slate-700/60 pb-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-amber-400" />
                <span>scratchpad.txt</span>
              </span>
              <span className="text-slate-500">Auto-saved</span>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="flex-1 w-full resize-none rounded-md bg-slate-950/50 p-3 font-mono text-sm text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500/50"
              placeholder="Type your notes here..."
            />
          </div>
        );

      case "settings":
        return (
          <div className="flex h-full flex-col text-slate-200 overflow-y-auto p-5 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <SettingsIcon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">System Settings</h3>
                <p className="text-xs text-slate-400">
                  Manage your Dawvix OS environment
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                  <UserIcon size={16} className="text-cyan-400" />
                  <span>Account Information</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Username: </span>
                    <span className="font-medium text-slate-200">
                      {user?.username || "Guest"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-medium text-slate-200">
                      {user?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                  <Laptop size={16} className="text-indigo-400" />
                  <span>About Dawvix OS</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>Version: 1.0.0 Alpha</p>
                  <p>Architecture: Web-Based Cloud Virtual Desktop</p>
                  <p>Stack: React 19, TypeScript, Tailwind CSS, Node.js</p>
                </div>
              </div>
            </div>
          </div>
        );

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
      minWidth={320}
      minHeight={220}
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
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition"
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
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition"
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
            className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/80 rounded-md transition"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto text-left">
        {renderContent()}
      </div>
    </Rnd>
  );
}
