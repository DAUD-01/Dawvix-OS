interface StartMenuProps {
  onLogout: () => void;
}

export default function StartMenu({ onLogout }: StartMenuProps) {
  return (
    <div
      className="
        absolute
        bottom-14
        left-2
        w-64
        rounded-xl
        bg-black/70
        backdrop-blur-md
        border
        border-white/10
        p-3
        text-white
      "
    >
      <div className="p-2 hover:bg-white/10 rounded">📁 Files</div>
      <div className="p-2 hover:bg-white/10 rounded">📝 Notes</div>
      <div className="p-2 hover:bg-white/10 rounded">⚙ Settings</div>
      <button
        onClick={onLogout}
        className="
                p-2
                hover:bg-white/10
                rounded
                w-full
                text-left"
      >
        🚪 Logout
      </button>
    </div>
  );
}
