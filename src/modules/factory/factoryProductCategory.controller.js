import { FactoryProductCategory } from "../../models/factory/FactoryProductCategory.model.js";
import Factory from "../../models/factory/Factory.model.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";

/* =============================
   ✅ CREATE FACTORY CATEGORY
============================= */
export const createFactoryProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { factoryProductCategoryName } = req.body;

    const factory = await Factory.findOne({ userID: userId });
    if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

    let factoryProductCategoryLogo = null;
    if (req.files?.factoryProductCategoryLogo?.[0]) {
      const uploaded = await S3UploadHelper.uploadFile(req.files.factoryProductCategoryLogo[0], "factory-category-logos");
      factoryProductCategoryLogo = uploaded.key;
    }

    const category = await FactoryProductCategory.create({
      factoryProductCategoryName,
      factoryProductCategoryLogo,
      factoryId: factory._id,
    });

    res.status(201).json({ success: true, message: "Factory category created successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET ALL FACTORY CATEGORIES
============================= */
export const getAllFactoryProductCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const factory = await Factory.findOne({ userID: userId });
    if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

    const categories = await FactoryProductCategory.find({ factoryId: factory._id });
    res.status(200).json({ success: true, message: "Categories fetched successfully", data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ GET SINGLE FACTORY CATEGORY
============================= */
export const getFactoryProductCategoryById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const factory = await Factory.findOne({ userID: userId });
    if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

    const category = await FactoryProductCategory.findOne({ _id: id, factoryId: factory._id });
    if (!category) return res.status(404).json({ success: false, message: "Category not found or not owned by you" });

    res.status(200).json({ success: true, message: "Category fetched successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ UPDATE FACTORY CATEGORY
============================= */
export const updateFactoryProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { factoryProductCategoryName } = req.body;

    const factory = await Factory.findOne({ userID: userId });
    if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

    const category = await FactoryProductCategory.findOne({ _id: id, factoryId: factory._id });
    if (!category) return res.status(403).json({ success: false, message: "You are not allowed to update this category" });

    let updates = { factoryProductCategoryName };
    if (req.files?.factoryProductCategoryLogo?.[0]) {
      const uploaded = await S3UploadHelper.uploadFile(req.files.factoryProductCategoryLogo[0], "factory-category-logos");
      updates.factoryProductCategoryLogo = uploaded.key;

      if (category.factoryProductCategoryLogo) await S3UploadHelper.deleteFile(category.factoryProductCategoryLogo);
    }

    const updatedCategory = await FactoryProductCategory.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

/* =============================
   ✅ DELETE FACTORY CATEGORY
============================= */
export const deleteFactoryProductCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const factory = await Factory.findOne({ userID: userId });
    if (!factory) return res.status(404).json({ success: false, message: "Factory not found" });

    const category = await FactoryProductCategory.findOneAndDelete({ _id: id, factoryId: factory._id });
    if (!category) return res.status(403).json({ success: false, message: "You are not allowed to delete this category" });

    if (category.factoryProductCategoryLogo) await S3UploadHelper.deleteFile(category.factoryProductCategoryLogo);

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};
