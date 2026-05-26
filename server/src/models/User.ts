import { Document, Schema, model } from "mongoose";

export type UserRole = "customer" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const output = ret as Partial<IUser>;
        delete output.passwordHash;
        return ret;
      }
    }
  }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = model<IUser>("User", UserSchema);
