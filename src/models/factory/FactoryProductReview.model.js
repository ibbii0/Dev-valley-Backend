import mongoose from "mongoose";

const factoryProductReviewSchema = new mongoose.Schema(
  {
    factoryProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FactoryProduct",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    factoryProductRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export const FactoryProductReview = mongoose.model("FactoryProductReview", factoryProductReviewSchema);
