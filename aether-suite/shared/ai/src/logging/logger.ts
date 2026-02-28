import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createLogger, format, transports } from "winston";

const environment = process.env.NODE_ENV ?? "development";
const isProduction = environment === "production";

const logsDirectory = join(process.cwd(), "logs");

if (isProduction && !existsSync(logsDirectory)) {
  mkdirSync(logsDirectory, { recursive: true });
}

const developmentFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const metadata = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    return `${String(timestamp)} [${level}] ${String(message)}${metadata}`;
  })
);

const productionFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  format.json()
);

const loggerTransports: transports.ConsoleTransportInstance[] | Array<transports.ConsoleTransportInstance | transports.FileTransportInstance> = [
  new transports.Console()
];

if (isProduction) {
  loggerTransports.push(
    new transports.File({ filename: join(logsDirectory, "error.log"), level: "error" }),
    new transports.File({ filename: join(logsDirectory, "combined.log") })
  );
}

export const logger = createLogger({
  level: isProduction ? "info" : "debug",
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  format: isProduction ? productionFormat : developmentFormat,
  transports: loggerTransports
});
