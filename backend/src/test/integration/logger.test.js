const logger = require("../../startup/logging");

describe("Logger test", () => {
  it("Should log a message", () => {
    const spy = jest.spyOn(logger, "info");
    logger.info("Test message");
    expect(spy).toHaveBeenCalledWith("Test message");
  });
});
