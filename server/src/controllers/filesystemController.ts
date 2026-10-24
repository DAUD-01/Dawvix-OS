import type { Response } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import Folder, { type IFolder } from "../models/Folder.js";
import File, { type IFile } from "../models/File.js";
import User from "../models/User.js";
import {
  ensureFileSystemExists,
  resolveFolderPath,
  deleteFolderRecursively,
} from "../services/filesystemService.js";

export const getDirectoryContents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Ensure user has their default filesystem initialized
    await ensureFileSystemExists(userId, user.username);

    let targetFolderId = req.query.parentId as string | undefined;

    // Default to the user's specific folder (/home/<username>) if no parentId specified
    if (!targetFolderId || targetFolderId === "root") {
      const homeFolder: IFolder | null = await Folder.findOne({
        name: "home",
        ownerId: userId,
      });

      if (homeFolder) {
        const userFolder: IFolder | null = await Folder.findOne({
          name: user.username,
          parentId: homeFolder._id.toString(),
          ownerId: userId,
        });

        if (userFolder) {
          targetFolderId = userFolder._id.toString();
        } else {
          targetFolderId = homeFolder._id.toString();
        }
      } else {
        const rootFolder: IFolder | null = await Folder.findOne({
          name: "/",
          ownerId: userId,
        });
        targetFolderId = rootFolder ? rootFolder._id.toString() : undefined;
      }
    }

    let currentFolder: IFolder | null = null;
    let pathBreadcrumbs: Array<{ id: string; name: string }> = [];

    if (targetFolderId) {
      currentFolder = await Folder.findById(targetFolderId);
      if (currentFolder && currentFolder.ownerId.toString() === userId) {
        pathBreadcrumbs = await resolveFolderPath(targetFolderId, userId);
      } else {
        currentFolder = null;
      }
    }

    const folders = await Folder.find({
      parentId: targetFolderId ?? null,
      ownerId: userId,
    }).sort({ name: 1 });

    const files = targetFolderId
      ? await File.find({
          parentId: targetFolderId,
          ownerId: userId,
        }).sort({ name: 1 })
      : [];

    res.status(200).json({
      currentFolder,
      path: pathBreadcrumbs,
      folders,
      files,
    });
  } catch (error) {
    console.error("getDirectoryContents error:", error);
    res.status(500).json({ message: "Failed to retrieve directory contents" });
  }
};

export const getFileSystemTree = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const folders = await Folder.find({ ownerId: userId }).sort({ name: 1 });
    const files = await File.find({ ownerId: userId }).sort({ name: 1 });

    res.status(200).json({ folders, files });
  } catch (error) {
    console.error("getFileSystemTree error:", error);
    res.status(500).json({ message: "Failed to retrieve file tree" });
  }
};

export const createFolder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, parentId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!name || typeof name !== "string") {
      res.status(400).json({ message: "Folder name is required" });
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      res.status(400).json({ message: "Folder name cannot be empty" });
      return;
    }

    // Check for existing folder with same name in same parent
    const existing = await Folder.findOne({
      name: trimmedName,
      parentId: parentId || null,
      ownerId: userId,
    });

    if (existing) {
      res
        .status(400)
        .json({ message: "A folder with this name already exists here" });
      return;
    }

    const folder = await Folder.create({
      name: trimmedName,
      parentId: parentId || null,
      ownerId: userId,
    });

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error("createFolder error:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

export const updateFolder = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, parentId } = req.body;

    if (!userId || !id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const folder: IFolder | null = await Folder.findById(String(id));
    if (!folder || folder.ownerId.toString() !== userId) {
      res.status(404).json({ message: "Folder not found" });
      return;
    }

    if (name && typeof name === "string" && name.trim()) {
      const trimmedName = name.trim();
      const existing = await Folder.findOne({
        _id: { $ne: folder._id },
        name: trimmedName,
        parentId: parentId !== undefined ? parentId : folder.parentId,
        ownerId: userId,
      });

      if (existing) {
        res
          .status(400)
          .json({ message: "A folder with this name already exists here" });
        return;
      }

      folder.name = trimmedName;
    }

    if (parentId !== undefined) {
      // Prevent moving folder into itself
      if (parentId === id) {
        res.status(400).json({ message: "Cannot move folder into itself" });
        return;
      }
      folder.parentId = parentId;
    }

    await folder.save();

    res.status(200).json({
      message: "Folder updated successfully",
      folder,
    });
  } catch (error) {
    console.error("updateFolder error:", error);
    res.status(500).json({ message: "Failed to update folder" });
  }
};

export const createFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { name, content = "", parentId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!name || typeof name !== "string" || !parentId) {
      res
        .status(400)
        .json({ message: "File name and parentId are required" });
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      res.status(400).json({ message: "File name cannot be empty" });
      return;
    }

    // Check duplicate
    const existing = await File.findOne({
      name: trimmedName,
      parentId,
      ownerId: userId,
    });

    if (existing) {
      res
        .status(400)
        .json({ message: "A file with this name already exists here" });
      return;
    }

    const file = await File.create({
      name: trimmedName,
      content,
      parentId,
      ownerId: userId,
    });

    res.status(201).json({
      message: "File created successfully",
      file,
    });
  } catch (error) {
    console.error("createFile error:", error);
    res.status(500).json({ message: "Failed to create file" });
  }
};

export const getFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId || !id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const file: IFile | null = await File.findById(String(id));
    if (!file || file.ownerId.toString() !== userId) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    res.status(200).json(file);
  } catch (error) {
    console.error("getFile error:", error);
    res.status(500).json({ message: "Failed to fetch file" });
  }
};

export const updateFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { content, name, parentId } = req.body;

    if (!userId || !id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const file: IFile | null = await File.findById(String(id));
    if (!file || file.ownerId.toString() !== userId) {
      res.status(404).json({ message: "File not found" });
      return;
    }

    if (typeof content === "string") {
      file.content = content;
    }

    if (name && typeof name === "string") {
      file.name = name.trim();
    }

    if (parentId && typeof parentId === "string") {
      file.parentId = parentId;
    }

    await file.save();

    res.status(200).json({
      message: "File updated successfully",
      file,
    });
  } catch (error) {
    console.error("updateFile error:", error);
    res.status(500).json({ message: "Failed to update file" });
  }
};

export const deleteItem = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const { type, id } = req.params;

    if (!userId || !id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const itemId = String(id);

    if (type === "folder") {
      const folder: IFolder | null = await Folder.findById(itemId);
      if (!folder || folder.ownerId.toString() !== userId) {
        res.status(404).json({ message: "Folder not found" });
        return;
      }

      await deleteFolderRecursively(itemId, userId);
      res.status(200).json({ message: "Folder deleted successfully" });
      return;
    }

    if (type === "file") {
      const file: IFile | null = await File.findById(itemId);
      if (!file || file.ownerId.toString() !== userId) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      await File.findByIdAndDelete(itemId);
      res.status(200).json({ message: "File deleted successfully" });
      return;
    }

    res.status(400).json({ message: "Invalid item type" });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
};
