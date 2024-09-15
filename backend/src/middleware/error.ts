import { Request, Response } from "express";
const winston = require("winston");

module.exports = function (
  err: Error,
  req: Request,
  res: Response,
  next: Function
) {
  winston.error(err.message, err);
  res.status(500).json({ message: err.message });
};
