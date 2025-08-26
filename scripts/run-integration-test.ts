const { execSync } = require("child_process");
const path = require("path");
import { checkDatabaseStatus } from "./check-db-status";
const fs = require("fs");

function getAvailableTests(dir: string) {
  console.log(`Archivos disponibles en ${dir}/:`);
  const testDir = path.join(process.cwd(), dir);
  if (fs.existsSync(testDir)) {
    const files = fs
      .readdirSync(testDir)
      .filter((file: string) => file.endsWith(".ts") && file !== "setup.ts")
      .map((file: string) => file.replace(".ts", ""));

    files.forEach((file: string) => {
      console.log(`   - ${file}`);
    });
  }
}

const testFile = process.argv[2];

if (!testFile) {
  console.log("❌ Error: Debes especificar el archivo de test");
  console.log("📝 Uso: npm run test:integration:file <nombre-del-archivo>");
  console.log("📝 Ejemplo: npm run test:integration:file songs-post-test");
  console.log("");
  console.log(" Primero asegúrate de que la BD de test esté levantada:");
  console.log("   npm run test:db:up");
  console.log("");
  getAvailableTests("tests-integracion");
  process.exit(1);
}

const testFilePath = path.join("tests-integracion", `${testFile}.ts`);

// Verificar que el archivo existe
if (!fs.existsSync(testFilePath)) {
  console.log(`❌ Error: El archivo ${testFilePath} no existe`);
  getAvailableTests("tests-integracion");
  process.exit(1);
}

async function runTest() {
  console.log(`Verificando conexión a BD antes de ejecutar: ${testFilePath}`);

  // Verificar que la BD esté disponible
  const dbAvailable = await checkDatabaseStatus();
  if (!dbAvailable) {
    process.exit(1);
  }

  console.log(`Ejecutando test de integración: ${testFilePath}`);

  try {
    // Ejecutar solo el test específico
    const command = `vitest run --config vitest.integration.config.ts ${testFilePath}`;

    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Test completado exitosamente");
  } catch (error) {
    console.error("❌ Error ejecutando el test:", error.message);
    process.exit(1);
  }
}

runTest();
