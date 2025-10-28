import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  // Check both possible tokens
  const accessToken =
    req.cookies.userAccessToken || req.cookies.adminAccessToken;

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized — no access token found");
  }

  try {
    // Verify JWT
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    // Attach user info to request
    req.user = decodedAccessToken;
    // Optional: also tag whether it's an admin or user token
    // req.userRole = req.cookies.adminAccessToken ? "admin" : "user";
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    throw new ApiError(401, "Invalid or expired token");
  }
});

export { isLoggedIn };
