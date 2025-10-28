import { asyncHandler } from "../../core/utils/async-handler.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { StoreOrders } from "../../models/store/StoreOrder.model.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import { storeOrderValidation } from "../../shared/validators/store.validation.js";

// CREATE ORDER
export const createOrder = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const storeId = req.params.storeId;
  const userId = req.user._id;

  const data = storeOrderValidation.parse(req.body);
  data.storeId = storeId;
  data.userId = userId;

  // Attach product images from StoreProduct
  for (let p of data.products) {
    const product = await StoreProduct.findById(p.storeProductId);
    if (!product) throw new ApiError(404, `Product ${p.storeProductId} not found`);
    p.productImage = product.productImage || null;
  }

  // Verify totalAmount
  const calculatedTotal = data.products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  if (calculatedTotal !== data.totalAmount) {
    throw new ApiError(400, "Total amount mismatch");
  }

  const order = await StoreOrders.create(data);
  const orderObj = order.toObject();

  // Generate signed URLs
  for (let p of orderObj.products) {
    if (p.productImage) {
      p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
    }
  }

  return res.status(201).json(new ApiResponse(201, orderObj, "Order created successfully"));
});

// READ ALL ORDERS
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await StoreOrders.find();
  const ordersWithUrls = [];

  for (let order of orders) {
    const orderObj = order.toObject();
    for (let p of orderObj.products) {
      if (p.productImage) {
        p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
      }
    }
    ordersWithUrls.push(orderObj);
  }

  return res.status(200).json(new ApiResponse(200, ordersWithUrls, "All orders fetched successfully"));
});

// READ SINGLE ORDER
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await StoreOrders.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const orderObj = order.toObject();
  for (let p of orderObj.products) {
    if (p.productImage) {
      p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
    }
  }

  return res.status(200).json(new ApiResponse(200, orderObj, "Order fetched successfully"));
});

// UPDATE ORDER
// export const updateOrder = asyncHandler(async (req, res) => {
//   const data = storeOrderValidation.partial().parse(req.body);

//   // If products updated, reattach images and recalc total
//   if (data.products) {
//     for (let p of data.products) {
//       const product = await StoreProduct.findById(p.storeProductId);
//       if (!product) throw new ApiError(404, `Product ${p.storeProductId} not found`);
//       p.productImage = product.productImage || null;
//     }
//     data.totalAmount = data.products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
//   }

//   const updatedOrder = await StoreOrders.findByIdAndUpdate(req.params.id, data, { new: true });
//   if (!updatedOrder) throw new ApiError(404, "Order not found");

//   const orderObj = updatedOrder.toObject();
//   for (let p of orderObj.products) {
//     if (p.productImage) {
//       p.productImageUrl = await S3UploadHelper.getSignedUrl(p.productImage);
//     }
//   }

//   return res.status(200).json(new ApiResponse(200, orderObj, "Order updated successfully"));
// });

// DELETE ORDER
export const deleteOrder = asyncHandler(async (req, res) => {
  const deletedOrder = await StoreOrders.findByIdAndDelete(req.params.id);
  if (!deletedOrder) throw new ApiError(404, "Order not found");
  return res.status(200).json(new ApiResponse(200, {}, "Order deleted successfully"));
});