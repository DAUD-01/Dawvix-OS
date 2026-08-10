import Taskbar from "../components/taskbar/Taskbar";

export default function Desktop() {
  return (
    <>
      <div
        className="
        h-screen
        w-screen
        overflow-hidden
        relative
        bg-slate-900
        text-gray
        text-center
      "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
        }}
      >
        Desktop
      </div>
      <Taskbar />
    </>
  );
}
