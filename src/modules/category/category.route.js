import express from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeCategorySchema } from "../../shared/validators/category.validation.js";
import {
  createCategory,
  getAllCategories,
  getStoreCategories,
  getFactoryCategories, 
} from "./category.controller.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";

const categoryRouter = express.Router();

categoryRouter.post("/createCategory", isLoggedIn, authorizeRoles("super-admin"), validate(storeCategorySchema), createCategory);
categoryRouter.get("/getallcategories", isLoggedIn,getAllCategories);
categoryRouter.get("/storecategory", isLoggedIn,getStoreCategories);
categoryRouter.get("/factorycategory",isLoggedIn, getFactoryCategories);

export default categoryRouter;
