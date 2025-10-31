import Router from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryOrder,
  getAllFactoryOrders,
  getFactoryOrderById,
  deleteFactoryOrder,
} from "./factoryOrder.controller.js";
import { factoryOrderValidation } from "../../shared/validators/factory.validation.js";

const factoryOrderRouter = Router();

factoryOrderRouter.post(
  "/",
  isLoggedIn,
  authorizeRoles("store-admin"),
  validate(factoryOrderValidation),
  createFactoryOrder
);

factoryOrderRouter.get("/", getAllFactoryOrders);
factoryOrderRouter.get("/:id", getFactoryOrderById);
factoryOrderRouter.delete("/:id", isLoggedIn, deleteFactoryOrder);

export default factoryOrderRouter;
