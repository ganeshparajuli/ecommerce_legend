"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const uuidPk = {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    };
    const timestamps = {
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    };
    const paranoidTimestamps = {
      ...timestamps,
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    };

    await queryInterface.createTable("brands", {
      id: uuidPk,
      name: { type: DataTypes.STRING(100), allowNull: false },
      image: DataTypes.STRING(255),
      slug: { type: DataTypes.STRING(100), unique: true },
      description: DataTypes.TEXT,
      featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      ...timestamps,
    });

    await queryInterface.createTable("categories", {
      id: uuidPk,
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: DataTypes.STRING(100),
      brand_id: {
        type: DataTypes.UUID,
        references: { model: "brands", key: "id" },
        onDelete: "SET NULL",
      },
      ...timestamps,
    });

    await queryInterface.createTable("category_series", {
      id: uuidPk,
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "categories", key: "id" },
        onDelete: "CASCADE",
      },
      series_name: { type: DataTypes.STRING(255), allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
      ...timestamps,
    });

    await queryInterface.createTable("users", {
      id: uuidPk,
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("user", "admin", "sub-admin", "sales", "finance"),
        allowNull: false,
        defaultValue: "user",
      },
      image: DataTypes.STRING(255),
      phone: DataTypes.STRING(20),
      address: DataTypes.STRING(255),
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
      ...timestamps,
    });

    await queryInterface.createTable("products", {
      id: uuidPk,
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), unique: true },
      brand_id: {
        type: DataTypes.UUID,
        references: { model: "brands", key: "id" },
        onDelete: "SET NULL",
      },
      category_id: {
        type: DataTypes.UUID,
        references: { model: "categories", key: "id" },
        onDelete: "SET NULL",
      },
      description: DataTypes.TEXT,
      product_details: DataTypes.TEXT,
      key_features: { type: DataTypes.JSONB, defaultValue: [] },
      specifications: { type: DataTypes.JSONB, defaultValue: {} },
      tags: { type: DataTypes.JSONB, defaultValue: [] },
      rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
      review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      availability: { type: DataTypes.STRING(50), defaultValue: "In Stock" },
      is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      sku: { type: DataTypes.STRING(50), unique: true },
      deleted_reason: DataTypes.TEXT,
      ...paranoidTimestamps,
    });

    await queryInterface.createTable("product_images", {
      id: uuidPk,
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      url: { type: DataTypes.STRING(500), allowNull: false },
      sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
      ...timestamps,
    });

    await queryInterface.createTable("product_variants", {
      id: uuidPk,
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      sku: { type: DataTypes.STRING(80), unique: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      compare_at_price: { type: DataTypes.DECIMAL(12, 2) },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      attributes: { type: DataTypes.JSONB, defaultValue: {} },
      is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_reason: DataTypes.TEXT,
      ...paranoidTimestamps,
    });

    await queryInterface.createTable("sales", {
      id: uuidPk,
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      discount_type: { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false, defaultValue: "percentage" },
      discount_value: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM("draft", "scheduled", "active", "ended"),
        allowNull: false,
        defaultValue: "draft",
      },
      ...timestamps,
    });

    await queryInterface.createTable("sale_products", {
      sale_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "sales", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("sale_gift_products", {
      id: uuidPk,
      sale_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sales", key: "id" },
        onDelete: "CASCADE",
      },
      gift_product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      gift_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      min_purchase_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      min_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      max_gifts_per_order: { type: DataTypes.INTEGER, defaultValue: 1 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("sale_product_gifts", {
      id: uuidPk,
      sale_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sales", key: "id" },
        onDelete: "CASCADE",
      },
      main_product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      gift_product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      gift_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      min_main_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      max_gifts_per_order: { type: DataTypes.INTEGER, defaultValue: 1 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("cart_items", {
      id: uuidPk,
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      product_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "CASCADE",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      selected: { type: DataTypes.BOOLEAN, defaultValue: true },
      sale_id: {
        type: DataTypes.UUID,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
      ...timestamps,
    });
    await queryInterface.addIndex("cart_items", ["user_id", "product_variant_id"], {
      unique: true,
      name: "cart_items_user_variant_unique",
    });

    await queryInterface.createTable("wishlists", {
      id: uuidPk,
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      added_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("wishlists", ["user_id", "product_id"], {
      unique: true,
      name: "wishlists_user_product_unique",
    });

    await queryInterface.createTable("orders", {
      id: uuidPk,
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "RESTRICT",
      },
      total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      shipping_address: { type: DataTypes.JSONB, allowNull: false },
      payment_method: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "cod" },
      status: {
        type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      promo_code: DataTypes.STRING(50),
      discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      sale_id: {
        type: DataTypes.UUID,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
      ...timestamps,
    });

    await queryInterface.createTable("order_items", {
      id: uuidPk,
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "RESTRICT",
      },
      product_variant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "RESTRICT",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      original_price: DataTypes.DECIMAL(12, 2),
      discount_applied: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      sale_id: {
        type: DataTypes.UUID,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("payments", {
      id: uuidPk,
      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      ...timestamps,
    });

    await queryInterface.createTable("reviews", {
      id: uuidPk,
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.UUID,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      reviewer_name: { type: DataTypes.STRING(100), allowNull: false },
      rating: { type: DataTypes.INTEGER, allowNull: false },
      comment: DataTypes.TEXT,
      ...timestamps,
    });

    await queryInterface.createTable("promocodes", {
      id: uuidPk,
      code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      description: DataTypes.TEXT,
      min_purchase: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      max_discount_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      valid_from: { type: DataTypes.DATE, allowNull: false },
      valid_until: { type: DataTypes.DATE, allowNull: false },
      max_uses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      ...timestamps,
    });

    await queryInterface.createTable("contacts", {
      id: uuidPk,
      name: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false },
      subject: { type: DataTypes.STRING(255), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      ...timestamps,
    });

    await queryInterface.createTable("faqs", {
      id: uuidPk,
      question: { type: DataTypes.STRING(255), allowNull: false },
      answer: { type: DataTypes.TEXT, allowNull: false },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      ...timestamps,
    });

    await queryInterface.createTable("newsletter_subscribers", {
      id: uuidPk,
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      name: DataTypes.STRING(255),
      status: { type: DataTypes.ENUM("active", "unsubscribed"), defaultValue: "active" },
      subscribed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });

    await queryInterface.createTable("notification_settings", {
      id: uuidPk,
      order_confirmation: { type: DataTypes.BOOLEAN, defaultValue: true },
      order_delivery: { type: DataTypes.BOOLEAN, defaultValue: true },
      low_stock_alert: { type: DataTypes.BOOLEAN, defaultValue: true },
      new_user_registration: { type: DataTypes.BOOLEAN, defaultValue: true },
      order_cancellation: { type: DataTypes.BOOLEAN, defaultValue: true },
      payment_confirmation: { type: DataTypes.BOOLEAN, defaultValue: true },
      newsletter_subscription: { type: DataTypes.BOOLEAN, defaultValue: false },
      promotional_emails: { type: DataTypes.BOOLEAN, defaultValue: false },
      sms_notifications: { type: DataTypes.BOOLEAN, defaultValue: false },
      email_notifications: { type: DataTypes.BOOLEAN, defaultValue: true },
      ...timestamps,
    });

    await queryInterface.createTable("services", {
      id: uuidPk,
      name: DataTypes.STRING(255),
      description: DataTypes.TEXT,
      price: DataTypes.DECIMAL(12, 2),
      image_url: DataTypes.STRING(500),
      ...timestamps,
    });

    await queryInterface.createTable("splash_screens", {
      id: uuidPk,
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      image_url: DataTypes.STRING(500),
      product_id: {
        type: DataTypes.UUID,
        references: { model: "products", key: "id" },
        onDelete: "SET NULL",
      },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      start_date: DataTypes.DATE,
      end_date: DataTypes.DATE,
      button_text: DataTypes.STRING(100),
      button_link: DataTypes.STRING(500),
      background_color: DataTypes.STRING(7),
      text_color: DataTypes.STRING(7),
      ...timestamps,
    });

    await queryInterface.createTable("store_settings", {
      id: uuidPk,
      store_name: { type: DataTypes.STRING(100), allowNull: false },
      store_email: { type: DataTypes.STRING(255), allowNull: false },
      store_phone: { type: DataTypes.STRING(20), allowNull: false },
      store_address: { type: DataTypes.TEXT, allowNull: false },
      logo: DataTypes.STRING(255),
      footer_logo: DataTypes.STRING(255),
      store_description: DataTypes.TEXT,
      website: DataTypes.STRING(255),
      social_media: { type: DataTypes.JSONB, defaultValue: {} },
      business_hours: { type: DataTypes.JSONB, defaultValue: {} },
      currency: { type: DataTypes.STRING(10), defaultValue: "NPR" },
      timezone: { type: DataTypes.STRING(50), defaultValue: "Asia/Kathmandu" },
      sub_store_locations: { type: DataTypes.JSONB, defaultValue: [] },
      ...timestamps,
    });
  },

  async down(queryInterface) {
    // Reverse FK dependency order.
    const tables = [
      "store_settings",
      "splash_screens",
      "services",
      "notification_settings",
      "newsletter_subscribers",
      "faqs",
      "contacts",
      "promocodes",
      "reviews",
      "payments",
      "order_items",
      "orders",
      "wishlists",
      "cart_items",
      "sale_product_gifts",
      "sale_gift_products",
      "sale_products",
      "sales",
      "product_variants",
      "product_images",
      "products",
      "users",
      "category_series",
      "categories",
      "brands",
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
    // Drop ENUM types Postgres created for us (Sequelize names them enum_<table>_<column>).
    const enums = [
      "enum_users_role",
      "enum_sales_discount_type",
      "enum_sales_status",
      "enum_orders_status",
      "enum_newsletter_subscribers_status",
    ];
    for (const enumName of enums) {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${enumName}";`);
    }
  },
};
