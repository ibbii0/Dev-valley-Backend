
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { asyncHandler } from "../../core/utils/async-handler.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js";
import User from "../../models/User.model.js";
import { updateUserSchema } from "../../shared/validators/auth.validators.js";
import Store from "../../models/store/Store.model.js";
import { deleteStore } from "../store/store.controller.js";
import Factory from "../../models/factory/Factory.model.js";
import { deleteFactory } from "../factory/factory.controller.js";
import mongoose from "mongoose";
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
// 📍 Delete user + related data

export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.user._id; // 👈 use logged-in user’s ID
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const objectId = new mongoose.Types.ObjectId(id);

  switch (user.userRole) {
    case "buyer": {
      await User.findByIdAndDelete(objectId);
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Buyer deleted successfully"));
    }

    case "store-admin": {
      const store = await Store.findOne({ userID: objectId });
      if (store) {
        await deleteStore(
          { user: { _id: id } },
          { status: () => ({ json: () => {} }) }
        );
      }
      await User.findByIdAndDelete(objectId);
      return res.status(200).json(
        new ApiResponse(
          200,
          { storeDeleted: !!store },
          store
            ? "Store and Store-Admin deleted successfully"
            : "Store-Admin deleted (no store found)"
        )
      );
    }

    case "factory-admin": {
      const factory = await Factory.findOne({ userID: objectId });
      if (factory) {
        await deleteFactory(
          { user: { _id: id } },
          { status: () => ({ json: () => {} }) }
        );
      }
      await User.findByIdAndDelete(objectId);
      return res.status(200).json(
        new ApiResponse(
          200,
          { factoryDeleted: !!factory },
          factory
            ? "Factory and Factory-Admin deleted successfully"
            : "Factory-Admin deleted (no factory found)"
        )
      );
    }

    default:
      throw new ApiError(400, "Invalid user role");
  }
});