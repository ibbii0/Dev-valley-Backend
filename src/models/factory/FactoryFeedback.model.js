import mongoose from "mongoose";

const factoryFeedbackSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory", required: true },
    factoryFeedback: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // the logged-in store-admin
  },
  { timestamps: true }
);

export const FactoryFeedback = mongoose.model("FactoryFeedback", factoryFeedbackSchema);
