import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreTransaction } from "../../models/store/StoreTransaction.model.js";
import { storeTransactionSchema } from "../../shared/validators/store.validation.js";
import { StoreOrders } from "../../models/store/StoreOrder.model.js";

// CREATE TRANSACTION
export const createTransaction = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  // Validate request body (only card details + orderId)
  const data = storeTransactionSchema.parse(req.body);

  // Fetch order from DB
  const order = await StoreOrders.findById(data.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  // Assign storeId automatically from order
  data.storeId = order.storeId;

  // Assign logged-in user
  data.userId = req.user.id;

  // Assign amount automatically from order
  data.amount = Number(order.totalAmount);

  // Default status if not provided
  if (!data.status) data.status = "failed";

  const transaction = await StoreTransaction.create(data);
data.status = "successful"
  // Optionally: update order paymentStatus if transaction successful
  if (data.status === "successful") {
    order.paymentStatus = "paid";
    await order.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, transaction, "Transaction created successfully"));
});

// READ ALL TRANSACTIONS
export const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await StoreTransaction.find();
  return res.status(200).json(new ApiResponse(200, transactions, "All transactions fetched successfully"));
});

// READ SINGLE TRANSACTION
export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await StoreTransaction.findById(req.params.id);
  if (!transaction) throw new ApiError(404, "Transaction not found");
  return res.status(200).json(new ApiResponse(200, transaction, "Transaction fetched successfully"));
});

// UPDATE TRANSACTION
export const updateTransaction = asyncHandler(async (req, res) => {
  const data = storeTransactionSchema.partial().parse(req.body);
  const updatedTransaction = await StoreTransaction.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!updatedTransaction) throw new ApiError(404, "Transaction not found");
  return res.status(200).json(new ApiResponse(200, updatedTransaction, "Transaction updated successfully"));
});

// DELETE TRANSACTION
export const deleteTransaction = asyncHandler(async (req, res) => {
  const deletedTransaction = await StoreTransaction.findByIdAndDelete(req.params.id);
  if (!deletedTransaction) throw new ApiError(404, "Transaction not found");
  return res.status(200).json(new ApiResponse(200, {}, "Transaction deleted successfully"));
});
