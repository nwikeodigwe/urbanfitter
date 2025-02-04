const logger = require("../utils/Logger");

module.exports = function (err, req, res, next) {
  logger.info(err.stack);
  logger.error(err.message);
  res.status(500).json({ message: err.message });
};
