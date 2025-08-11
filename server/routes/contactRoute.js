const express = require("express");
const router = express.Router();
const contactController = require("../controller/contactController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

router.post("/", contactController.createContact);
router.get(
  "/",
  isAuthenticated,
  authorizeRoles("admin","sub-admin", "sales"),
  contactController.getAllContacts
);
router.get(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin","sub-admin", "sales"),
  contactController.getContactById
);
router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin","sub-admin", "sales"),
  contactController.updateContact
);
router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin","sub-admin", "sales"),
  contactController.deleteContact
);

module.exports = router;
