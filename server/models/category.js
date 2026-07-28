"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" });
      Category.hasMany(models.CategorySeries, { foreignKey: "categoryId", as: "series" });
      Category.hasMany(models.Product, { foreignKey: "categoryId", as: "products" });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      slug: DataTypes.STRING(100),
      brandId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "brands", key: "id" },
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      underscored: true,
    }
  );

  return Category;
};
