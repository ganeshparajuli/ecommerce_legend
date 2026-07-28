const express = require("express");
const rateLimit = require("express-rate-limit");
const userController = require("../controller/userController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");
const upload = require("../utils/Upload");
const router = express.Router();

// Stricter limiter on credential entry points to blunt brute-force/credential-stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later." },
});

router.post("/register", authLimiter, upload.single("image"), userController.register);
router.post("/login", authLimiter, userController.login);
router.get("/:id", isAuthenticated, userController.profile);

router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin","sub-admin","sales"),
  userController.getAllUsers
);

router.post(
  "/add",
  isAuthenticated,
  authorizeRoles("admin","sub-admin","sales"),
  upload.single("image"),
  userController.addUser
);

router.put("/:id", isAuthenticated, userController.updateProfile);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin","sub-admin","sales"),
  userController.deleteUser
);

router.put(
  "/update-image/:id",
  upload.single("image"),
  userController.updateImage
);

module.exports = router;