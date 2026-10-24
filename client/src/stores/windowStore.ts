import { create } from "zustand";
import type { WindowData } from "../types/window";

interface WindowStore {
  windows: WindowData[];
  activeWindowId: string | null;

  openWindow: (
    id: string,
    title: string,
    params?: Record<string, unknown>,
  ) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleWindowMinimize: (id: string) => void;
  updateWindowParams: (id: string, params: Record<string, unknown>) => void;
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
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, minimized: true } : win,
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
      windows: state.windows.map((win) => {
        if (win.id !== id) {
          return win;
        }

        if (!win.maximized) {
          return {
            ...win,
            previousX: win.x,
            previousY: win.y,
            previousWidth: win.width,
            previousHeight: win.height,
            maximized: true,
          };
        }

        const fallbackWidth = Math.min(
          680,
          typeof globalThis.window !== "undefined"
            ? globalThis.window.innerWidth - 80
            : 680,
        );
        const fallbackHeight = Math.min(
          480,
          typeof globalThis.window !== "undefined"
            ? globalThis.window.innerHeight - 140
            : 480,
        );

        return {
          ...win,
          maximized: false,
          x: win.previousX ?? 80,
          y: win.previousY ?? 60,
          width: win.previousWidth ?? fallbackWidth,
          height: win.previousHeight ?? fallbackHeight,
        };
      }),
    })),

  restoreWindow: (id) =>
    set((state) => {
      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      return {
        windows: state.windows.map((win) =>
          win.id === id
            ? {
                ...win,
                minimized: false,
                zIndex: highestZ + 1,
              }
            : win,
        ),
        activeWindowId: id,
      };
    }),

  openWindow: (id, title, params) =>
    set((state) => {
      const highestZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      const exists = state.windows.find((w) => w.id === id);

      if (exists) {
        // Bring to front, unminimize, and update title / params
        return {
          windows: state.windows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  title: title || w.title,
                  params:
                    params !== undefined
                      ? { ...w.params, ...params }
                      : w.params,
                  minimized: false,
                  zIndex: highestZ + 1,
                }
              : w,
          ),
          activeWindowId: id,
        };
      }

      // Calculate initial cascading dimensions and coordinates
      const screenW =
        typeof globalThis.window !== "undefined"
          ? globalThis.window.innerWidth
          : 1280;
      const screenH =
        typeof globalThis.window !== "undefined"
          ? globalThis.window.innerHeight
          : 800;

      const defaultW = Math.min(660, screenW - 80);
      const defaultH = Math.min(460, screenH - 120);

      const cascadeIndex = state.windows.length % 6;
      const initialX = Math.max(
        30,
        Math.min(60 + cascadeIndex * 36, screenW - defaultW - 40),
      );
      const initialY = Math.max(
        20,
        Math.min(40 + cascadeIndex * 36, screenH - defaultH - 80),
      );

      return {
        windows: [
          ...state.windows,
          {
            id,
            title,
            minimized: false,
            maximized: false,
            zIndex: highestZ + 1,
            x: initialX,
            y: initialY,
            width: defaultW,
            height: defaultH,
            params,
          },
        ],
        activeWindowId: id,
      };
    }),

  updateWindowParams: (id, params) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              params: { ...w.params, ...params },
            }
          : w,
      ),
    })),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

  updateWindowGeometry: (id, x, y, width, height) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id
          ? {
              ...win,
              x,
              y,
              width,
              height,
            }
          : win,
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
