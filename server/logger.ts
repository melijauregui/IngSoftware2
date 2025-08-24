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

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
  }),
];

// Set log level based on environment
const logLevel = config.ENVIRONMENT === "production" ? "info" : "debug";

// Create the logger
const logger = winston.createLogger({
  level: logLevel,
  levels,
  format,
  transports,
});

export default logger;
