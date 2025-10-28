import { asyncHandler } from "../../core/utils/async-handler.js";
import adminUser from "../../models/admin/Admin.model.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { mailTransporter } from "../../shared/helpers/mail.helper.js";
import crypto from "crypto";
import { storeAccessToken, storeLoginCookies } from "../../shared/helpers/cookies.helper.js";
import { adminVerificationMailBody, adminForgotPasswordMailBody } from "../../shared/constants/mail.constant.js";
import S3UploadHelper from "../../shared/helpers/s3Upload.js"; // ✅ for AWS image upload/delete

// ------------------- REGISTER ADMIN -------------------
const registerAdmin = asyncHandler(async (req, res) => {
    const { adminName, adminEmail, adminPassword, adminRole, phoneNumber, adminAddress } = req.body;

    const existingAdmin = await adminUser.findOne({ adminEmail });
    if (existingAdmin) throw new ApiError(400, "Admin already exists");

    // ✅ Upload profile image to S3 (if provided)
    let profileImageKey = null;
    if (req.file) {
        try {
            const uploadResult = await S3UploadHelper.uploadFile(req.file, "admin-profiles");
            profileImageKey = uploadResult.key;
        } catch (error) {
            console.error("Admin profile upload error:", error);
            throw new ApiError(500, "Profile image upload failed");
        }
    }

    const admin = await adminUser.create({
        adminName,
        adminEmail,
        adminPassword,
        adminRole,
        phoneNumber,
        adminAddress,
        ...(profileImageKey && { adminProfileImage: profileImageKey })
    });

    const { unHashedToken, hashedToken, tokenExpiry } = admin.generateTemporaryToken();
    admin.adminVerificationToken = hashedToken;
    admin.adminVerificationTokenExpiry = tokenExpiry;
    await admin.save();

    const verificationLink = `${process.env.BASE_URL}/api/v1/admin/verify/${unHashedToken}`;
    await mailTransporter.sendMail({
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: adminEmail,
        subject: "Verify your admin email",
        html: adminVerificationMailBody(adminName, verificationLink)
    });

    return res.status(201).json(
        new ApiResponse(201, {
            adminName,
            adminEmail,
            adminRole,
            phoneNumber,
            adminAddress,
            ...(profileImageKey && { adminProfileImage: profileImageKey })
        }, "Admin registered successfully")
    );
});

// ------------------- LOGIN ADMIN -------------------
const loginAdmin = asyncHandler(async (req, res) => {
    const { adminEmail, adminPassword } = req.body;
    const admin = await adminUser.findOne({ adminEmail });
    if (!admin) throw new ApiError(400, "Admin not found");

    const isPasswordCorrect = await admin.isPasswordCorrect(adminPassword);
    if (!isPasswordCorrect) throw new ApiError(400, "Invalid password");
    if (!admin.adminIsVerified) throw new ApiError(400, "Admin not verified");

    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    storeLoginCookies(res, accessToken, refreshToken, "admin");
    admin.refreshToken = refreshToken;
    await admin.save();

    return res.status(200).json(
        new ApiResponse(200, {
            admin: {
                adminName: admin.adminName,
                adminEmail: admin.adminEmail,
                adminRole: admin.adminRole,
                profileImage: admin.adminProfileImage || null
            },
            tokens: { accessToken, refreshToken }
        }, "Admin logged in successfully")
    );
});

// ------------------- LOGOUT ADMIN -------------------
const logoutAdmin = asyncHandler(async (req, res) => {
    const adminId = req.user?._id;
    if (!adminId) throw new ApiError(401, "Admin not authenticated");

    const admin = await adminUser.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    admin.refreshToken = null;
    await admin.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

// ------------------- VERIFY ADMIN EMAIL -------------------
const verifyAdminMail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) throw new ApiError(400, "Token not provided");

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await adminUser.findOne({
        adminVerificationToken: hashedToken,
        adminVerificationTokenExpiry: { $gt: Date.now() }
    });
    if (!admin) throw new ApiError(400, "Invalid or expired verification token");

    admin.adminIsVerified = true;
    admin.adminVerificationToken = null;
    admin.adminVerificationTokenExpiry = null;
    await admin.save();

    return res.status(200).json(new ApiResponse(200, {}, "Admin verified successfully"));
});

// ------------------- GET NEW ACCESS TOKEN -------------------
const getAdminAccessToken = asyncHandler(async (req, res) => {
    const { adminRefreshToken } = req.cookies;
    if (!adminRefreshToken) throw new ApiError(400, "Refresh token not found");

    const admin = await adminUser.findOne({ refreshToken: adminRefreshToken });
    if (!admin) throw new ApiError(400, "Invalid refresh token");

    const accessToken = admin.generateAccessToken();
    await storeAccessToken(res, accessToken, "admin");

    return res.status(201).json(
        new ApiResponse(201, { accessToken }, "Admin access token generated successfully")
    );
});

