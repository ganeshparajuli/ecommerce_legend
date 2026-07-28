"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      Brand.hasMany(models.Category, { foreignKey: "brandId", as: "categories" });
      Brand.hasMany(models.Product, { foreignKey: "brandId", as: "products" });
    }
  }

  Brand.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      image: DataTypes.STRING(255),
      slug: { type: DataTypes.STRING(100), unique: true },
      description: DataTypes.TEXT,
      featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "brands",
      underscored: true,
    }
  );

  return Brand;
};
