"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    static associate() {}
  }

  Faq.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      question: { type: DataTypes.STRING(255), allowNull: false },
      answer: { type: DataTypes.TEXT, allowNull: false },
      sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "Faq",
      tableName: "faqs",
      underscored: true,
    }
  );

  return Faq;
};
