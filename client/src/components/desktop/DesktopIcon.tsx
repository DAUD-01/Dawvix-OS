interface DesktopIconProps {
  icon: string;
  name: string;
  onClick?: () => void;
}

export default function DesktopIcon({ icon, name, onClick }: DesktopIconProps) {
  return (
    <button
      type="button"
      className="
        group
        flex
        flex-col
        items-center
        gap-1.5
        p-2.5
        rounded-xl
        hover:bg-white/10
        active:bg-white/20
        text-white
        w-22
        transition-all
        duration-150
        cursor-pointer
        select-none
        border
        border-transparent
        hover:border-white/10
        focus:outline-none
        focus:bg-white/15
      "
      onClick={onClick}
    >
      <span className="text-3xl filter drop-shadow group-hover:scale-105 transition-transform">
        {icon}
      </span>
      <span className="text-xs font-medium text-slate-100 drop-shadow truncate w-full text-center">
        {name}
      </span>
    </button>
  );
}
