export interface WindowData {
  id: string;
  title: string;

  minimized: boolean;
  maximized: boolean;

  zIndex: number;

  x: number;
  y: number;

  width: number;
  height: number;

  previousX?: number;
  previousY?: number;

  previousWidth?: number;
  previousHeight?: number;
}
