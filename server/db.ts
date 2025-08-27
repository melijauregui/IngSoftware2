// db.ts
import logger from "./logger";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient({
  log: ["error"],
});

// Only test database connection if not in test mode
if (process.env.NODE_ENV !== "test") {
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
