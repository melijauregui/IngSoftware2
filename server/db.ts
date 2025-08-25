// db.ts
import mysql from "mysql2/promise";
import logger from "./logger";
import { config } from "../config";

export const dbProduction = mysql.createPool({
  host: config.DB_HOST,
  port: Number(config.DATABASE_PORT),
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
});

// Only test database connection if not in test mode
if (process.env.NODE_ENV !== "test") {
  // Test database connection
  dbProduction
    .getConnection()
    .then((connection) => {
      logger.info("Database connection established successfully");
      connection.release();
    })
    .catch((error) => {
      logger.error(`Database connection failed: ${error.message}`);
    });
}
