"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class NewsletterSubscriber extends Model {
    static associate() {}
  }

  NewsletterSubscriber.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      name: DataTypes.STRING(255),
      status: {
        type: DataTypes.ENUM("active", "unsubscribed"),
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "NewsletterSubscriber",
      tableName: "newsletter_subscribers",
      underscored: true,
      createdAt: "subscribedAt",
      updatedAt: false,
    }
  );

  return NewsletterSubscriber;
};
