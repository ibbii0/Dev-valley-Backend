// src/models/AdminAction.model.js
import mongoose from "mongoose";

const adminActionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "VerifyStore",
        "RejectStore",
        "SuspendStore",
        "BlockStore",
        "VerifyProduct",
        "RejectProduct",
        "VerifyFactory",
        "RejectFactory",
        "SuspendFactory",
        "BlockFactory",
        "VerifyFactoryProduct",
        "RejectFactoryProduct",
      ],
      required: true,
    },
    targetTable: {
      type: String,
      enum: ["Store", "StoreProduct", "Factory", "FactoryProduct"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    actionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AdminAction = mongoose.model("AdminAction", adminActionSchema);
export default AdminAction;
