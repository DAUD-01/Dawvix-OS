import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

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

    const decoded = jwt.verify(token, secret) as unknown as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
