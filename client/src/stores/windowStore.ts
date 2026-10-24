import { create } from "zustand";
import type { WindowData } from "../types/window";

interface WindowStore {
  windows: WindowData[];
  activeWindowId: string | null;

  openWindow: (id: string, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleWindowMinimize: (id: string) => void;
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
  activeWindowId: null,

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((window) =>
        window.id === id ? { ...window, minimized: true } : window,
      ),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  toggleWindowMinimize: (id) =>
    set((state) => {
      const target = state.windows.find((w) => w.id === id);
      if (!target) return state;

      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);

      // If active and visible, minimize it
      if (state.activeWindowId === id && !target.minimized) {
        return {
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, minimized: true } : w,
          ),
          activeWindowId: null,
        };
      }

      // Otherwise restore and focus
      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? { ...w, minimized: false, zIndex: highestZ + 1 }
            : w,
        ),
        activeWindowId: id,
      };
    }),

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
          width: window.previousWidth ?? 520,
          height: window.previousHeight ?? 380,
        };
      }),
    })),

  restoreWindow: (id) =>
    set((state) => {
      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      return {
        windows: state.windows.map((window) =>
          window.id === id
            ? {
                ...window,
                minimized: false,
                zIndex: highestZ + 1,
              }
            : window,
        ),
        activeWindowId: id,
      };
    }),

  openWindow: (id, title) =>
    set((state) => {
      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const exists = state.windows.find((w) => w.id === id);

      if (exists) {
        // Unminimize if needed and bring to front
        return {
          windows: state.windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  minimized: false,
                  zIndex: highestZ + 1,
                }
              : w,
          ),
          activeWindowId: id,
        };
      }

      // Stagger new window position
      const offsetIndex = state.windows.length % 8;
      const initialX = Math.min(100 + offsetIndex * 30, window.innerWidth - 560);
      const initialY = Math.min(80 + offsetIndex * 30, window.innerHeight - 440);

      return {
        windows: [
          ...state.windows,
          {
            id,
            title,
            minimized: false,
            maximized: false,
            zIndex: highestZ + 1,
            x: Math.max(20, initialX),
            y: Math.max(20, initialY),
            width: 540,
            height: 380,
          },
        ],
        activeWindowId: id,
      };
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
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
        activeWindowId: id,
      };
    }),
}));
