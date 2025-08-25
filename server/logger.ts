import winston, { level } from "winston";
import path from "path";
import { config } from "../config";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "white",
};

winston.addColors(colors);

// Format for console (with colors)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format for files (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
    format: fileFormat,
  }),
];

// Set log level based on environment
const logLevel = config.ENVIRONMENT === "production" ? "info" : "debug";

// Create the logger
const logger = winston.createLogger({
  level: logLevel,
  levels,
  transports,
});

export default logger;
