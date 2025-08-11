require("dotenv").config();

const mysql = require("mysql2/promise");
// create the connection to database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
});

async function dbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`Connected to database at ${connection.config.database}`);
    connection.release();
  } catch (error) {
    console.error("Error connecting to database: ", error);
  }
}

dbConnection();

module.exports = pool;

