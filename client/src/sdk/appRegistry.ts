import { create } from "zustand";
import { useNotificationStore } from "../stores/notificationStore";

export interface AppDefinition {
  id: string;
  name: string;
  category: "productivity" | "utilities" | "development" | "creativity" | "media";
  description: string;
  icon: string;
  version: string;
  author: string;
  rating: number;
  downloads: string;
  isBuiltIn?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const STORE_CATALOG: AppDefinition[] = [
  {
    id: "calculator",
    name: "Calculator",
    category: "utilities",
    description: "Modern arithmetic calculator with expression history and keyboard navigation.",
    icon: "🧮",
    version: "1.2.0",
    author: "Dawvix Core Team",
    rating: 4.8,
    downloads: "14.2k",
    defaultWidth: 340,
    defaultHeight: 460,
  },
  {
    id: "paint",
    name: "Paint Studio",
    category: "creativity",
    description: "Digital drawing canvas with brushes, geometry shapes, color palettes, and VFS export.",
    icon: "🎨",
    version: "2.0.1",
    author: "Dawvix Creative",
    rating: 4.9,
    downloads: "28.5k",
    defaultWidth: 840,
    defaultHeight: 640,
  },
  {
    id: "calendar",
    name: "Calendar & Agenda",
    category: "productivity",
    description: "Monthly calendar planner with date agenda reminders and event tracking.",
    icon: "📅",
    version: "1.4.0",
    author: "Dawvix Productivity",
    rating: 4.7,
    downloads: "19.8k",
    defaultWidth: 780,
    defaultHeight: 520,
  },
];

interface AppRegistryState {
  installedApps: string[];
  installApp: (id: string) => void;
  uninstallApp: (id: string) => void;
  isInstalled: (id: string) => boolean;
}

const STORAGE_KEY = "dawvix_installed_apps";

export const useAppRegistryStore = create<AppRegistryState>((set, get) => ({
  installedApps: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Calculator, Paint, and Calendar pre-installed for great out-of-the-box UX
    return ["calculator", "paint", "calendar"];
  })(),

  installApp: (id: string) => {
    const app = STORE_CATALOG.find((a) => a.id === id);
    if (!app) return;

    if (!get().installedApps.includes(id)) {
      const next = [...get().installedApps, id];
      set({ installedApps: next });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // silent
      }
      useNotificationStore.getState().notify({
        title: "App Installed",
        message: `${app.name} has been installed on Dawvix OS.`,
        type: "success",
      });
    }
  },

  uninstallApp: (id: string) => {
    const app = STORE_CATALOG.find((a) => a.id === id);
    const next = get().installedApps.filter((appId) => appId !== id);
    set({ installedApps: next });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // silent
    }
    if (app) {
      useNotificationStore.getState().notify({
        title: "App Removed",
        message: `${app.name} has been uninstalled.`,
        type: "warning",
      });
    }
  },

  isInstalled: (id: string) => {
    return get().installedApps.includes(id);
  },
}));
