import { Schema, model, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  parentId: string | null;
  ownerId: string;
}

const FolderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    parentId: {
      type: String,
      default: null,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IFolder>("Folder", FolderSchema);
