import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeTransactionSchema } from "../../shared/validators/store.validation.js";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "./storeTransaction.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";

const storeTransactionRouter = Router();

storeTransactionRouter.post("/", isLoggedIn, validate(storeTransactionSchema), createTransaction);
storeTransactionRouter.get("/", isLoggedIn, getAllTransactions);
storeTransactionRouter.get("/:id", isLoggedIn, getTransactionById);
storeTransactionRouter.put("/:id", isLoggedIn, validate(storeTransactionSchema.partial()), updateTransaction);
storeTransactionRouter.delete("/:id", isLoggedIn, deleteTransaction);

export default storeTransactionRouter;
