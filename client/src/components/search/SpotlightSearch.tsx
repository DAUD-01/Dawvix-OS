import { useState, useEffect, useRef } from "react";
import {
  Search,
  Folder,
  FileText,
  FileCode,
  Terminal,
  Settings,
  X,
  Code2,
  ExternalLink,
} from "lucide-react";
import { getFileSystemTree, type FileData, type FolderData } from "../../services/filesystemService";
import { useWindowStore } from "../../stores/windowStore";

interface SearchResultItem {
  id: string;
  title: string;
  category: "Apps" | "Folders" | "Files";
  icon: React.ReactNode;
  action: () => void;
  subtitle?: string;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const [treeFiles, setTreeFiles] = useState<FileData[]>([]);
  const [treeFolders, setTreeFolders] = useState<FolderData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openWindow = useWindowStore((state) => state.openWindow);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch VFS items when search opens
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    inputRef.current?.focus();

    const fetchTree = async () => {
      try {
        const data = await getFileSystemTree();
        setTreeFiles(data.files || []);
        setTreeFolders(data.folders || []);
      } catch {
        // Fallback
      }
    };
    fetchTree();
  }, [isOpen]);

  // Built-in Apps list
  const builtInApps = [
    {
      id: "app-files",
      title: "Files",
      subtitle: "File Manager & Storage",
      category: "Apps" as const,
      icon: <Folder size={18} className="text-amber-400" />,
      action: () => {
        openWindow("files", "Files");
        onClose();
      },
    },
    {
      id: "app-notes",
      title: "Notes",
      subtitle: "Text Editor & Scratchpad",
      category: "Apps" as const,
      icon: <FileText size={18} className="text-emerald-400" />,
      action: () => {
        openWindow("notes", "Notes");
        onClose();
      },
    },
    {
      id: "app-code",
      title: "Code Studio",
      subtitle: "VSCode Lite IDE & Sandbox",
      category: "Apps" as const,
      icon: <Code2 size={18} className="text-blue-400" />,
      action: () => {
        openWindow("code", "Code Studio");
        onClose();
      },
    },
    {
      id: "app-terminal",
      title: "Terminal",
      subtitle: "Virtual Bash Shell & Command Prompt",
      category: "Apps" as const,
      icon: <Terminal size={18} className="text-cyan-400" />,
      action: () => {
        openWindow("terminal", "Terminal");
        onClose();
      },
    },
    {
      id: "app-settings",
      title: "Settings",
      subtitle: "System Preferences & Wallpaper",
      category: "Apps" as const,
      icon: <Settings size={18} className="text-purple-400" />,
      action: () => {
        openWindow("settings", "Settings");
        onClose();
      },
    },
    {
      id: "app-monitor",
      title: "Task Manager",
      subtitle: "Processes & Performance Monitor",
      category: "Apps" as const,
      icon: <span className="text-base">📊</span>,
      action: () => {
        openWindow("monitor", "Task Manager");
        onClose();
      },
    },
    {
      id: "app-store",
      title: "App Store",
      subtitle: "Discover & Install Applications",
      category: "Apps" as const,
      icon: <span className="text-base">🛍️</span>,
      action: () => {
        openWindow("store", "App Store");
        onClose();
      },
    },
    {
      id: "app-calculator",
      title: "Calculator",
      subtitle: "Standard & Arithmetic Calculator",
      category: "Apps" as const,
      icon: <span className="text-base">🧮</span>,
      action: () => {
        openWindow("calculator", "Calculator");
        onClose();
      },
    },
    {
      id: "app-paint",
      title: "Paint Studio",
      subtitle: "Drawing Canvas & VFS Export",
      category: "Apps" as const,
      icon: <span className="text-base">🎨</span>,
      action: () => {
        openWindow("paint", "Paint Studio");
        onClose();
      },
    },
    {
      id: "app-calendar",
      title: "Calendar & Agenda",
      subtitle: "Planner & Date Reminders",
      category: "Apps" as const,
      icon: <span className="text-base">📅</span>,
      action: () => {
        openWindow("calendar", "Calendar");
        onClose();
      },
    },
  ];

  // Dynamic search results
  const q = query.trim().toLowerCase();

  const appResults: SearchResultItem[] = builtInApps.filter(
    (app) =>
      app.title.toLowerCase().includes(q) ||
      (app.subtitle && app.subtitle.toLowerCase().includes(q)),
  );

  const folderResults: SearchResultItem[] = treeFolders
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((folder) => ({
      id: folder.id,
      title: folder.name,
      subtitle: "Virtual Folder",
      category: "Folders" as const,
      icon: <Folder size={18} className="text-amber-400" />,
      action: () => {
        openWindow("files", `Files - ${folder.name}`, { folderId: folder.id });
        onClose();
      },
    }));

  const fileResults: SearchResultItem[] = treeFiles
    .filter((f) => f.name.toLowerCase().includes(q))
    .slice(0, 8)
    .map((file) => ({
      id: file.id,
      title: file.name,
      subtitle: `Document • ${file.content ? file.content.length : 0} bytes`,
      category: "Files" as const,
      icon: file.name.match(/\.(js|ts|json|html|css)$/i) ? (
        <FileCode size={18} className="text-yellow-400" />
      ) : (
        <FileText size={18} className="text-cyan-400" />
      ),
      action: () => {
        if (file.name.match(/\.(js|ts|json|html|css)$/i)) {
          openWindow("code", `Code - ${file.name}`, {
            fileId: file.id,
            fileName: file.name,
            content: file.content,
          });
        } else {
          openWindow("notes", `Notes - ${file.name}`, {
            fileId: file.id,
            fileName: file.name,
            content: file.content,
          });
        }
        onClose();
      },
    }));

  const allResults: SearchResultItem[] = [
    ...appResults,
    ...folderResults,
    ...fileResults,
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? allResults.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      allResults[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5 bg-slate-950/80">
          <Search size={18} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search apps, files, folders..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No results found matching &quot;{query}&quot;
            </div>
          ) : (
            allResults.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white truncate">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-800/70 border border-slate-700/50">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ExternalLink size={12} className="text-cyan-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>Dawvix Spotlight</span>
        </div>
      </div>
    </div>
  );
}
