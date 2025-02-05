const winston = require("winston");
require("express-async-errors");

class Logger {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: "logfile.log" }),
      ],
    });

    this.initializeLogging();
  }

  initializeLogging() {
    winston.exceptions.handle(
      new winston.transports.File({ filename: "uncaughtExceptions.log" })
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
