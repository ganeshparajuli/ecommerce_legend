"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId", as: "items" });
      Order.belongsTo(models.Sale, { foreignKey: "saleId", as: "sale" });
    }
  }

  Order.init(
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
        onDelete: "RESTRICT",
      },
      totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get: decimalGetter("totalAmount"),
      },
      shippingAddress: { type: DataTypes.JSONB, allowNull: false },
      paymentMethod: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "cod" },
      status: {
        type: DataTypes.ENUM("pending", "processing", "shipped", "delivered", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      promoCode: DataTypes.STRING(50),
      discountAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        get: decimalGetter("discountAmount"),
      },
      saleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "sales", key: "id" },
        onDelete: "SET NULL",
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      underscored: true,
    }
  );

  return Order;
};
