import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to Users collection
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    storeLogo: {
      type: String,
      default: 'https://placehold.co/600x400?text=User+Image',
    },
    storeCoverImage: {
      type: String,
      default: 'https://placehold.co/600x400?text=User+Image',
    },
    storeDescription: {
      type: String,
      default: "",
    },
    storeCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // ✅ matches the model name exactly
    default: null,
  },
    idCardNumber: {
      type: String,
      maxlength: 13,
      default: null,
    },
    idCardImage: {
      type: String,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    storeStatus: {
      type: String,
      enum: ["pending", "live", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);
export default Store;