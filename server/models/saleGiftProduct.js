"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class SaleGiftProduct extends Model {
    static associate(models) {
      SaleGiftProduct.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
      SaleGiftProduct.belongsTo(models.Product, { foreignKey: "giftProductId", as: "giftProduct" });
    }
  }

  SaleGiftProduct.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      saleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sales", key: "id" },
        onDelete: "CASCADE",
      },
      giftProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      giftQuantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      minPurchaseAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: decimalGetter("minPurchaseAmount"),
      },
      minQuantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      maxGiftsPerOrder: { type: DataTypes.INTEGER, defaultValue: 1 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "SaleGiftProduct",
      tableName: "sale_gift_products",
      underscored: true,
      updatedAt: false,
    }
  );

  return SaleGiftProduct;
};
