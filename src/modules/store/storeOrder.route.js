import Router from "express";
import {upload} from "../../core/middleware/multer.js";
import { validate } from "../../core/middleware/validate.js";
import { storeOrderValidation } from "../../shared/validators/store.validation.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  // updateOrder,
  deleteOrder,
} from "./storeOrder.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";   
const storeOrderRouter = Router();

// CREATE ORDER with optional document upload
storeOrderRouter.post(
  "/:storeId",
  isLoggedIn,
  authorizeRoles("buyer"),
  upload.single("orderDocument"),
  validate(storeOrderValidation),
  createOrder
);

storeOrderRouter.get("/", getAllOrders);
storeOrderRouter.get("/:id", getOrderById);

// UPDATE with optional document upload
// storeOrderRouter.put(
//   "/:id",
//   isLoggedIn,
//   upload.single("orderDocument"),
//   validate(storeOrderValidation.partial()),
//   updateOrder
// );

storeOrderRouter.delete("/:id", isLoggedIn, deleteOrder);

export default storeOrderRouter;
