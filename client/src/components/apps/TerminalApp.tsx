import { useState, useEffect, useRef } from "react";
import {
  getDirectoryContents,
  createFolder,
  createFile,
  updateFolder,
  updateFile,
  deleteItem,
} from "../../services/filesystemService";
import { useAuthStore } from "../../stores/authStore";

interface CommandRecord {
  id: string;
  command: string;
  output: string | React.ReactNode;
  path: string;
}

export default function TerminalApp() {
  const user = useAuthStore((state) => state.user);
  const username = user?.username || "dawood";

  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const [currentPathDisplay, setCurrentPathDisplay] = useState("~");
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<CommandRecord[]>([
    {
      id: "welcome",
      command: "",
      output: (
        <div className="text-slate-300 space-y-1 mb-2">
          <p className="text-cyan-400 font-bold">
            Dawvix OS Virtual Shell v1.0.0 (x86_64-dawvix-web)
          </p>
          <p className="text-slate-400">
            Type <span className="text-yellow-400 font-mono">help</span> to list
            available commands. Connected to virtual filesystem.
          </p>
        </div>
      ),
      path: "~",
    },
  ]);

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize terminal current folder to user's home
  useEffect(() => {
    const initTerminal = async () => {
      try {
        const rootDir = await getDirectoryContents();
        setCurrentFolderId(rootDir.currentFolder?.id);
        setCurrentPathDisplay(`~`);
      } catch {
        setCurrentPathDisplay("~");
      }
    };
    initTerminal();
  }, []);

  // Scroll to bottom on new commands
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const runCommand = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          command: "",
          output: "",
          path: currentPathDisplay,
        },
      ]);
      return;
    }

    // Save to bash history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    let output: string | React.ReactNode = "";

    try {
      switch (cmd) {
        case "clear":
          setHistory([]);
          return;

        case "help":
          output = (
            <div className="space-y-1 text-slate-300 font-mono text-xs">
              <p className="text-cyan-400 font-semibold mb-1">
                Dawvix Virtual Shell Commands:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <span className="text-yellow-300 font-bold">pwd</span> - Print
                  working directory path
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">ls</span> - List
                  folders and files in directory
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">cd &lt;dir&gt;</span> -
                  Change directory (cd .. or cd ~)
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    mkdir &lt;name&gt;
                  </span>{" "}
                  - Create a new folder
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    touch &lt;name&gt;
                  </span>{" "}
                  - Create an empty file
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    cat &lt;file&gt;
                  </span>{" "}
                  - View file contents
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    echo &lt;txt&gt;
                  </span>{" "}
                  - Print text or write (echo msg &gt; file)
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    rm &lt;item&gt;
                  </span>{" "}
                  - Delete file or folder
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">
                    mv &lt;src&gt; &lt;dest&gt;
                  </span>{" "}
                  - Rename or move item
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">whoami</span> -
                  Print current user
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">date</span> - Print
                  current system time
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">neofetch</span> -
                  Display Dawvix system specs
                </div>
                <div>
                  <span className="text-yellow-300 font-bold">clear</span> -
                  Clear terminal screen
                </div>
              </div>
            </div>
          );
          break;

        case "pwd":
          output = currentPathDisplay === "~" ? `/home/${username}` : currentPathDisplay;
          break;

        case "whoami":
          output = username;
          break;

        case "date":
          output = new Date().toString();
          break;

        case "neofetch":
        case "dawvixfetch":
          output = (
            <div className="flex flex-col sm:flex-row gap-4 py-2 font-mono text-xs">
              <pre className="text-cyan-400 font-bold leading-tight select-none">
{`   ____                 _      
  |  _ \\  __ ___      _(_)_  __
  | | | |/ _\` \\ \\ /\\ / / \\ \\/ /
  | |_| | (_| |\\ V  V /| |>  < 
  |____/ \\__,_| \\_/\\_/ |_/_/\\_\\
         OPERATING SYSTEM      `}
              </pre>
              <div className="space-y-0.5 text-slate-300">
                <p className="text-cyan-300 font-bold">
                  {username}@dawvix-os
                </p>
                <p className="text-slate-500">----------------------</p>
                <p>
                  <span className="text-yellow-400 font-bold">OS:</span> Dawvix
                  OS Web Edition 1.0.0
                </p>
                <p>
                  <span className="text-yellow-400 font-bold">Host:</span>{" "}
                  Browser Virtual Environment
                </p>
                <p>
                  <span className="text-yellow-400 font-bold">Kernel:</span>{" "}
                  VFS-Cloud-2026
                </p>
                <p>
                  <span className="text-yellow-400 font-bold">Shell:</span>{" "}
                  dawvix-sh 1.0
                </p>
                <p>
                  <span className="text-yellow-400 font-bold">Resolution:</span>{" "}
                  {typeof window !== "undefined"
                    ? `${window.innerWidth}x${window.innerHeight}`
                    : "1920x1080"}
                </p>
                <p>
                  <span className="text-yellow-400 font-bold">VFS:</span> Active
                  (/home/{username})
                </p>
              </div>
            </div>
          );
          break;

        case "ls": {
          const dir = await getDirectoryContents(currentFolderId);
          if (dir.folders.length === 0 && dir.files.length === 0) {
            output = "(empty directory)";
          } else {
            output = (
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs py-1">
                {dir.folders.map((f) => (
                  <span key={f.id} className="text-blue-400 font-bold">
                    📁 {f.name}/
                  </span>
                ))}
                {dir.files.map((f) => (
                  <span key={f.id} className="text-slate-200">
                    📄 {f.name}
                  </span>
                ))}
              </div>
            );
          }
          break;
        }

        case "cd": {
          const target = args[0] || "~";
          if (target === "~" || target === "") {
            const root = await getDirectoryContents();
            setCurrentFolderId(root.currentFolder?.id);
            setCurrentPathDisplay("~");
            output = "";
          } else if (target === "..") {
            const dir = await getDirectoryContents(currentFolderId);
            if (dir.path.length > 1) {
              const parent = dir.path[dir.path.length - 2];
              if (parent) {
                const parentDir = await getDirectoryContents(
                  parent.id === "root" ? undefined : parent.id,
                );
                setCurrentFolderId(parentDir.currentFolder?.id);
                setCurrentPathDisplay(
                  parentDir.path.map((p) => p.name).join("/").replace(/^\/\//, "/"),
                );
              }
            } else {
              output = "Already at root directory";
            }
          } else if (target === "/") {
            const dir = await getDirectoryContents("root");
            const rootFolder = dir.folders.find((f) => f.name === "/") || dir.currentFolder;
            setCurrentFolderId(rootFolder?.id);
            setCurrentPathDisplay("/");
          } else {
            // Find folder by name in current folder
            const dir = await getDirectoryContents(currentFolderId);
            const found = dir.folders.find(
              (f) => f.name.toLowerCase() === target.toLowerCase(),
            );
            if (found) {
              const targetDir = await getDirectoryContents(found.id);
              setCurrentFolderId(found.id);
              setCurrentPathDisplay(
                targetDir.path.map((p) => p.name).join("/").replace(/^\/\//, "/"),
              );
            } else {
              output = `cd: no such file or directory: ${target}`;
            }
          }
          break;
        }

        case "mkdir": {
          const folderName = args[0];
          if (!folderName) {
            output = "mkdir: missing operand";
            break;
          }
          await createFolder(folderName, currentFolderId);
          output = `Directory '${folderName}' created`;
          break;
        }

        case "touch": {
          const fileName = args[0];
          if (!fileName) {
            output = "touch: missing file operand";
            break;
          }
          if (!currentFolderId) {
            output = "touch: cannot create file at root drive";
            break;
          }
          await createFile(fileName, currentFolderId, "");
          output = `File '${fileName}' created`;
          break;
        }

        case "cat": {
          const fileName = args[0];
          if (!fileName) {
            output = "cat: missing file operand";
            break;
          }
          const dir = await getDirectoryContents(currentFolderId);
          const file = dir.files.find(
            (f) => f.name.toLowerCase() === fileName.toLowerCase(),
          );
          if (!file) {
            output = `cat: ${fileName}: No such file`;
          } else {
            output = (
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200">
                {file.content || "(empty file)"}
              </pre>
            );
          }
          break;
        }

        case "echo": {
          const fullEcho = args.join(" ");
          if (fullEcho.includes(">")) {
            const [text, targetFile] = fullEcho.split(">").map((s) => s.trim());
            if (!targetFile) {
              output = "echo: missing destination file";
              break;
            }
            if (!currentFolderId) {
              output = "echo: cannot write at root directory";
              break;
            }
            const cleanText = text.replace(/^["']|["']$/g, "");
            const dir = await getDirectoryContents(currentFolderId);
            const existingFile = dir.files.find(
              (f) => f.name.toLowerCase() === targetFile.toLowerCase(),
            );
            if (existingFile) {
              await updateFile(existingFile.id, cleanText);
            } else {
              await createFile(targetFile, currentFolderId, cleanText);
            }
            output = `Wrote to ${targetFile}`;
          } else {
            output = fullEcho.replace(/^["']|["']$/g, "");
          }
          break;
        }

        case "rm": {
          const itemName = args[0];
          if (!itemName) {
            output = "rm: missing operand";
            break;
          }
          const dir = await getDirectoryContents(currentFolderId);
          const foundFile = dir.files.find(
            (f) => f.name.toLowerCase() === itemName.toLowerCase(),
          );
          if (foundFile) {
            await deleteItem("file", foundFile.id);
            output = `Removed file '${itemName}'`;
            break;
          }
          const foundFolder = dir.folders.find(
            (f) => f.name.toLowerCase() === itemName.toLowerCase(),
          );
          if (foundFolder) {
            await deleteItem("folder", foundFolder.id);
            output = `Removed folder '${itemName}'`;
            break;
          }
          output = `rm: cannot remove '${itemName}': No such file or directory`;
          break;
        }

        case "mv": {
          const srcName = args[0];
          const destName = args[1];
          if (!srcName || !destName) {
            output = "mv: missing destination file operand after '" + srcName + "'";
            break;
          }
          const dir = await getDirectoryContents(currentFolderId);
          const fileToRename = dir.files.find(
            (f) => f.name.toLowerCase() === srcName.toLowerCase(),
          );
          if (fileToRename) {
            await updateFile(fileToRename.id, undefined, destName);
            output = `Renamed '${srcName}' to '${destName}'`;
            break;
          }
          const folderToRename = dir.folders.find(
            (f) => f.name.toLowerCase() === srcName.toLowerCase(),
          );
          if (folderToRename) {
            await updateFolder(folderToRename.id, destName);
            output = `Renamed folder '${srcName}' to '${destName}'`;
            break;
          }
          output = `mv: cannot stat '${srcName}': No such file or directory`;
          break;
        }

        default:
          output = `dawvix-sh: command not found: ${cmd}. Type 'help' for available commands.`;
          break;
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      output = `Error: ${msg || "Operation failed"}`;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: rawInput,
        output,
        path: currentPathDisplay,
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputVal("");
        } else {
          setHistoryIndex(nextIndex);
          setInputVal(commandHistory[nextIndex] || "");
        }
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex h-full flex-col bg-slate-950 p-4 font-mono text-xs text-slate-100 select-text overflow-y-auto cursor-text"
    >
      {/* Command Output History */}
      <div className="space-y-2">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">
                  {username}@dawvix
                </span>
                <span className="text-slate-500">:</span>
                <span className="text-cyan-400 font-medium">{item.path}</span>
                <span className="text-slate-300">$</span>
                <span className="text-white font-semibold">{item.command}</span>
              </div>
            )}
            {item.output && (
              <div className="text-slate-300 leading-relaxed pl-1">
                {item.output}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Input Line */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-emerald-400 font-bold shrink-0">
          {username}@dawvix
        </span>
        <span className="text-slate-500">:</span>
        <span className="text-cyan-400 font-medium shrink-0">
          {currentPathDisplay}
        </span>
        <span className="text-slate-300 font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white focus:outline-none caret-cyan-400 font-mono text-xs"
        />
      </div>

      <div ref={terminalEndRef} />
    </div>
  );
}
