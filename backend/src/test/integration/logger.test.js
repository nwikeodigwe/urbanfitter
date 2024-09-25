const winston = require("winston");
const { logger, initializeLogging } = require("../../startup/logging");

describe("Logger configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should log a message", () => {
    const spy = jest.spyOn(logger, "info");
    logger.info("Test message");
    expect(spy).toHaveBeenCalledWith("Test message");
  });

  it("should handle uncaught exceptions with the correct transport", () => {
    const exceptionsHandleSpy = jest.spyOn(winston.exceptions, "handle");

    initializeLogging();

    expect(exceptionsHandleSpy).toHaveBeenCalledWith(
      expect.any(winston.transports.File)
    );

    const handledTransport = exceptionsHandleSpy.mock.calls[0][0];
    expect(handledTransport.filename).toEqual("uncaughtExceptions.log");
  });

  it("should log unhandled rejections and exit the process", () => {
    const errorSpy = jest.spyOn(winston, "error");

    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    initializeLogging();

    const rejectionError = new Error("Unhandled rejection");
    process.emit("unhandledRejection", rejectionError);

    expect(errorSpy).toHaveBeenCalledWith(
      rejectionError.message,
      rejectionError
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
