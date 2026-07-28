"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Wishlist.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
    }
  }

  Wishlist.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Wishlist",
      tableName: "wishlists",
      underscored: true,
      createdAt: "addedAt",
      updatedAt: false,
      indexes: [{ unique: true, fields: ["user_id", "product_id"] }],
    }
  );

  return Wishlist;
};
