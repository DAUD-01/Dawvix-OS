import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  time?: string;
}

export default function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00");

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem("dawvix_calendar_events");
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    const today = new Date().toISOString().split("T")[0];
    return [
      {
        id: "ev-1",
        dateStr: today,
        title: "Dawvix OS Development Sprint",
        time: "09:30",
      },
      {
        id: "ev-2",
        dateStr: today,
        title: "Virtual Filesystem Architecture Review",
        time: "14:00",
      },
    ];
  });

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem("dawvix_calendar_events", JSON.stringify(updated));
    } catch {
      // silent
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split("T")[0]);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: "ev-" + Date.now(),
      dateStr: selectedDate,
      title: newEventTitle.trim(),
      time: newEventTime,
    };

    saveEvents([...events, newEv]);
    setNewEventTitle("");
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((ev) => ev.id !== id));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

  // Padding days before
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ dayNum: 0, dateStr: "", isCurrentMonth: false });
  }

  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }

  const selectedEvents = events.filter((ev) => ev.dateStr === selectedDate);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="flex h-full bg-slate-900 text-slate-100 select-none overflow-hidden font-sans">
      {/* Left: Monthly Calendar View */}
      <div className="flex-1 flex flex-col border-r border-white/10 p-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleToday}
              className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-cyan-400 font-medium transition cursor-pointer border border-white/5"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
          {days.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return <div key={idx} className="rounded-xl opacity-0" />;
            }

            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const dayEvents = events.filter((ev) => ev.dateStr === item.dateStr);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex flex-col p-2 rounded-xl transition cursor-pointer relative text-left min-h-[46px] border ${
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-500/50 text-white font-bold"
                    : isToday
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                    : "bg-slate-800/30 border-white/5 hover:bg-white/5 text-slate-300"
                }`}
              >
                <span className="text-xs">{item.dayNum}</span>
                {dayEvents.length > 0 && (
                  <div className="flex items-center gap-1 mt-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {dayEvents.length > 1 && (
                      <span className="text-[9px] text-slate-400">
                        +{dayEvents.length - 1}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Date Agenda */}
      <div className="w-72 bg-slate-950/60 p-4 flex flex-col justify-between overflow-y-auto shrink-0">
        <div>
          <div className="pb-3 border-b border-white/10">
            <h4 className="text-sm font-semibold text-white">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h4>
            <span className="text-[11px] text-slate-400">
              {selectedEvents.length} scheduled event(s)
            </span>
          </div>

          {/* Event List */}
          <div className="py-3 space-y-2 max-h-[300px] overflow-y-auto">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No events on this date
              </div>
            ) : (
              selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-start justify-between gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono mb-0.5">
                      <Clock size={11} />
                      <span>{ev.time || "All day"}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium break-words">
                      {ev.title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                    title="Delete event"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Event Form */}
        <form
          onSubmit={handleAddEvent}
          className="pt-3 border-t border-white/10 space-y-2 shrink-0"
        >
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              className="w-24 bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <input
              type="text"
              placeholder="Event title..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Event</span>
          </button>
        </form>
      </div>
    </div>
  );
}
