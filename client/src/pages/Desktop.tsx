import StartMenu from "../components/start-menu/StartMenu";
import Taskbar from "../components/taskbar/Taskbar";
import DesktopIcon from "../components/desktop/DesktopIcon";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

import { useState } from "react";
import WindowManager from "../components/window/WindowManager";
import { useWindowStore } from "../stores/windowStore";

export default function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();

    navigate("/");
  };
  const openWindow = useWindowStore((state) => state.openWindow);
  return (
    <>
      <div
        className="
        h-screen
        w-screen
        overflow-hidden
        relative
        bg-slate-900
        text-gray-300
        text-center
      "
        style={{
          backgroundImage: "url('https://wallpapercave.com/wp/wp13153820.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <p className="mt-10">Dawvix-OS-1.0</p>

        <div
          className="
              p-4
              flex
             flex-col
              gap-4"
        >
          <DesktopIcon
            icon="📁"
            name="Files"
            onClick={() => openWindow("files", "Files")}
          />{" "}
          <DesktopIcon
            icon="📝"
            name="Notes"
            onClick={() => openWindow("notes", "Notes")}
          />{" "}
          <DesktopIcon
            icon="⚙"
            name="Settings"
            onClick={() => openWindow("settings", "Settings")}
          />{" "}
        </div>

        <WindowManager />

        <Taskbar onStartClick={() => setStartOpen(!startOpen)} />
        {startOpen && <StartMenu onLogout={handleLogout} />}
      </div>
    </>
  );
}
