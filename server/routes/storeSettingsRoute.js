const express = require("express");
const router = express.Router();
const storeSettingsController = require("../controller/storeSettingsController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const upload = require("../utils/Upload");

const STAFF = ["admin", "sub-admin", "sales"];

router.get("/", storeSettingsController.getStoreSettings);

router.put(
  "/",
  isAuthenticated,
  authorizeRoles(...STAFF),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
  ]),
  storeSettingsController.updateStoreSettings
);

router.patch("/logo", isAuthenticated, authorizeRoles(...STAFF), upload.single("logo"), storeSettingsController.updateStoreLogo);
router.patch("/footer-logo", isAuthenticated, authorizeRoles(...STAFF), upload.single("footerLogo"), storeSettingsController.updateFooterLogo);
router.delete("/logo", isAuthenticated, authorizeRoles(...STAFF), storeSettingsController.removeStoreLogo);
router.delete("/footer-logo", isAuthenticated, authorizeRoles(...STAFF), storeSettingsController.removeFooterLogo);

// Sub-store locations
router.get("/locations", storeSettingsController.getSubStoreLocations);
router.get("/locations/:locationId", storeSettingsController.getSubStoreLocationById);
router.post("/locations", isAuthenticated, authorizeRoles("admin", "sub-admin"), storeSettingsController.addSubStoreLocation);
router.put("/locations/bulk-update", isAuthenticated, authorizeRoles("admin", "sub-admin"), storeSettingsController.bulkUpdateSubStoreLocations);
router.put("/locations/:locationId", isAuthenticated, authorizeRoles("admin", "sub-admin"), storeSettingsController.updateSubStoreLocation);
router.delete("/locations/:locationId", isAuthenticated, authorizeRoles("admin", "sub-admin"), storeSettingsController.deleteSubStoreLocation);
router.patch(
  "/locations/:locationId/toggle-status",
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.toggleSubStoreLocationStatus
);

module.exports = router;
