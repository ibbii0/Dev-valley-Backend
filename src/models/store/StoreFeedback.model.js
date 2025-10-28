import mongoose from "mongoose";

const storeFeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeFeedback: { type: String, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true }
}, { timestamps: true });

export const StoreFeedBack = mongoose.model("StoreFeedBack", storeFeedbackSchema);
