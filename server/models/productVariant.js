"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      ProductVariant.hasMany(models.CartItem, { foreignKey: "productVariantId", as: "cartItems" });
      ProductVariant.hasMany(models.OrderItem, { foreignKey: "productVariantId", as: "orderItems" });
    }

    get discountPercentage() {
      if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
      return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
    }
  }

  ProductVariant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      sku: { type: DataTypes.STRING(80), unique: true },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get: decimalGetter("price"),
        validate: { min: 0 },
      },
      compareAtPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        get: decimalGetter("compareAtPrice"),
        validate: {
          min: 0,
          isAboveSellingPrice(value) {
            if (value !== null && value !== undefined && Number(value) < Number(this.price)) {
              throw new Error("compareAtPrice must be greater than or equal to price");
            }
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      attributes: { type: DataTypes.JSONB, defaultValue: {} },
      isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
      deletedReason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "product_variants",
      underscored: true,
      paranoid: true,
    }
  );

  return ProductVariant;
};
