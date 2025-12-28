import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "test.log" }),
    new winston.transports.File({ filename: "errors.log", level: "error" }),
  ],
});
