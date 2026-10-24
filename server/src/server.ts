import authRouter from "./routes/authRoutes.js";
import filesystemRouter from "./routes/filesystemRoutes.js";
import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/filesystem", filesystemRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", name: "Dawvix OS Backend API" });
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
