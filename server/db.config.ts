import prisma from "./db";
import { testPrisma } from "./db.test";

/**
 * Database connection configuration
 *
 * Exports the appropriate database connection based on the environment:
 * - In test/development environment: Uses testPrisma (test database)
 * - In production environments: Uses prisma (main database)
 *
 * @remarks
 * This allows the application to automatically use the correct database
 * connection without requiring code changes between environments.
 *
 * @example
 * ```typescript
 * import { db } from './db.config';
 *
 * ```
 */
export const db =
  process.env.ENVIRONMENT === "production" ? prisma : testPrisma;
