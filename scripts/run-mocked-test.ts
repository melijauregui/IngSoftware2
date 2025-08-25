const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const testFile = process.argv[2];

if (!testFile) {
  console.log("❌ Error: Debes especificar el archivo de test");
  console.log("Uso: npm run test:mocked:file <nombre-del-archivo>");
  console.log("Ejemplo: npm run test:mocked:file songs-post-test");
  console.log("");
  getAvailableTests("tests-mocked");
  process.exit(1);
}

const testFilePath = path.join("tests-mocked", `${testFile}.ts`);

// Verificar que el archivo existe
if (!fs.existsSync(testFilePath)) {
  console.log(`❌ Error: El archivo ${testFilePath} no existe`);
  getAvailableTests("tests-mocked");
  process.exit(1);
}

function runTest() {
  console.log(`Ejecutando test mocked: ${testFilePath}`);

  try {
    // Ejecutar solo el test específico
    const command = `vitest run ${testFilePath}`;

    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Test mocked completado exitosamente");
  } catch (error) {
    console.error("❌ Error ejecutando el test mocked:", error.message);
    process.exit(1);
  }
}

runTest();

export function getAvailableTests(dir) {
  console.log(`Archivos disponibles en ${dir}/:`);
  const testDir = path.join(process.cwd(), dir);
  if (fs.existsSync(testDir)) {
    const files = fs
      .readdirSync(testDir)
      .filter((file) => file.endsWith(".ts") && file !== "setup.ts")
      .map((file) => file.replace(".ts", ""));

    files.forEach((file) => {
      console.log(`   - ${file}`);
    });
  }
}
