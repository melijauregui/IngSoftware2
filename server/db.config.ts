import prisma from "./db";
import { testPrisma } from "./db.test";
import logger from "./logger";

/**
 * Database connection configuration
 *
 * Exports the appropriate database connection based on the environment:
 * - In test environment: Uses testPrisma (test database)
 * - In other environments: Uses prisma (development/production database)
 *
 * @remarks
 * This allows the application to automatically use the correct database
 * connection without requiring code changes between environments.
 *
 * @example
 * ```typescript
 * import { db } from './db.config';
 *
 * // This will use test database in test environment
 * // and production database in other environments
 * const playlists = await db.playlist.findMany();
 * ```
 */
export const db = process.env.NODE_ENV === "test" ? testPrisma : prisma;
