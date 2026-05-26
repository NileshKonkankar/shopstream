import { Document, Schema, Types, model } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  productId: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      default: []
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", OrderSchema);
