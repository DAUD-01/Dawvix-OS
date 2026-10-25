import { create } from "zustand";
import { socketService, type OnlineUser } from "../services/socketService";

interface SocketState {
  onlineUsers: OnlineUser[];
  isConnected: boolean;
  initSocket: (user: { id: string; username: string }) => void;
  cleanupSocket: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  onlineUsers: [],
  isConnected: false,

  initSocket: (user) => {
    socketService.connect({ userId: user.id, username: user.username });

    const unsubscribe = socketService.onPresenceUpdate((users) => {
      set({ onlineUsers: users, isConnected: true });
    });

    // Provide initial state with current user if empty
    set({
      isConnected: true,
      onlineUsers: [
        {
          socketId: "local",
          userId: user.id,
          username: user.username,
          joinedAt: Date.now(),
        },
      ],
    });

    return unsubscribe;
  },

  cleanupSocket: () => {
    socketService.disconnect();
    set({ onlineUsers: [], isConnected: false });
  },
}));
