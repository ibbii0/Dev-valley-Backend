import mongoose from "mongoose";
const factoryProductSchema = new mongoose.Schema(
  {
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    factoryProductName: { type: String, required: true, trim: true, maxlength: 100 },
    factoryProductImage: { type: String, default: null },
    factoryMinOrderUnits: { type: Number, default: 1, min: 1 },
    factoryProductDescription: { type: String, trim: true, default: null },
    factoryProductStatus: { type: String, enum: ["live", "pending"], default: "pending" },
    factoryProductReviewId: { type: mongoose.Schema.Types.ObjectId, ref: "FactoryProductReview", default: null },
    factoryProductFeedbackId: { type: mongoose.Schema.Types.ObjectId, ref: "FactoryProductFeedback", default: null },
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "FactoryProductCategory", required: false },
  },
  { timestamps: true }
);
export const FactoryProduct = mongoose.model("FactoryProduct", factoryProductSchema);
export default FactoryProduct;