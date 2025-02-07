const logger = require("../utils/Logger");
const error = require("./error");

describe("error middleware", () => {
  it("Should log error and send a 500 response", () => {
    logger.error = jest.fn();

    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const err = new Error("Test error");

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(err.message);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: err.message });
  });
});
