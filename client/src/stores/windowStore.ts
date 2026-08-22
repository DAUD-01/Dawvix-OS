import { create } from "zustand";
import type { WindowData } from "../types/window";

interface WindowStore {
  windows: WindowData[];

  openWindow: (id: string, title: string) => void;

  closeWindow: (id: string) => void;

  focusWindow: (id: string) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],

  openWindow: (id, title) =>
    set((state) => {
      const exists = state.windows.find((w) => w.id === id);

      if (exists) {
        return state;
      }

      return {
        windows: [
          ...state.windows,
          {
            id,
            title,
            minimized: false,
            maximized: false,
            zIndex: state.windows.length + 1,
          },
        ],
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),

  focusWindow: (id) =>
    set((state) => {
      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);

      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                zIndex: highestZ + 1,
              }
            : w,
        ),
      };
    }),
}));
