import { create } from "zustand";
import type { WindowData } from "../types/window";

interface WindowStore {
  windows: WindowData[];

  openWindow: (id: string, title: string) => void;

  closeWindow: (id: string) => void;

  focusWindow: (id: string) => void;

  minimizeWindow: (id: string) => void;

  maximizeWindow: (id: string) => void;

  restoreWindow: (id: string) => void;

  updateWindowGeometry: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
  windows: [],

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, minimized: true } : window,
      ),
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((window) => {
        if (window.id !== id) {
          return window;
        }

        if (!window.maximized) {
          return {
            ...window,

            previousX: window.x,
            previousY: window.y,

            previousWidth: window.width,
            previousHeight: window.height,

            maximized: true,
          };
        }

        return {
          ...window,

          maximized: false,

          x: window.previousX ?? 150,
          y: window.previousY ?? 100,

          width: window.previousWidth ?? 500,

          height: window.previousHeight ?? 350,
        };
      }),
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id
          ? {
              ...window,
              minimized: false,
            }
          : window,
      ),
    })),

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

            x: 150 + state.windows.length * 30,
            y: 100 + state.windows.length * 30,

            width: 500,
            height: 350,
          },
        ],
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),

  updateWindowGeometry: (id, x, y, width, height) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id
          ? {
              ...window,
              x,
              y,
              width,
              height,
            }
          : window,
      ),
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
