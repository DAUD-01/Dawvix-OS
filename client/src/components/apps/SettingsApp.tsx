import { Settings as SettingsIcon, User as UserIcon, Laptop, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export default function SettingsApp() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-full flex-col text-slate-200 overflow-y-auto p-5 space-y-5 select-none">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700/60">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">System Settings</h3>
          <p className="text-xs text-slate-400">
            Manage your Dawvix OS environment and profile
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-white">
            <UserIcon size={16} className="text-cyan-400" />
            <span>Account Profile</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">Username</span>
              <span className="font-medium text-slate-100">
                {user?.username || "Guest"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">Email</span>
              <span className="font-medium text-slate-100">
                {user?.email || "guest@dawvix.os"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Virtual Filesystem Isolation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All files created in Dawvix OS are scoped securely to your user account (`/home/{user?.username || "user"}`). Other users cannot see or modify your virtual drives.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
            <Laptop size={16} className="text-indigo-400" />
            <span>About Dawvix OS</span>
          </div>
          <div className="space-y-1 text-xs text-slate-400">
            <p>Version: 1.0.0 (Step 5 - Virtual Filesystem Active)</p>
            <p>Kernel: Virtual Node.js & Mongoose Hierarchical Engine</p>
            <p>Desktop UI: React 19, TypeScript, Tailwind CSS v4, Zustand</p>
          </div>
        </div>
      </div>
    </div>
  );
}
