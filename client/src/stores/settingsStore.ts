import { create } from "zustand";

export interface WallpaperOption {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "mountain-lake",
    name: "Alpine Mist",
    thumbnail:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=80",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon City",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=70",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80",
  },
  {
    id: "deep-space",
    name: "Deep Space Nebula",
    thumbnail:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=70",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80",
  },
  {
    id: "foggy-forest",
    name: "Nordic Forest",
    thumbnail:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2560&q=80",
  },
  {
    id: "dark-abstract",
    name: "Obsidian Geometry",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=80",
  },
];

interface SettingsState {
  wallpaper: string;
  theme: "slate" | "cyberpunk" | "nebula" | "forest";
  soundEnabled: boolean;

  setWallpaper: (url: string) => void;
  setTheme: (theme: "slate" | "cyberpunk" | "nebula" | "forest") => void;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  wallpaper:
    localStorage.getItem("dawvix_wallpaper") ||
    WALLPAPERS[0]?.url ||
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=80",
  theme:
    (localStorage.getItem("dawvix_theme") as
      | "slate"
      | "cyberpunk"
      | "nebula"
      | "forest") || "slate",
  soundEnabled: localStorage.getItem("dawvix_sound") !== "false",

  setWallpaper: (url: string) => {
    localStorage.setItem("dawvix_wallpaper", url);
    set({ wallpaper: url });
  },

  setTheme: (theme) => {
    localStorage.setItem("dawvix_theme", theme);
    set({ theme });
  },

  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      localStorage.setItem("dawvix_sound", String(next));
      return { soundEnabled: next };
    }),
}));
