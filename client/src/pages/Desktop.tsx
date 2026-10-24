import StartMenu from "../components/start-menu/StartMenu";
import Taskbar from "../components/taskbar/Taskbar";
import DesktopIcon from "../components/desktop/DesktopIcon";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";

import { useState, useRef, useEffect } from "react";
import WindowManager from "../components/window/WindowManager";
import { useWindowStore } from "../stores/windowStore";

export default function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const startMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const openWindow = useWindowStore((state) => state.openWindow);
  const wallpaper = useSettingsStore((state) => state.wallpaper);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close start menu when clicking outside
  useEffect(() => {
    if (!startOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(target) &&
        startButtonRef.current &&
        !startButtonRef.current.contains(target)
      ) {
        setStartOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [startOpen]);

  return (
    <div
      className="
        h-screen
        w-screen
        overflow-hidden
        relative
        bg-slate-950
        text-slate-100
        select-none
        transition-all
        duration-300
      "
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.45) 0%, rgba(2, 6, 23, 0.85) 100%),
          url('${wallpaper}')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Desktop Canvas / App Icons */}
      <div className="absolute top-5 left-5 flex flex-col gap-3.5 z-10">
        <DesktopIcon
          icon="📁"
          name="Files"
          onClick={() => openWindow("files", "Files")}
        />
        <DesktopIcon
          icon="📝"
          name="Notes"
          onClick={() => openWindow("notes", "Notes")}
        />
        <DesktopIcon
          icon="💻"
          name="Terminal"
          onClick={() => openWindow("terminal", "Terminal")}
        />
        <DesktopIcon
          icon="⚙️"
          name="Settings"
          onClick={() => openWindow("settings", "Settings")}
        />
      </div>

      {/* Desktop Workspace for Windows (bounds isolated above taskbar) */}
      <div
        id="desktop-workspace"
        className="absolute inset-0 bottom-12 overflow-hidden pointer-events-none z-20"
      >
        <WindowManager />
      </div>

      {/* Taskbar & Start Menu */}
      <Taskbar
        startButtonRef={startButtonRef}
        onStartClick={() => setStartOpen((prev) => !prev)}
        isStartOpen={startOpen}
      />

      {startOpen && (
        <StartMenu
          menuRef={startMenuRef}
          onLogout={handleLogout}
          onClose={() => setStartOpen(false)}
        />
      )}
    </div>
  );
}
