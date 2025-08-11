const express = require("express");
const userController = require("../controller/userController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");
const upload = require("../utils/Upload");
const router = express.Router();

router.post("/register", upload.single("image"), userController.register);
router.post("/login", userController.login);
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