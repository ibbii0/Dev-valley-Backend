import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
import { ApiError } from "../../core/utils/api-error.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { userForgotPasswordMailBody, userVerificationMailBody } from "../../shared/constants/mail.constant.js";
import { mailTransporter } from "../../shared/helpers/mail.helper.js";
import { storeAccessToken, storeLoginCookies } from "../../shared/helpers/cookies.helper.js";
import crypto from "crypto";
import S3UploadHelper from "../../shared/helpers/s3Upload.js"; // ✅ Added import for AWS logic

const registerUser = asyncHandler(async (req, res) => {
    const { userName, userEmail, userPassword, userRole, phoneNumber, userAddress } = req.body;
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    // ✅ Handle profile image upload (if provided)
    let profileImageKey = null;
    if (req.file) {
        try {
            const uploadResult = await S3UploadHelper.uploadFile(req.file, "user-profiles");
            profileImageKey = uploadResult.key; // Store the S3 key for later retrieval
        } catch (error) {
            console.error("S3 Upload Error:", error);
            throw new ApiError(500, "Profile image upload failed");
        }
    }

    const user = await User.create({
        userName,
        userEmail,
        userPassword,
        userRole,
        phoneNumber,
        userAddress,
        ...(profileImageKey && { profileImage: profileImageKey }) // ✅ store S3 key if available
    });

    if (!user) {
        throw new ApiError(400, "User not Created");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.userVerificationToken = hashedToken;
    user.userVerificationTokenExpiry = tokenExpiry;
    await user.save();

    console.log("User created:", user);

    const userVerificationEmailLink = `${process.env.BASE_URL}/api/v1/auth/verify/${unHashedToken}`;

    await mailTransporter.sendMail({
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: userEmail,
        subject: "Verify your email",
        html: userVerificationMailBody(userName, userVerificationEmailLink),
    });

    const response = {
        userName: user.userName,
        userEmail: user.userEmail,
        userRole: user.userRole,
        phoneNumber: user.phoneNumber,
        userAddress: user.userAddress,
        ...(profileImageKey && { profileImage: profileImageKey })
    };

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                response,
                "User created successfully"
            )
        );
});

const logInUser = asyncHandler(async (req, res) => {
    const { userEmail, userPassword } = req.body;
    const user = await User.findOne({ userEmail });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(userPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }

    if (!user.userIsVerified) {
        throw new ApiError(400, "User not verified");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    storeLoginCookies(res, accessToken, refreshToken, "user");

    user.userRefreshToken = refreshToken;
    await user.save();

    const response = {
        user: {
            userName: user.userName,
            userEmail: user.userEmail,
            userRole: user.userRole,
            phoneNumber: user.phoneNumber,
            profileImage: user.profileImage || null
        },
        tokens: {
            accessToken,
            refreshToken
        }
    };

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                response,
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.userRefreshToken = null;
    await user.save();

    res.clearCookie("accessToken", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const verifyUserMail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    if (!token) {
        throw new ApiError(400, "Token not found");
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        userVerificationToken: hashedToken,
        userVerificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.userIsVerified = true;
    user.userVerificationToken = null;
    user.userVerificationTokenExpiry = null;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User verified successfully"));
});

const getAccessToken = asyncHandler(async (req, res) => {
    const { userRefreshToken } = req.cookies;
    if (!userRefreshToken) throw new ApiError(400, "Refresh token not found");

    const user = await User.findOne({ userRefreshToken });
    if (!user) throw new ApiError(400, "Invalid refresh token");

    const accessToken = await user.generateAccessToken();

    await storeAccessToken(res, accessToken, "user");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { accessToken },
                "User access token generated successfully"
            )
        );
});

const forgotPasswordMail = asyncHandler(async (req, res) => {
    const { userEmail } = req.body;

    const user = await User.findOne({ userEmail });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.userPasswordResetToken = hashedToken;
    user.userPasswordExpirationDate = tokenExpiry;
    await user.save();

    const userPasswordResetLink = `${process.env.BASE_URL}/api/v1/auth/reset-password/${unHashedToken}`;

    await mailTransporter.sendMail({
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: userEmail,
        subject: "Reset your password",
        html: userForgotPasswordMailBody(user.userName, userPasswordResetLink),
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { userPasswordResetLink },
                "Password reset link sent successfully"
            )
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { userPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        userPasswordResetToken: hashedToken,
        userPasswordExpirationDate: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    user.userPassword = userPassword;
    user.userPasswordResetToken = null;
    user.userPasswordExpirationDate = null;
    await user.save();

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Password reset successfully"));
});

export { registerUser, logInUser, logoutUser, verifyUserMail, getAccessToken, forgotPasswordMail, resetPassword };
