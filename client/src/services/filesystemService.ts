import { api } from "./authService";

export interface FolderData {
  id: string;
  _id?: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileData {
  id: string;
  _id?: string;
  name: string;
  content: string;
  parentId: string;
  ownerId: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DirectoryResponse {
  currentFolder: FolderData | null;
  path: Array<{ id: string; name: string }>;
  folders: FolderData[];
  files: FileData[];
}

export const getDirectoryContents = async (
  parentId?: string,
): Promise<DirectoryResponse> => {
  const params = parentId ? { parentId } : {};
  const response = await api.get<DirectoryResponse>("/filesystem", { params });
  return response.data;
};

export const getFileSystemTree = async (): Promise<{
  folders: FolderData[];
  files: FileData[];
}> => {
  const response = await api.get("/filesystem/tree");
  return response.data;
};

export const createFolder = async (
  name: string,
  parentId?: string | null,
): Promise<{ message: string; folder: FolderData }> => {
  const response = await api.post("/filesystem/folder", { name, parentId });
  return response.data;
};

export const updateFolder = async (
  id: string,
  name?: string,
  parentId?: string | null,
): Promise<{ message: string; folder: FolderData }> => {
  const response = await api.put(`/filesystem/folder/${id}`, {
    name,
    parentId,
  });
  return response.data;
};

export const createFile = async (
  name: string,
  parentId: string,
  content: string = "",
): Promise<{ message: string; file: FileData }> => {
  const response = await api.post("/filesystem/file", {
    name,
    parentId,
    content,
  });
  return response.data;
};

export const uploadFile = async (
  name: string,
  content: string,
  parentId: string,
  size?: number,
  mimeType?: string,
): Promise<{ message: string; file: FileData }> => {
  const response = await api.post("/filesystem/upload", {
    name,
    content,
    parentId,
    size,
    mimeType,
  });
  return response.data;
};

export const getFile = async (id: string): Promise<FileData> => {
  const response = await api.get(`/filesystem/file/${id}`);
  return response.data;
};

export const updateFile = async (
  id: string,
  content?: string,
  name?: string,
  parentId?: string,
): Promise<{ message: string; file: FileData }> => {
  const response = await api.put(`/filesystem/file/${id}`, {
    content,
    name,
    parentId,
  });
  return response.data;
};

export const deleteItem = async (
  type: "folder" | "file",
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/filesystem/${type}/${id}`);
  return response.data;
};
