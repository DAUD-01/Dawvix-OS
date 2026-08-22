import Window from "./Window";
import { useWindowStore } from "../../stores/windowStore";

export default function WindowManager() {
  const windows = useWindowStore((state) => state.windows);

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
    </>
  );
}
