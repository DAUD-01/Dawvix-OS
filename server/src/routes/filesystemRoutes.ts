import { Router } from "express";
import {
  getDirectoryContents,
  getFileSystemTree,
  createFolder,
  updateFolder,
  createFile,
  getFile,
  updateFile,
  deleteItem,
} from "../controllers/filesystemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all filesystem routes
router.use(protect);

router.get("/", getDirectoryContents);
router.get("/tree", getFileSystemTree);
router.post("/folder", createFolder);
router.put("/folder/:id", updateFolder);
router.post("/file", createFile);
router.get("/file/:id", getFile);
router.put("/file/:id", updateFile);
router.delete("/:type/:id", deleteItem);

export default router;
