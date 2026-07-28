"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      CartItem.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      CartItem.belongsTo(models.ProductVariant, { foreignKey: "productVariantId", as: "variant" });
      CartItem.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
    }
  }

  CartItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      productVariantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "product_variants", key: "id" },
        onDelete: "CASCADE",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
      selected: { type: DataTypes.BOOLEAN, defaultValue: true },
      saleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      underscored: true,
      indexes: [{ unique: true, fields: ["user_id", "product_variant_id"] }],
    }
  );

  return CartItem;
};
