"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NotificationSettings extends Model {
    static associate() {}
  }

  NotificationSettings.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderConfirmation: { type: DataTypes.BOOLEAN, defaultValue: true },
      orderDelivery: { type: DataTypes.BOOLEAN, defaultValue: true },
      lowStockAlert: { type: DataTypes.BOOLEAN, defaultValue: true },
      newUserRegistration: { type: DataTypes.BOOLEAN, defaultValue: true },
      orderCancellation: { type: DataTypes.BOOLEAN, defaultValue: true },
      paymentConfirmation: { type: DataTypes.BOOLEAN, defaultValue: true },
      newsletterSubscription: { type: DataTypes.BOOLEAN, defaultValue: false },
      promotionalEmails: { type: DataTypes.BOOLEAN, defaultValue: false },
      smsNotifications: { type: DataTypes.BOOLEAN, defaultValue: false },
      emailNotifications: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "NotificationSettings",
      tableName: "notification_settings",
      underscored: true,
    }
  );

  return NotificationSettings;
};
