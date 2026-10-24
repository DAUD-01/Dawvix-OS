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
  Edit2,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  getDirectoryContents,
  createFolder,
  createFile,
  updateFolder,
  updateFile,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Creation modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const loadDirectory = useCallback(
    async (folderId?: string) => {
      setLoading(true);
      try {
        const data = await getDirectoryContents(folderId);
        setFolders(data.folders);
        setFiles(data.files);
        setPath(data.path);
        setCurrentFolderId(data.currentFolder?.id || folderId);
      } catch {
        // Fallback local filesystem view if backend connection is unavailable
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
            content:
              "Welcome to Dawvix OS!\nThis is your private virtual file system running in the cloud.\nYou can create, edit, view, and organize files and folders here.",
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
    },
    [user?.username],
  );

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const handleNavigateFolder = (folderId: string) => {
    setSearchQuery("");
    loadDirectory(folderId);
  };

  const handleNavigateUp = () => {
    setSearchQuery("");
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
        alert("Cannot create file at filesystem root. Navigate into a folder first.");
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

  const handleRename = async (
    type: "folder" | "file",
    id: string,
    currentName: string,
  ) => {
    const newName = prompt(`Enter new name for ${type}:`, currentName);
    if (!newName || newName.trim() === currentName) return;

    try {
      if (type === "folder") {
        await updateFolder(id, newName.trim());
      } else {
        await updateFile(id, undefined, newName.trim());
      }
      loadDirectory(currentFolderId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || `Failed to rename ${type}`);
    }
  };

  const handleDelete = async (
    type: "folder" | "file",
    id: string,
    name: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete ${type} "${name}"?${
          type === "folder" ? " All files inside will also be deleted." : ""
        }`,
      )
    ) {
      return;
    }

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
    openWindow("notes", `Notes - ${file.name}`, {
      fileId: file.id,
      fileName: file.name,
      content: file.content,
    });
  };

  // Filter items by search query
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col bg-slate-900/60 text-slate-200 select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 bg-slate-950/50 px-3 py-2 text-xs">
        {/* Navigation & Breadcrumbs */}
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

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search
              size={12}
              className="absolute left-2.5 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search in folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-32 sm:w-40 rounded-lg bg-slate-950/80 border border-slate-800 pl-7 pr-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1 rounded cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-1 rounded cursor-pointer ${
                viewMode === "list"
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List size={13} />
            </button>
          </div>

          {/* Creation Buttons */}
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <FolderPlus size={13} className="text-amber-400" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <FilePlus size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">New File</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer Viewport */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFolders.length === 0 && filteredFiles.length === 0 && !loading ? (
          <div className="flex h-56 flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <Folder size={40} className="text-slate-600 stroke-1" />
            <p>
              {searchQuery
                ? `No items match "${searchQuery}"`
                : "This directory is empty"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => handleNavigateFolder(folder.id)}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent hover:border-slate-700/60 hover:bg-slate-800/50 transition cursor-pointer select-none"
              >
                <Folder
                  size={46}
                  className="text-amber-400 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                  {folder.name}
                </span>

                {/* Quick actions on hover */}
                <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename("folder", folder.id, folder.name);
                    }}
                    title="Rename Folder"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete("folder", folder.id, folder.name);
                    }}
                    title="Delete Folder"
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}

            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onDoubleClick={() => handleOpenFile(file)}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-transparent hover:border-slate-700/60 hover:bg-slate-800/50 transition cursor-pointer select-none"
              >
                <FileText
                  size={46}
                  className="text-cyan-400 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                  {file.name}
                </span>

                {/* Quick actions on hover */}
                <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename("file", file.id, file.name);
                    }}
                    title="Rename File"
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <Edit2 size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete("file", file.id, file.name);
                    }}
                    title="Delete File"
                    className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2 pl-2">Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Size</th>
                  <th className="pb-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredFolders.map((folder) => (
                  <tr
                    key={folder.id}
                    onDoubleClick={() => handleNavigateFolder(folder.id)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-2 pl-2 flex items-center gap-2">
                      <Folder size={16} className="text-amber-400 shrink-0" />
                      <span className="font-medium text-slate-200">
                        {folder.name}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400">File folder</td>
                    <td className="py-2 text-slate-500">—</td>
                    <td className="py-2 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename("folder", folder.id, folder.name);
                          }}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete("folder", folder.id, folder.name);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    onDoubleClick={() => handleOpenFile(file)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-2 pl-2 flex items-center gap-2">
                      <FileText size={16} className="text-cyan-400 shrink-0" />
                      <span className="font-medium text-slate-200">
                        {file.name}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400">Document</td>
                    <td className="py-2 text-slate-500">
                      {file.content ? `${file.content.length} B` : "0 B"}
                    </td>
                    <td className="py-2 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename("file", file.id, file.name);
                          }}
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete("file", file.id, file.name);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Directory Status Footer */}
      <div className="border-t border-slate-800 bg-slate-950/60 px-3 py-1.5 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          {filteredFolders.length} folders, {filteredFiles.length} files
        </span>
        <span>Hierarchical Virtual VFS</span>
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
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 cursor-pointer"
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
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 cursor-pointer"
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
