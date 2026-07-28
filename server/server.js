require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

const validateEnv = require("./config/validateEnv");
validateEnv();

const { sequelize } = require("./models");
const errorHandler = require("./middlewares/errorHandler");

// Routers
const brandRouter = require("./routes/brandRoute");
const userRouter = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const productVariantRoute = require("./routes/productVariantRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const paymentRoutes = require("./routes/paymentRoute");
const categoryRoute = require("./routes/categoryRoute");
const categorySeriesRoute = require("./routes/categorySeriesRoute");
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

const server = express();

const allowedOrigins = [process.env.FRONTEND || "http://localhost:5173"];

// contentSecurityPolicy/crossOriginResourcePolicy are disabled because this
// server also serves the built SPA and /uploads images consumed cross-origin;
// the other helmet defaults (hsts, noSniff, frameguard, hidePoweredBy...) still apply.
server.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
server.use(compression());

server.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ extended: true, limit: "50mb" }));
server.use(cookieParser());
server.use(morgan("tiny"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
server.use("/api", apiLimiter);

server.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, status: "ok", uptime: process.uptime() });
  } catch (error) {
    res.status(503).json({ success: false, status: "db_unreachable" });
  }
});

// API Routes
server.use("/api/brand", brandRouter);
server.use("/api/user", userRouter);
server.use("/api/product", productRoute);
server.use("/api/productVariant", productVariantRoute);
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
server.use("/api/store-settings", storeSettingsRoute);
server.use("/api/notification-settings", notificationSettingsRoute);

// Static file serving (uploads must come before the SPA catch-all)
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.use("/", express.static(path.join(__dirname, "public")));

server.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// SPA catch-all - must come after API routes and static file middleware.
server.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.use(errorHandler);

const port = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log(`Connected to Postgres database "${sequelize.config.database}"`);
    server.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV || "production"} mode on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  });
