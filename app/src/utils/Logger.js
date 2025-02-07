const winston = require("winston");
require("express-async-errors");

class Logger {
  constructor() {
    const format = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    );
    const transports = [
      new winston.transports.File({ filename: "logs/info.log" }),
    ];

    if (process.env.NODE_ENV === "debug")
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), format),
        })
      );

    this.logger = winston.createLogger({
      level: "info",
      format,
      transports,
    });

    this.initializeLogging();
  }

  initializeLogging() {
    winston.exceptions.handle(
      new winston.transports.File({
        filename: "logs/error.log",
      })
    );

    process.on("unhandledRejection", (ex) => {
      this.logger.error(ex.message, ex);
      process.exit(1);
    });
  }

  info(message, ...args) {
    this.logger.info(message, ...args);
  }

  error(message, ...args) {
    this.logger.error(message, ...args);
  }

  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }

  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
}

module.exports = new Logger();
