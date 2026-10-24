import { useAuthStore } from "../../stores/authStore";
import { useWindowStore } from "../../stores/windowStore";
import { Folder, FileText, Settings, LogOut, User as UserIcon } from "lucide-react";

interface StartMenuProps {
  onLogout: () => void;
  onClose: () => void;
}

export default function StartMenu({ onLogout, onClose }: StartMenuProps) {
  const user = useAuthStore((state) => state.user);
  const openWindow = useWindowStore((state) => state.openWindow);

  const handleLaunch = (id: string, title: string) => {
    openWindow(id, title);
    onClose();
  };

  const apps = [
    {
      id: "files",
      title: "Files",
      description: "File Manager & Storage",
      icon: <Folder size={18} className="text-amber-400" />,
    },
    {
      id: "notes",
      title: "Notes",
      description: "Text editor & scratchpad",
      icon: <FileText size={18} className="text-emerald-400" />,
    },
    {
      id: "settings",
      title: "Settings",
      description: "System & Profile Preferences",
      icon: <Settings size={18} className="text-cyan-400" />,
    },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        fixed
        bottom-14
        left-3
        w-72
        rounded-2xl
        bg-slate-900/90
        backdrop-blur-2xl
        border
        border-slate-800
        p-4
        text-white
        shadow-2xl
        z-50
        flex
        flex-col
        gap-3
        select-none
        animate-in
        fade-in
        slide-in-from-bottom-2
        duration-150
      "
    >
      {/* User Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-white/10">
          <UserIcon size={18} />
        </div>
        <div className="truncate text-left">
          <p className="text-sm font-semibold text-white truncate">
            {user?.username || "Dawvix User"}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.email || "user@dawvix.os"}
          </p>
        </div>
      </div>

      {/* App List */}
      <div className="flex flex-col gap-1 py-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 mb-1 text-left">
          Applications
        </span>
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => handleLaunch(app.id, app.title)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 active:bg-slate-800 text-left transition duration-150 cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-slate-800/60 group-hover:bg-slate-700/60 transition">
              {app.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-100 group-hover:text-cyan-300">
                {app.title}
              </p>
              <p className="text-[10px] text-slate-400">{app.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Logout Row */}
      <div className="pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="
            flex
            items-center
            justify-center
            gap-2
            p-2.5
            hover:bg-red-500/10
            hover:text-red-400
            text-slate-300
            rounded-xl
            w-full
            text-xs
            font-medium
            transition
            duration-150
            cursor-pointer
          "
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
