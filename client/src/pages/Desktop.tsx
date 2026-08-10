import StartMenu from "../components/start-menu/StartMenu";
import Taskbar from "../components/taskbar/Taskbar";
import DesktopIcon from "../components/desktop/DesktopIcon";

import { useState } from "react";

export default function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
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
      "
        style={{
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/previews/043/255/118/non_2x/blue-grainy-gradient-background-with-soft-transitions-for-social-media-vector.jpg')",
        }}
      >
        Welcome to Dawvix OS
        <div
          className="
              p-4
              flex
             flex-col
              gap-4"
        >
          <DesktopIcon icon="📁" name="Files" />
          <DesktopIcon icon="📝" name="Notes" />
          <DesktopIcon icon="⚙" name="Settings" />
        </div>

        <Taskbar onStartClick={() => setStartOpen(!startOpen)} />
        {startOpen && <StartMenu />}
      </div>
    </>
  );
}
