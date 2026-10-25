import StartMenu from "../components/start-menu/StartMenu";
import Taskbar from "../components/taskbar/Taskbar";
import DesktopIcon from "../components/desktop/DesktopIcon";
import SpotlightSearch from "../components/search/SpotlightSearch";
import ToastContainer from "../components/notifications/ToastContainer";
import NotificationCenter from "../components/notifications/NotificationCenter";
import WindowSwitcher from "../components/window/WindowSwitcher";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useSocketStore } from "../stores/socketStore";
import { useAppRegistryStore, STORE_CATALOG } from "../sdk/appRegistry";

import { useState, useRef, useEffect } from "react";
import WindowManager from "../components/window/WindowManager";
import { useWindowStore } from "../stores/windowStore";

export default function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherIndex, setSwitcherIndex] = useState(0);

  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const startMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const openWindow = useWindowStore((state) => state.openWindow);
  const windows = useWindowStore((state) => state.windows);
  const toggleShowDesktop = useWindowStore((state) => state.toggleShowDesktop);
  const restoreWindow = useWindowStore((state) => state.restoreWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const wallpaper = useSettingsStore((state) => state.wallpaper);
  const { isCenterOpen, setCenterOpen } = useNotificationStore();
  const { initSocket, cleanupSocket } = useSocketStore();
  const installedApps = useAppRegistryStore((state) => state.installedApps);

  useEffect(() => {
    if (user) {
      initSocket({ id: user.id || "local-user", username: user.username });
    }
    return () => cleanupSocket();
  }, [user, initSocket, cleanupSocket]);

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

  // Global Keyboard Shortcuts (Ctrl+Space/Cmd+K Spotlight, Alt+Tab Switcher, Win/Alt+D Show Desktop)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Spotlight Search: Ctrl+Space or Cmd+K
      if (
        ((e.ctrlKey || e.metaKey) && e.code === "Space") ||
        ((e.ctrlKey || e.metaKey) && e.key === "k")
      ) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }

      // Alt+Tab Window Switcher
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        if (windows.length > 0) {
          setSwitcherOpen(true);
          setSwitcherIndex((prev) => (prev + 1) % windows.length);
        }
      }

      // Show Desktop: Alt+D or Ctrl+Shift+D
      if (
        (e.altKey && e.key === "d") ||
        (e.ctrlKey && e.shiftKey && e.key === "D")
      ) {
        e.preventDefault();
        toggleShowDesktop();
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [windows.length, toggleShowDesktop]);

  const handleSwitcherSelect = (id: string) => {
    restoreWindow(id);
    focusWindow(id);
    setSwitcherOpen(false);
  };

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
          icon="⚡"
          name="Code"
          onClick={() => openWindow("code", "Code Studio")}
        />
        <DesktopIcon
          icon="⚙️"
          name="Settings"
          onClick={() => openWindow("settings", "Settings")}
        />
        <DesktopIcon
          icon="📊"
          name="Monitor"
          onClick={() => openWindow("monitor", "Task Manager")}
        />
        <DesktopIcon
          icon="🛍️"
          name="Store"
          onClick={() => openWindow("store", "App Store")}
        />
        {STORE_CATALOG.filter((app) => installedApps.includes(app.id)).map(
          (app) => (
            <DesktopIcon
              key={app.id}
              icon={app.icon}
              name={app.name.split(" ")[0]}
              onClick={() => openWindow(app.id, app.name)}
            />
          ),
        )}
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
        onSearchClick={() => setSearchOpen(true)}
      />

      {/* Spotlight Search Overlay */}
      <SpotlightSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Alt + Tab Window Switcher */}
      <WindowSwitcher
        isOpen={switcherOpen}
        selectedIndex={switcherIndex}
        onSelect={handleSwitcherSelect}
        onClose={() => setSwitcherOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Action & Notification Center */}
      {isCenterOpen && (
        <NotificationCenter onClose={() => setCenterOpen(false)} />
      )}

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
