const fs = require("fs");
const path = require("path");

const logsDir = path.join(process.cwd(), "logs");

// Función para limpiar códigos de color ANSI de un string
function stripAnsiColors(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// Función para procesar un archivo de log
function processLogFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const cleanedLines = lines.map((line) => stripAnsiColors(line));
    const cleanedContent = cleanedLines.join("\n");

    fs.writeFileSync(filePath, cleanedContent);
    console.log(`✅ Limpiado: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Procesar todos los archivos de log
if (fs.existsSync(logsDir)) {
  const files = fs.readdirSync(logsDir);
  const logFiles = files.filter((file) => file.endsWith(".log"));

  if (logFiles.length === 0) {
    console.log("No se encontraron archivos de log para limpiar");
  } else {
    console.log(`Limpiando ${logFiles.length} archivo(s) de log...`);
    logFiles.forEach((file) => {
      processLogFile(path.join(logsDir, file));
    });
    console.log("✨ Limpieza completada");
  }
} else {
  console.log("📁 Directorio de logs no encontrado");
}
