import { ApiError } from "../utils/api-error.js";

/**
 * authorizeRoles(...)
 * Checks if the logged-in user or admin has any of the allowed roles.
 * Usage:
 *   authorizeRoles("store-admin")
 *   authorizeRoles("factory-admin", "super-admin")
 *   authorizeRoles("user", "admin")
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized - Please log in first");
    }

    // Extract both possible role fields
    const userRole = req.user.userRole;
    const adminRole = req.user.adminRole;

    // Pick whichever role exists (userRole OR adminRole)
    const currentRole = userRole || adminRole;

    if (!currentRole) {
      throw new ApiError(403, "Access denied - No role assigned");
    }

    // Check if the current role is allowed
    if (!allowedRoles.includes(currentRole)) {
      throw new ApiError(
        403,
        `Access denied - Only [${allowedRoles.join(", ")}] can access this route`
      );
    }

    // Role is valid → continue
    next();
  };
};
export { authorizeRoles };
