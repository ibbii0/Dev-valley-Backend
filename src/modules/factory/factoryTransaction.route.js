import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import {
  createFactoryTransaction,
  getAllFactoryTransactions,
  getFactoryTransactionById,
  deleteFactoryTransaction,
} from "./factoryTransaction.controller.js";
import { factoryTransactionSchema } from "../../shared/validators/factory.validation.js";

const router = Router();

router.post("/", isLoggedIn, validate(factoryTransactionSchema), createFactoryTransaction);
router.get("/", isLoggedIn, getAllFactoryTransactions);
router.get("/:id", isLoggedIn, getFactoryTransactionById);
router.delete("/:id", isLoggedIn, deleteFactoryTransaction);

export default router;