// ------------------- FORGOT PASSWORD -------------------
const forgotAdminPasswordMail = asyncHandler(async (req, res) => {
    const { adminEmail } = req.body;
    const admin = await adminUser.findOne({ adminEmail });
    if (!admin) throw new ApiError(400, "Admin not found");

    const { unHashedToken, hashedToken, tokenExpiry } = admin.generateTemporaryToken();
    admin.adminPasswordResetToken = hashedToken;
    admin.adminPasswordExpirationDate = tokenExpiry;
    await admin.save();

    const resetLink = `${process.env.BASE_URL}/api/v1/admin/reset-password/${unHashedToken}`;
    await mailTransporter.sendMail({
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: adminEmail,
        subject: "Reset your password",
        html: adminForgotPasswordMailBody(admin.adminName, resetLink)
    });

    return res.status(201).json(new ApiResponse(201, { resetLink }, "Password reset link sent successfully"));
});

// ------------------- RESET PASSWORD -------------------
const resetAdminPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { adminPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await adminUser.findOne({
        adminPasswordResetToken: hashedToken,
        adminPasswordExpirationDate: { $gt: Date.now() }
    });
    if (!admin) throw new ApiError(400, "Invalid or expired password reset token");

    admin.adminPassword = adminPassword;
    admin.adminPasswordResetToken = null;
    admin.adminPasswordExpirationDate = null;
    await admin.save();

    return res.status(201).json(new ApiResponse(201, {}, "Password reset successfully"));
});


// ✅ ------------------- UPDATE / DELETE PROFILE IMAGE -------------------
const updateAdminProfileImage = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    if (!req.file) throw new ApiError(400, "Profile image file is required");

    const admin = await adminUser.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");

    if (admin.adminProfileImage) {
        await S3UploadHelper.deleteFile(admin.adminProfileImage).catch(() => {});
    }

    const uploadResult = await S3UploadHelper.uploadFile(req.file, "admin-profiles");
    admin.adminProfileImage = uploadResult.key;
    await admin.save();

    const profileImageUrl = await S3UploadHelper.getSignedUrl(uploadResult.key);

    return res.status(200).json(
        new ApiResponse(200, { profileImageUrl }, "Admin profile image updated successfully")
    );
});

const deleteAdminProfileImage = asyncHandler(async (req, res) => {
    const { adminId } = req.params;

    const admin = await adminUser.findById(adminId);
    if (!admin) throw new ApiError(404, "Admin not found");
    if (!admin.adminProfileImage) throw new ApiError(400, "Admin does not have a profile image");

    await S3UploadHelper.deleteFile(admin.adminProfileImage);
    admin.adminProfileImage = null;
    await admin.save();

    return res.status(200).json(new ApiResponse(200, {}, "Admin profile image deleted successfully"));
});
// ------------------- GET ALL ADMINS -------------------
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await adminUser.find().select("-adminPassword -refreshToken");

  if (!admins || admins.length === 0)
    throw new ApiError(404, "No admins found");

  const adminsWithImages = await Promise.all(
    admins.map(async (admin) => {
      const adminObj = admin.toObject();
      if (adminObj.adminProfileImage) {
        try {
          adminObj.adminProfileImageUrl = await S3UploadHelper.getSignedUrl(adminObj.adminProfileImage);
        } catch {
          adminObj.adminProfileImageUrl = null;
        }
      }
      return adminObj;
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, adminsWithImages, "Admins retrieved successfully"));
});

// ------------------- GET ADMIN BY ID -------------------
const getAdminById = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const admin = await adminUser.findById(adminId).select("-adminPassword -refreshToken");
  if (!admin) throw new ApiError(404, "Admin not found");

  const adminObj = admin.toObject();
  if (adminObj.adminProfileImage) {
    try {
      adminObj.adminProfileImageUrl = await S3UploadHelper.getSignedUrl(adminObj.adminProfileImage);
    } catch {
      adminObj.adminProfileImageUrl = null;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, adminObj, "Admin retrieved successfully"));
});


/**
 * 🟠 UPDATE ADMIN PROFILE (no image upload)
 */
const updateAdminProfile = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const allowedFields = ["adminName", "phoneNumber", "adminAddress", "adminRole"];

  const admin = await adminUser.findById(adminId);
  if (!admin) throw new ApiError(404, "Admin not found");

  // Update only allowed text fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      admin[field] = req.body[field];
    }
  });

  await admin.save();

  const imageUrl = admin.adminProfileImage
    ? await S3UploadHelper.getSignedUrl(admin.adminProfileImage)
    : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        adminId: admin._id,
        adminName: admin.adminName,
        adminEmail: admin.adminEmail,
        adminRole: admin.adminRole,
        phoneNumber: admin.phoneNumber,
        adminAddress: admin.adminAddress,
        profileImageUrl: imageUrl,
      },
      "Admin profile updated successfully"
    )
  );
});

/**
 * 🔴 DELETE ADMIN PROFILE (account removal)
 */
const deleteAdminProfile = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const admin = await Admin.findById(adminId);
  if (!admin) throw new ApiError(404, "Admin not found");

  // If admin has a profile image in S3, delete it first
  if (admin.adminProfileImage) {
    await S3UploadHelper.deleteFile(admin.adminProfileImage);
  }

  await Admin.findByIdAndDelete(adminId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin profile deleted successfully"));
});

export { updateAdminProfile, deleteAdminProfile };

export {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    verifyAdminMail,
    getAdminAccessToken,
    forgotAdminPasswordMail,
    resetAdminPassword,
    updateAdminProfileImage,
    deleteAdminProfileImage,
    getAllAdmins,
    getAdminById
};
