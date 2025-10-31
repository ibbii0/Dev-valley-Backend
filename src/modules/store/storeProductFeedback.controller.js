import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreProductFeedback } from "../../models/store/StoreProductFeedback.model.js";
import { storeProductFeedbackValidation } from "../../shared/validators/store.validation.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";

/* =============================
   ✅ CREATE FEEDBACK (BUYER ONLY)
============================= */
export const createProductFeedback = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  // Only buyers can create feedback
  if (req.user.userRole !== "buyer") throw new ApiError(403, "Only buyers can create feedback");

  // Validate user input
  const data = storeProductFeedbackValidation.parse(req.body);

  // Assign logged-in user
  data.userId = req.user._id;

  // Fetch product from DB to get storeId
  const product = await StoreProduct.findById(data.storeProductId);
  if (!product) throw new ApiError(404, "Product not found");

  data.storeId = product.storeId;

  // Handle optional image upload
  if (req.file) {
    const uploaded = await S3UploadHelper.uploadFile(req.file, "product-feedback-images");
    data.storeProductImage = uploaded.key;
  }

  const feedback = await StoreProductFeedback.create(data);
  const feedbackObj = feedback.toObject();

  // Generate signed URL for image
  if (feedbackObj.storeProductImage) {
    feedbackObj.storeProductImageUrl = await S3UploadHelper.getSignedUrl(feedbackObj.storeProductImage);
  }

  res.status(201).json(new ApiResponse(201, feedbackObj, "Product feedback created successfully"));
});

/* =============================
   ✅ GET ALL FEEDBACKS
============================= */
export const getAllProductFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await StoreProductFeedback.find();
  const feedbacksWithUrls = await Promise.all(
    feedbacks.map(async (f) => {
      const obj = f.toObject();
      if (obj.storeProductImage) obj.storeProductImageUrl = await S3UploadHelper.getSignedUrl(obj.storeProductImage);
      return obj;
    })
  );
  return res.status(200).json(new ApiResponse(200, feedbacksWithUrls, "All product feedbacks fetched successfully"));
});

/* =============================
   ✅ GET SINGLE FEEDBACK
============================= */
export const getProductFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await StoreProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Product feedback not found");

  const feedbackObj = feedback.toObject();
  if (feedbackObj.storeProductImage) feedbackObj.storeProductImageUrl = await S3UploadHelper.getSignedUrl(feedbackObj.storeProductImage);

  return res.status(200).json(new ApiResponse(200, feedbackObj, "Product feedback fetched successfully"));
});

/* =============================
   ✅ UPDATE FEEDBACK (OWNER ONLY)
============================= */
export const updateProductFeedback = asyncHandler(async (req, res) => {
  const feedback = await StoreProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Product feedback not found");

  // Only owner can update
  if (feedback.userId.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");

  const data = storeProductFeedbackValidation.partial().parse(req.body);

  // Handle optional image upload
  if (req.file) {
    if (feedback.storeProductImage) await S3UploadHelper.deleteFile(feedback.storeProductImage);
    const uploaded = await S3UploadHelper.uploadFile(req.file, "product-feedback-images");
    data.storeProductImage = uploaded.key;
  }

  const updatedFeedback = await StoreProductFeedback.findByIdAndUpdate(req.params.id, data, { new: true });
  const feedbackObj = updatedFeedback.toObject();
  if (feedbackObj.storeProductImage) feedbackObj.storeProductImageUrl = await S3UploadHelper.getSignedUrl(feedbackObj.storeProductImage);

  return res.status(200).json(new ApiResponse(200, feedbackObj, "Product feedback updated successfully"));
});

/* =============================
   ✅ DELETE FEEDBACK (OWNER ONLY)
============================= */
export const deleteProductFeedback = asyncHandler(async (req, res) => {
  const feedback = await StoreProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Product feedback not found");

  // Only owner can delete
  if (feedback.userId.toString() !== req.user._id.toString()) throw new ApiError(403, "Not authorized");

  if (feedback.storeProductImage) await S3UploadHelper.deleteFile(feedback.storeProductImage);
  await StoreProductFeedback.deleteOne({ _id: req.params.id });

  return res.status(200).json(new ApiResponse(200, {}, "Product feedback deleted successfully"));
});
