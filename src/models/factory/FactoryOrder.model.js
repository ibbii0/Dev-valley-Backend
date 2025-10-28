// models/FactoryOrder.model.js
import mongoose from "mongoose";

const factoryOrderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    products: [
      {
        factoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Factory",
          required: true,
        },
        factoryProductId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FactoryProduct",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingId: String,
    totalAmount: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const FactoryOrder = mongoose.model("FactoryOrder", factoryOrderSchema);
