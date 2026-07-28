"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" });
      Product.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" });
      Product.hasMany(models.ProductImage, {
        foreignKey: "productId",
        as: "images",
        onDelete: "CASCADE",
        hooks: true,
      });
      Product.hasMany(models.ProductVariant, {
        foreignKey: "productId",
        as: "variants",
        onDelete: "CASCADE",
        hooks: true,
      });
      Product.hasMany(models.Review, { foreignKey: "productId", as: "reviews" });
      Product.hasMany(models.OrderItem, { foreignKey: "productId", as: "orderItems" });
      Product.hasMany(models.CartItem, { foreignKey: "productId", as: "cartItems" });
      Product.belongsToMany(models.Sale, {
        through: models.SaleProduct,
        foreignKey: "productId",
        otherKey: "saleId",
        as: "sales",
      });
    }

    // Convenience accessor used by controllers when variants are eager-loaded.
    get priceRange() {
      const variants = this.variants || [];
      if (!variants.length) return null;
      const prices = variants.map((v) => v.price);
      return { min: Math.min(...prices), max: Math.max(...prices) };
    }

    get defaultVariant() {
      const variants = this.variants || [];
      return variants.find((v) => v.isDefault) || variants[0] || null;
    }
  }

  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), unique: true },
      brandId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "brands", key: "id" },
        onDelete: "SET NULL",
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "categories", key: "id" },
        onDelete: "SET NULL",
      },
      description: DataTypes.TEXT,
      productDetails: DataTypes.TEXT,
      keyFeatures: { type: DataTypes.JSONB, defaultValue: [] },
      specifications: { type: DataTypes.JSONB, defaultValue: {} },
      tags: { type: DataTypes.JSONB, defaultValue: [] },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0,
        get: decimalGetter("rating"),
      },
      reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
      availability: { type: DataTypes.STRING(50), defaultValue: "In Stock" },
      isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
      sku: { type: DataTypes.STRING(50), unique: true },
      deletedReason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
      paranoid: true,
    }
  );

  return Product;
};
