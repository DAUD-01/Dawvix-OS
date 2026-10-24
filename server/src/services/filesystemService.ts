import Folder, { type IFolder } from "../models/Folder.js";
import File from "../models/File.js";

export const createDefaultFileSystem = async (
  userId: string,
  username: string,
) => {
  // 1. Root Directory: /
  const rootFolder = await Folder.create({
    name: "/",
    parentId: null,
    ownerId: userId,
  });

  // 2. System Directory: home
  const homeFolder = await Folder.create({
    name: "home",
    parentId: rootFolder._id.toString(),
    ownerId: userId,
  });

  // 3. User Home Directory: /home/<username>
  const userFolder = await Folder.create({
    name: username,
    parentId: homeFolder._id.toString(),
    ownerId: userId,
  });

  // 4. Default user folders
  const documentsFolder = await Folder.create({
    name: "documents",
    parentId: userFolder._id.toString(),
    ownerId: userId,
  });

  const notesFolder = await Folder.create({
    name: "notes",
    parentId: userFolder._id.toString(),
    ownerId: userId,
  });

  const projectsFolder = await Folder.create({
    name: "projects",
    parentId: userFolder._id.toString(),
    ownerId: userId,
  });

  await Folder.create({
    name: "downloads",
    parentId: userFolder._id.toString(),
    ownerId: userId,
  });

  await Folder.create({
    name: "pictures",
    parentId: userFolder._id.toString(),
    ownerId: userId,
  });

  // 5. Default starting files
  await File.create({
    name: "welcome.txt",
    content:
      "Welcome to Dawvix OS!\n\nThis is your private virtual file system running in the cloud.\nYou can create, edit, view, and organize files and folders here.",
    parentId: notesFolder._id.toString(),
    ownerId: userId,
  });

  await File.create({
    name: "getting-started.md",
    content:
      "# Dawvix OS Architecture\n\n- Virtual Filesystem is hierarchical: / -> home -> user -> folders & files.\n- Each user has full ownership and isolation.\n- Open, edit, and create files anytime from Files or Notes.",
    parentId: documentsFolder._id.toString(),
    ownerId: userId,
  });

  await File.create({
    name: "main.js",
    content: `console.log("Welcome to Dawvix OS Virtual Runtime!");\nconsole.log("System initialized successfully.");`,
    parentId: projectsFolder._id.toString(),
    ownerId: userId,
  });

  return { rootFolder, homeFolder, userFolder };
};

export const ensureFileSystemExists = async (
  userId: string,
  username: string,
) => {
  const existingFolder = await Folder.findOne({ ownerId: userId });
  if (!existingFolder) {
    return await createDefaultFileSystem(userId, username);
  }
  return null;
};

export const resolveFolderPath = async (folderId: string, userId: string) => {
  const path: Array<{ id: string; name: string }> = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: IFolder | null = await Folder.findById(currentId);
    if (!folder || folder.ownerId.toString() !== userId) break;

    path.unshift({ id: folder._id.toString(), name: folder.name });
    currentId = folder.parentId;
  }

  return path;
};

export const deleteFolderRecursively = async (
  folderId: string,
  userId: string,
) => {
  // Find all subfolders
  const subfolders = await Folder.find({ parentId: folderId, ownerId: userId });
  for (const sub of subfolders) {
    await deleteFolderRecursively(sub._id.toString(), userId);
  }

  // Delete all files in this folder
  await File.deleteMany({ parentId: folderId, ownerId: userId });

  // Delete the folder itself
  await Folder.deleteOne({ _id: folderId, ownerId: userId });
};
