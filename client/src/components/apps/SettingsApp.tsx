import { useState } from "react";
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Laptop,
  Image as ImageIcon,
  Palette,
  Volume2,
  VolumeX,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useSettingsStore, WALLPAPERS } from "../../stores/settingsStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { updateProfile } from "../../services/authService";

export default function SettingsApp() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { wallpaper, theme, soundEnabled, setWallpaper, setTheme, toggleSound } =
    useSettingsStore();

  const [activeTab, setActiveTab] = useState<
    "personalization" | "account" | "system"
  >("personalization");

  // Profile edit state
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  // Custom wallpaper URL
  const [customWallpaper, setCustomWallpaper] = useState("");

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername.trim() === user?.username) return;

    setUpdatingUsername(true);
    setUsernameMessage(null);

    try {
      const data = await updateProfile(newUsername.trim());
      setUser(data.user);
      setUsernameMessage("Username updated successfully!");
      useNotificationStore.getState().notify({
        title: "Profile Updated",
        message: `Username changed to "${newUsername.trim()}"`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setUsernameMessage(msg || "Failed to update username");
    } finally {
      setUpdatingUsername(false);
      setTimeout(() => setUsernameMessage(null), 3000);
    }
  };

  const handleApplyCustomWallpaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWallpaper.trim()) return;
    setWallpaper(customWallpaper.trim());
    setCustomWallpaper("");
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/70 text-slate-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-slate-700/60 bg-slate-950/70 px-4 py-3 shrink-0">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <SettingsIcon size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">System Settings</h3>
          <p className="text-[11px] text-slate-400">
            Personalize your Dawvix OS environment
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-44 border-r border-slate-800 bg-slate-950/40 p-2.5 flex flex-col gap-1 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("personalization")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
              activeTab === "personalization"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Palette size={14} className="text-cyan-400" />
            <span>Personalization</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
              activeTab === "account"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <UserIcon size={14} className="text-purple-400" />
            <span>User Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
              activeTab === "system"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Laptop size={14} className="text-indigo-400" />
            <span>System Info</span>
          </button>
        </aside>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-5">
          {activeTab === "personalization" && (
            <div className="space-y-5">
              {/* Wallpaper Gallery */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ImageIcon size={15} className="text-cyan-400" />
                  <span>Desktop Wallpaper</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALLPAPERS.map((wp) => {
                    const isSelected = wallpaper === wp.url;
                    return (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => setWallpaper(wp.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 transition cursor-pointer text-left aspect-video ${
                          isSelected
                            ? "border-cyan-400 shadow-lg shadow-cyan-500/20"
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <img
                          src={wp.thumbnail}
                          alt={wp.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[11px] font-medium text-white truncate">
                            {wp.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 rounded-full bg-cyan-500 p-0.5 text-slate-950">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Wallpaper URL Form */}
                <form
                  onSubmit={handleApplyCustomWallpaper}
                  className="pt-2 flex items-center gap-2"
                >
                  <input
                    type="url"
                    placeholder="Paste custom image URL..."
                    value={customWallpaper}
                    onChange={(e) => setCustomWallpaper(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold cursor-pointer transition"
                  >
                    Set Wallpaper
                  </button>
                </form>
              </div>

              {/* Theme Selector */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Sparkles size={15} className="text-yellow-400" />
                  <span>Accent Theme</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "slate", name: "Slate Modern", color: "bg-cyan-500" },
                    { id: "cyberpunk", name: "Cyberpunk", color: "bg-fuchsia-500" },
                    { id: "nebula", name: "Deep Nebula", color: "bg-indigo-500" },
                    { id: "forest", name: "Emerald Forest", color: "bg-emerald-500" },
                  ].map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setTheme(
                            t.id as "slate" | "cyberpunk" | "nebula" | "forest",
                          )
                        }
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-500/10 text-white"
                            : "border-slate-800 hover:bg-slate-800/60 text-slate-300"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full ${t.color}`} />
                        <span className="font-medium truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 size={16} className="text-cyan-400" />
                  ) : (
                    <VolumeX size={16} className="text-slate-500" />
                  )}
                  <div>
                    <span className="font-medium text-white block">
                      Sound Effects
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Play acoustic feedback on window and desktop actions
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? "bg-cyan-500" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
                <div className="flex items-center gap-2 text-white font-medium">
                  <UserIcon size={15} className="text-cyan-400" />
                  <span>Profile Information</span>
                </div>

                <form onSubmit={handleUpdateUsername} className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Username (Display Name)
                    </label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || "user@dawvix.os"}
                      className="w-full rounded-xl bg-slate-950/60 border border-slate-800/80 px-3 py-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {usernameMessage && (
                      <span className="text-xs text-cyan-300 italic">
                        {usernameMessage}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={
                        updatingUsername || newUsername.trim() === user?.username
                      }
                      className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold cursor-pointer transition"
                    >
                      {updatingUsername && (
                        <RefreshCw size={13} className="animate-spin" />
                      )}
                      <span>Update Profile</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Laptop size={15} className="text-indigo-400" />
                  <span>Dawvix Operating System Specifications</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">OS Edition</span>
                    <span className="font-medium text-white">
                      Dawvix OS Enterprise Web 1.0
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Kernel Engine</span>
                    <span>Node.js v24 + Virtual VFS</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Frontend Environment</span>
                    <span>React 19, TypeScript, Tailwind CSS v4, Zustand</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Storage System</span>
                    <span>Isolated Hierarchical Cloud Virtual Filesystem</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Developer</span>
                    <span className="text-cyan-400 font-medium">
                      Dawood Sardar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
