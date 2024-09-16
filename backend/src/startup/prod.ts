const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app: any) {
  app.use(helmet());
  app.use(compression());
};
