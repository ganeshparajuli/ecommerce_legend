"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const ADMIN_EMAIL = "admin@superadmin.com";
const ADMIN_PASSWORD = "Admin@12345$";
const ADMIN_NAME = "Super Admin";

module.exports = {
  async up(queryInterface) {
    // Idempotent — skip if admin already exists
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      { replacements: { email: ADMIN_EMAIL } }
    );
    if (rows.length > 0) {
      console.log(`[seed] Admin user already exists (${ADMIN_EMAIL}), skipping.`);
      return;
    }

    // Hash directly — bypass the model beforeSave hook (safe in seeders)
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        id: crypto.randomUUID(),
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password,
        role: "admin",
        active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    console.log(`[seed] Admin user created: ${ADMIN_EMAIL}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: ADMIN_EMAIL }, {});
    console.log(`[seed] Admin user removed: ${ADMIN_EMAIL}`);
  },
};
