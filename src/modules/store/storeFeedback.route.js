import Router from "express";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { validate } from "../../core/middleware/validate.js";
import { storeFeedbackValidation } from "../../shared/validators/store.validation.js";
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from "./storeFeedback.controller.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
const storeFeedbackRouter = Router();

storeFeedbackRouter.post("/",isLoggedIn,authorizeRoles("buyer"),validate(storeFeedbackValidation),createFeedback);
storeFeedbackRouter.get("/", getAllFeedbacks);
storeFeedbackRouter.get("/:id", getFeedbackById);
storeFeedbackRouter.put("/:id", validate(storeFeedbackValidation.partial()), updateFeedback);
storeFeedbackRouter.delete("/:id", deleteFeedback);

export default storeFeedbackRouter;
