
// routes/newsletterRoute.js
const express = require("express");
const router = express.Router();

console.log('🔧 Loading newsletter controller...');
const newsletterController = require("../controller/newsletterController");
console.log('✅ Newsletter controller loaded successfully');

const { authorizeRoles, isAuthenticated } = require("../middlewares/auth");

// Test routes for debugging
router.get('/test', (req, res) => {
  console.log('📧 Newsletter test route hit');
  res.json({ 
    success: true, 
    message: 'Newsletter routes working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/newsletters/test',
      'GET /api/newsletters/debug',
      'POST /api/newsletters/',
      'GET /api/newsletters/',
      'GET /api/newsletters/:id',
      'PUT /api/newsletters/:id',
      'DELETE /api/newsletters/:id'
    ]
  });
});

router.get('/debug', (req, res) => {
  console.log('📧 Newsletter debug route hit');
  res.json({
    success: true,
    message: 'Newsletter debug info',
    server: {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      headers: req.headers,
      timestamp: new Date().toISOString()
    }
  });
});

// Main subscription endpoint
router.post("/", (req, res, next) => {
  console.log('📧 POST /api/newsletters/ hit with body:', req.body);
  console.log('📧 Content-Type:', req.headers['content-type']);
  newsletterController.subscribe(req, res, next);
});

// Get all subscriptions (admin only)
router.get("/", isAuthenticated, authorizeRoles("admin","sub-admin","sales"), (req, res, next) => {
  console.log('📧 GET /api/newsletters/ hit (admin route)');
  newsletterController.getAllSubscriptions(req, res, next);
});

// Get subscription by ID (admin only) 
router.get("/:id", isAuthenticated, authorizeRoles("admin","sub-admin","sales"), (req, res, next) => {
  console.log('📧 GET /api/newsletters/:id hit with id:', req.params.id);
  newsletterController.getSubscriptionById(req, res, next);
});

// Update subscription (admin only)
router.put("/:id", isAuthenticated, authorizeRoles("admin"), (req, res, next) => {
  console.log('📧 PUT /api/newsletters/:id hit with id:', req.params.id, 'body:', req.body);
  newsletterController.updateSubscription(req, res, next);
});

// Delete subscription
router.delete("/:id", (req, res, next) => {
  console.log('📧 DELETE /api/newsletters/:id hit with id:', req.params.id);
  newsletterController.unsubscribe(req, res, next);
});

console.log('📧 Newsletter routes configured');
module.exports = router;