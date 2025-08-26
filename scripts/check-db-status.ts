import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { testConfig } from "../config.test";

/**
 * Checks the status of the test database and validates its configuration
 *
 * @returns Promise<boolean> - True if database is working correctly, false otherwise
 *
 * @remarks
 * This function performs the following checks:
 * - Connects to the test database using Prisma
 * - Verifies that all required tables exist (Song, Playlist, PlaylistsSongs)
 * - Validates table structure and naming
 * - Provides detailed error messages and troubleshooting tips
 *
 * @example
 * ```typescript
 * const isDatabaseReady = await checkDatabaseStatus();
 * if (isDatabaseReady) {
 *   console.log("Database is ready for testing");
 * } else {
 *   console.log("Database needs to be set up");
 * }
 * ```
 */
export async function checkDatabaseStatus(): Promise<boolean> {
  try {
    console.log("Verificando estado de la base de datos de test...");
    console.log(`Configuración de conexión:`);
    console.log(`   Host: ${testConfig.DB_HOST}`);
    console.log(`   Port: ${testConfig.DATABASE_PORT}`);
    console.log(`   User: ${testConfig.DB_USER}`);
    console.log(`   Database: ${testConfig.DB_NAME}`);
    console.log("");

    const prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });

    // Test connection
    await prisma.$connect();

    // Verificar que las tablas existan usando Prisma
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Song', 'Playlist', 'PlaylistsSongs')
      ORDER BY table_name
    `;

    await prisma.$disconnect();

    // Comprobar que las tablas sean {Song, Playlist, PlaylistsSongs}
    if (tables.length !== 3) {
      console.log("❌ Las tablas no son correctas");
      console.log(`   Tablas encontradas: ${tables.length}`);
      return false;
    }

    const tableNames = (tables as any[]).map((t) => t.table_name);

    if (!tableNames.includes("Song")) {
      console.log("❌ La tabla Song no existe");
      return false;
    }
    if (!tableNames.includes("Playlist")) {
      console.log("❌ La tabla Playlist no existe");
      return false;
    }
    if (!tableNames.includes("PlaylistsSongs")) {
      console.log("❌ La tabla PlaylistsSongs no existe");
      return false;
    }

    console.log("✅ Base de datos de test está funcionando correctamente");
    console.log(`   Tablas encontradas: ${tableNames.join(", ")}`);
    return true;
  } catch (error) {
    console.log("❌ Error verificando la base de datos de test:");
    console.log(`   Código: ${(error as any).code || "N/A"}`);
    console.log(`   Mensaje: ${(error as any).message}`);
    console.log("");
    console.log("💡 Para levantar la BD de test, ejecuta:");
    console.log("   npm run test:db:up");
    console.log("");
    console.log("💡 Para verificar el estado de Docker:");
    console.log("   docker ps");
    console.log("");
    console.log("💡 Para ver los logs del contenedor PostgreSQL:");
    console.log("   docker logs melodia-db-test");
    console.log("");
    console.log("💡 Para ejecutar las migraciones de Prisma:");
    console.log("   npx prisma migrate deploy");
    return false;
  }
}

/**
 * Checks if the test PostgreSQL Docker container is running
 *
 * @returns Promise<boolean> - True if container is running, false otherwise
 *
 * @remarks
 * Uses the `docker ps` command to check for containers with "test" in the name.
 * Specifically looks for a PostgreSQL container for testing.
 *
 * @example
 * ```typescript
 * const isDockerRunning = await checkDockerStatus();
 * if (isDockerRunning) {
 *   console.log("Docker container is running");
 * } else {
 *   console.log("Docker container is not running");
 * }
 * ```
 */
async function checkDockerStatus() {
  try {
    console.log("Verificando estado de contenedores Docker...");

    const output = execSync("docker ps --filter name=test", {
      encoding: "utf8",
    });

    if (output.includes("postgres")) {
      console.log("✅ Contenedor PostgreSQL de test está ejecutándose");
      return true;
    } else {
      console.log("❌ Contenedor PostgreSQL de test no está ejecutándose");
      return false;
    }
  } catch (error) {
    console.log("❌ Error verificando contenedores Docker:");
    console.log(`   ${(error as any).message}`);
    return false;
  }
}

/**
 * Main function that orchestrates the database status check
 *
 * @remarks
 * This function:
 * 1. First checks if the Docker container is running
 * 2. If Docker is running, checks the database status
 * 3. Provides comprehensive feedback about the system state
 *
 * @example
 * ```typescript
 * // This function is called when the script is executed directly
 * main();
 * ```
 */
async function main() {
  const dockerOk = await checkDockerStatus();
  console.log("");

  if (dockerOk) {
    await checkDatabaseStatus();
  }
}

main();
