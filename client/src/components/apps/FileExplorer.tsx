import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FileText,
  FolderPlus,
  FilePlus,
  ArrowUp,
  RefreshCw,
  Trash2,
  HardDrive,
  ChevronRight,
} from "lucide-react";
import {
  getDirectoryContents,
  createFolder,
  createFile,
  deleteItem,
  type FolderData,
  type FileData,
} from "../../services/filesystemService";
import { useAuthStore } from "../../stores/authStore";
import { useWindowStore } from "../../stores/windowStore";

export default function FileExplorer() {
  const user = useAuthStore((state) => state.user);
  const openWindow = useWindowStore((state) => state.openWindow);

  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New item creation state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const loadDirectory = useCallback(async (folderId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDirectoryContents(folderId);
      setFolders(data.folders);
      setFiles(data.files);
      setPath(data.path);
      setCurrentFolderId(data.currentFolder?.id || folderId);
    } catch {
      // Fallback mock structure if backend is temporarily disconnected
      const fallbackFolders: FolderData[] = [
        { id: "f-doc", name: "documents", parentId: "user", ownerId: "local" },
        { id: "f-not", name: "notes", parentId: "user", ownerId: "local" },
        { id: "f-prj", name: "projects", parentId: "user", ownerId: "local" },
        { id: "f-dwn", name: "downloads", parentId: "user", ownerId: "local" },
        { id: "f-pic", name: "pictures", parentId: "user", ownerId: "local" },
      ];
      const fallbackFiles: FileData[] = [
        {
          id: "file-welcome",
          name: "welcome.txt",
          content: "Welcome to Dawvix OS Virtual Filesystem!",
          parentId: "user",
          ownerId: "local",
        },
      ];
      setFolders(fallbackFolders);
      setFiles(fallbackFiles);
      setPath([
        { id: "root", name: "/" },
        { id: "home", name: "home" },
        { id: "user", name: user?.username || "dawood" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleNavigateFolder = (folderId: string) => {
    loadDirectory(folderId);
  };

  const handleNavigateUp = () => {
    if (path.length > 1) {
      const parentCrumb = path[path.length - 2];
      if (parentCrumb) {
        loadDirectory(parentCrumb.id === "root" ? undefined : parentCrumb.id);
      }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName("");
      setShowNewFolderModal(false);
      loadDirectory(currentFolderId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to create folder");
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      if (!currentFolderId) {
        alert("Cannot create file at filesystem root. Navigate to a folder first.");
        return;
      }
      await createFile(newFileName.trim(), currentFolderId);
      setNewFileName("");
      setShowNewFileModal(false);
      loadDirectory(currentFolderId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to create file");
    }
  };

  const handleDelete = async (type: "folder" | "file", id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${type} "${name}"?`)) return;

    try {
      await deleteItem(type, id);
      loadDirectory(currentFolderId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || `Failed to delete ${type}`);
    }
  };

  const handleOpenFile = (file: FileData) => {
    openWindow("notes", `Notes - ${file.name}`);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900/60 text-slate-200 select-none">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 bg-slate-950/40 px-3 py-2 text-xs">
        {/* Navigation buttons and Path Breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={handleNavigateUp}
            disabled={path.length <= 1}
            title="Up to parent folder"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ArrowUp size={14} />
          </button>

          <button
            type="button"
            onClick={() => loadDirectory(currentFolderId)}
            title="Refresh"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Breadcrumb Path Bar */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 overflow-x-auto text-[11px] max-w-full">
            <HardDrive size={13} className="text-cyan-400 shrink-0 mr-1" />
            {path.map((crumb, idx) => (
              <div key={crumb.id || idx} className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    loadDirectory(crumb.id === "root" ? undefined : crumb.id)
                  }
                  className="hover:text-cyan-300 font-medium transition cursor-pointer"
                >
                  {crumb.name}
                </button>
                {idx < path.length - 1 && (
                  <ChevronRight size={11} className="text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: New Folder & New File */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <FolderPlus size={13} className="text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <FilePlus size={13} className="text-emerald-400" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer Grid Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {folders.length === 0 && files.length === 0 && !loading ? (
          <div className="flex h-48 flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <Folder size={36} className="text-slate-600 stroke-1" />
            <p>This folder is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Folder items */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => handleNavigateFolder(folder.id)}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent hover:border-slate-700/60 hover:bg-slate-800/50 transition cursor-pointer"
              >
                <Folder
                  size={42}
                  className="text-amber-400 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                  {folder.name}
                </span>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete("folder", folder.id, folder.name);
                  }}
                  title="Delete Folder"
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* File items */}
            {files.map((file) => (
              <div
                key={file.id}
                onDoubleClick={() => handleOpenFile(file)}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent hover:border-slate-700/60 hover:bg-slate-800/50 transition cursor-pointer"
              >
                <FileText
                  size={42}
                  className="text-cyan-400 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                  {file.name}
                </span>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete("file", file.id, file.name);
                  }}
                  title="Delete File"
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl space-y-3"
          >
            <h4 className="text-xs font-semibold text-white">Create New Folder</h4>
            <input
              type="text"
              required
              autoFocus
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFile}
            className="w-full max-w-xs rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl space-y-3"
          >
            <h4 className="text-xs font-semibold text-white">Create New File</h4>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. notes.txt or script.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
