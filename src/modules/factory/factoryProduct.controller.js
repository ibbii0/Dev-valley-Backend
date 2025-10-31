import Factory from "../../models/factory/Factory.model.js";
import FactoryProduct from "../../models/factory/FactoryProduct.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

/* =============================
   ✅ CREATE PRODUCT
============================= */
export const createFactoryProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { factoryProductName, factoryProductDescription, factoryMinOrderUnits, factoryProductStatus,productCategoryId } = req.body;

  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new Error("Factory not found");

  let productImageKey = null;
  if (req.file) {
    const uploadResult = await S3UploadHelper.uploadFile(req.file, "factory-product-images");
    productImageKey = uploadResult.key;
  }

  const product = await FactoryProduct.create({
    factoryId: factory._id,
    factoryProductName,
    factoryProductDescription,
    factoryMinOrderUnits,
    factoryProductStatus: factoryProductStatus || "pending",
    factoryProductImage: productImageKey,
    productCategoryId,
  });

  const productObj = product.toObject();
  if (productObj.factoryProductImage) productObj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(productObj.factoryProductImage);

  res.status(201).json({ success: true, message: "Factory product created successfully", data: productObj });
});

/* =============================
   ✅ GET ALL PRODUCTS
============================= */
export const getAllFactoryProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new Error("Factory not found");

  const products = await FactoryProduct.find({ factoryId: factory._id }).sort({ createdAt: -1 });

  const productsWithUrls = await Promise.all(
    products.map(async (p) => {
      const obj = p.toObject();
      if (obj.factoryProductImage) obj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(obj.factoryProductImage);
      return obj;
    })
  );

  res.status(200).json({ success: true, count: products.length, data: productsWithUrls });
});

/* =============================
   ✅ GET SINGLE PRODUCT
============================= */
export const getFactoryProductById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new Error("Factory not found");

  const product = await FactoryProduct.findOne({ _id: id, factoryId: factory._id });
  if (!product) throw new Error("Product not found or not owned by this factory");

  const productObj = product.toObject();
  if (productObj.factoryProductImage) productObj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(productObj.factoryProductImage);

  res.status(200).json({ success: true, data: productObj });
});

/* =============================
   ✅ UPDATE PRODUCT
============================= */
export const updateFactoryProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new Error("Factory not found");

  const product = await FactoryProduct.findOne({ _id: id, factoryId: factory._id });
  if (!product) throw new Error("Product not found or not owned by this factory");

  const allowedFields = ["factoryProductName", "factoryProductDescription", "factoryMinOrderUnits", "factoryProductStatus"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.file) {
    if (product.factoryProductImage) await S3UploadHelper.deleteFile(product.factoryProductImage);
    const uploadResult = await S3UploadHelper.uploadFile(req.file, "factory-product-images");
    product.factoryProductImage = uploadResult.key;
  }

  await product.save();

  const productObj = product.toObject();
  if (productObj.factoryProductImage) productObj.factoryProductImageUrl = await S3UploadHelper.getSignedUrl(productObj.factoryProductImage);

  res.status(200).json({ success: true, message: "Factory product updated successfully", data: productObj });
});

/* =============================
   ✅ DELETE PRODUCT
============================= */
export const deleteFactoryProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const factory = await Factory.findOne({ userID: userId });
  if (!factory) throw new Error("Factory not found");

  const product = await FactoryProduct.findOne({ _id: id, factoryId: factory._id });
  if (!product) throw new Error("Product not found or not owned by this factory");

  if (product.factoryProductImage) await S3UploadHelper.deleteFile(product.factoryProductImage);

  await FactoryProduct.deleteOne({ _id: id });

  res.status(200).json({ success: true, message: "Factory product deleted successfully" });
});
