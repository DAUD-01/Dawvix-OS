import { useState } from "react";
import { FileText, Save, Check } from "lucide-react";

export default function NotesApp() {
  const [content, setContent] = useState(
    "Welcome to Dawvix OS!\n\nThis is your private workspace. You can write your quick thoughts, code snippets, or todo lists here.",
  );
  const [saved, setSaved] = useState(true);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const lineCount = content.split("\n").length;
  const charCount = content.length;

  return (
    <div className="flex h-full flex-col bg-slate-900/60 p-3 select-none">
      {/* Editor Header */}
      <div className="mb-2 flex items-center justify-between border-b border-slate-700/60 pb-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-amber-400" />
          <span className="font-medium text-slate-200">scratchpad.txt</span>
          {!saved && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            {lineCount} lines, {charCount} chars
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-200 transition cursor-pointer"
          >
            {saved ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save size={12} className="text-cyan-400" />
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
        className="flex-1 w-full resize-none rounded-lg bg-slate-950/70 p-3.5 font-mono text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500/50 leading-relaxed"
        placeholder="Type your notes here..."
      />
    </div>
  );
}
