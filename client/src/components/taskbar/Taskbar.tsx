import Clock from "./Clock";

interface TaskbarProps {
  onStartClick: () => void;
}

export default function Taskbar({ onStartClick }: TaskbarProps) {
  return (
    <div
      className="
        absolute
        bottom-0
        left-0
        w-full
        h-12
        bg-black/40
        backdrop-blur-md
        border-t
        border-white/10
        text-black
      "
    >
      <button
        onClick={onStartClick}
        className="
        px-4
        text-white
        hover:bg-white/10
        h-full"
      >
        Start
      </button>
      <Clock />
    </div>
  );
}
