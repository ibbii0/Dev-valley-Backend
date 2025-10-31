import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreProductReview } from "../../models/store/StoreProductReview.model.js";
import { storeProductReviewValidation } from "../../shared/validators/store.validation.js";

// CREATE REVIEW
export const createReview = asyncHandler(async (req, res) => {
  const data = storeProductReviewValidation.parse(req.body);

  const review = await StoreProductReview.create({
    ...data,
    userId: req.user._id, // from logged-in user
  });

  return res.status(201).json(new ApiResponse(201, review, "Review created successfully"));
});

// GET ALL REVIEWS
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await StoreProductReview.find()
    .populate("userId", "name email")    // optional: populate user info
    .populate("storeId", "name")         // optional: populate store info
    .populate("productId", "name price"); // optional: populate product info

  return res.status(200).json(new ApiResponse(200, reviews, "All reviews fetched successfully"));
});

// GET SINGLE REVIEW
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await StoreProductReview.findById(req.params.id)
    .populate("userId", "name email")
    .populate("storeId", "name")
    .populate("productId", "name price");

  if (!review) throw new ApiError(404, "Review not found");
  return res.status(200).json(new ApiResponse(200, review, "Review fetched successfully"));
});

// UPDATE REVIEW (only owner can update)
export const updateReview = asyncHandler(async (req, res) => {
  const data = storeProductReviewValidation.partial().parse(req.body);

  const updatedReview = await StoreProductReview.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id }, // ensure only owner can update
    data,
    { new: true }
  );

  if (!updatedReview) throw new ApiError(404, "Review not found or not authorized");
  return res.status(200).json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

// DELETE REVIEW (only owner can delete)
export const deleteReview = asyncHandler(async (req, res) => {
  const deletedReview = await StoreProductReview.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id // only owner can delete
  });

  if (!deletedReview) throw new ApiError(404, "Review not found or not authorized");
  return res.status(200).json(new ApiResponse(200, {}, "Review deleted successfully"));
});
