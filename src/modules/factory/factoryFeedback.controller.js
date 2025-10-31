import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import {FactoryFeedback} from "../../models/factory/FactoryFeedback.model.js";
import Store from "../../models/store/Store.model.js";
import { factoryFeedbackValidation } from "../../shared/validators/factory.validation.js";
import  Factory  from "../../models/factory/Factory.model.js";

// 🟢 CREATE Feedback (store-admin only)
export const createFactoryFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // ✅ Only store-admin can create feedback
  if (req.user.userRole !== "store-admin") {
    throw new ApiError(403, "Only store-admins can give factory feedback.");
  }

  // ✅ Find store linked to this store-admin
  const store = await Store.findOne({ userID: userId });
  if (!store) {
    throw new ApiError(404, "Store not found for this store-admin user.");
  }

  // ✅ Validate incoming data
  const data = factoryFeedbackValidation.parse(req.body);

  // ✅ Check if the factory exists
  const factory = await Factory.findById(data.factoryId);
  if (!factory) {
    throw new ApiError(404, "Factory not found. Invalid factoryId provided.");
  }

  // ✅ Create feedback
  const feedback = await FactoryFeedback.create({
    factoryFeedback: data.factoryFeedback,
    factoryId: factory._id,
    storeId: store._id,
    userId: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Factory feedback created successfully"));
});


// 🟢 GET ALL Feedbacks (populate store & factory)
export const getAllFactoryFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await FactoryFeedback.find()
    .populate("userId", "userName userEmail")
    .populate("storeId", "storeName storeDescription")
    .populate("factoryId", "factoryName");

  return res
    .status(200)
    .json(new ApiResponse(200, feedbacks, "All factory feedbacks fetched successfully"));
});


// 🟢 GET SINGLE Feedback
export const getFactoryFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await FactoryFeedback.findById(req.params.id)
    .populate("userId", "userName userEmail")
    .populate("storeId", "storeName storeDescription")
    .populate("factoryId", "factoryName");

  if (!feedback) throw new ApiError(404, "Feedback not found");

  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "Factory feedback fetched successfully"));
});


// 🟢 UPDATE Feedback (only owner)
export const updateFactoryFeedback = asyncHandler(async (req, res) => {
  const feedback = await FactoryFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  if (feedback.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own feedback");
  }

  const data = factoryFeedbackValidation.partial().parse(req.body);

  const updatedFeedback = await FactoryFeedback.findByIdAndUpdate(
    req.params.id,
    data,
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedFeedback, "Feedback updated successfully"));
});


// 🟢 DELETE Feedback (only owner)
export const deleteFactoryFeedback = asyncHandler(async (req, res) => {
  const feedback = await FactoryFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  if (feedback.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own feedback");
  }

  await feedback.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Feedback deleted successfully"));
});
