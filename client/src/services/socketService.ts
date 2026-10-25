import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "../stores/notificationStore";

const SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000");

export interface OnlineUser {
  socketId: string;
  userId: string;
  username: string;
  activeWindow?: string;
  joinedAt: number;
}

class SocketService {
  private socket: Socket | null = null;
  private presenceListeners: Array<(users: OnlineUser[]) => void> = [];
  private noteUpdateListeners: Array<
    (data: {
      noteId: string;
      content: string;
      cursor?: number;
      updatedBy: string;
      timestamp: number;
    }) => void
  > = [];
  private noteJoinListeners: Array<
    (data: { username: string; timestamp: number }) => void
  > = [];

  public connect(userData?: { userId: string; username: string }) {
    if (this.socket && this.socket.connected) {
      if (userData) {
        this.socket.emit("presence:join", userData);
      }
      return;
    }

    try {
      this.socket = io(SERVER_URL, {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        if (userData) {
          this.socket?.emit("presence:join", userData);
        }
      });

      this.socket.on("presence:update", (users: OnlineUser[]) => {
        this.presenceListeners.forEach((listener) => listener(users));
      });

      this.socket.on(
        "note:update",
        (data: {
          noteId: string;
          content: string;
          cursor?: number;
          updatedBy: string;
          timestamp: number;
        }) => {
          this.noteUpdateListeners.forEach((listener) => listener(data));
        },
      );

      this.socket.on(
        "note:user_joined",
        (data: { username: string; timestamp: number }) => {
          this.noteJoinListeners.forEach((listener) => listener(data));
        },
      );

      this.socket.on(
        "notification:new",
        (notif: {
          title: string;
          message: string;
          type?: "info" | "success" | "warning" | "error";
        }) => {
          useNotificationStore.getState().notify({
            title: notif.title || "System Notice",
            message: notif.message,
            type: notif.type || "info",
          });
        },
      );

      this.socket.on("connect_error", () => {
        // Silent fallback for standalone / offline usage
      });
    } catch {
      // Graceful fallback
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinNoteRoom(noteId: string, username: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("note:join", { noteId, username });
    }
  }

  public leaveNoteRoom(noteId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("note:leave", { noteId });
    }
  }

  public emitNoteEdit(
    noteId: string,
    content: string,
    username: string,
    cursor?: number,
  ) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("note:edit", { noteId, content, username, cursor });
    }
  }

  public onPresenceUpdate(listener: (users: OnlineUser[]) => void) {
    this.presenceListeners.push(listener);
    return () => {
      this.presenceListeners = this.presenceListeners.filter(
        (l) => l !== listener,
      );
    };
  }

  public onNoteUpdate(
    listener: (data: {
      noteId: string;
      content: string;
      cursor?: number;
      updatedBy: string;
      timestamp: number;
    }) => void,
  ) {
    this.noteUpdateListeners.push(listener);
    return () => {
      this.noteUpdateListeners = this.noteUpdateListeners.filter(
        (l) => l !== listener,
      );
    };
  }

  public onNoteUserJoined(
    listener: (data: { username: string; timestamp: number }) => void,
  ) {
    this.noteJoinListeners.push(listener);
    return () => {
      this.noteJoinListeners = this.noteJoinListeners.filter(
        (l) => l !== listener,
      );
    };
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
