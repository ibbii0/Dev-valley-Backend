import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
    {
        profileImage: {
            type: String,
            default: 'https://placehold.co/600x400?text=User+Image',
        },
        userName: {
            type: String,
            required: true,
            trim: true,
        },
        userEmail: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        userPassword: {
            type: String,
            required: true,
        },
        userAddress: {
            type: String,
            default: null,
            trim: true,
        },
        userIsVerified: {
            type: Boolean,
            default: false,
        },
        userPasswordResetToken: {
            type: String,
            default: null,
        },
        userPasswordExpirationDate: {
            type: Date,
            default: null,
        },
        userVerificationToken: {
            type: String,
            default: null,
        },
        userVerificationTokenExpiry: {
            type: Date,
            default: null
        },
        userRefreshToken: {
            type: String,
            default: null,
        },
        userRole: {
            type: String,
            enum: ["buyer", "store-admin", "factory-admin"],
            default: "buyer",
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

userSchema.pre("save", function (next) {
    if (this.isModified("userPassword")) {
        this.userPassword = bcrypt.hashSync(this.userPassword, 10)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.userPassword);
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            userEmail: this.userEmail,
            userName: this.userName,
            userRole: this.userRole
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );
};

userSchema.methods.generateTemporaryToken = function () {

    const unHashedToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    const tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes from now

    return { unHashedToken, hashedToken, tokenExpiry };
};


const User = mongoose.model("User", userSchema);

export default User;