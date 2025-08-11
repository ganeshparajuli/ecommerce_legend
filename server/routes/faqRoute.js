const express = require("express");
const router = express.Router();
const faqController = require("../controller/faqController");
const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin", "sales"),
  faqController.createFAQ
);

router.get(
  "/",
  faqController.getAllFAQs
);

router.get(
  "/:id",
  faqController.getFAQById
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin", "sales"),
  faqController.updateFAQ
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("admin", "sales"),
  faqController.deleteFAQ
);

module.exports = router;