import Store from "../../models/store/Store.model.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import { StoreProductFeedback } from "../../models/store/StoreProductFeedback.model.js";
import { StoreProductReview } from "../../models/store/StoreProductReview.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

/* =============================
   ✅ CREATE PRODUCT
============================= */
export const createProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productName, productDescription, productCategoryId, price, stock } = req.body;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new Error("Store not found");

  let productImageKey = null;
  if (req.file) {
    const uploadResult = await S3UploadHelper.uploadFile(req.file, "product-images");
    productImageKey = uploadResult.key;
  }

  const product = await StoreProduct.create({
    storeId: store._id,
    productName,
    productDescription,
    productCategoryId: productCategoryId || null,
    price,
    stock,
    productImage: productImageKey,
  });

  const productObj = product.toObject();
  if (productObj.productImage) {
    productObj.productImageUrl = await S3UploadHelper.getSignedUrl(productObj.productImage);
  }

  res.status(201).json({ success: true, message: "Product created successfully", data: productObj });
});

/* =============================
   ✅ GET ALL PRODUCTS
============================= */
export const getAllProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const store = await Store.findOne({ userID: userId });
  if (!store) throw new Error("Store not found");

  const products = await StoreProduct.find({ storeId: store._id })
    .populate("productCategoryId", "categoryName")
    .sort({ createdAt: -1 });

  const productsWithUrls = await Promise.all(
    products.map(async (p) => {
      const obj = p.toObject();
      if (obj.productImage) obj.productImageUrl = await S3UploadHelper.getSignedUrl(obj.productImage);
      return obj;
    })
  );

  res.status(200).json({ success: true, count: products.length, data: productsWithUrls });
});

/* =============================
   ✅ GET SINGLE PRODUCT
============================= */
export const getProductById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new Error("Store not found");

  const product = await StoreProduct.findOne({ _id: id, storeId: store._id })
    .populate("productCategoryId", "categoryName");

  if (!product) throw new Error("Product not found or not owned by your store");

  const productObj = product.toObject();
  if (productObj.productImage) productObj.productImageUrl = await S3UploadHelper.getSignedUrl(productObj.productImage);

  res.status(200).json({ success: true, data: productObj });
});

/* =============================
   ✅ UPDATE PRODUCT
============================= */
export const updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new Error("Store not found");

  const product = await StoreProduct.findOne({ _id: id, storeId: store._id });
  if (!product) throw new Error("Product not found or not owned by this store");

  // Only allow these fields to be updated
  const allowedFields = ["productName", "productDescription", "productCategoryId", "price", "stock", "productStatus"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  // Handle product image upload
  if (req.file) {
    if (product.productImage) await S3UploadHelper.deleteFile(product.productImage);
    const uploadResult = await S3UploadHelper.uploadFile(req.file, "product-images");
    product.productImage = uploadResult.key;
  }

  await product.save();

  const productObj = product.toObject();
  if (productObj.productImage) productObj.productImageUrl = await S3UploadHelper.getSignedUrl(product.productImage);

  res.status(200).json({ success: true, message: "Product updated successfully", data: productObj });
});

/* =============================
   ✅ DELETE PRODUCT
============================= */
export const deleteProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const store = await Store.findOne({ userID: userId });
  if (!store) throw new Error("Store not found");

  const product = await StoreProduct.findOne({ _id: id, storeId: store._id });
  if (!product) throw new Error("Product not found or not owned by this store");

  if (product.productImage) await S3UploadHelper.deleteFile(product.productImage);

  await Promise.all([
    StoreProductFeedback.deleteMany({ _id: product.productFeedBackId }),
    StoreProductReview.deleteMany({ _id: product.productReviewId }),
  ]);

  await StoreProduct.deleteOne({ _id: id });

  res.status(200).json({ success: true, message: "Product and related data deleted successfully" });
});
