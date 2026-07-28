"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class PromoCode extends Model {
    static associate() {}
  }

  PromoCode.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      description: DataTypes.TEXT,
      minPurchase: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: decimalGetter("minPurchase"),
      },
      maxDiscountAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get: decimalGetter("maxDiscountAmount"),
      },
      validFrom: { type: DataTypes.DATE, allowNull: false },
      validUntil: { type: DataTypes.DATE, allowNull: false },
      maxUses: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "PromoCode",
      tableName: "promocodes",
      underscored: true,
    }
  );

  return PromoCode;
};
