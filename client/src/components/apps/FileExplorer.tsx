import { useState, useEffect, useCallback, useRef } from "react";
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
  Scissors,
  ClipboardPaste,
  Home,
  FileCode,
  Image as ImageIcon,
  Download,
  FolderGit2,
  FileCheck,
  Upload,
  Eye,
  X,
} from "lucide-react";
import {
  getDirectoryContents,
  createFolder,
  createFile,
  updateFolder,
  updateFile,
  uploadFile,
  deleteItem,
  type FolderData,
  type FileData,
} from "../../services/filesystemService";
import { useAuthStore } from "../../stores/authStore";
import { useWindowStore } from "../../stores/windowStore";
import { useNotificationStore } from "../../stores/notificationStore";

interface ClipboardItem {
  id: string;
  name: string;
  type: "folder" | "file";
  action: "cut";
}

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

  // Selection & Clipboard
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: "folder" | "file";
    name: string;
    size?: number;
    content?: string;
  } | null>(null);

  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  // Preview Modal
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

  // Drag and Drop & File Upload
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDirectory = useCallback(
    async (folderId?: string) => {
      setLoading(true);
      try {
        const data = await getDirectoryContents(folderId);
        setFolders(data.folders);
        setFiles(data.files);
        setPath(data.path);
        setCurrentFolderId(data.currentFolder?.id || folderId);
        setSelectedItem(null);
      } catch {
        // Fallback demo file system if offline
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

  const handleQuickJump = (folderName: string) => {
    const match = folders.find(
      (f) => f.name.toLowerCase() === folderName.toLowerCase(),
    );
    if (match) {
      handleNavigateFolder(match.id);
    } else {
      loadDirectory();
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const created = newFolderName.trim();
      await createFolder(created, currentFolderId);
      setNewFolderName("");
      setShowNewFolderModal(false);
      loadDirectory(currentFolderId);
      useNotificationStore.getState().notify({
        title: "Folder Created",
        message: `Created folder "${created}"`,
        type: "success",
      });
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
      const created = newFileName.trim();
      await createFile(created, currentFolderId);
      setNewFileName("");
      setShowNewFileModal(false);
      loadDirectory(currentFolderId);
      useNotificationStore.getState().notify({
        title: "File Created",
        message: `Created file "${created}"`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to create file");
    }
  };

  // Upload handler
  const processUploadFiles = async (fileList: FileList | File[]) => {
    if (!currentFolderId) {
      alert("Please navigate into a folder before uploading files.");
      return;
    }

    setUploading(true);
    try {
      for (const f of Array.from(fileList)) {
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          const isText =
            f.type.startsWith("text/") ||
            f.name.endsWith(".txt") ||
            f.name.endsWith(".md") ||
            f.name.endsWith(".json") ||
            f.name.endsWith(".js") ||
            f.name.endsWith(".ts");

          if (isText) {
            reader.readAsText(f);
          } else {
            reader.readAsDataURL(f);
          }

          reader.onload = async () => {
            try {
              const content = reader.result as string;
              await uploadFile(
                f.name,
                content,
                currentFolderId,
                f.size,
                f.type || "application/octet-stream",
              );
              resolve();
            } catch (uploadErr) {
              reject(uploadErr);
            }
          };

          reader.onerror = (err) => reject(err);
        });
      }
      const targetFolderName = path[path.length - 1]?.name || "folder";
      loadDirectory(currentFolderId);
      useNotificationStore.getState().notify({
        title: "Upload Completed",
        message: `Uploaded ${fileList.length} file(s) to ${targetFolderName}`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDownloadFile = (file: FileData) => {
    const element = document.createElement("a");
    if (file.content.startsWith("data:")) {
      element.href = file.content;
    } else {
      const blob = new Blob([file.content], {
        type: file.mimeType || "text/plain",
      });
      element.href = URL.createObjectURL(blob);
    }
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
          type === "folder" ? " All contents inside will also be removed." : ""
        }`,
      )
    ) {
      return;
    }

    try {
      await deleteItem(type, id);
      loadDirectory(currentFolderId);
      useNotificationStore.getState().notify({
        title: "Item Deleted",
        message: `Deleted ${type} "${name}"`,
        type: "warning",
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || `Failed to delete ${type}`);
    }
  };

  // Move / Cut & Paste
  const handleCut = (item: { id: string; name: string; type: "folder" | "file" }) => {
    setClipboard({ ...item, action: "cut" });
  };

  const handlePaste = async () => {
    if (!clipboard || !currentFolderId) return;

    try {
      if (clipboard.type === "folder") {
        await updateFolder(clipboard.id, undefined, currentFolderId);
      } else {
        await updateFile(clipboard.id, undefined, undefined, currentFolderId);
      }
      setClipboard(null);
      loadDirectory(currentFolderId);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Failed to move item");
    }
  };

  const handleOpenFile = (file: FileData) => {
    const isImage =
      file.name.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i) ||
      file.content.startsWith("data:image");

    if (isImage) {
      setPreviewFile(file);
      return;
    }

    const isCode = file.name.match(/\.(js|ts|jsx|tsx|json|html|css)$/i);
    if (isCode) {
      openWindow("code", `Code - ${file.name}`, {
        fileId: file.id,
        fileName: file.name,
        content: file.content,
      });
      return;
    }

    openWindow("notes", `Notes - ${file.name}`, {
      fileId: file.id,
      fileName: file.name,
      content: file.content,
    });
  };

  // Helper for file icons
  const getFileIcon = (name: string, content?: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "json":
      case "html":
      case "css":
        return <FileCode size={40} className="text-yellow-400" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "svg":
      case "gif":
      case "webp":
        if (content && content.startsWith("data:image")) {
          return (
            <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
              <img src={content} alt={name} className="h-full w-full object-cover" />
            </div>
          );
        }
        return <ImageIcon size={40} className="text-purple-400" />;
      default:
        return <FileText size={40} className="text-cyan-400" />;
    }
  };

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-full flex-col bg-slate-900/70 text-slate-200 select-none relative ${
        isDraggingOver ? "ring-2 ring-cyan-400 bg-cyan-950/20" : ""
      }`}
    >
      {/* Hidden File Input for Native Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && processUploadFiles(e.target.files)}
        className="hidden"
      />

      {/* Drag and drop overlay hint */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 bg-cyan-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-cyan-300 pointer-events-none">
          <Upload size={48} className="animate-bounce mb-2" />
          <p className="font-semibold text-sm">Drop files to upload to this directory</p>
        </div>
      )}

      {/* Top Action Ribbon / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 bg-slate-950/70 px-3 py-2 text-xs">
        {/* Navigation & Address Bar */}
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
            <RefreshCw size={13} className={loading || uploading ? "animate-spin" : ""} />
          </button>

          {/* Breadcrumb Path Address Bar */}
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
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search
              size={12}
              className="absolute left-2.5 text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-28 sm:w-36 rounded-lg bg-slate-950/80 border border-slate-800 pl-7 pr-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload files from your computer (or drag & drop)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer text-[11px]"
          >
            <Upload size={12} />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Cut & Paste Buttons */}
          <button
            type="button"
            disabled={!selectedItem}
            onClick={() => selectedItem && handleCut(selectedItem)}
            title="Cut selected item to move"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition cursor-pointer text-[11px]"
          >
            <Scissors size={12} className="text-amber-400" />
            <span className="hidden md:inline">Cut</span>
          </button>

          <button
            type="button"
            disabled={!clipboard}
            onClick={handlePaste}
            title={
              clipboard
                ? `Paste "${clipboard.name}" into current folder`
                : "Nothing to paste"
            }
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition cursor-pointer text-[11px]"
          >
            <ClipboardPaste size={12} className="text-emerald-400" />
            <span className="hidden md:inline">Paste</span>
          </button>

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

          {/* Add Folder & File */}
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <FolderPlus size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewFileModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium transition cursor-pointer"
          >
            <FilePlus size={13} className="text-slate-950" />
            <span className="hidden sm:inline">File</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (Sidebar + File Grid/List) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Windows Explorer Navigation Sidebar */}
        <aside className="w-44 border-r border-slate-800 bg-slate-950/40 p-2.5 flex flex-col gap-3 overflow-y-auto hidden sm:flex shrink-0 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
              Quick Access
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => loadDirectory()}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <Home size={14} className="text-cyan-400" />
                <span className="truncate">Home ({user?.username || "user"})</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump("documents")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <FileText size={14} className="text-blue-400" />
                <span>Documents</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump("notes")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <FileCheck size={14} className="text-emerald-400" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump("projects")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <FolderGit2 size={14} className="text-yellow-400" />
                <span>Projects</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickJump("downloads")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <Download size={14} className="text-purple-400" />
                <span>Downloads</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-1">
              Virtual Drive
            </span>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => loadDirectory("root")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 text-slate-300 hover:text-white text-left transition cursor-pointer"
              >
                <HardDrive size={14} className="text-slate-400" />
                <span>Root (/)</span>
              </button>
            </div>
          </div>

          {clipboard && (
            <div className="mt-auto rounded-lg bg-cyan-950/40 border border-cyan-800/40 p-2 text-[11px] text-cyan-300">
              <span className="block font-medium">Moving item:</span>
              <span className="truncate block opacity-80">{clipboard.name}</span>
            </div>
          )}
        </aside>

        {/* Viewport for Files & Folders */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredFolders.length === 0 && filteredFiles.length === 0 && !loading ? (
            <div className="flex h-56 flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <Folder size={44} className="text-slate-600 stroke-1" />
              <p>
                {searchQuery
                  ? `No items match "${searchQuery}"`
                  : "This folder is empty. Drag & drop files here to upload."}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredFolders.map((folder) => {
                const isSelected =
                  selectedItem?.id === folder.id && selectedItem.type === "folder";
                const isCut = clipboard?.id === folder.id;

                return (
                  <div
                    key={folder.id}
                    onClick={() =>
                      setSelectedItem({
                        id: folder.id,
                        type: "folder",
                        name: folder.name,
                      })
                    }
                    onDoubleClick={() => handleNavigateFolder(folder.id)}
                    className={`
                      group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition cursor-pointer select-none
                      ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10 shadow-lg"
                          : "border-transparent hover:border-slate-700/60 hover:bg-slate-800/50"
                      }
                      ${isCut ? "opacity-40" : "opacity-100"}
                    `}
                  >
                    <Folder
                      size={46}
                      className="text-amber-400 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                      {folder.name}
                    </span>

                    {/* Quick actions on hover */}
                    <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCut({
                            id: folder.id,
                            name: folder.name,
                            type: "folder",
                          });
                        }}
                        title="Cut"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Scissors size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename("folder", folder.id, folder.name);
                        }}
                        title="Rename"
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
                        title="Delete"
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredFiles.map((file) => {
                const isSelected =
                  selectedItem?.id === file.id && selectedItem.type === "file";
                const isCut = clipboard?.id === file.id;

                return (
                  <div
                    key={file.id}
                    onClick={() =>
                      setSelectedItem({
                        id: file.id,
                        type: "file",
                        name: file.name,
                        size: file.size || (file.content ? file.content.length : 0),
                        content: file.content,
                      })
                    }
                    onDoubleClick={() => handleOpenFile(file)}
                    className={`
                      group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition cursor-pointer select-none
                      ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10 shadow-lg"
                          : "border-transparent hover:border-slate-700/60 hover:bg-slate-800/50"
                      }
                      ${isCut ? "opacity-40" : "opacity-100"}
                    `}
                  >
                    <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
                      {getFileIcon(file.name, file.content)}
                    </div>
                    <span className="text-xs font-medium text-slate-200 text-center truncate w-full">
                      {file.name}
                    </span>

                    {/* Quick actions on hover */}
                    <div className="absolute top-1 right-1 flex items-center opacity-0 group-hover:opacity-100 transition gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(file);
                        }}
                        title="Preview"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Eye size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFile(file);
                        }}
                        title="Download"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Download size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCut({
                            id: file.id,
                            name: file.name,
                            type: "file",
                          });
                        }}
                        title="Cut"
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <Scissors size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename("file", file.id, file.name);
                        }}
                        title="Rename"
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
                        title="Delete"
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
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
                  {filteredFolders.map((folder) => {
                    const isSelected =
                      selectedItem?.id === folder.id &&
                      selectedItem.type === "folder";

                    return (
                      <tr
                        key={folder.id}
                        onClick={() =>
                          setSelectedItem({
                            id: folder.id,
                            type: "folder",
                            name: folder.name,
                          })
                        }
                        onDoubleClick={() => handleNavigateFolder(folder.id)}
                        className={`transition cursor-pointer group ${
                          isSelected ? "bg-cyan-500/10" : "hover:bg-slate-800/40"
                        }`}
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
                                handleCut({
                                  id: folder.id,
                                  name: folder.name,
                                  type: "folder",
                                });
                              }}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              <Scissors size={12} />
                            </button>
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
                    );
                  })}

                  {filteredFiles.map((file) => {
                    const isSelected =
                      selectedItem?.id === file.id && selectedItem.type === "file";

                    return (
                      <tr
                        key={file.id}
                        onClick={() =>
                          setSelectedItem({
                            id: file.id,
                            type: "file",
                            name: file.name,
                            size: file.size || (file.content ? file.content.length : 0),
                            content: file.content,
                          })
                        }
                        onDoubleClick={() => handleOpenFile(file)}
                        className={`transition cursor-pointer group ${
                          isSelected ? "bg-cyan-500/10" : "hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-2 pl-2 flex items-center gap-2">
                          <FileText size={16} className="text-cyan-400 shrink-0" />
                          <span className="font-medium text-slate-200">
                            {file.name}
                          </span>
                        </td>
                        <td className="py-2 text-slate-400">
                          {file.mimeType || "Document"}
                        </td>
                        <td className="py-2 text-slate-500">
                          {file.size
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : file.content
                            ? `${file.content.length} B`
                            : "0 B"}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewFile(file);
                              }}
                              title="Preview"
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(file);
                              }}
                              title="Download"
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCut({
                                  id: file.id,
                                  name: file.name,
                                  type: "file",
                                });
                              }}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            >
                              <Scissors size={12} />
                            </button>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Directory Status Footer */}
      <div className="border-t border-slate-800 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>
            {filteredFolders.length} folders, {filteredFiles.length} files
          </span>
          {selectedItem && (
            <span className="text-cyan-400 border-l border-slate-800 pl-3">
              Selected: {selectedItem.name}{" "}
              {selectedItem.size !== undefined && `(${selectedItem.size} B)`}
            </span>
          )}
        </div>
        <span>Dawvix Virtual VFS</span>
      </div>

      {/* Image / File Preview Modal */}
      {previewFile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="relative max-h-full max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white text-xs truncate">
                Preview: {previewFile.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center min-h-60 max-h-96 bg-slate-950 rounded-xl p-2">
              {previewFile.content.startsWith("data:image") ||
              previewFile.name.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i) ? (
                <img
                  src={previewFile.content}
                  alt={previewFile.name}
                  className="max-h-80 max-w-full object-contain rounded-lg"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 p-3 max-h-80 overflow-y-auto w-full">
                  {previewFile.content || "(empty file)"}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleDownloadFile(previewFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
