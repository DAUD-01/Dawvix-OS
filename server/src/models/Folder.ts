import { Schema, model, Document, type Types } from "mongoose";

export interface IFolder extends Document {
  name: string;
  parentId: string | null;
  ownerId: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Folder = model<IFolder>("Folder", FolderSchema);
export default Folder;
