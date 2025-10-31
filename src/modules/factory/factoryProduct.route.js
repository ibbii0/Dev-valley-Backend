import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryProduct,
  getAllFactoryProducts,
  getFactoryProductById,
  updateFactoryProduct,
  deleteFactoryProduct,
} from "./factoryProduct.controller.js";
import { factoryProductSchema, updateFactoryProductSchema } from "../../shared/validators/factory.validation.js";

const router = express.Router();

// Routes
router.post("/create", isLoggedIn, authorizeRoles("factory-admin"), upload.single("factoryProductImage"), validate(factoryProductSchema), createFactoryProduct);
router.get("/getall", isLoggedIn, authorizeRoles("factory-admin"), getAllFactoryProducts);
router.get("/get/:id", isLoggedIn, authorizeRoles("factory-admin"), getFactoryProductById);
router.put("/update/:id", isLoggedIn, authorizeRoles("factory-admin"), upload.single("factoryProductImage"), validate(updateFactoryProductSchema), updateFactoryProduct);
router.delete("/delete/:id", isLoggedIn, authorizeRoles("factory-admin"), deleteFactoryProduct);

export default router;
