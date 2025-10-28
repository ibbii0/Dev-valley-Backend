import mongoose from "mongoose";

const storeProductCategorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    categoryLogo: {
      type: String,
      default: null,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

export const StoreProductCategory = mongoose.model("StoreProductCategory", storeProductCategorySchema);
