import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Star,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { STORE_CATALOG, useAppRegistryStore, type AppDefinition } from "../../sdk/appRegistry";
import { useWindowStore } from "../../stores/windowStore";

export default function AppStoreApp() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { installApp, uninstallApp, isInstalled } = useAppRegistryStore();
  const { openWindow } = useWindowStore();

  const categories = [
    { id: "all", name: "All Apps" },
    { id: "utilities", name: "Utilities" },
    { id: "creativity", name: "Creativity" },
    { id: "productivity", name: "Productivity" },
  ];

  const filteredApps = STORE_CATALOG.filter((app) => {
    const matchesCategory =
      selectedCategory === "all" || app.category === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunchApp = (app: AppDefinition) => {
    openWindow(app.id, app.name);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 select-none overflow-hidden font-sans">
      {/* Store Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">
              Dawvix App Store
            </h3>
            <span className="text-[11px] text-slate-400">
              Discover and install verified applications
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Store Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-6 flex flex-col justify-between shadow-xl">
          <div className="max-w-md space-y-2 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold tracking-wider uppercase inline-flex items-center gap-1">
              <Sparkles size={11} />
              Featured Selection
            </span>
            <h2 className="text-xl font-bold text-white">
              Expand your Dawvix Experience
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Install lightweight, high-performance desktop applications tailored for creativity, calculation, and time management.
            </p>
          </div>
          <div className="absolute right-6 -bottom-4 opacity-10 text-9xl pointer-events-none select-none font-bold">
            APPS
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const installed = isInstalled(app.id);

            return (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-850 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                        {app.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {app.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{app.author}</span>
                          <span>•</span>
                          <span className="capitalize">{app.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Star size={12} fill="currentColor" />
                      <span>{app.rating}</span>
                    </div>
                  </div>

                  {/* App Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {app.description}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Download size={11} />
                    <span>{app.downloads} installs</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {installed ? (
                      <>
                        <button
                          onClick={() => handleLaunchApp(app)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
                        >
                          <ExternalLink size={13} />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={() => uninstallApp(app.id)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Uninstall"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => installApp(app.id)}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-white/10"
                      >
                        <Download size={13} />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
