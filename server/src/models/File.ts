import { Schema, model, Document } from "mongoose";

export interface IFile extends Document {
  name: string;
  content: string;
  parentId: string;
  ownerId: string;
}

const FileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    parentId: {
      type: String,
      required: true,
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

export default model<IFile>("File", FileSchema);
