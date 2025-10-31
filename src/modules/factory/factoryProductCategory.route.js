import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import { createFactoryProductCategory, getAllFactoryProductCategories, getFactoryProductCategoryById, updateFactoryProductCategory, deleteFactoryProductCategory } from "./factoryProductCategory.controller.js";
import { factoryProductCategorySchema, updateFactoryProductCategorySchema } from "../../shared/validators/factory.validation.js";

const router = express.Router();

router.post("/create", isLoggedIn, authorizeRoles("factory-admin"), upload.fields([{ name: "factoryProductCategoryLogo", maxCount: 1 }]), validate(factoryProductCategorySchema), createFactoryProductCategory);
router.get("/getall", isLoggedIn, getAllFactoryProductCategories);
router.get("/get/:id", isLoggedIn, getFactoryProductCategoryById);
router.put("/update/:id", isLoggedIn, authorizeRoles("factory-admin"), upload.fields([{ name: "factoryProductCategoryLogo", maxCount: 1 }]), validate(updateFactoryProductCategorySchema), updateFactoryProductCategory);
router.delete("/delete/:id", isLoggedIn, authorizeRoles("factory-admin"), deleteFactoryProductCategory);

export default router;
