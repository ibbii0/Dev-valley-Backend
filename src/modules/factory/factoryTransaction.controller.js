import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { FactoryTransaction } from "../../models/factory/FactoryTransaction.model.js";
import { FactoryOrder } from "../../models/factory/FactoryOrder.model.js";
import { factoryTransactionSchema } from "../../shared/validators/factory.validation.js";
import  Store  from "../../models/store/Store.model.js";

// CREATE TRANSACTION
export const createFactoryTransaction = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const data = factoryTransactionSchema.parse(req.body);
  const { orderId, cardNumber, cardUserName, cardExpiryDate, cvcNumber, transactionStatus } = data;

  // Fetch order
  const order = await FactoryOrder.findById(orderId);
  if (!order) throw new ApiError(404, "Factory order not found");

  // ✅ Check if order belongs to logged-in user
  const store = await Store.findOne({ _id: order.storeId, userID: req.user._id });

// ✅ Check if logged-in user owns the store of this order
if (!store) {
  throw new ApiError(403, "You are not authorized to pay for this order");
}


  const transaction = await FactoryTransaction.create({
    factoryId: order.products[0].factoryId, // or handle multiple factories if needed
    orderId,
    cardNumber,
    cardUserName,
    cardExpiryDate,
    cvcNumber,
    transactionStatus: transactionStatus || "successful",
    amount: Number(order.totalAmount),
    userId: req.user._id,
    storeId: order.storeId,
  });

  if (transaction.transactionStatus === "successful") {
    order.paymentStatus = "completed";
    await order.save();
  }

  return res.status(201).json(new ApiResponse(201, transaction, "Transaction successful"));
});


// GET ALL TRANSACTIONS
export const getAllFactoryTransactions = asyncHandler(async (req, res) => {
  const transactions = await FactoryTransaction.find({ userId: req.user._id });
  return res.status(200).json(new ApiResponse(200, transactions, "Transactions fetched successfully"));
});

// GET SINGLE TRANSACTION
export const getFactoryTransactionById = asyncHandler(async (req, res) => {
  const transaction = await FactoryTransaction.findById(req.params.id);
  if (!transaction) throw new ApiError(404, "Transaction not found");
  return res.status(200).json(new ApiResponse(200, transaction, "Transaction fetched successfully"));
});

// DELETE TRANSACTION
export const deleteFactoryTransaction = asyncHandler(async (req, res) => {
  const deleted = await FactoryTransaction.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Transaction not found");
  return res.status(200).json(new ApiResponse(200, {}, "Transaction deleted successfully"));
});
