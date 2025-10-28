import express from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import {
  createFactoryProductReviewSchema,
  updateFactoryProductReviewSchema,
} from "../../shared/validators/factory.validation.js";
import {
  createFactoryProductReview,
  getAllFactoryProductReviews,
  getFactoryProductReviewById,
  updateFactoryProductReview,
  deleteFactoryProductReview,
} from "./factoryProductReview.controller.js";

const router = express.Router();

router.post(
  "/create",
  isLoggedIn,
  authorizeRoles("store-admin"),
  validate(createFactoryProductReviewSchema),
  createFactoryProductReview
);

router.get(
  "/all",
  isLoggedIn,
  authorizeRoles("super-admin", "factory-admin"),
  getAllFactoryProductReviews
);

router.get(
  "/:id",
  isLoggedIn,
  authorizeRoles("super-admin", "factory-admin", "store-admin"),
  getFactoryProductReviewById
);

router.put(
  "/update/:id",
  isLoggedIn,
  authorizeRoles("store-admin"),
  validate(updateFactoryProductReviewSchema),
  updateFactoryProductReview
);

router.delete(
  "/delete/:id",
  isLoggedIn,
  authorizeRoles("store-admin"),
  deleteFactoryProductReview
);

export default router;
