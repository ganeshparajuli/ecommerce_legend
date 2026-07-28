"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SaleProductGift extends Model {
    static associate(models) {
      SaleProductGift.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
      SaleProductGift.belongsTo(models.Product, { foreignKey: "mainProductId", as: "mainProduct" });
      SaleProductGift.belongsTo(models.Product, { foreignKey: "giftProductId", as: "giftProduct" });
    }
  }

  SaleProductGift.init(
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
      mainProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      giftProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      giftQuantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      minMainQuantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      maxGiftsPerOrder: { type: DataTypes.INTEGER, defaultValue: 1 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "SaleProductGift",
      tableName: "sale_product_gifts",
      underscored: true,
      updatedAt: false,
    }
  );

  return SaleProductGift;
};
