import mongoose from "mongoose";

const factoryProductCategorySchema = new mongoose.Schema(
  {
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
    factoryProductCategoryName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    factoryProductCategoryLogo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const FactoryProductCategory = mongoose.model(
  "FactoryProductCategory",
  factoryProductCategorySchema
);
