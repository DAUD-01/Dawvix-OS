import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Save,
  Check,
  FilePlus2,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Bold,
  Italic,
  Code,
  List,
  Heading,
  FolderOpen,
} from "lucide-react";
import {
  updateFile,
  createFile,
  getDirectoryContents,
  type FileData,
} from "../../services/filesystemService";

interface NotesAppProps {
  initialFileId?: string;
  initialFileName?: string;
  initialContent?: string;
}

export default function NotesApp({
  initialFileId,
  initialFileName,
  initialContent,
}: NotesAppProps) {
  const [fileId, setFileId] = useState<string | null>(initialFileId || null);
  const [fileName, setFileName] = useState<string>(
    initialFileName || "notes.txt",
  );
  const [content, setContent] = useState<string>(
    initialContent !== undefined
      ? initialContent
      : "# Welcome to Dawvix Notes\n\nThis is your private, cloud-synced text editor.\n- Use **Ctrl + S** to save anytime\n- Toggle preview with the Eye icon\n- Saved directly to your virtual filesystem under `/notes`.",
  );

  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [availableNotes, setAvailableNotes] = useState<FileData[]>([]);
  const [notesFolderId, setNotesFolderId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync when window params change
  useEffect(() => {
    if (initialFileId) {
      setFileId(initialFileId);
      setFileName(initialFileName || "notes.txt");
      if (initialContent !== undefined) {
        setContent(initialContent);
        setSaved(true);
      }
    }
  }, [initialFileId, initialFileName, initialContent]);

  // Load available notes from user's notes directory
  const loadNotesFromFilesystem = useCallback(async () => {
    try {
      const rootDir = await getDirectoryContents();
      const notesFolder =
        rootDir.folders.find((f) => f.name.toLowerCase() === "notes") ||
        rootDir.currentFolder;

      if (notesFolder) {
        setNotesFolderId(notesFolder.id);
        const folderContents = await getDirectoryContents(notesFolder.id);
        setAvailableNotes(folderContents.files);

        // If no file is opened yet, check if notes.txt or welcome.txt exists
        if (!initialFileId && folderContents.files.length > 0) {
          const defaultNote =
            folderContents.files.find((f) => f.name === "notes.txt") ||
            folderContents.files[0];
          if (defaultNote && !fileId) {
            setFileId(defaultNote.id);
            setFileName(defaultNote.name);
            setContent(defaultNote.content);
            setSaved(true);
          }
        }
      }
    } catch {
      // Offline fallback
    }
  }, [initialFileId, fileId]);

  useEffect(() => {
    loadNotesFromFilesystem();
  }, [loadNotesFromFilesystem]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      if (fileId) {
        await updateFile(fileId, content);
        setSaved(true);
        setStatusMessage("Saved to filesystem");
      } else {
        const destFolderId = notesFolderId;
        if (!destFolderId) {
          throw new Error("Notes folder could not be found");
        }

        const validName = fileName.endsWith(".txt") || fileName.endsWith(".md")
          ? fileName
          : `${fileName}.txt`;

        const result = await createFile(validName, destFolderId, content);
        setFileId(result.file.id);
        setFileName(result.file.name);
        setSaved(true);
        setStatusMessage(`Saved to /notes/${result.file.name}`);
        loadNotesFromFilesystem();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setStatusMessage(msg || "Failed to save note");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [fileId, fileName, content, notesFolderId, loadNotesFromFilesystem]);

  // Auto-save debounce (saves after 2.5s idle)
  useEffect(() => {
    if (saved || !fileId) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2500);

    return () => clearTimeout(timer);
  }, [content, saved, fileId, handleSave]);

  // Ctrl+S shortcut
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

  const handleNewNote = () => {
    const name = prompt("Enter note name:", "notes.txt");
    if (!name || !name.trim()) return;

    setFileId(null);
    setFileName(name.trim());
    setContent("");
    setSaved(false);
    setStatusMessage("New note ready");
  };

  const handleSelectNote = (note: FileData) => {
    if (!saved && !confirm("You have unsaved changes. Discard and switch note?")) {
      return;
    }
    setFileId(note.id);
    setFileName(note.name);
    setContent(note.content);
    setSaved(true);
    setShowNotesDrawer(false);
  };

  const handleExportDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Quick formatting insert
  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setSaved(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4),
      );
    }, 0);
  };

  const lineCount = content ? content.split("\n").length : 1;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex h-full flex-col bg-slate-900/80 text-slate-100 select-none">
      {/* Editor Main Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 bg-slate-950/70 px-3 py-2 text-xs">
        {/* Left: Notes Drawer Toggle & Filename */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setShowNotesDrawer((prev) => !prev)}
            title="Browse Saved Notes"
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              showNotesDrawer
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <FolderOpen size={13} />
            <span className="hidden sm:inline text-[11px]">Notes</span>
          </button>

          <FileText size={15} className="text-amber-400 shrink-0" />

          <input
            type="text"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              setSaved(false);
            }}
            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 px-1 py-0.5 font-semibold text-xs text-slate-100 focus:outline-none max-w-44 truncate"
            title="Click to rename note"
          />

          {!saved && (
            <span
              title="Unsaved edits"
              className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 animate-pulse"
            />
          )}

          {statusMessage && (
            <span className="text-[11px] text-cyan-300 italic truncate hidden md:inline">
              ({statusMessage})
            </span>
          )}
        </div>

        {/* Formatting Buttons (Hidden in preview mode) */}
        {!previewMode && (
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/60 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              title="Bold"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Bold size={12} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*")}
              title="Italic"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Italic size={12} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("# ", "")}
              title="Heading"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Heading size={12} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("- ", "")}
              title="List"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <List size={12} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("`", "`")}
              title="Code"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Code size={12} />
            </button>
          </div>
        )}

        {/* Right: Actions (Preview, New, Save, Export) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPreviewMode((prev) => !prev)}
            title={previewMode ? "Switch to Editor" : "Markdown Preview"}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
              previewMode
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
            <span className="hidden sm:inline text-[11px]">
              {previewMode ? "Edit" : "Preview"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNewNote}
            title="Create new note"
            className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            <FilePlus2 size={13} className="text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">New</span>
          </button>

          <button
            type="button"
            onClick={handleExportDownload}
            title="Download note to computer"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Download size={13} />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            title="Save note (Ctrl + S)"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-950 font-semibold transition cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span className="text-[11px]">Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check size={13} />
                <span className="text-[11px]">Saved</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span className="text-[11px]">Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace (Drawer + Editor Area) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Notes Filesystem Drawer */}
        {showNotesDrawer && (
          <aside className="w-52 border-r border-slate-800 bg-slate-950/90 p-2.5 flex flex-col gap-2 overflow-y-auto shrink-0 z-10 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-semibold text-slate-300 text-[11px]">
                /notes directory
              </span>
              <button
                type="button"
                onClick={loadNotesFromFilesystem}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw size={11} />
              </button>
            </div>

            <div className="space-y-1">
              {availableNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 p-2">No notes found</p>
              ) : (
                availableNotes.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => handleSelectNote(note)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer text-xs ${
                      fileId === note.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <FileText size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate">{note.name}</span>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Editor or Preview Pane */}
        {previewMode ? (
          <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-sm max-w-none bg-slate-950/70 font-sans text-slate-200">
            <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {content}
            </div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            className="flex-1 w-full resize-none bg-slate-950/80 p-5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed overflow-y-auto"
            placeholder="Type your note content here..."
          />
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span>{fileName}</span>
          <span>•</span>
          <span>{saved ? "Auto-saved" : "Modified"}</span>
        </span>
        <div className="flex items-center gap-3">
          <span>Lines: {lineCount}</span>
          <span>Words: {wordCount}</span>
          <span>Chars: {charCount}</span>
        </div>
      </div>
    </div>
  );
}
