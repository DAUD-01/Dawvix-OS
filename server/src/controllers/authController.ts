import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        MessageChannel: "All fields are required",
      });
      return;
    }

    const userExist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExist) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
