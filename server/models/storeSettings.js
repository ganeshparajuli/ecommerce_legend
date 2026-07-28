"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StoreSettings extends Model {
    static associate() {}
  }

  StoreSettings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      storeName: { type: DataTypes.STRING(100), allowNull: false },
      storeEmail: { type: DataTypes.STRING(255), allowNull: false },
      storePhone: { type: DataTypes.STRING(20), allowNull: false },
      storeAddress: { type: DataTypes.TEXT, allowNull: false },
      logo: DataTypes.STRING(255),
      footerLogo: DataTypes.STRING(255),
      storeDescription: DataTypes.TEXT,
      website: DataTypes.STRING(255),
      socialMedia: { type: DataTypes.JSONB, defaultValue: {} },
      businessHours: { type: DataTypes.JSONB, defaultValue: {} },
      currency: { type: DataTypes.STRING(10), defaultValue: "NPR" },
      timezone: { type: DataTypes.STRING(50), defaultValue: "Asia/Kathmandu" },
      subStoreLocations: { type: DataTypes.JSONB, defaultValue: [] },
    },
    {
      sequelize,
      modelName: "StoreSettings",
      tableName: "store_settings",
      underscored: true,
    }
  );

  return StoreSettings;
};
