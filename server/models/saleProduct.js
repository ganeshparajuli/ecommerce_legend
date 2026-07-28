"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SaleProduct extends Model {
    static associate(models) {
      SaleProduct.belongsTo(models.Sale, { foreignKey: "saleId" });
      SaleProduct.belongsTo(models.Product, { foreignKey: "productId" });
    }
  }

  SaleProduct.init(
    {
      saleId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "sales", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "SaleProduct",
      tableName: "sale_products",
      underscored: true,
      updatedAt: false,
    }
  );

  return SaleProduct;
};
