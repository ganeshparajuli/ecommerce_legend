"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CategorySeries extends Model {
    static associate(models) {
      CategorySeries.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" });
      CategorySeries.hasMany(models.Product, { foreignKey: "seriesId", as: "products" });
    }
  }

  CategorySeries.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "categories", key: "id" },
        onDelete: "CASCADE",
      },
      seriesName: { type: DataTypes.STRING(255), allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "CategorySeries",
      tableName: "category_series",
      underscored: true,
    }
  );

  return CategorySeries;
};
