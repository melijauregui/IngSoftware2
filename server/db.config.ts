import prisma from "./db";
import { testPrisma } from "./db.test";
import logger from "./logger";

// Export the appropriate database connection based on environment
export const db = process.env.NODE_ENV === "test" ? testPrisma : prisma;
