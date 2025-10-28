
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import User from "../../models/User.model.js";
import StoreProduct from "../../models/store/StoreProduct.model.js";
import {StoreOrders} from "../../models/store/StoreOrder.model.js";
import { updateUserSchema } from "../../shared/validators/auth.validators.js";
import Store from "../../models/store/Store.model.js";
import { StoreFeedBack } from "../../models/store/StoreFeedback.model.js";

import { StoreProductCategory } from "../../models/store/StoreProductCategory.model.js";
import { StoreProductFeedback } from "../../models/store/StoreProductFeedback.model.js";
import { StoreProductReview } from "../../models/store/StoreProductReview.model.js";
import { StoreTransaction } from "../../models/store/StoreTransaction.model.js";

// 📍 Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  if (!users || users.length === 0) throw new ApiError(404, "No users found");

  const usersWithImages = await Promise.all(
    users.map(async (user) => {
      const userObj = user.toObject();
      if (userObj.profileImage) {
        try {
          userObj.profileImageUrl = await S3UploadHelper.getSignedUrl(userObj.profileImage);
        } catch {
          userObj.profileImageUrl = null;
        }
      }
      return userObj;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, usersWithImages, "Users retrieved successfully"));
});

// 📍 Create/Register user
export const createUser = asyncHandler(async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;
  if (!userName || !userEmail || !userPassword)
    throw new ApiError(400, "All fields are required");

  const existingUser = await User.findOne({ userEmail });
  if (existingUser) throw new ApiError(409, "User already exists");

  let uploadResult = null;
  if (req.file) {
    uploadResult = await S3UploadHelper.uploadFile(req.file, "user-profiles");
  }

  const user = await User.create({
    userName,
    userEmail,
    userPassword,
    profileImage: uploadResult ? uploadResult.key : undefined,
  });

  const userResponse = user.toObject();
  delete userResponse.userPassword;

  if (uploadResult) {
    userResponse.profileImageUrl = await S3UploadHelper.getSignedUrl(uploadResult.key);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, userResponse, "User created successfully"));
});

// 📍 Update user info

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Validate request body
  const parsedData = updateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    const errors = parsedData.error.errors.map(e => e.message);
    throw new ApiError(400, "Validation failed", errors);
  }

  const updates = parsedData.data; // Only validated fields

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});


// 📍 Update profile image
export const updateProfileImage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!req.file) throw new ApiError(400, "Profile image file is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Delete old image
  if (user.profileImage) {
    await S3UploadHelper.deleteFile(user.profileImage).catch(() => {});
  }

  const uploadResult = await S3UploadHelper.uploadFile(req.file, "user-profiles");
  user.profileImage = uploadResult.key;
  await user.save();

  const profileImageUrl = await S3UploadHelper.getSignedUrl(uploadResult.key);

  return res
    .status(200)
    .json(new ApiResponse(200, { profileImageUrl }, "Profile image updated successfully"));
});

// 📍 Delete profile image
export const deleteProfileImage = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.profileImage) throw new ApiError(400, "User does not have a profile image");

  await S3UploadHelper.deleteFile(user.profileImage);
  user.profileImage = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Profile image deleted successfully"));
});

// 📍 Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  const userObj = user.toObject();
  if (userObj.profileImage) {
    userObj.profileImageUrl = await S3UploadHelper.getSignedUrl(userObj.profileImage).catch(
      () => null
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userObj, "User profile retrieved successfully"));
});


import mongoose from "mongoose";

// 📍 Delete user and related data
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const objectId = new mongoose.Types.ObjectId(id); // ✅ convert to ObjectId

  // ✅ Check if user has any related data
  const hasData = await Promise.all([
  StoreProduct.exists({ userID: objectId }),                   // StoreProduct.userID
  StoreOrders.exists({ userId: id }),                           // StoreOrders.userId (string in your schema)
  Store.exists({ userID: objectId }),                           // Store.userID
  StoreFeedBack.exists({ userId: objectId }),              
  // StoreProductCategory.exists({ storeId: userStore._id }),  // Will handle after finding user's store
  StoreProductFeedback.exists({ userId: objectId }),           // StoreProductFeedback.userId
  StoreProductReview.exists({ userId: objectId }),             // StoreProductReview.userId
  // StoreTransaction.exists({ storeId: userStore._id.toString() }) // handle after finding user's store
]);
  const hasAnyData = hasData.some(Boolean);

  if (hasAnyData) {
    // 🧹 Delete all related records
    await Promise.all([
      StoreProduct.deleteMany({ createdBy: objectId }),
      StoreOrders.deleteMany({ user: objectId }),
      Store.deleteMany({ userID: objectId }),
      StoreFeedBack.deleteMany({ userID: objectId }),
      StoreProductCategory.deleteMany({ createdBy: objectId }),
      StoreProductFeedback.deleteMany({ userID: objectId }),
      StoreProductReview.deleteMany({ userID: objectId }),
      StoreTransaction.deleteMany({ userID: objectId }),
    ]);
  }

  // 🧑‍💻 Finally delete the user itself
  await User.findByIdAndDelete(objectId);

  return res.status(200).json(
    new ApiResponse(
      200,
      { relatedDataDeleted: hasAnyData },
      hasAnyData
        ? "User and related data deleted successfully"
        : "User deleted (no related data found)"
    )
  );
});
