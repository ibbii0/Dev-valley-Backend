import mongoose from "mongoose";

const factoryTransactionSchema = new mongoose.Schema(
  {
    factoryId: { type: String, required: true },
    orderId: { type: String, required: true },
    cardNumber: { type: String, required: true },
    cardUserName: { type: String, required: true },
    cardExpiryDate: { type: String, required: true },
    cvcNumber: { type: String, required: true },
    transactionStatus: { type: String, enum: ["successful", "failed"], default: "failed" },
    amount: { type: mongoose.Decimal128, required: true },
    storeId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const FactoryTransaction = mongoose.model("FactoryTransaction", factoryTransactionSchema);
