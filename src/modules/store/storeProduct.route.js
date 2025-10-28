import express from "express";
import { upload } from "../../core/middleware/multer.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./storeProduct.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import { storeProductSchema, updateStoreProductSchema } from "../../shared/validators/store.validation.js";

const storeProductRouter = express.Router();

// Routes

// 📍 Create product (with optional productImage)
storeProductRouter.post("/create", isLoggedIn, authorizeRoles("store-admin"), upload.single("productImage"), validate(storeProductSchema), createProduct);

// 📍 Get all products
storeProductRouter.get("/getall", isLoggedIn, authorizeRoles("store-admin"), getAllProducts);

// 📍 Get single product by ID
storeProductRouter.get("/get/:id", isLoggedIn, authorizeRoles("store-admin"), getProductById);

// 📍 Update product (with optional new productImage)
storeProductRouter.put("/update/:id", isLoggedIn, authorizeRoles("store-admin"), upload.single("productImage"), validate(updateStoreProductSchema), updateProduct);

// 📍 Delete product
storeProductRouter.delete("/delete/:id", isLoggedIn, authorizeRoles("store-admin"), deleteProduct);

export default storeProductRouter;
