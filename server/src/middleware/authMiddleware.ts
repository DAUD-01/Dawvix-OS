import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "Invalid token format",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        message: "Server error: JWT_SECRET environment variable is missing",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as unknown as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);

    res.status(401).json({
      message: "Invalid token",
    });
  }
};
