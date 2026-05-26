import { Document, Schema, model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ isActive: 1, category: 1, createdAt: -1 });
ProductSchema.index({ title: "text", description: "text" });

export const Product = model<IProduct>("Product", ProductSchema);
