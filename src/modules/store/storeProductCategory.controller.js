import { StoreProductCategory } from "../../models/store/StoreProductCategory.model.js";
import Store from "../../models/store/Store.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";

/* =============================
   ✅ CREATE CATEGORY
============================= */
export const createStoreProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryName } = req.body;

    const store = await Store.findOne({ userID: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    let categoryLogo = null;
    if (req.files?.categoryLogo?.[0]) {
      const uploaded = await S3UploadHelper.uploadFile(req.files.categoryLogo[0], "category-logos");
      categoryLogo = uploaded.key;
    }

    const category = await StoreProductCategory.create({
      categoryName,
      categoryLogo,
      storeId: store._id,
    });

    res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET ALL CATEGORIES
============================= */
export const getAllStoreProductCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const store = await Store.findOne({ userID: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const categories = await StoreProductCategory.find({ storeId: store._id });
    res.status(200).json({ success: true, message: "Categories fetched successfully", data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET SINGLE CATEGORY
============================= */
export const getStoreProductCategoryById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const store = await Store.findOne({ userID: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const category = await StoreProductCategory.findOne({ _id: id, storeId: store._id });
    if (!category) return res.status(404).json({ success: false, message: "Category not found or not owned by you" });

    res.status(200).json({ success: true, message: "Category fetched successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ UPDATE CATEGORY
============================= */
export const updateStoreProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { categoryName } = req.body;

    const store = await Store.findOne({ userID: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const category = await StoreProductCategory.findOne({ _id: id, storeId: store._id });
    if (!category) return res.status(403).json({ success: false, message: "You are not allowed to update this category" });

    let updates = { categoryName };
    if (req.files?.categoryLogo?.[0]) {
      const uploaded = await S3UploadHelper.uploadFile(req.files.categoryLogo[0], "category-logos");
      updates.categoryLogo = uploaded.key;

      // Delete old logo from S3
      if (category.categoryLogo) await S3UploadHelper.deleteFile(category.categoryLogo);
    }

    const updatedCategory = await StoreProductCategory.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ DELETE CATEGORY
============================= */
export const deleteStoreProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const store = await Store.findOne({ userID: userId });
    if (!store) return res.status(404).json({ success: false, message: "Store not found" });

    const category = await StoreProductCategory.findOneAndDelete({ _id: id, storeId: store._id });
    if (!category) return res.status(403).json({ success: false, message: "You are not allowed to delete this category" });

    if (category.categoryLogo) await S3UploadHelper.deleteFile(category.categoryLogo);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

