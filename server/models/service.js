"use strict";
const { Model } = require("sequelize");
const decimalGetter = require("../utils/decimalGetter");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate() {}
  }

  Service.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING(255),
      description: DataTypes.TEXT,
      price: {
        type: DataTypes.DECIMAL(12, 2),
        get: decimalGetter("price"),
      },
      imageUrl: DataTypes.STRING(500),
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "services",
      underscored: true,
    }
  );

  return Service;
};
