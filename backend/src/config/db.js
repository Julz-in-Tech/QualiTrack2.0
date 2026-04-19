const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "qualitrack",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

module.exports = pool;
