import Factory from "../../models/factory/Factory.model.js";
import User from "../../models/User.model.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import FactoryProduct from "../../models/factory/FactoryProduct.model.js";
import { FactoryProductCategory } from "../../models/factory/FactoryProductCategory.model.js";
import { FactoryProductReview } from "../../models/factory/FactoryProductReview.model.js";
import { FactoryProductFeedback } from "../../models/factory/FactoryProductFeedback.model.js";
import { FactoryFeedback } from "../../models/factory/FactoryFeedback.model.js";
import { FactoryOrder } from "../../models/factory/FactoryOrder.model.js";
import { FactoryTransaction } from "../../models/factory/FactoryTransaction.model.js";

// ---------- CREATE FACTORY ----------
export const createFactory = asyncHandler(async (req, res) => {
  const { factoryName, factoryDescription, factoryCategoryId, idCardNumber, factoryLicenseNumber } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const existingFactory = await Factory.findOne({ userID: userId });
  if (existingFactory) throw new ApiError(400, "User already owns a factory");

  // 🖼️ Upload images if provided
  let logoKey = null;
  let coverKey = null;
  let licenseImageKey = null;

  if (req.files?.factoryLogo?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLogo[0], "factory-logos");
    logoKey = upload.key;
  }

  if (req.files?.factoryCoverImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.factoryCoverImage[0], "factory-covers");
    coverKey = upload.key;
  }

  if (req.files?.factoryLicenseImage?.[0]) {
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLicenseImage[0], "factory-licenses");
    licenseImageKey = upload.key;
  }

  const newFactory = await Factory.create({
    userID: userId,
    factoryName,
    factoryDescription,
    factoryCategoryId: factoryCategoryId || null,
    idCardNumber,
    factoryLicenseNumber,
    factoryLogo: logoKey,
    factoryCoverImage: coverKey,
    factoryLicenseImage: licenseImageKey,
  });

  const factoryObj = newFactory.toObject();

  // Generate signed URLs
  if (factoryObj.factoryLogo) factoryObj.factoryLogoUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLogo);
  if (factoryObj.factoryCoverImage) factoryObj.factoryCoverImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryCoverImage);
  if (factoryObj.factoryLicenseImage) factoryObj.factoryLicenseImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLicenseImage);

  return res.status(201).json(new ApiResponse(201, factoryObj, "Factory created successfully"));
});

// ---------- GET FACTORY DETAILS ----------
export const getFactoryDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const factory = await Factory.findOne({ userID: userId }).populate("factoryCategoryId", "categoryName categoryType");

  if (!factory) throw new ApiError(404, "User does not have a factory");

  const factoryObj = factory.toObject();
  if (factoryObj.factoryLogo) factoryObj.factoryLogoUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLogo).catch(() => null);
  if (factoryObj.factoryCoverImage) factoryObj.factoryCoverImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryCoverImage).catch(() => null);
  if (factoryObj.factoryLicenseImage) factoryObj.factoryLicenseImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLicenseImage).catch(() => null);

  return res.status(200).json(new ApiResponse(200, factoryObj, "Factory details retrieved successfully"));
});

