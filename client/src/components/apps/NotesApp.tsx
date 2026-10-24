import { useState, useEffect, useCallback } from "react";
import { FileText, Save, Check, FilePlus2, RefreshCw } from "lucide-react";
import {
  updateFile,
  createFile,
  getDirectoryContents,
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
    initialFileName || "Untitled.txt",
  );
  const [content, setContent] = useState<string>(
    initialContent !== undefined
      ? initialContent
      : "Welcome to Dawvix OS!\n\nThis is your private workspace. You can write your thoughts, code snippets, or notes here and save them directly to your virtual file system.",
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync if props change (e.g. user opens another file while Notes is already active)
  useEffect(() => {
    if (initialFileId) {
      setFileId(initialFileId);
      setFileName(initialFileName || "Document.txt");
      if (initialContent !== undefined) {
        setContent(initialContent);
        setSaved(true);
      }
    }
  }, [initialFileId, initialFileName, initialContent]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setStatusMessage(null);

    try {
      if (fileId) {
        // Update existing file in virtual filesystem
        await updateFile(fileId, content);
        setSaved(true);
        setStatusMessage("Saved to filesystem");
      } else {
        // Create new file: prompt for filename
        const promptName = prompt(
          "Enter filename to save:",
          fileName.endsWith(".txt") ? fileName : `${fileName}.txt`,
        );
        if (!promptName || !promptName.trim()) {
          setSaving(false);
          return;
        }

        const validName = promptName.trim();

        // Get user's notes folder or default directory
        const dir = await getDirectoryContents();
        const notesFolder =
          dir.folders.find((f) => f.name.toLowerCase() === "notes") ||
          dir.currentFolder;

        if (!notesFolder) {
          throw new Error("Unable to locate destination folder in filesystem");
        }

        const result = await createFile(validName, notesFolder.id, content);
        setFileId(result.file.id);
        setFileName(result.file.name);
        setSaved(true);
        setStatusMessage(`Saved to /notes/${result.file.name}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setStatusMessage(msg || "Failed to save file");
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  }, [fileId, fileName, content]);

  // Handle Ctrl+S keyboard shortcut
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  const handleNewNote = () => {
    if (!saved && !confirm("You have unsaved changes. Create new note anyway?")) {
      return;
    }
    setFileId(null);
    setFileName("Untitled.txt");
    setContent("");
    setSaved(true);
    setStatusMessage("New document created");
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const lineCount = content ? content.split("\n").length : 1;
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full flex-col bg-slate-900/70 p-3 select-none">
      {/* Editor Header Toolbar */}
      <div className="mb-2.5 flex items-center justify-between border-b border-slate-700/60 pb-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText size={15} className="text-amber-400 shrink-0" />
          <span className="font-semibold text-slate-100 truncate">
            {fileName}
          </span>
          {!saved && (
            <span
              title="Unsaved changes"
              className="h-2 w-2 rounded-full bg-cyan-400 shrink-0 animate-pulse"
            />
          )}
          {statusMessage && (
            <span className="text-[11px] text-cyan-300 ml-2 italic truncate">
              ({statusMessage})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewNote}
            title="Create new note"
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            <FilePlus2 size={13} className="text-emerald-400" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            title="Save file (Ctrl+S)"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-3 py-1.5 text-xs text-slate-950 font-semibold transition cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check size={13} className="text-slate-950" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save size={13} className="text-slate-950" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <textarea
        value={content}
        onChange={handleTextChange}
        className="flex-1 w-full resize-none rounded-xl bg-slate-950/80 p-4 font-mono text-xs text-slate-100 placeholder-slate-500 border border-slate-800/90 focus:outline-none focus:border-cyan-500/60 leading-relaxed shadow-inner"
        placeholder="Type or paste your text here..."
      />

      {/* Status Bar */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>UTF-8 • Virtual FS</span>
        <span>
          Lines: {lineCount} | Words: {wordCount} | Chars: {charCount}
        </span>
      </div>
    </div>
  );
}
