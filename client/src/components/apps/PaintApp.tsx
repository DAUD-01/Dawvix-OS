import { useState, useRef, useEffect, useCallback } from "react";
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Minus,
  RotateCcw,
  Download,
  Trash2,
  HardDrive,
} from "lucide-react";
import { uploadFile, getDirectoryContents } from "../../services/filesystemService";
import { useNotificationStore } from "../../stores/notificationStore";

type ToolType = "brush" | "eraser" | "line" | "rect" | "circle";

const SWATCHES = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#06b6d4");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<ToolType>("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [savingToVFS, setSavingToVFS] = useState(false);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  }, []);

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // Remove current
    const previousState = nextHistory[nextHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(nextHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "brush" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCanvasCoords(e);

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (startPos && history.length > 0) {
      // Restore last snapshot to preview shape cleanly
      const lastState = history[history.length - 1];
      ctx.putImageData(lastState, 0, 0);

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();

      if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          coords.x - startPos.x,
          coords.y - startPos.y,
        );
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2),
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPos(null);
      saveState();
    }
  };

  // Export / Download PNG to device
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `dawvix-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Save to Dawvix Virtual Filesystem (VFS)
  const handleSaveToVFS = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSavingToVFS(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const rootDir = await getDirectoryContents();
      const targetFolder =
        rootDir.folders.find((f) => f.name.toLowerCase() === "documents") ||
        rootDir.folders[0] ||
        rootDir.currentFolder;

      if (!targetFolder) {
        throw new Error("No destination folder found in filesystem");
      }

      const fileName = `artwork-${Date.now().toString().slice(-4)}.png`;
      await uploadFile(fileName, dataUrl, targetFolder.id, dataUrl.length, "image/png");

      useNotificationStore.getState().notify({
        title: "Saved to Files",
        message: `Saved "${fileName}" to /${targetFolder.name}`,
        type: "success",
      });
    } catch {
      useNotificationStore.getState().notify({
        title: "Save Failed",
        message: "Could not save painting to Virtual Filesystem",
        type: "error",
      });
    } finally {
      setSavingToVFS(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950/80 px-3 py-2 text-xs shrink-0">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => setTool("brush")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              tool === "brush" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            title="Brush"
          >
            <Paintbrush size={15} />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              tool === "eraser" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            title="Eraser"
          >
            <Eraser size={15} />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              tool === "line" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            title="Straight Line"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              tool === "rect" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            title="Rectangle"
          >
            <Square size={15} />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              tool === "circle" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"
            }`}
            title="Circle"
          >
            <Circle size={15} />
          </button>
        </div>

        {/* Brush Size Slider */}
        <div className="flex items-center gap-2 px-2 bg-slate-900 py-1 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400">Size:</span>
          <input
            type="range"
            min="1"
            max="36"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-cyan-400 h-1 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-cyan-300 w-4">{brushSize}</span>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
            {SWATCHES.map((swatch) => (
              <button
                key={swatch}
                onClick={() => setColor(swatch)}
                className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                  color === swatch ? "border-cyan-400 scale-110" : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded-md bg-transparent cursor-pointer border-0 p-0 ml-1"
              title="Custom Color"
            />
          </div>
        </div>

        {/* Actions: Undo, Clear, Save, Download */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 disabled:opacity-30 transition cursor-pointer"
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition cursor-pointer"
            title="Clear Canvas"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={handleSaveToVFS}
            disabled={savingToVFS}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 font-medium transition cursor-pointer"
            title="Save to Virtual Filesystem"
          >
            <HardDrive size={13} />
            <span className="text-[11px]">{savingToVFS ? "Saving..." : "Save to VFS"}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer"
            title="Export PNG to Computer"
          >
            <Download size={13} />
            <span className="text-[11px]">Export</span>
          </button>
        </div>
      </div>

      {/* Drawing Board Viewport */}
      <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
        <canvas
          ref={canvasRef}
          width={800}
          height={550}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="rounded-xl shadow-2xl shadow-black/80 cursor-crosshair bg-white max-w-full max-h-full object-contain"
        />
      </div>

      {/* Bottom Status Info */}
      <div className="px-3 py-1.5 border-t border-white/10 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Canvas: 800 x 550 px</span>
        <span className="capitalize text-cyan-400">Tool: {tool}</span>
        <span>History: {history.length} snapshots</span>
      </div>
    </div>
  );
}
