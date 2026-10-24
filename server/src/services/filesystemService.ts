import Folder from "../models/Folder.js";

export const createDefaultFileSystem = async (
  userId: string,
  username: string,
) => {
  const homeFolder = await Folder.create({
    name: "home",
    parentId: null,
    ownerId: userId,
  });

  const userFolder = await Folder.create({
    name: username,
    parentId: homeFolder._id.toString(),
    ownerId: userId,
  });

  const defaultFolders = [
    "documents",
    "downloads",
    "notes",
    "projects",
    "pictures",
  ];

  for (const folderName of defaultFolders) {
    await Folder.create({
      name: folderName,

      parentId: userFolder._id.toString(),

      ownerId: userId,
    });
  }
};
