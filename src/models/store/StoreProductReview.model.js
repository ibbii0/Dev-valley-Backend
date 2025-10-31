import mongoose from "mongoose";

const storeProductReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  storeProductRating: { type: Number, required: true, min: 1, max: 5 }
}, { timestamps: true });

export const StoreProductReview = mongoose.model("StoreProductReview", storeProductReviewSchema);
