import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const adminUserSchema = new mongoose.Schema(
    {
        adminProfileImage: {
            type: String,
            default: 'https://placehold.co/600x400?text=User+Image',
        },
        adminName: {
            type: String,
            required: true,
            trim: true,
        },
        adminEmail: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        adminPassword: {
            type: String,
            required: true,
        },
        adminAddress: {
            type: String,
            default: null,
            trim: true,
        },
        adminIsVerified: {
            type: Boolean,
            default: false,
        },
        adminPasswordResetToken: {
            type: String,
            default: null,
        },
        adminPasswordExpirationDate: {
            type: Date,
            default: null,
        },
        adminVerificationToken: {
            type: String,
            default: null,
        },
        adminVerificationTokenExpiry: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String,
            default: null,
        },
        adminRole: {
            type: String,
            enum: ["super-admin", "admin-analyst", "admin-factory", "admin-store", "admin-buyer"],
            default: "super-admin",
        },
        phoneNumber: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

adminUserSchema.pre("save", function (next) {
    if (this.isModified("adminPassword")) {
        this.adminPassword = bcrypt.hashSync(this.adminPassword, 10)
    }
    next()
})

adminUserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.adminPassword);
};


adminUserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            adminEmail: this.adminEmail,
            adminName: this.adminName,
            adminRole: this.adminRole
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

adminUserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );
};

adminUserSchema.methods.generateTemporaryToken = function () {

    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + 30 * 60 * 1000; // 20 minutes;

    return { unHashedToken, hashedToken, tokenExpiry };
};


const adminUser = mongoose.model("adminUser", adminUserSchema);

export default adminUser;