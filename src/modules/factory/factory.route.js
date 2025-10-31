import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import { createFactorySchema, updateFactorySchema } from "../../shared/validators/factory.validation.js";
import { createFactory, getFactoryDetails, updateFactory, deleteFactory, getAllFactories } from "./factory.controller.js";

const router = express.Router();

// Routes in single-line format
router.post("/createFactory", isLoggedIn, authorizeRoles("factory-admin"), upload.fields([{ name: "factoryLogo", maxCount: 1 }, { name: "factoryCoverImage", maxCount: 1 }, { name: "factoryLicenseImage", maxCount: 1 }]), validate(createFactorySchema), createFactory);
router.get("/getFactory", isLoggedIn, authorizeRoles("factory-admin"), getFactoryDetails);
router.put("/updateFactory", isLoggedIn, authorizeRoles("factory-admin"), upload.fields([{ name: "factoryLogo", maxCount: 1 }, { name: "factoryCoverImage", maxCount: 1 }, { name: "factoryLicenseImage", maxCount: 1 }]), validate(updateFactorySchema), updateFactory);
router.delete("/deleteFactory", isLoggedIn, authorizeRoles("factory-admin"), deleteFactory);
router.get("/getAllFactories", isLoggedIn, authorizeRoles("super-admin"), getAllFactories);

export default router;
