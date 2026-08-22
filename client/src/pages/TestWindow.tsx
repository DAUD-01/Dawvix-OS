import { useWindowStore } from "../stores/windowStore";

export default function TestWindow() {
  const { windows, openWindow, closeWindow } = useWindowStore();

  return (
    <div>
      <button onClick={() => openWindow("notes", "Notes")}>Open Notes</button>

      <button onClick={() => openWindow("settings", "Settings")}>
        Open Settings
      </button>

      <hr />

      {windows.map((w) => (
        <div key={w.id}>
          {w.title}

          <button onClick={() => closeWindow(w.id)}>X</button>
        </div>
      ))}
    </div>
  );
}
