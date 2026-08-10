interface DesktopIconProps {
  icon: string;
  name: string;
}

export default function DesktopIcon({ icon, name }: DesktopIconProps) {
  return (
    <button
      className="
        flex
        flex-col
        items-center
        gap-1
        p-2
        rounded-lg
        hover:bg-white/10
        text-white
        w-20
      "
    >
      <span className="text-4xl">{icon}</span>

      <span className="text-sm">{name}</span>
    </button>
  );
}
