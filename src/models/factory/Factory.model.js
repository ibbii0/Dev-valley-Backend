import mongoose from "mongoose";

const factorySchema = new mongoose.Schema(
  {
    // Reference to the user who owns/manages the factory
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Must match your User model name
      required: true,
    },

    factoryName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    factoryDescription: {
      type: String,
      default: "",
    },

    factoryCoverImage: {
      type: String,
      default: "https://placehold.co/600x400?text=Factory+Cover",
    },

    factoryLogo: {
      type: String,
      default: "https://placehold.co/600x400?text=Factory+Logo",
    },

    factoryIsBlocked: {
      type: Boolean,
      default: false,
    },

    factoryIsSuspended: {
      type: Boolean,
      default: false,
    },

    factoryLicenseNumber: {
      type: String,
      maxlength: 50,
      trim: true,
      default: null,
    },

    factoryLicenseImage: {
      type: String,
      default: null,
    },

    idCardNumber: {
      type: String,
      maxlength: 20,
      trim: true,
      default: null,
    },

    factoryStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    factoryCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Factory = mongoose.model("Factory", factorySchema);
export default Factory;
