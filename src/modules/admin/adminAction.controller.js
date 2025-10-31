import Store from "../../models/store/Store.model.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import Factory from "../../models/factory/Factory.model.js";
import FactoryProduct from "../../models/factory/FactoryProduct.model.js";
import AdminActions from "../../models/admin/adminAction.model.js";
import { asyncHandler } from "../../core/utils/async-handler.js";

// Helper to log admin actions
const logAdminAction = async ({ adminId, actionType, targetTable, targetId, notes }) => {
  await AdminActions.create({ adminId, actionType, targetTable, targetId, notes });
};

// ---------- STORE ACTIONS ----------
export const verifyStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.storeStatus = "live";
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store verified",
  });

  res.status(200).json({ success: true, message: "Store verified successfully" });
});

export const rejectStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.storeStatus = "rejected";
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store rejected",
  });

  res.status(200).json({ success: true, message: "Store rejected successfully" });
});

export const suspendStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.isSuspended = true;
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "SuspendStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store suspended",
  });

  res.status(200).json({ success: true, message: "Store suspended successfully" });
});

export const blockStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);
  if (!store) return res.status(404).json({ message: "Store not found" });

  store.isBlocked = true;
  await store.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "BlockStore",
    targetTable: "Store",
    targetId: store._id,
    notes: req.body.notes || "Store blocked",
  });

  res.status(200).json({ success: true, message: "Store blocked successfully" });
});

// ---------- PRODUCT ACTIONS ----------
export const verifyProduct = asyncHandler(async (req, res) => {
  const product = await StoreProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.productStatus = "live";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyProduct",
    targetTable: "StoreProduct",
    targetId: product._id,
    notes: req.body.notes || "Product verified",
  });

  res.status(200).json({ success: true, message: "Product verified successfully" });
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await StoreProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.productStatus = "rejected";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectProduct",
    targetTable: "StoreProduct",
    targetId: product._id,
    notes: req.body.notes || "Product rejected",
  });

  res.status(200).json({ success: true, message: "Product rejected successfully" });
});
// ---------- FACTORY ACTIONS ----------
export const verifyFactory = asyncHandler(async (req, res) => {
  const factory = await Factory.findById(req.params.id);
  if (!factory) return res.status(404).json({ message: "Factory not found" });

  factory.factoryStatus = "approved";
  await factory.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyFactory",
    targetTable: "Factory",
    targetId: factory._id,
    notes: req.body.notes || "Factory verified",
  });

  res.status(200).json({ success: true, message: "Factory verified successfully" });
});

export const rejectFactory = asyncHandler(async (req, res) => {
  const factory = await Factory.findById(req.params.id);
  if (!factory) return res.status(404).json({ message: "Factory not found" });

  factory.factoryStatus = "rejected";
  await factory.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectFactory",
    targetTable: "Factory",
    targetId: factory._id,
    notes: req.body.notes || "Factory rejected",
  });

  res.status(200).json({ success: true, message: "Factory rejected successfully" });
});

export const suspendFactory = asyncHandler(async (req, res) => {
  const factory = await Factory.findById(req.params.id);
  if (!factory) return res.status(404).json({ message: "Factory not found" });

  factory.factoryIsSuspended = true;
  await factory.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "SuspendFactory",
    targetTable: "Factory",
    targetId: factory._id,
    notes: req.body.notes || "Factory suspended",
  });

  res.status(200).json({ success: true, message: "Factory suspended successfully" });
});

export const blockFactory = asyncHandler(async (req, res) => {
  const factory = await Factory.findById(req.params.id);
  if (!factory) return res.status(404).json({ message: "Factory not found" });

  factory.factoryIsBlocked = true;
  await factory.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "BlockFactory",
    targetTable: "Factory",
    targetId: factory._id,
    notes: req.body.notes || "Factory blocked",
  });

  res.status(200).json({ success: true, message: "Factory blocked successfully" });
});

// ---------- FACTORY PRODUCT ACTIONS ----------
export const verifyFactoryProduct = asyncHandler(async (req, res) => {
  const product = await FactoryProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Factory product not found" });

  product.factoryProductStatus = "live";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "VerifyFactoryProduct",
    targetTable: "FactoryProduct",
    targetId: product._id,
    notes: req.body.notes || "Product verified",
  });

  res.status(200).json({ success: true, message: "Factory product verified successfully" });
});

export const rejectFactoryProduct = asyncHandler(async (req, res) => {
  const product = await FactoryProduct.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Factory product not found" });

  product.factoryProductStatus = "rejected";
  await product.save();

  await logAdminAction({
    adminId: req.user._id,
    actionType: "RejectFactoryProduct",
    targetTable: "FactoryProduct",
    targetId: product._id,
    notes: req.body.notes || "Product rejected",
  });

  res.status(200).json({ success: true, message: "Factory product rejected successfully" });
});