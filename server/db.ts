// db.ts
import mysql from "mysql2/promise";
import logger from "./logger";
import { config } from "../config";

export const db = mysql.createPool({
  host: config.DB_HOST,
  port: Number(config.DATABASE_PORT),
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
});

// Test database connection
db.getConnection()
  .then((connection) => {
    logger.info("Database connection established successfully");
    connection.release();
  })
  .catch((error) => {
    logger.error(`Database connection failed: ${error.message}`);
  });
