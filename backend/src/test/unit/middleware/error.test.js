const winston = require("winston");
const error = require("../../../middleware/error");

describe("error middleware", () => {
  it("Should log error and send a 500 response", () => {
    winston.error = jest.fn();

    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const err = new Error("Test error");

    error(err, req, res, next);

    expect(winston.error).toHaveBeenCalledWith(err.message, err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: err.message });
  });
});
