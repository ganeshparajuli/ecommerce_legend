"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "series_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "category_series", key: "id" },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("products", "series_id");
  },
};
