
import express from "express";
import { upload } from "../../core/middleware/multer.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  updateProfileImage,
  deleteProfileImage,
  getUserProfile,
  deleteUser,
} from "../../modules/user/user.controller.js";

const router = express.Router();

// Routes

// 📍 Get all users
router.get("/all-users", getAllUsers);

// 📍 Create/Register new user
router.post("/", upload.single("profileImage"), createUser);

// 📍 Get single user profile
router.get("/:userId", getUserProfile);

// 📍 Update user info
router.put("/update/:id", updateUser);

// 📍 Update profile image
router.put("/:userId/profile-image", upload.single("profileImage"), updateProfileImage);

// 📍 Delete profile image
router.delete("/:userId/profile-image", deleteProfileImage);

// 📍 Delete user + related data
router.delete("/delete/:id", deleteUser);

export default router;
