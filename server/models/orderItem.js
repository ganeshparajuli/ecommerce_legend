"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "orderId", as: "order" });
      OrderItem.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: "productVariantId", as: "variant" });
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "orders", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "RESTRICT",
      },
      productVariantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "RESTRICT",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get: decimalGetter("price"),
      },
      originalPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        get: decimalGetter("originalPrice"),
      },
      discountApplied: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: decimalGetter("discountApplied"),
      },
      saleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "order_items",
      underscored: true,
      updatedAt: false,
    }
  );

  return OrderItem;
};
