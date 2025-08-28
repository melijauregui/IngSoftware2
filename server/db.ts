// db.ts
import logger from "./logger";
import { PrismaClient } from "./generated/prisma";
import { config } from "../config";

const prisma = new PrismaClient({
  log: ["error"],
});

// Only test database connection if mode is production
if (config.ENVIRONMENT === "production") {
  // Test database connection
  prisma
    .$connect()
    .then(() => {
      logger.info("Database connection established successfully");
    })
    .catch((error: Error) => {
      logger.error(`Database connection failed: ${error.message}`);
    });
}

export { prisma };
export default prisma;