// ---------- UPDATE FACTORY ----------
export const updateFactory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new ApiError(404, "Factory not found");

  // 🖼️ Update images if new files are uploaded
  if (req.files?.factoryLogo?.[0]) {
    if (factory.factoryLogo) await S3UploadHelper.deleteFile(factory.factoryLogo).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLogo[0], "factory-logos");
    factory.factoryLogo = upload.key;
  }

  if (req.files?.factoryCoverImage?.[0]) {
    if (factory.factoryCoverImage) await S3UploadHelper.deleteFile(factory.factoryCoverImage).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.files.factoryCoverImage[0], "factory-covers");
    factory.factoryCoverImage = upload.key;
  }

  if (req.files?.factoryLicenseImage?.[0]) {
    if (factory.factoryLicenseImage) await S3UploadHelper.deleteFile(factory.factoryLicenseImage).catch(() => {});
    const upload = await S3UploadHelper.uploadFile(req.files.factoryLicenseImage[0], "factory-licenses");
    factory.factoryLicenseImage = upload.key;
  }

  const allowedFields = ["factoryName", "factoryDescription", "factoryCategoryId", "idCardNumber", "factoryLicenseNumber"];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) factory[field] = updates[field];
  });

  await factory.save();

  const factoryObj = factory.toObject();
  if (factoryObj.factoryLogo) factoryObj.factoryLogoUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLogo).catch(() => null);
  if (factoryObj.factoryCoverImage) factoryObj.factoryCoverImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryCoverImage).catch(() => null);
  if (factoryObj.factoryLicenseImage) factoryObj.factoryLicenseImageUrl = await S3UploadHelper.getSignedUrl(factoryObj.factoryLicenseImage).catch(() => null);

  return res.status(200).json(new ApiResponse(200, factoryObj, "Factory updated successfully"));
});

// ---------- DELETE FACTORY ----------
export const deleteFactory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1️⃣ Find factory owned by this user
  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new ApiError(404, "Factory not found");

  // 2️⃣ Delete associated images from S3 (if any)
  const imageFields = [
    factory.factoryLogo,
    factory.factoryCoverImage,
    factory.factoryLicenseImage,
  ];

  for (const image of imageFields) {
    if (image) {
      await S3UploadHelper.deleteFile(image).catch(() => {});
    }
  }

  // 3️⃣ Delete all associated records

  // Products
  const products = await FactoryProduct.find({ factoryId: factory._id });
  for (const product of products) {
    if (product.factoryProductImage) {
      await S3UploadHelper.deleteFile(product.factoryProductImage).catch(() => {});
    }
  }
  await FactoryProduct.deleteMany({ factoryId: factory._id });

  // Product Categories
  const categories = await FactoryProductCategory.find({ factoryId: factory._id });
  for (const cat of categories) {
    if (cat.factoryProductCategoryLogo) {
      await S3UploadHelper.deleteFile(cat.factoryProductCategoryLogo).catch(() => {});
    }
  }
  await FactoryProductCategory.deleteMany({ factoryId: factory._id });

  // Product Reviews & Feedback
  await FactoryProductReview.deleteMany({ factoryId: factory._id });
  await FactoryProductFeedback.deleteMany({ factoryId: factory._id });

  // Factory Feedback (given by stores)
  await FactoryFeedback.deleteMany({ factoryId: factory._id });

  // Orders
  await FactoryOrder.deleteMany({ "products.factoryId": factory._id });

  // Transactions
  await FactoryTransaction.deleteMany({ factoryId: factory._id.toString() });

  // 4️⃣ Finally, delete the factory itself
  await Factory.deleteOne({ _id: factory._id });

  // 5️⃣ Send success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Factory and all related data deleted successfully"));
});

// ---------- GET ALL FACTORIES ----------
export const getAllFactories = asyncHandler(async (req, res) => {
  const factories = await Factory.find().populate("factoryCategoryId", "categoryName categoryType").populate("userID", "fullName email");

  const factoriesWithUrls = await Promise.all(factories.map(async factory => {
    const obj = factory.toObject();
    if (obj.factoryLogo) obj.factoryLogoUrl = await S3UploadHelper.getSignedUrl(obj.factoryLogo).catch(() => null);
    if (obj.factoryCoverImage) obj.factoryCoverImageUrl = await S3UploadHelper.getSignedUrl(obj.factoryCoverImage).catch(() => null);
    if (obj.factoryLicenseImage) obj.factoryLicenseImageUrl = await S3UploadHelper.getSignedUrl(obj.factoryLicenseImage).catch(() => null);
    return obj;
  }));

  return res.status(200).json(new ApiResponse(200, factoriesWithUrls, "All factories retrieved successfully"));
});