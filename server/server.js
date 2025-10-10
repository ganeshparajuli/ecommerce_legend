// Load required modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

// Routers
const brandRouter = require("./routes/brandRoute");
const userRouter = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const paymentRoutes = require("./routes/paymentRoute");
const categoryRoute = require("./routes/categoryRoute");
const contactRoute = require("./routes/contactRoute");
const faqRoute = require("./routes/faqRoute");
const wishlistRoute = require("./routes/wishlistRoute");
const splashRoute = require("./routes/splashRoute");
const promoRoute = require("./routes/promoRoute");
const saleRoute = require("./routes/saleRoute");
const reviewRoute = require("./routes/reviewRoute");
const servicesRoute = require("./routes/servicesRoute");
const newsletterRoute = require("./routes/newsletterRoute");
const storeSettingsRoute = require("./routes/storeSettingsRoute");
const notificationSettingsRoute = require("./routes/notificationSettingsRoute");

// Initialize Express app
const server = express();

// ✅ DEBUGGING MIDDLEWARE - Add this to track all requests
server.use((req, res, next) => {
  if (
    req.url.includes("/store-settings") ||
    req.url.includes("/api/store-settings")
  ) {
    console.log("\n🔍 === STORE SETTINGS REQUEST DEBUG ===");
    console.log("📍 URL:", req.url);
    console.log("🎯 Method:", req.method);
    console.log("📝 Headers:", req.headers);
    console.log("📦 Body keys:", Object.keys(req.body || {}));
    console.log("📁 Files:", req.files || "No files");
    console.log("==========================================\n");
  }
  next();
});

// Middleware
server.use(
  cors({
    origin: [
      "*",
      "http://localhost:5173",
      "http://localhost:5173",
      "https://186339b33b7c.ngrok-free.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Increase payload size limits for file uploads
server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ extended: true, limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("tiny"));

// ✅ Add request logging for debugging
server.use((req, res, next) => {
  if (req.method !== "GET" && req.url.includes("store-settings")) {
    console.log(
      `🚀 ${req.method} ${req.url} - Body size: ${
        JSON.stringify(req.body).length
      } chars`
    );
  }
  next();
});

// API Routes
server.use("/api/brand", brandRouter);
server.use("/api/user", userRouter);
server.use("/api/product", productRoute);
server.use("/api/cart", cartRoute);
server.use("/api/order", orderRoute);
server.use("/api/payments", paymentRoutes);
server.use("/api/category", categoryRoute);
server.use("/api/categorySeries", categorySeriesRoute);
server.use("/api/contact", contactRoute);
server.use("/api/faq", faqRoute);
server.use("/api/wishlist", wishlistRoute);
server.use("/api/splash", splashRoute);
server.use("/api/promo", promoRoute);
server.use("/api/sale", saleRoute);
server.use("/api/reviews", reviewRoute);
server.use("/api/services", servicesRoute);
server.use("/api/newsletters", newsletterRoute);

// ✅ Store settings route with extra debugging
console.log("📋 Registering store settings route at: /api/store-settings");
server.use("/api/store-settings", storeSettingsRoute);

server.use("/api/notification-settings", notificationSettingsRoute);

// ✅ Add a test endpoint to verify store settings route is working
server.get("/api/store-settings/test", (req, res) => {
  console.log("✅ Store settings test endpoint hit!");
  res.json({
    message: "Store settings route is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  });
});

// IMPORTANT: Static file middleware BEFORE catch-all route
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use("/", express.static(path.join(__dirname, "public")));

// Debug endpoint to check static files
server.get("/debug/static-files", (req, res) => {
  const uploadsPath = path.join(__dirname, "uploads");
  const fs = require("fs");
  res.json({
    uploadsDirectory: uploadsPath,
    directoryExists: fs.existsSync(uploadsPath),
    files: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : [],
    environment: process.env.NODE_ENV,
  });
});

// ✅ Add 404 handler for API routes
server.use("/api/*", (req, res, next) => {
  console.log(`❌ 404 - API route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "API route not found",
    method: req.method,
    url: req.url,
    availableRoutes: [
      "GET /api/store-settings",
      "PUT /api/store-settings",
      "GET /api/store-settings/test",
    ],
  });
});

// ✅ Global error handler
server.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:", error);
  if (req.url.includes("store-settings")) {
    console.error("💥 Store settings error:", error.message);
    console.error("📍 Stack:", error.stack);
  }
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    url: req.url,
    method: req.method,
  });
});

// Catch-all route AFTER static file middleware and API routes
server.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Clear the console
console.clear();

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(
    `✅ Server running in ${
      process.env.NODE_ENV || "production"
    } mode on port ${port}`
  );
  console.log(
    `🔗 Store settings test URL: http://localhost:${port}/api/store-settings/test`
  );
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
});
