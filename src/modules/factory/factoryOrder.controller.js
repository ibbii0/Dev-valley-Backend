import { FactoryOrder } from "../../models/factory/FactoryOrder.model.js";
import { FactoryProduct } from "../../models/factory/FactoryProduct.model.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { factoryOrderValidation } from "../../shared/validators/factory.validation.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import Store from "../../models/store/Store.model.js";
import crypto from "crypto";

// ✅ CREATE ORDER (storeId extracted from user)
export const createFactoryOrder = asyncHandler(async (req, res) => {
  // ✅ Validate request body
  const data = factoryOrderValidation.parse(req.body);
  const { shippingAddress, products } = data;

  // ✅ Get store for logged-in user
  const store = await Store.findOne({ userID: req.user._id });
  if (!store) throw new ApiError(404, "Store not found for this user");
  const storeId = store._id.toString();

  const orderProducts = [];

  // ✅ Loop through products (can be from different factories)
  for (const p of products) {
    const product = await FactoryProduct.findById(p.factoryProductId);
    if (!product)
      throw new ApiError(404, `Product ${p.factoryProductId} not found`);

    orderProducts.push({
      factoryId: product.factoryId, // dynamic factoryId
      factoryProductId: product._id,
      quantity: p.quantity,
      price: p.price,
      productImage: product.factoryProductImage || null,
    });
  }

  // ✅ Calculate total order amount
  const totalAmount = orderProducts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  // ✅ Generate unique order ID
  const orderId = `FO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // ✅ Create FactoryOrder
  const order = await FactoryOrder.create({
    storeId,
    products: orderProducts,
    shippingAddress,
    totalAmount,
    orderId,
  });

  // ✅ Convert product images to signed URLs
  const orderObj = order.toObject();
  for (const p of orderObj.products) {
    if (p.productImage)
      p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, orderObj, "Factory order created successfully"));
});


// ✅ GET ALL ORDERS
export const getAllFactoryOrders = asyncHandler(async (req, res) => {
  const orders = await FactoryOrder.find();

  const ordersWithUrls = [];
  for (let order of orders) {
    const orderObj = order.toObject();
    for (let p of orderObj.products) {
      if (p.productImage)
        p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
    }
    ordersWithUrls.push(orderObj);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ordersWithUrls, "All factory orders fetched successfully"));
});

// ✅ GET SINGLE ORDER
export const getFactoryOrderById = asyncHandler(async (req, res) => {
  const order = await FactoryOrder.findById(req.params.id);
  if (!order) throw new ApiError(404, "Factory order not found");

  const orderObj = order.toObject();
  for (let p of orderObj.products) {
    if (p.productImage)
      p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, orderObj, "Factory order fetched successfully"));
});

// ✅ DELETE ORDER
export const deleteFactoryOrder = asyncHandler(async (req, res) => {
  const deleted = await FactoryOrder.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Factory order not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Factory order deleted successfully"));
});
