import Router from "express";
import { validate } from "../../core/middleware/validate.js";
import { storeProductReviewValidation } from "../../shared/validators/store.validation.js";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "./storeProductReview.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { is } from "zod/locales";
const storeProductReviewRouter = Router();

storeProductReviewRouter.post("/",isLoggedIn,authorizeRoles("buyer"), validate(storeProductReviewValidation), createReview);
storeProductReviewRouter.get("/",isLoggedIn,authorizeRoles("buyer","store-admin"), getAllReviews);
storeProductReviewRouter.get("/:id", isLoggedIn,authorizeRoles("buyer"), getReviewById);
storeProductReviewRouter.put("/:id",isLoggedIn, authorizeRoles("buyer"), validate(storeProductReviewValidation.partial()), updateReview);
storeProductReviewRouter.delete("/:id",isLoggedIn, authorizeRoles("buyer"), deleteReview);

export default storeProductReviewRouter;