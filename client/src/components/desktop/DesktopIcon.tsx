interface DesktopIconProps {
  icon: string;
  name: string;
  onClick?: () => void;
}

export default function DesktopIcon({ icon, name, onClick }: DesktopIconProps) {
  return (
    <button
      className="
        flex
        flex-col
        items-center
        gap-1
        p-2
        rounded-lgs
        hover:bg-white/10
        text-white
        w-20
      "
      onClick={onClick}
    >
      <span className="text-4xl">{icon}</span>

      <span className="text-sm">{name}</span>
    </button>
  );
}
