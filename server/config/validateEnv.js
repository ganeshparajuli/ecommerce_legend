const REQUIRED_VARS = ["JWT_SECRET_KEY", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];

module.exports = function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || String(process.env[key]).trim() === "");
  if (missing.length > 0) {
    console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }
};
