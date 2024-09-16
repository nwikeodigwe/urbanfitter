const express = require("express");
const logger = require("./startup/logging");
const app = express();

require("./startup/routes")(app);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  logger.info(`Listening on port ${port}...`);
});
