import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { FactoryProductReview } from "../../models/factory/FactoryProductReview.model.js";
import { FactoryProduct } from "../../models/factory/FactoryProduct.model.js";
import  Store  from "../../models/store/Store.model.js";

// ---------- CREATE REVIEW ----------
export const createFactoryProductReview = asyncHandler(async (req, res) => {
  const { factoryProductId, factoryProductRating } = req.body;

  // Find Store by user ID
  const store = await Store.findOne({ userID: req.user._id });
  if (!store) throw new ApiError(404, "Store not found for this user");

  // Get factoryId from FactoryProduct
  const product = await FactoryProduct.findById(factoryProductId);
  if (!product) throw new ApiError(404, "Factory Product not found");

  // Check if already reviewed
  const existing = await FactoryProductReview.findOne({
    factoryProductId,
    storeId: store._id,
  });
  if (existing) throw new ApiError(400, "You already reviewed this product");

  const review = await FactoryProductReview.create({
    factoryProductId,
    storeId: store._id,
    factoryId: product.factoryId,
    factoryProductRating,
  });

  return res.status(201).json(new ApiResponse(201, review, "Review created successfully"));
});

// ---------- GET ALL REVIEWS ----------
export const getAllFactoryProductReviews = asyncHandler(async (req, res) => {
  const reviews = await FactoryProductReview.find()
    .populate("factoryProductId", "factoryProductName")
    .populate("factoryId", "factoryName")
    .populate("storeId", "storeName");

  return res.status(200).json(new ApiResponse(200, reviews, "All reviews fetched successfully"));
});

// ---------- GET REVIEW BY ID ----------
export const getFactoryProductReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await FactoryProductReview.findById(id)
    .populate("factoryProductId", "factoryProductName")
    .populate("factoryId", "factoryName")
    .populate("storeId", "storeName");

  if (!review) throw new ApiError(404, "Review not found");

  return res.status(200).json(new ApiResponse(200, review, "Review fetched successfully"));
});

// ---------- UPDATE REVIEW ----------
export const updateFactoryProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { factoryProductRating } = req.body;
  const userId = req.user._id;

  const store = await Store.findOne({ userId });
  if (!store) throw new ApiError(404, "Store not found");

  const review = await FactoryProductReview.findOne({ _id: id, storeId: store._id });
  if (!review) throw new ApiError(404, "Review not found or not yours");

  review.factoryProductRating = factoryProductRating;
  await review.save();

  return res.status(200).json(new ApiResponse(200, review, "Review updated successfully"));
});

// ---------- DELETE REVIEW ----------
export const deleteFactoryProductReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const store = await Store.findOne({ userId });
  if (!store) throw new ApiError(404, "Store not found");

  const review = await FactoryProductReview.findOneAndDelete({ _id: id, storeId: store._id });
  if (!review) throw new ApiError(404, "Review not found or not yours");

  return res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});
