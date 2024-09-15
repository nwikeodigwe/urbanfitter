require("express-async-errors");
const express = require("express");
const winston = require("winston");
const errorMiddleware = require("./middleware/error");
const app = express();
require("./startup/routes")(app);

process.on("uncaughtException", (ex) => {
  winston.error(ex.message, ex);
  process.exit(1);
});

winston.exceptions.handle(
  new winston.transports.File({ filename: "uncaughtExceptions.log" })
);

process.on("unhandledRejection", (ex: any) => {
  throw ex;
});

winston.add(new winston.transports.File({ filename: "logfile.log" }), {
  level: "error",
});
// winston.add(new winston.transports.Console(), {
//   level: "error",
// });
// winston.add( new winston.transports.Redis, {});

app.use(errorMiddleware);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});
