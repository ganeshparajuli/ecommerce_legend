"use strict";
/**
 * One-off migration: reads the legacy MariaDB/MySQL data (loaded from joystore.sql into a
 * temporary MySQL instance - see .env.migration) and writes it into the new Postgres schema
 * via the Sequelize models. Preserves every existing primary key / foreign key exactly.
 *
 * Usage: node scripts/migrate-mysql-to-postgres.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
require("dotenv").config({ path: require("path").join(__dirname, "../.env.migration") });

const crypto = require("crypto");
const mysql = require("mysql2/promise");
const db = require("../models");

const summary = {}; // table -> { read, migrated, skipped, warnings: [] }
function report(table) {
  if (!summary[table]) summary[table] = { read: 0, migrated: 0, skipped: 0, warnings: [] };
  return summary[table];
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function shortId() {
  return crypto.randomBytes(4).toString("hex");
}

function safeJsonParse(value, fallback, expectArray = false) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    if (expectArray && !Array.isArray(parsed)) return fallback;
    if (!expectArray && (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function normalizeImagePaths(imageField) {
  const arr = safeJsonParse(imageField, [], true);
  return arr
    .filter((p) => typeof p === "string" && p.trim())
    .map((p) => p.replace(/^\/+/, ""));
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Selling price + a "compare at" price that is only kept if it's genuinely higher. */
function resolvePricing({ finalPrice, actualPrice, originalPrice }) {
  const price = toNumberOrNull(finalPrice) ?? toNumberOrNull(actualPrice) ?? 0;
  const candidates = [toNumberOrNull(originalPrice), toNumberOrNull(actualPrice)].filter(
    (v) => v !== null && v > price
  );
  const compareAtPrice = candidates.length ? Math.max(...candidates) : null;
  return { price, compareAtPrice };
}

