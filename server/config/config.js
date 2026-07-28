require("dotenv").config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  dialect: process.env.DB_DIALECT || "postgres",
  logging: false,
  pool: {
    max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX) : 10,
    min: process.env.DB_POOL_MIN ? Number(process.env.DB_POOL_MIN) : 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = {
  development: base,
  test: {
    ...base,
    database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`,
  },
  production: {
    ...base,
    dialectOptions: process.env.DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  },
};
