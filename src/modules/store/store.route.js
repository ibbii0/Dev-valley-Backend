import express from "express";
import { upload } from "../../core/middleware/multer.js";
import { isLoggedIn } from "../../core/middleware/isLoggedin.js";
import { authorizeRoles } from "../../core/middleware/authorizeRoles.js";
import { validate } from "../../core/middleware/validate.js";
import { createStoreSchema, updateStoreSchema } from "../../shared/validators/store.validation.js";
import { createStore, getStoreDetails, updateStore, deleteStore, getAllStores } from "./store.controller.js";

const router = express.Router();

// Routes
router.post("/createStore", isLoggedIn, authorizeRoles("store-admin"), upload.fields([
  { name: "storeLogo", maxCount: 1 },
  { name: "storeCoverImage", maxCount: 1 },
  { name: "idCardImage", maxCount: 1 },
]), validate(createStoreSchema), createStore);

router.get("/getStore", isLoggedIn, authorizeRoles("store-admin"), getStoreDetails);

router.put("/updateStore", isLoggedIn, authorizeRoles("store-admin"), upload.fields([
  { name: "storeLogo", maxCount: 1 },
  { name: "storeCoverImage", maxCount: 1 },
]), validate(updateStoreSchema), updateStore);

router.delete("/deleteStore", isLoggedIn, authorizeRoles("store-admin"), deleteStore);

router.get("/getAllStores", isLoggedIn, authorizeRoles("super-admin"), getAllStores);

export default router;
