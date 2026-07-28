"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SplashScreen extends Model {
    static associate(models) {
      SplashScreen.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
    }
  }

  SplashScreen.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: DataTypes.TEXT,
      imageUrl: DataTypes.STRING(500),
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "products", key: "id" },
        onDelete: "SET NULL",
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      displayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      buttonText: DataTypes.STRING(100),
      buttonLink: DataTypes.STRING(500),
      backgroundColor: DataTypes.STRING(7),
      textColor: DataTypes.STRING(7),
    },
    {
      sequelize,
      modelName: "SplashScreen",
      tableName: "splash_screens",
      underscored: true,
    }
  );

  return SplashScreen;
};
