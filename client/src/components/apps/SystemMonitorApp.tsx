import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Layers,
  XCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useWindowStore } from "../../stores/windowStore";
import { useNotificationStore } from "../../stores/notificationStore";

export default function SystemMonitorApp() {
  const { windows, closeWindow, focusWindow } = useWindowStore();
  const [activeTab, setActiveTab] = useState<"processes" | "performance" | "system">("processes");

  // Simulated metrics with realistic variations
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 18, 25, 14, 20, 32, 19, 15, 22, 18]);
  const [ramHistory, setRamHistory] = useState<number[]>([42, 43, 44, 43, 45, 46, 45, 47, 46, 48]);
  const [currentCpu, setCurrentCpu] = useState(18);
  const [currentRam, setCurrentRam] = useState(46); // percent
  const [uptimeSeconds, setUptimeSeconds] = useState(142);

  // Update metrics loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Base load depends slightly on number of open windows
      const baseLoad = Math.min(80, 8 + windows.length * 4);
      const nextCpu = Math.max(5, Math.min(98, Math.round(baseLoad + (Math.random() * 18 - 9))));
      const nextRam = Math.max(25, Math.min(85, Math.round(38 + windows.length * 3 + (Math.random() * 4 - 2))));

      setCurrentCpu(nextCpu);
      setCurrentRam(nextRam);

      setCpuHistory((prev) => [...prev.slice(1), nextCpu]);
      setRamHistory((prev) => [...prev.slice(1), nextRam]);
      setUptimeSeconds((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [windows.length]);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate pseudo PID and stable resource usage per window
  const processList = useMemo(() => {
    // OS Core Kernel tasks
    const kernelTasks = [
      {
        id: "kernel",
        name: "Dawvix Kernel Core",
        pid: 104,
        status: "Running",
        cpu: (currentCpu * 0.22).toFixed(1) + "%",
        memory: "184.2 MB",
        isSystem: true,
      },
      {
        id: "vfs-daemon",
        name: "Virtual Filesystem Daemon",
        pid: 312,
        status: "Running",
        cpu: (currentCpu * 0.12).toFixed(1) + "%",
        memory: "96.4 MB",
        isSystem: true,
      },
      {
        id: "window-server",
        name: "Desktop Compositor",
        pid: 480,
        status: "Running",
        cpu: (currentCpu * 0.18).toFixed(1) + "%",
        memory: "142.0 MB",
        isSystem: true,
      },
    ];

    const appTasks = windows.map((win, idx) => {
      const pseudoPid = 1000 + (idx + 1) * 112;
      return {
        id: win.id,
        name: win.title || win.id,
        pid: pseudoPid,
        status: win.minimized ? "Background" : "Foreground",
        cpu: Math.max(0.5, currentCpu * 0.15).toFixed(1) + "%",
        memory: (64 + (idx + 1) * 38.5).toFixed(1) + " MB",
        isSystem: false,
      };
    });

    return [...kernelTasks, ...appTasks];
  }, [windows, currentCpu]);

  const handleKillProcess = (id: string, name: string) => {
    closeWindow(id);
    useNotificationStore.getState().notify({
      title: "Process Terminated",
      message: `Successfully ended task "${name}"`,
      type: "warning",
    });
  };

  // Sparkline SVG path generator
  const renderSparkline = (data: number[], strokeColor: string, fillColor: string) => {
    const width = 280;
    const height = 70;
    const maxVal = 100;
    const step = width / (data.length - 1);

    const points = data.map((val, idx) => {
      const x = idx * step;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;
    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${strokeColor})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/90 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header / App Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-xs tracking-wide">
              Task Manager
            </h3>
            <span className="text-[10px] text-slate-400">
              Dawvix System Monitor
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("processes")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "processes"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers size={13} />
            <span>Processes ({processList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "performance"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Cpu size={13} />
            <span>Performance</span>
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "system"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HardDrive size={13} />
            <span>Hardware</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "processes" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium">Process Name</th>
                    <th className="py-2.5 px-3 font-medium">PID</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium">CPU</th>
                    <th className="py-2.5 px-3 font-medium">Memory</th>
                    <th className="py-2.5 px-3.5 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {processList.map((proc) => (
                    <tr
                      key={proc.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-2 px-3.5 font-medium text-slate-200 flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            proc.isSystem ? "bg-cyan-400" : "bg-emerald-400"
                          }`}
                        />
                        <span className="truncate max-w-[180px]">{proc.name}</span>
                        {proc.isSystem && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5">
                            System
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">
                        {proc.pid}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            proc.status === "Foreground"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {proc.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono">
                        {proc.cpu}
                      </td>
                      <td className="py-2 px-3 text-slate-300 font-mono">
                        {proc.memory}
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        {!proc.isSystem ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => focusWindow(proc.id)}
                              className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-cyan-500/10 transition cursor-pointer"
                            >
                              Switch
                            </button>
                            <button
                              onClick={() => handleKillProcess(proc.id, proc.name)}
                              className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-rose-500/10 transition flex items-center gap-1 cursor-pointer"
                              title="End Task"
                            >
                              <XCircle size={13} />
                              <span>End Task</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Quick Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Total Processes
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {processList.length}
                  </div>
                </div>
                <Layers size={22} className="text-emerald-400/60" />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    CPU Load
                  </span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    {currentCpu}%
                  </div>
                </div>
                <Cpu size={22} className="text-cyan-400/60" />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    RAM Usage
                  </span>
                  <div className="text-lg font-bold text-purple-400 mt-0.5 font-mono">
                    {currentRam}%
                  </div>
                </div>
                <Activity size={22} className="text-purple-400/60" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-4">
            {/* CPU Metric Card */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-emerald-400" />
                  <span className="font-semibold text-xs text-white">
                    Central Processing Unit (CPU)
                  </span>
                </div>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {currentCpu}%
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="h-20 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5 overflow-hidden">
                {renderSparkline(cpuHistory, "#10b981", "#10b981")}
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500">Speed:</span>{" "}
                  <span className="text-slate-200 font-mono">3.40 GHz</span>
                </div>
                <div>
                  <span className="text-slate-500">Cores:</span>{" "}
                  <span className="text-slate-200 font-mono">8 (Virtual)</span>
                </div>
                <div>
                  <span className="text-slate-500">Threads:</span>{" "}
                  <span className="text-slate-200 font-mono">16</span>
                </div>
                <div>
                  <span className="text-slate-500">Uptime:</span>{" "}
                  <span className="text-slate-200 font-mono">{formatUptime(uptimeSeconds)}</span>
                </div>
              </div>
            </div>

            {/* RAM Metric Card */}
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-purple-400" />
                  <span className="font-semibold text-xs text-white">
                    Physical Memory (RAM)
                  </span>
                </div>
                <span className="text-lg font-bold font-mono text-purple-400">
                  {( (16 * currentRam) / 100 ).toFixed(1)} GB / 16.0 GB ({currentRam}%)
                </span>
              </div>

              {/* Sparkline Visual */}
              <div className="h-20 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5 overflow-hidden">
                {renderSparkline(ramHistory, "#a855f7", "#a855f7")}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500">In Use:</span>{" "}
                  <span className="text-slate-200 font-mono">{((16 * currentRam) / 100).toFixed(1)} GB</span>
                </div>
                <div>
                  <span className="text-slate-500">Available:</span>{" "}
                  <span className="text-slate-200 font-mono">{(16 - (16 * currentRam) / 100).toFixed(1)} GB</span>
                </div>
                <div>
                  <span className="text-slate-500">Allocated:</span>{" "}
                  <span className="text-slate-200 font-mono">DDR5 5600 MHz</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-slate-950 font-bold text-lg">
                  D
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Dawvix OS Virtual Machine</h4>
                  <p className="text-xs text-slate-400">Architecture: WebAssembly / React 19 Core</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Kernel Version</span>
                  <p className="font-mono text-slate-200">Dawvix-vfs-1.0.4-cloud</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Host Engine</span>
                  <p className="font-mono text-slate-200">{navigator.userAgent.split(" ").slice(-1)[0] || "Chromium"}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">System Resolution</span>
                  <p className="font-mono text-slate-200">{window.innerWidth} x {window.innerHeight}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Session Status</span>
                  <p className="font-mono text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    Verified Authenticated
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          <span>System Uptime: {formatUptime(uptimeSeconds)}</span>
        </div>
        <span>Processes: {processList.length} total</span>
      </div>
    </div>
  );
}
