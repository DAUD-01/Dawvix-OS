import authRouter from "./routes/authRoutes.js";
import filesystemRouter from "./routes/filesystemRoutes.js";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/filesystem", filesystemRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    name: "Dawvix OS Backend API",
    socket: "Socket.IO Enabled",
  });
});

// Create HTTP server for Express and Socket.IO
const server = http.createServer(app);

export interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
  activeWindow?: string;
  joinedAt: number;
}

const onlineUsers = new Map<string, ConnectedUser>();

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  // Presence: user joined the OS
  socket.on("presence:join", (userData: { userId: string; username: string }) => {
    if (!userData || !userData.userId) return;
    onlineUsers.set(socket.id, {
      socketId: socket.id,
      userId: userData.userId,
      username: userData.username || "Anonymous",
      joinedAt: Date.now(),
    });
    // Broadcast updated online users list
    io.emit("presence:update", Array.from(onlineUsers.values()));
  });

  // Collaborative Notes: join note room
  socket.on(
    "note:join",
    ({ noteId, username }: { noteId: string; username: string }) => {
      if (!noteId) return;
      socket.join(`note:${noteId}`);
      socket.to(`note:${noteId}`).emit("note:user_joined", {
        username: username || "Guest",
        timestamp: Date.now(),
      });
    },
  );

  // Collaborative Notes: real-time content sync
  socket.on(
    "note:edit",
    ({
      noteId,
      content,
      cursor,
      username,
    }: {
      noteId: string;
      content: string;
      cursor?: number;
      username: string;
    }) => {
      if (!noteId) return;
      socket.to(`note:${noteId}`).emit("note:update", {
        noteId,
        content,
        cursor,
        updatedBy: username || "Collaborator",
        timestamp: Date.now(),
      });
    },
  );

  // Collaborative Notes: leave room
  socket.on("note:leave", ({ noteId }: { noteId: string }) => {
    if (!noteId) return;
    socket.leave(`note:${noteId}`);
  });

  // Global broadcast notification across OS clients
  socket.on(
    "broadcast:notification",
    (notif: { title: string; message: string; type?: string }) => {
      io.emit("notification:new", notif);
    },
  );

  socket.on("disconnect", () => {
    if (onlineUsers.has(socket.id)) {
      onlineUsers.delete(socket.id);
      io.emit("presence:update", Array.from(onlineUsers.values()));
    }
  });
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} with Socket.IO enabled`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
