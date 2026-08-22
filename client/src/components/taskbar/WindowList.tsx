import { useWindowStore } from "../../stores/windowStore";

export default function WindowList() {
  const windows = useWindowStore((state) => state.windows);

  const restoreWindow = useWindowStore((state) => state.restoreWindow);

  const focusWindow = useWindowStore((state) => state.focusWindow);

  const handleWindowClick = (id: string) => {
    restoreWindow(id);
    focusWindow(id);
  };

  return (
    <div className="flex items-center gap-1 flex-1 px-2">
      {windows.map((window) => (
        <button
          key={window.id}
          onClick={() => handleWindowClick(window.id)}
          className="
            px-3
            h-9
            text-sm
            text-white
            bg-white/5
            hover:bg-white/10
            rounded-md
            max-w-32
            truncate
          "
        >
          {window.title}
        </button>
      ))}
    </div>
  );
}
