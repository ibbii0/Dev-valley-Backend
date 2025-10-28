import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import Factory from "../../models/factory/Factory.model.js";
import FactoryProduct from "../../models/factory/FactoryProduct.model.js";
import { FactoryProductFeedback } from "../../models/factory/FactoryProductFeedback.model.js";
import Store from "../../models/store/Store.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { factoryProductFeedbackValidation } from "../../shared/validators/factory.validation.js";

// 🟢 CREATE Factory Product Feedback (only store-admin)
export const createFactoryProductFeedback = asyncHandler(async (req, res) => {
  const user = req.user;

  // ✅ Only store-admin can give feedback
  if (user.userRole !== "store-admin") {
    throw new ApiError(403, "Only store-admins can create product feedback");
  }

  // ✅ Check store existence
  const store = await Store.findOne({ userID: user._id });
  if (!store) throw new ApiError(404, "Store not found for this store-admin");

  // ✅ Validate body
  const data = factoryProductFeedbackValidation.parse(req.body);

  // ✅ Check factory and product validity
  const factory = await Factory.findById(data.factoryId);
  if (!factory) throw new ApiError(404, "Factory not found");

  const product = await FactoryProduct.findOne({
    _id: data.factoryProductId,
    factoryId: data.factoryId,
  });
  if (!product) throw new ApiError(404, "Product not found for this factory");

  // 🖼️ Upload product feedback image (if provided)
  let uploadedKey = null;
  if (req.file) {
    const upload = await S3UploadHelper.uploadFile(req.file, "factory-feedbacks");
    uploadedKey = upload.key;
  }

  const feedback = await FactoryProductFeedback.create({
    factoryProductId: data.factoryProductId,
    storeId: store._id,
    factoryId: data.factoryId,
    description: data.description,
    factoryProductImage: uploadedKey,
  });

  const feedbackObj = feedback.toObject();
  if (feedbackObj.factoryProductImage)
    feedbackObj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(
      feedbackObj.factoryProductImage
    ).catch(() => null);

  return res
    .status(201)
    .json(new ApiResponse(201, feedbackObj, "Factory product feedback created successfully"));
});

// 🟢 GET ALL Factory Product Feedbacks
export const getAllFactoryProductFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await FactoryProductFeedback.find()
    .populate("factoryProductId", "factoryProductName factoryProductImage")
    .populate("factoryId", "factoryName")
    .populate("storeId", "storeName storeDescription");

  const withUrls = await Promise.all(
    feedbacks.map(async (f) => {
      const obj = f.toObject();
      if (obj.factoryProductImage)
        obj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(
          obj.factoryProductImage
        ).catch(() => null);
      return obj;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, withUrls, "All factory product feedbacks fetched successfully"));
});

// 🟢 GET SINGLE Factory Product Feedback
export const getFactoryProductFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await FactoryProductFeedback.findById(req.params.id)
    .populate("factoryProductId", "factoryProductName factoryProductImage")
    .populate("factoryId", "factoryName")
    .populate("storeId", "storeName storeDescription");

  if (!feedback) throw new ApiError(404, "Feedback not found");

  const obj = feedback.toObject();
  if (obj.factoryProductImage)
    obj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(
      obj.factoryProductImage
    ).catch(() => null);

  return res
    .status(200)
    .json(new ApiResponse(200, obj, "Factory product feedback fetched successfully"));
});

// 🟢 UPDATE Factory Product Feedback (only store owner)
export const updateFactoryProductFeedback = asyncHandler(async (req, res) => {
  const feedback = await FactoryProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  const store = await Store.findOne({ userID: req.user._id });
  if (!store || feedback.storeId.toString() !== store._id.toString()) {
    throw new ApiError(403, "You can only update your own feedback");
  }

  const data = factoryProductFeedbackValidation.partial().parse(req.body);

  let uploadedKey = feedback.factoryProductImage;
  if (req.file) {
    // delete old image first if exists
    if (feedback.factoryProductImage)
      await S3UploadHelper.deleteFile(feedback.factoryProductImage).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.file, "factory-feedbacks");
    uploadedKey = upload.key;
  }

  const updated = await FactoryProductFeedback.findByIdAndUpdate(
    req.params.id,
    { ...data, factoryProductImage: uploadedKey },
    { new: true }
  );

  const obj = updated.toObject();
  if (obj.factoryProductImage)
    obj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(
      obj.factoryProductImage
    ).catch(() => null);

  return res
    .status(200)
    .json(new ApiResponse(200, obj, "Factory product feedback updated successfully"));
});

// 🟢 DELETE Factory Product Feedback (only store owner)
export const deleteFactoryProductFeedback = asyncHandler(async (req, res) => {
  const feedback = await FactoryProductFeedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  const store = await Store.findOne({ userID: req.user._id });
  if (!store || feedback.storeId.toString() !== store._id.toString()) {
    throw new ApiError(403, "You can only delete your own feedback");
  }

  // delete image from S3 if exists
  if (feedback.factoryProductImage)
    await S3UploadHelper.deleteFile(feedback.factoryProductImage).catch(() => {});

  await feedback.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Factory product feedback deleted successfully"));
});
