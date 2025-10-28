import mongoose from "mongoose";

const storeProductFeedbackSchema = new mongoose.Schema({
  storeProductId: { type: mongoose.Schema.Types.ObjectId, ref: "StoreProduct", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  description: { type: String, required: true },
  storeProductImage: { type: String },
}, { timestamps: true });

export const StoreProductFeedback = mongoose.model("StoreProductFeedback", storeProductFeedbackSchema);
