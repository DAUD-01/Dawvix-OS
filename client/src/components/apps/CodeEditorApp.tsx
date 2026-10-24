import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileCode,
  Save,
  Play,
  Check,
  RefreshCw,
  Plus,
  X,
  FolderOpen,
  Terminal,
  Code2,
} from "lucide-react";
import {
  getDirectoryContents,
  updateFile,
  createFile,
  type FileData,
} from "../../services/filesystemService";

interface CodeTab {
  id: string; // file ID or temporary ID
  name: string;
  content: string;
  language: string;
  saved: boolean;
  isVirtualFile: boolean;
}

const detectLanguage = (name: string): string => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
    case "json":
      return "json";
    case "html":
      return "html";
    case "css":
      return "css";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

export default function CodeEditorApp() {
  const [tabs, setTabs] = useState<CodeTab[]>([
    {
      id: "tab-demo-js",
      name: "main.js",
      content: `// Dawvix Code Studio - VSCode Lite
function calculateStats(items) {
  const total = items.reduce((sum, item) => sum + item.score, 0);
  return {
    count: items.length,
    average: total / items.length
  };
}

const users = [
  { name: "Dawood", score: 98 },
  { name: "System", score: 92 },
  { name: "Guest", score: 85 }
];

console.log("Analyzing user metrics...");
const stats = calculateStats(users);
console.log("Results:", stats);
`,
      language: "javascript",
      saved: true,
      isVirtualFile: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>("tab-demo-js");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFileBrowser, setShowFileBrowser] = useState(false);
  const [vfsFiles, setVfsFiles] = useState<FileData[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Load project files from VFS
  const loadVfsFiles = useCallback(async () => {
    try {
      const rootDir = await getDirectoryContents();
      const projFolder =
        rootDir.folders.find((f) => f.name.toLowerCase() === "projects") ||
        rootDir.folders[0] ||
        rootDir.currentFolder;

      if (projFolder) {
        const contents = await getDirectoryContents(projFolder.id);
        setVfsFiles(contents.files);
      }
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    loadVfsFiles();
  }, [loadVfsFiles]);

  const handleContentChange = (newContent: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, content: newContent, saved: false }
          : tab,
      ),
    );
  };

  const handleSave = useCallback(async () => {
    if (!activeTab) return;
    setSaving(true);

    try {
      if (activeTab.isVirtualFile) {
        await updateFile(activeTab.id, activeTab.content);
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTab.id ? { ...t, saved: true } : t)),
        );
      } else {
        // Save to projects directory
        const rootDir = await getDirectoryContents();
        const projFolder =
          rootDir.folders.find((f) => f.name.toLowerCase() === "projects") ||
          rootDir.currentFolder;

        if (projFolder) {
          const result = await createFile(
            activeTab.name,
            projFolder.id,
            activeTab.content,
          );
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTab.id
                ? {
                    ...t,
                    id: result.file.id,
                    isVirtualFile: true,
                    saved: true,
                  }
                : t,
            ),
          );
          loadVfsFiles();
        }
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to save code");
    } finally {
      setSaving(false);
    }
  }, [activeTab, loadVfsFiles]);

  // Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleRunCode = () => {
    if (!activeTab) return;
    setShowConsole(true);
    setConsoleLogs([]);

    const capturedLogs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: unknown[]) => {
      capturedLogs.push(
        args
          .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
          .join(" "),
      );
    };
    console.error = (...args: unknown[]) => {
      capturedLogs.push(`[ERROR] ${args.join(" ")}`);
    };
    console.warn = (...args: unknown[]) => {
      capturedLogs.push(`[WARN] ${args.join(" ")}`);
    };

    try {
      // Execute in sandboxed Function wrapper
      const runnable = new Function(activeTab.content);
      const evalResult = runnable();
      if (evalResult !== undefined) {
        capturedLogs.push(`=> Return: ${JSON.stringify(evalResult, null, 2)}`);
      }
    } catch (err: unknown) {
      capturedLogs.push(`Runtime Error: ${(err as Error).message}`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }

    setConsoleLogs(capturedLogs.length > 0 ? capturedLogs : ["(Executed with no output)"]);
  };

  const handleOpenVfsFile = (file: FileData) => {
    const existing = tabs.find((t) => t.id === file.id);
    if (existing) {
      setActiveTabId(file.id);
    } else {
      const newTab: CodeTab = {
        id: file.id,
        name: file.name,
        content: file.content || "",
        language: detectLanguage(file.name),
        saved: true,
        isVirtualFile: true,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(file.id);
    }
    setShowFileBrowser(false);
  };

  const handleNewTab = () => {
    const name = prompt("Enter file name:", "script.js");
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    const newTab: CodeTab = {
      id: `tab-${Date.now()}`,
      name: trimmed,
      content: "",
      language: detectLanguage(trimmed),
      saved: false,
      isVirtualFile: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Keep at least one tab
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1]?.id || "");
    }
  };

  const lines = (activeTab?.content || "").split("\n");

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-mono text-xs">
      {/* Top VSCode Title & Action Ribbon */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-3 py-1.5 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-cyan-400" />
          <span className="font-semibold text-slate-200">Dawvix Code Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFileBrowser((prev) => !prev)}
            title="Open file from Virtual Filesystem"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer text-[11px]"
          >
            <FolderOpen size={12} className="text-amber-400" />
            <span>Open VFS File</span>
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            title="Execute Code in Sandbox"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer text-[11px]"
          >
            <Play size={12} fill="currentColor" />
            <span>Run</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            title="Save file (Ctrl + S)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition cursor-pointer text-[11px]"
          >
            {saving ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : activeTab?.saved ? (
              <Check size={12} />
            ) : (
              <Save size={12} />
            )}
            <span>{activeTab?.saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-slate-800/80 bg-slate-900/60 px-2 overflow-x-auto shrink-0 pt-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 border-t-2 rounded-t-lg transition cursor-pointer text-xs ${
                isActive
                  ? "bg-slate-950 border-cyan-400 text-white font-medium"
                  : "bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
              }`}
            >
              <FileCode
                size={13}
                className={
                  tab.language === "javascript"
                    ? "text-yellow-400"
                    : tab.language === "typescript"
                    ? "text-blue-400"
                    : "text-cyan-400"
                }
              />
              <span>{tab.name}</span>
              {!tab.saved && (
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              )}
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleNewTab}
          title="New Tab"
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ml-1 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Main Workspace (File Browser Modal + Code Editor Area) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* VFS File Browser Drawer */}
        {showFileBrowser && (
          <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900/95 border-r border-slate-800 p-3 z-20 flex flex-col gap-2 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">
                Open from VFS
              </span>
              <button
                type="button"
                onClick={() => setShowFileBrowser(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1 flex-1">
              {vfsFiles.length === 0 ? (
                <p className="text-slate-500 text-xs p-2">
                  No files in projects folder
                </p>
              ) : (
                vfsFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => handleOpenVfsFile(file)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  >
                    <FileCode size={13} className="text-yellow-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Editor Gutter (Line Numbers) */}
        <div className="w-11 bg-slate-950/90 border-r border-slate-900 py-3 text-right pr-2 text-slate-600 select-none overflow-hidden shrink-0 font-mono text-xs leading-6">
          {lines.map((_, idx) => (
            <div key={idx + 1}>{idx + 1}</div>
          ))}
        </div>

        {/* Code Textarea Editor */}
        <textarea
          ref={textareaRef}
          value={activeTab?.content || ""}
          onChange={(e) => handleContentChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-slate-950 p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-6 select-text overflow-y-auto"
          placeholder="// Type your code here..."
        />
      </div>

      {/* Output Console Drawer */}
      {showConsole && (
        <div className="h-36 border-t border-slate-800 bg-slate-950 flex flex-col shrink-0 select-text">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <Terminal size={12} className="text-emerald-400" />
              <span>Execution Output</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConsoleLogs([])}
                className="hover:text-white cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowConsole(false)}
                className="hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 font-mono text-xs space-y-1 text-slate-300">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith("[ERROR]")
                    ? "text-red-400"
                    : log.startsWith("[WARN]")
                    ? "text-yellow-400"
                    : "text-slate-300"
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-t border-slate-800 bg-cyan-950/30 px-3 py-1 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-medium">
            {activeTab?.language?.toUpperCase()}
          </span>
          <span>UTF-8</span>
          <span>{activeTab?.saved ? "Saved" : "Modified"}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Lines: {lines.length}</span>
          <button
            type="button"
            onClick={() => setShowConsole((prev) => !prev)}
            className="hover:text-white cursor-pointer flex items-center gap-1"
          >
            <Terminal size={11} />
            <span>Console</span>
          </button>
        </div>
      </div>
    </div>
  );
}
