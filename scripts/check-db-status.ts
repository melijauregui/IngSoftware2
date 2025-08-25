const mysql = require("mysql2/promise");
const { execSync } = require("child_process");
import { testConfig } from "../config.test";

export async function checkDatabaseStatus(): Promise<boolean> {
  try {
    console.log("Verificando estado de la base de datos de test...");
    console.log(`Configuración de conexión:`);
    console.log(`   Host: ${testConfig.DB_HOST}`);
    console.log(`   Port: ${testConfig.DATABASE_PORT}`);
    console.log(`   User: ${testConfig.DB_USER}`);
    console.log(`   Database: ${testConfig.DB_NAME}`);
    console.log("");

    const connection = await mysql.createConnection({
      host: testConfig.DB_HOST,
      port: parseInt(testConfig.DATABASE_PORT || "3307"),
      user: testConfig.DB_USER,
      password: testConfig.DB_PASSWORD,
      database: testConfig.DB_NAME,
    });

    await connection.ping();

    // Verificar que las tablas existan
    const [tables] = await connection.execute("SHOW TABLES");

    await connection.end();

    //comprobar que las tablas sean {songs, playlists, playlists_songs}
    if (tables.length !== 3) {
      console.log("❌ Las tablas no son correctas");
      return false;
    }
    if (tables[0].Tables_in_melodia_db_test !== "playlists") {
      console.log("❌ La tabla playlists no existe");
      return false;
    }
    if (tables[1].Tables_in_melodia_db_test !== "playlists_songs") {
      console.log("❌ La tabla playlists_songs no existe");
      return false;
    }
    if (tables[2].Tables_in_melodia_db_test !== "songs") {
      console.log("❌ La tabla songs no existe");
      return false;
    }
    console.log("✅ Base de datos de test está funcionando correctamente");
    return true;
  } catch (error) {
    console.log("❌ Error verificando la base de datos de test:");
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   SQL State: ${error.sqlState || "N/A"}`);
    console.log("");
    console.log("💡 Para levantar la BD de test, ejecuta:");
    console.log("   npm run test:db:up");
    console.log("");
    console.log("💡 Para verificar el estado de Docker:");
    console.log("   docker ps");
    console.log("");
    console.log("💡 Para ver los logs del contenedor MySQL:");
    console.log("   docker logs melodia-db-test");
    return false;
  }
}

async function checkDockerStatus() {
  try {
    console.log("Verificando estado de contenedores Docker...");

    const output = execSync("docker ps --filter name=test", {
      encoding: "utf8",
    });

    if (output.includes("mysql")) {
      console.log("✅ Contenedor MySQL de test está ejecutándose");
      return true;
    } else {
      console.log("❌ Contenedor MySQL de test no está ejecutándose");
      return false;
    }
  } catch (error) {
    console.log("❌ Error verificando contenedores Docker:");
    console.log(`   ${error.message}`);
    return false;
  }
}

async function main() {
  const dockerOk = await checkDockerStatus();
  console.log("");

  if (dockerOk) {
    await checkDatabaseStatus();
  }
}

main();
