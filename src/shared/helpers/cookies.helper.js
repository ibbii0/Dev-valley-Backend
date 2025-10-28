// src/shared/helpers/cookies.helper.js
import { asyncHandler } from "../../core/utils/async-handler.js";

const storeLoginCookies =  (res, accessToken, refreshToken, role) => {
    // Sanitize the role name to avoid spaces or capital letters

    console.log(role);
    
    const normalizedRole = role?.toLowerCase();


    console.log("Hello world");
    
    // Dynamic cookie names
    const accessTokenName = `${normalizedRole}AccessToken`;
    const refreshTokenName = `${normalizedRole}RefreshToken`;


    res.cookie(accessTokenName, accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(refreshTokenName, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

const storeAccessToken = asyncHandler(async (res, accessToken, role = "user") => {
    const normalizedRole = role?.toLowerCase() || "user";
    const accessTokenName = `${normalizedRole}AccessToken`;

    res.cookie(accessTokenName, accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
});

export { storeLoginCookies, storeAccessToken };


