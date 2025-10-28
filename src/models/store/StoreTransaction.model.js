import mongoose from "mongoose";

const storeTransactionSchema = new mongoose.Schema({
  storeId: { type: String },
  orderId: { type: String, required: true, unique: true },
  cardNumber: { type: String, required: true },
  cardHolderName: { type: String, required: true },
  cardExpiryDate: { type: String },
  cvcNumber: { type: String },
  amount: { type: mongoose.Decimal128, required: true },
  status: { type: String, enum: ["successful", "failed"], default: "failed" }
}, { timestamps: true });

export const StoreTransaction = mongoose.model("StoreTransaction", storeTransactionSchema);
