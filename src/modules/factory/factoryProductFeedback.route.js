import express from "express";
import {
  createFactoryProductFeedback,
  getAllFactoryProductFeedbacks,
  getFactoryProductFeedbackById,
  updateFactoryProductFeedback,
  deleteFactoryProductFeedback,
} from "./factoryProductFeedback.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { upload } from "../../core/middleware/multer.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";

const router = express.Router();

router.post("/", isLoggedIn, authorizeRoles("store-admin"), upload.single("factoryProductImage"), createFactoryProductFeedback);
router.get("/", getAllFactoryProductFeedbacks);
router.get("/:id", getFactoryProductFeedbackById);
router.put("/:id", isLoggedIn, upload.single("factoryProductImage"), updateFactoryProductFeedback);
router.delete("/:id", isLoggedIn, deleteFactoryProductFeedback);

export default router;