async function main() {
  const mysqlConn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const sequelize = db.sequelize;
  await sequelize.authenticate();
  console.log("Connected to both MySQL (source) and Postgres (target).\n");

  async function fetch(table) {
    const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);
    report(table).read = rows.length;
    return rows;
  }

  // ---------- Brands ----------
  const brands = await fetch("brands");
  for (const b of brands) {
    await db.Brand.create({
      id: b.id,
      name: b.name,
      image: b.image,
      slug: b.slug,
      description: b.description,
      featured: !!b.featured,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    });
    report("brands").migrated++;
  }
  const brandByName = new Map(brands.map((b) => [b.name.trim().toLowerCase(), b.id]));

  // ---------- Categories ----------
  const categories = await fetch("categories");
  for (const c of categories) {
    await db.Category.create({
      id: c.id,
      name: c.name,
      slug: c.slug,
      brandId: c.brandId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
    report("categories").migrated++;
  }
  const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));

  // ---------- Category series ----------
  const series = await fetch("category_series");
  for (const s of series) {
    await db.CategorySeries.create({
      id: s.id,
      categoryId: s.category_id,
      seriesName: s.series_name,
      isActive: !!s.is_active,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    });
    report("category_series").migrated++;
  }

  // ---------- Users ----------
  const users = await fetch("users");
  for (const u of users) {
    await db.User.create({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      image: u.image,
      phone: u.phone,
      address: u.address,
      active: !!u.active,
      createdAt: u.created_at,
      updatedAt: u.created_at,
    });
    report("users").migrated++;
  }

  // ---------- Products (+ images + default variant) ----------
  const products = await fetch("products");
  const defaultVariantByProduct = new Map(); // productId -> variantId, used by cart/order items below
  let unmatchedBrand = 0;
  let unmatchedCategory = 0;

  for (const p of products) {
    const brandId = p.brand ? brandByName.get(p.brand.trim().toLowerCase()) || null : null;
    const categoryId = p.category ? categoryByName.get(p.category.trim().toLowerCase()) || null : null;
    if (p.brand && !brandId) unmatchedBrand++;
    if (p.category && !categoryId) unmatchedCategory++;

    const isDeleted = !!p.is_deleted;
    const product = await db.Product.create({
      id: p.id,
      name: p.name,
      slug: `${slugify(p.name)}-${p.id.slice(0, 8)}`,
      brandId,
      categoryId,
      description: p.description,
      productDetails: p.productDetails,
      keyFeatures: safeJsonParse(p.keyFeatures, [], true),
      specifications: safeJsonParse(p.specifications, {}, false),
      tags: safeJsonParse(p.tags, [], true),
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      availability: p.availability || "In Stock",
      isFeatured: !!p.featured,
      sku: p.sku || `PRD-${shortId().toUpperCase()}`,
      deletedReason: p.deleted_reason,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      deletedAt: isDeleted ? p.deleted_at || p.updated_at : null,
    });
    report("products").migrated++;

    // Images: old `image` column was a JSON-stringified array crammed into one TEXT field.
    const imagePaths = normalizeImagePaths(p.image);
    for (let i = 0; i < imagePaths.length; i++) {
      await db.ProductImage.create({
        productId: p.id,
        url: imagePaths[i],
        sortOrder: i,
        isPrimary: i === 0,
      });
      report("product_images").migrated++;
    }

    // Every legacy product row becomes exactly one default variant carrying its old
    // price/quantity/color - this is what makes "every product has >=1 variant" universally true.
    const { price, compareAtPrice } = resolvePricing({
      finalPrice: p.finalPrice,
      actualPrice: p.actualPrice,
      originalPrice: p.originalPrice,
    });
    const attributes = {};
    if (p.color && p.color !== "N-A") attributes.color = p.color;

    const defaultVariant = await db.ProductVariant.create({
      productId: p.id,
      sku: `${product.sku}-DEFAULT`,
      price,
      compareAtPrice,
      quantity: p.quantity || 0,
      attributes,
      isDefault: true,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      deletedAt: isDeleted ? p.deleted_at || p.updated_at : null,
    });
    defaultVariantByProduct.set(p.id, defaultVariant.id);
    report("product_variants").migrated++;
  }
  if (unmatchedBrand) report("products").warnings.push(`${unmatchedBrand} product(s) had a brand string with no matching Brand row - left brandId null`);
  if (unmatchedCategory) report("products").warnings.push(`${unmatchedCategory} product(s) had a category string with no matching Category row - left categoryId null`);

  // ---------- Legacy product_variants (2 stray rows) become additional variants ----------
  const legacyVariants = await fetch("product_variants");
  for (const v of legacyVariants) {
    const productExists = defaultVariantByProduct.has(v.product_id);
    if (!productExists) {
      report("product_variants").skipped++;
      report("product_variants").warnings.push(`variant ${v.id} references missing product ${v.product_id} - skipped`);
      continue;
    }
    const { price, compareAtPrice } = resolvePricing({
      finalPrice: v.finalPrice,
      actualPrice: v.actualPrice,
      originalPrice: v.originalPrice,
    });
    const attributes = {};
    if (v.storage) attributes.storage = v.storage;
    if (v.size) attributes.size = v.size;
    if (v.color) attributes.color = v.color;

    await db.ProductVariant.create({
      id: v.id,
      productId: v.product_id,
      sku: `LEGACY-${v.id.slice(0, 8).toUpperCase()}`,
      price,
      compareAtPrice,
      quantity: v.quantity || 0,
      attributes,
      isDefault: false,
      createdAt: v.created_at,
      updatedAt: v.updated_at,
      deletedAt: v.is_deleted ? v.deleted_at || v.updated_at : null,
    });
    report("product_variants").migrated++;
  }

  // ---------- Sales ----------
  const sales = await fetch("sales");
  for (const s of sales) {
    await db.Sale.create({
      id: s.id,
      name: s.name,
      description: s.description,
      discountType: s.discount_type,
      discountValue: s.discount_value,
      startDate: s.start_date,
      endDate: s.end_date,
      status: s.status,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    });
    report("sales").migrated++;
  }
  const validSaleIds = new Set(sales.map((s) => s.id));

  // ---------- Sale <-> Product joins ----------
  const saleProducts = await fetch("sale_products");
  for (const sp of saleProducts) {
    await db.SaleProduct.create({
      saleId: sp.sale_id,
      productId: sp.product_id,
      createdAt: sp.created_at,
    });
    report("sale_products").migrated++;
  }

  const saleGiftProducts = await fetch("sale_gift_products");
  for (const g of saleGiftProducts) {
    await db.SaleGiftProduct.create({
      id: g.id,
      saleId: g.sale_id,
      giftProductId: g.gift_product_id,
      giftQuantity: g.gift_quantity,
      minPurchaseAmount: g.min_purchase_amount,
      minQuantity: g.min_quantity,
      maxGiftsPerOrder: g.max_gifts_per_order,
      isActive: !!g.is_active,
      createdAt: g.created_at,
    });
    report("sale_gift_products").migrated++;
  }

  const saleProductGifts = await fetch("sale_product_gifts");
  for (const g of saleProductGifts) {
    await db.SaleProductGift.create({
      id: g.id,
      saleId: g.sale_id,
      mainProductId: g.main_product_id,
      giftProductId: g.gift_product_id,
      giftQuantity: g.gift_quantity,
      minMainQuantity: g.min_main_quantity,
      maxGiftsPerOrder: g.max_gifts_per_order,
      isActive: !!g.is_active,
      createdAt: g.created_at,
    });
    report("sale_product_gifts").migrated++;
  }

  // ---------- Cart items (resolve to each product's default variant) ----------
  const cartItems = await fetch("cart_items");
  for (const ci of cartItems) {
    const variantId = defaultVariantByProduct.get(ci.product_id);
    if (!variantId) {
      report("cart_items").skipped++;
      report("cart_items").warnings.push(`cart item ${ci.id} references missing product ${ci.product_id} - skipped`);
      continue;
    }
    await db.CartItem.create({
      id: ci.id,
      userId: ci.user_id,
      productId: ci.product_id,
      productVariantId: variantId,
      quantity: ci.quantity,
      selected: ci.selected === undefined ? true : !!ci.selected,
      saleId: ci.sale_id && validSaleIds.has(ci.sale_id) ? ci.sale_id : null,
      createdAt: ci.created_at,
      updatedAt: ci.updated_at,
    });
    report("cart_items").migrated++;
  }

  // ---------- Wishlists ----------
  const wishlists = await fetch("wishlists");
  for (const w of wishlists) {
    await db.Wishlist.create({
      id: w.id,
      userId: w.user_id,
      productId: w.product_id,
      addedAt: w.added_at,
    });
    report("wishlists").migrated++;
  }

  // ---------- Orders ----------
  const orders = await fetch("orders");
  for (const o of orders) {
    await db.Order.create({
      id: o.id,
      userId: o.user_id,
      totalAmount: o.total_amount,
      shippingAddress: safeJsonParse(o.shipping_address, {}, false),
      paymentMethod: o.payment_method,
      status: o.status,
      promoCode: o.promo_code,
      discountAmount: o.discount_amount || 0,
      saleId: o.sale_id && validSaleIds.has(o.sale_id) ? o.sale_id : null,
      createdAt: o.created_at,
      updatedAt: o.updated_at || o.created_at,
    });
    report("orders").migrated++;
  }

  // ---------- Order items (resolve to each product's default variant) ----------
  const orderItems = await fetch("order_items");
  for (const oi of orderItems) {
    const variantId = defaultVariantByProduct.get(oi.product_id);
    if (!variantId) {
      report("order_items").skipped++;
      report("order_items").warnings.push(`order item ${oi.id} references missing product ${oi.product_id} - skipped`);
      continue;
    }
    await db.OrderItem.create({
      id: oi.id,
      orderId: oi.order_id,
      productId: oi.product_id,
      productVariantId: variantId,
      quantity: oi.quantity,
      price: oi.price,
      originalPrice: oi.original_price,
      discountApplied: oi.discount_applied || 0,
      saleId: oi.sale_id && validSaleIds.has(oi.sale_id) ? oi.sale_id : null,
      createdAt: oi.created_at,
    });
    report("order_items").migrated++;
  }

  // ---------- Payments ----------
  const payments = await fetch("payments");
  for (const pay of payments) {
    await db.Payment.create({ id: pay.id, orderId: pay.order_id });
    report("payments").migrated++;
  }

  // ---------- Reviews (old schema had product_id as INT - never a valid FK to products.id) ----------
  const reviews = await fetch("reviews");
  const validProductIds = new Set(products.map((p) => p.id));
  for (const r of reviews) {
    if (!validProductIds.has(String(r.product_id))) {
      report("reviews").skipped++;
      report("reviews").warnings.push(`review ${r.id} has unresolvable legacy product_id ${r.product_id} - skipped`);
      continue;
    }
    await db.Review.create({
      productId: r.product_id,
      reviewerName: r.reviewer_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
    report("reviews").migrated++;
  }

  // ---------- Promo codes ----------
  const promos = await fetch("promocodes");
  for (const pc of promos) {
    await db.PromoCode.create({
      id: pc.id,
      code: pc.code,
      description: pc.description,
      minPurchase: pc.min_purchase,
      maxDiscountAmount: pc.max_discount_amount,
      validFrom: pc.valid_from,
      validUntil: pc.valid_until,
      maxUses: pc.max_uses,
      isActive: !!pc.is_active,
      createdAt: pc.created_at,
      updatedAt: pc.updated_at,
    });
    report("promocodes").migrated++;
  }

  // ---------- Contacts / FAQs / Newsletter / Notification settings ----------
  const contacts = await fetch("contacts");
  for (const c of contacts) {
    await db.Contact.create({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      subject: c.subject,
      message: c.message,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    });
    report("contacts").migrated++;
  }

  const faqs = await fetch("faqs");
  for (const f of faqs) {
    await db.Faq.create({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: f.order,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    });
    report("faqs").migrated++;
  }

  const subscribers = await fetch("newsletter_subscribers");
  for (const s of subscribers) {
    await db.NewsletterSubscriber.create({
      id: s.id,
      email: s.email,
      name: s.name,
      status: s.status,
      subscribedAt: s.subscribed_at,
    });
    report("newsletter_subscribers").migrated++;
  }

  const notifSettings = await fetch("notification_settings");
  for (const n of notifSettings) {
    await db.NotificationSettings.create({
      id: n.id,
      orderConfirmation: !!n.order_confirmation,
      orderDelivery: !!n.order_delivery,
      lowStockAlert: !!n.low_stock_alert,
      newUserRegistration: !!n.new_user_registration,
      orderCancellation: !!n.order_cancellation,
      paymentConfirmation: !!n.payment_confirmation,
      newsletterSubscription: !!n.newsletter_subscription,
      promotionalEmails: !!n.promotional_emails,
      smsNotifications: !!n.sms_notifications,
      emailNotifications: !!n.email_notifications,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    });
    report("notification_settings").migrated++;
  }

  // ---------- Services / Splash screens ----------
  const services = await fetch("services");
  for (const s of services) {
    await db.Service.create({
      name: s.name,
      description: s.description,
      price: s.price,
      imageUrl: s.image_url,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    });
    report("services").migrated++;
  }

  const splashScreens = await fetch("splash_screens");
  for (const s of splashScreens) {
    await db.SplashScreen.create({
      id: s.id,
      title: s.title,
      description: s.description,
      imageUrl: s.image_url,
      productId: s.product_id && validProductIds.has(s.product_id) ? s.product_id : null,
      isActive: !!s.is_active,
      displayOrder: s.display_order,
      startDate: s.start_date,
      endDate: s.end_date,
      buttonText: s.button_text,
      buttonLink: s.button_link,
      backgroundColor: s.background_color,
      textColor: s.text_color,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    });
    report("splash_screens").migrated++;
  }

  // ---------- Store settings ----------
  const storeSettingsRows = await fetch("store_settings");
  for (const s of storeSettingsRows) {
    const socialMedia = safeJsonParse(s.social_media, {}, false);
    const businessHours = safeJsonParse(s.business_hours, {}, false);
    if (s.social_media && Object.keys(socialMedia).length === 0) {
      report("store_settings").warnings.push("social_media was corrupted in source data - reset to {}");
    }
    if (s.business_hours && Object.keys(businessHours).length === 0) {
      report("store_settings").warnings.push("business_hours was corrupted in source data - reset to {}");
    }
    await db.StoreSettings.create({
      id: s.id,
      storeName: s.store_name,
      storeEmail: s.store_email,
      storePhone: s.store_phone,
      storeAddress: s.store_address,
      logo: s.logo,
      footerLogo: s.footer_logo,
      storeDescription: s.store_description,
      website: s.website,
      socialMedia,
      businessHours,
      currency: s.currency,
      timezone: s.timezone,
      subStoreLocations: safeJsonParse(s.sub_store_locations, [], true),
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    });
    report("store_settings").migrated++;
  }

  await mysqlConn.end();

  console.log("\n================ MIGRATION SUMMARY ================");
  for (const [table, stats] of Object.entries(summary)) {
    console.log(
      `${table.padEnd(24)} read=${String(stats.read).padEnd(5)} migrated=${String(stats.migrated).padEnd(5)} skipped=${stats.skipped}`
    );
    for (const w of stats.warnings) console.log(`   ! ${w}`);
  }
  console.log("=====================================================\n");
}

main()
  .then(() => {
    console.log("Migration finished.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration FAILED:", err);
    process.exit(1);
  });
