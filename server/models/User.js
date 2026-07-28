"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$/;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: "userId", as: "orders" });
      User.hasMany(models.CartItem, { foreignKey: "userId", as: "cartItems" });
      User.hasMany(models.Wishlist, { foreignKey: "userId", as: "wishlist" });
      User.hasMany(models.Review, { foreignKey: "userId", as: "reviews" });
    }

    toSafeJSON() {
      const { password, ...safe } = this.toJSON();
      return safe;
    }

    validatePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("user", "admin", "sub-admin", "sales", "finance"),
        allowNull: false,
        defaultValue: "user",
      },
      image: DataTypes.STRING(255),
      phone: DataTypes.STRING(20),
      // TEXT, not STRING(255): the profile "My Addresses" UI stores a JSON-serialized
      // array of structured address objects here, which routinely exceeds 255 chars.
      address: DataTypes.TEXT,
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed("password") && !BCRYPT_HASH_PATTERN.test(user.password)) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};
