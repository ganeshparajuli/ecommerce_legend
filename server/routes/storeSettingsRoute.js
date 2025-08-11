const express = require("express");
const router = express.Router();
const storeSettingsController = require("../controller/storeSettingsController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const upload = require("../utils/Upload");

// ✅ DEBUGGING MIDDLEWARE - Add this to track middleware flow
const debugMiddleware = (name) => (req, res, next) => {
  console.log(`🔄 Middleware: ${name} - START`);
  console.log(`📍 Method: ${req.method}, URL: ${req.url}`);
  console.log(`👤 User: ${req.user ? req.user.id : 'No user'}`);
  console.log(`🍪 Cookies: ${Object.keys(req.cookies || {}).join(', ') || 'No cookies'}`);
  
  // Store original next function
  const originalNext = next;
  
  // Override next to log when middleware completes
  next = (error) => {
    if (error) {
      console.log(`❌ Middleware: ${name} - FAILED:`, error.message);
    } else {
      console.log(`✅ Middleware: ${name} - PASSED`);
    }
    originalNext(error);
  };
  
  next();
};

// ✅ ADD THIS IMMEDIATELY AFTER IMPORTS - BEFORE ANY OTHER ROUTES
router.options("*", (req, res) => {
  console.log('🎯 OPTIONS request received for:', req.url);
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// ✅ EXISTING STORE SETTINGS ROUTES (KEPT INTACT) - WITH DEBUGGING
router.get("/", 
  debugMiddleware("GET Store Settings"),
  storeSettingsController.getStoreSettings
);

// ✅ MAIN UPDATE ROUTE - ADD DEBUGGING TO EACH MIDDLEWARE
router.put(
  "/",
  debugMiddleware("PUT Store Settings - Start"),
  (req, res, next) => {
    console.log('\n🚀 === STORE SETTINGS UPDATE REQUEST ===');
    console.log('📦 Body keys:', Object.keys(req.body || {}));
    console.log('📁 Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('🍪 All cookies:', req.cookies);
    console.log('🔑 Authorization header:', req.headers.authorization || 'None');
    console.log('==========================================\n');
    next();
  },
  debugMiddleware("Before Authentication"),
  isAuthenticated,
  debugMiddleware("After Authentication"),
  authorizeRoles("admin", "sub-admin", "sales"),
  debugMiddleware("After Authorization"),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'footerLogo', maxCount: 1 }
  ]),
  debugMiddleware("After Upload Middleware"),
  (req, res, next) => {
    console.log('🎯 About to call controller with:');
    console.log('📦 Final req.body keys:', Object.keys(req.body || {}));
    console.log('📁 Final req.files:', req.files || 'No files');
    console.log('👤 Final req.user:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');
    next();
  },
  storeSettingsController.updateStoreSettings
);

// ✅ TEMPORARY BYPASS ROUTE - NO AUTHENTICATION (FOR TESTING ONLY)
router.put(
  "/test-no-auth",
  debugMiddleware("Test Route - No Auth"),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'footerLogo', maxCount: 1 }
  ]),
  debugMiddleware("Test Route - After Upload"),
  (req, res, next) => {
    console.log('🧪 TEST ROUTE - Direct to controller');
    console.log('📦 Body:', req.body);
    console.log('📁 Files:', req.files);
    next();
  },
  storeSettingsController.updateStoreSettings
);

router.patch(
  "/logo",
  debugMiddleware("PATCH Logo"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin", "sales"),
  upload.single("logo"),
  storeSettingsController.updateStoreLogo
);

router.patch(
  "/footer-logo",
  debugMiddleware("PATCH Footer Logo"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin", "sales"),
  upload.single("footerLogo"),
  storeSettingsController.updateFooterLogo
);

router.delete(
  "/logo",
  debugMiddleware("DELETE Logo"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin", "sales"),
  storeSettingsController.removeStoreLogo
);

router.delete(
  "/footer-logo",
  debugMiddleware("DELETE Footer Logo"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin", "sales"),
  storeSettingsController.removeFooterLogo
);

// ✅ NEW SUB-STORE LOCATIONS ROUTES
// Get all sub-store locations
router.get(
  "/locations",
  debugMiddleware("GET Locations"),
  storeSettingsController.getSubStoreLocations
);

// Get specific sub-store location by ID
router.get(
  "/locations/:locationId",
  debugMiddleware("GET Location by ID"),
  storeSettingsController.getSubStoreLocationById
);

// Add new sub-store location
router.post(
  "/locations",
  debugMiddleware("POST Location"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.addSubStoreLocation
);

// Update sub-store location
router.put(
  "/locations/:locationId",
  debugMiddleware("PUT Location"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.updateSubStoreLocation
);

// Delete sub-store location
router.delete(
  "/locations/:locationId",
  debugMiddleware("DELETE Location"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.deleteSubStoreLocation
);

// Toggle sub-store location status (active/inactive)
router.patch(
  "/locations/:locationId/toggle-status",
  debugMiddleware("PATCH Toggle Status"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.toggleSubStoreLocationStatus
);

// Bulk update sub-store locations
router.put(
  "/locations/bulk-update",
  debugMiddleware("PUT Bulk Update"),
  isAuthenticated,
  authorizeRoles("admin", "sub-admin"),
  storeSettingsController.bulkUpdateSubStoreLocations
);

module.exports = router;