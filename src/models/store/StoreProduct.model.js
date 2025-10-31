import mongoose from "mongoose";

const storeProductSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productDescription: {
      type: String,
      default: "",
    },
    productCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreProductCategory",
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    productImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    productReviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreProductReview",
      default: null,
    },
    productFeedBackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreProductFeedback",
      default: null,
    },
    productStatus: {
      type: String,
      enum: ["live", "pending"," rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const StoreProduct = mongoose.model("StoreProduct", storeProductSchema);
export default StoreProduct;