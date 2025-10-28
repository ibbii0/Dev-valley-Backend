
import express from "express";
import { upload } from "../../core/middleware/multer.js";
  import { isLoggedIn } from "../../core/middleware/isLoggedin.js"; 
  import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
   import { validate } from "../../core/middleware/validate.js"; 
   import { createStoreProductCategory, getAllStoreProductCategories, getStoreProductCategoryById, updateStoreProductCategory, deleteStoreProductCategory } from "./storeProductCategory.controller.js"; import { storeProductCategorySchema, updateStoreProductCategorySchema } from "../../shared/validators/store.validation.js";

const router = express.Router(); 

router.post("/create", isLoggedIn, authorizeRoles("store-admin"), upload.fields([{ name: "categoryLogo", maxCount: 1 }]), validate(storeProductCategorySchema), createStoreProductCategory); 
router.get("/getall", isLoggedIn, getAllStoreProductCategories); 
router.get("/get/:id", isLoggedIn, getStoreProductCategoryById); 
router.put("/update/:id", isLoggedIn, authorizeRoles("store-admin"), upload.fields([{ name: "categoryLogo", maxCount: 1 }]), validate(updateStoreProductCategorySchema), updateStoreProductCategory); 
router.delete("/delete/:id", isLoggedIn, authorizeRoles("store-admin"), deleteStoreProductCategory);

export default router;


