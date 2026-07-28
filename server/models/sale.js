"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    static associate(models) {
      Sale.belongsToMany(models.Product, {
        through: models.SaleProduct,
        foreignKey: "saleId",
        otherKey: "productId",
        as: "products",
      });
      Sale.hasMany(models.SaleGiftProduct, { foreignKey: "saleId", as: "saleGifts" });
      Sale.hasMany(models.SaleProductGift, { foreignKey: "saleId", as: "productGifts" });
    }
  }

  Sale.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
        defaultValue: "percentage",
      },
      discountValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        get: decimalGetter("discountValue"),
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM("draft", "scheduled", "active", "ended"),
        allowNull: false,
        defaultValue: "draft",
      },
    },
    {
      sequelize,
      modelName: "Sale",
      tableName: "sales",
      underscored: true,
    }
  );

  return Sale;
};
