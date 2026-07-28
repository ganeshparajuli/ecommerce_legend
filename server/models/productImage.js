"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
    }
  }

  ProductImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
      url: { type: DataTypes.STRING(500), allowNull: false },
      sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
      isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize,
      modelName: "ProductImage",
      tableName: "product_images",
      underscored: true,
    }
  );

  return ProductImage;
};
