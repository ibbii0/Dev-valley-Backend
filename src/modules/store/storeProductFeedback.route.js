import Router from "express";
import { upload } from "../../core/middleware/multer.js";
import { validate } from "../../core/middleware/validate.js";
import { storeProductFeedbackValidation } from "../../shared/validators/store.validation.js";
import {
  createProductFeedback,
  getAllProductFeedback,
  getProductFeedbackById,
  updateProductFeedback,
  deleteProductFeedback,
} from "./storeProductFeedback.controller.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";

const router = Router();

router.post("/", isLoggedIn, upload.single("storeProductImage"), validate(storeProductFeedbackValidation), createProductFeedback);
router.get("/", isLoggedIn, getAllProductFeedback);
router.get("/:id", isLoggedIn, getProductFeedbackById);
router.put("/:id", isLoggedIn, upload.single("storeProductImage"), validate(storeProductFeedbackValidation.partial()), updateProductFeedback);
router.delete("/:id", isLoggedIn, deleteProductFeedback);

export default router;
