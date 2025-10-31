import Store from "../../models/store/Store.model.js";
import User from "../../models/User.model.js";
import { StoreFeedBack } from "../../models/store/StoreFeedback.model.js";
import { StoreOrders } from "../../models/store/StoreOrder.model.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import { StoreTransaction } from "../../models/store/StoreTransaction.model.js";
import { StoreProductFeedback } from "../../models/store/StoreProductFeedback.model.js";
import { StoreProductReview } from "../../models/store/StoreProductReview.model.js";
import { StoreProductCategory } from "../../models/store/StoreProductCategory.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";

import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

// ---------- CREATE STORE ----------
export const createStore = asyncHandler(async (req, res) => {
  const {
    storeName,
    storeDescription,
    storeCategoryId,
    idCardNumber,
  } = req.body;

  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const existingStore = await Store.findOne({ userID: userId });
  if (existingStore) throw new ApiError(400, "User already owns a store");

  // 🖼️ Upload images if provided
  let storeLogoKey = null;
  let storeCoverKey = null;
  let idCardImageKey = null;

  if (req.files?.storeLogo?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.storeLogo[0], "store-logos");
    storeLogoKey = upload.key;
  }

  if (req.files?.storeCoverImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.storeCoverImage[0], "store-covers");
    storeCoverKey = upload.key;
  }

  if (req.files?.idCardImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.idCardImage[0], "id-cards");
    idCardImageKey = upload.key;
  }

  const newStore = await Store.create({
    userID: userId,
    storeName,
    storeLogo: storeLogoKey,
    storeCoverImage: storeCoverKey,
    storeDescription,
    storeCategoryId: storeCategoryId || null,
    idCardNumber,
    idCardImage: idCardImageKey,
  });

  // Signed URLs for display
  const storeObj = newStore.toObject();
  if (storeObj.storeLogo)
    storeObj.storeLogoUrl = await S3UploadHelper.getSignedUrl(storeObj.storeLogo);
  if (storeObj.storeCoverImage)
    storeObj.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(storeObj.storeCoverImage);
  if (storeObj.idCardImage)
    storeObj.idCardImageUrl = await S3UploadHelper.getSignedUrl(storeObj.idCardImage);

  return res
    .status(201)
    .json(new ApiResponse(201, storeObj, "Store created successfully"));
});

// ---------- GET STORE DETAILS ----------
export const getStoreDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const store = await Store.findOne({ userID: userId }).populate(
    "storeCategoryId",
    "categoryName categoryType"
  );

  if (!store) throw new ApiError(404, "User does not have a store");

  const storeObj = store.toObject();

  if (storeObj.storeLogo)
    storeObj.storeLogoUrl = await S3UploadHelper.getSignedUrl(storeObj.storeLogo).catch(() => null);
  if (storeObj.storeCoverImage)
    storeObj.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(storeObj.storeCoverImage).catch(() => null);
  if (storeObj.idCardImage)
    storeObj.idCardImageUrl = await S3UploadHelper.getSignedUrl(storeObj.idCardImage).catch(() => null);

  return res
    .status(200)
    .json(new ApiResponse(200, storeObj, "Store details retrieved successfully"));
});

// ---------- UPDATE STORE (Logo & Cover Only) ----------
export const updateStore = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new ApiError(404, "Store not found");

  // 🖼️ Update images if new files are uploaded
  if (req.files?.storeLogo?.[0]) {
    if (store.storeLogo) await S3UploadHelper.deleteFile(store.storeLogo).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.files.storeLogo[0], "store-logos");
    store.storeLogo = upload.key;
  }

  if (req.files?.storeCoverImage?.[0]) {
    if (store.storeCoverImage) await S3UploadHelper.deleteFile(store.storeCoverImage).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.files.storeCoverImage[0], "store-covers");
    store.storeCoverImage = upload.key;
  }

  const allowedFields = ["storeName", "storeDescription", "storeCategoryId"];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) store[field] = updates[field];
  });

  await store.save();

  const storeObj = store.toObject();
  if (storeObj.storeLogo)
    storeObj.storeLogoUrl = await S3UploadHelper.getSignedUrl(storeObj.storeLogo).catch(() => null);
  if (storeObj.storeCoverImage)
    storeObj.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(storeObj.storeCoverImage).catch(() => null);

  return res
    .status(200)
    .json(new ApiResponse(200, storeObj, "Store updated successfully"));
});

// ---------- DELETE STORE ----------
export const deleteStore = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1️⃣ Find the store owned by the user
  const store = await Store.findOne({ userID: userId });
  if (!store) throw new ApiError(404, "Store not found");

  const storeId = store._id;

  // 2️⃣ Delete store images from S3 if they exist
  if (store.storeLogo) await S3UploadHelper.deleteFile(store.storeLogo).catch(() => {});
  if (store.storeCoverImage) await S3UploadHelper.deleteFile(store.storeCoverImage).catch(() => {});
  if (store.idCardImage) await S3UploadHelper.deleteFile(store.idCardImage).catch(() => {});

  // 3️⃣ Delete all related documents using correct fields
  await Promise.all([
    StoreFeedBack.deleteMany({ storeId }),                   // store feedback linked by storeId
    StoreOrders.deleteMany({ storeId: storeId.toString() }), // orders storeId stored as string
    StoreProduct.deleteMany({ storeId }),                    // products linked by storeId
    StoreTransaction.deleteMany({ storeId: storeId.toString() }), // transactions storeId as string
    StoreProductFeedback.deleteMany({ storeId }),            // product feedback linked by storeId
    StoreProductReview.deleteMany({ storeId }),              // product reviews linked by storeId
    StoreProductCategory.deleteMany({ storeId })             // product categories linked by storeId
  ]);

  // 4️⃣ Delete the store itself
  await Store.deleteOne({ _id: storeId });

  // 5️⃣ Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Store and all associated data deleted successfully"));
});

// ---------- GET ALL STORES ----------
export const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find()
    .populate("storeCategoryId", "categoryName categoryType")
    .populate("userID", "fullName email");

  if (!stores || stores.length === 0) throw new ApiError(404, "No stores found");

  const storesWithUrls = await Promise.all(
    stores.map(async (store) => {
      const obj = store.toObject();
      if (obj.storeLogo)
        obj.storeLogoUrl = await S3UploadHelper.getSignedUrl(obj.storeLogo).catch(() => null);
      if (obj.storeCoverImage)
        obj.storeCoverImageUrl = await S3UploadHelper.getSignedUrl(obj.storeCoverImage).catch(() => null);
      return obj;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, storesWithUrls, "All stores retrieved successfully"));
});
