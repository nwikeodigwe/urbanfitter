require("dotenv").config();
const express = require("express");
const logger = require("./startup/logging");
const app = express();

require("./auth/passport");
require("./startup/routes")(app);
require("./startup/prod")(app);

const port = process.env.PORT || 8000;

module.exports = app.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});
