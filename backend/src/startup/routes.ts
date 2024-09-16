import express from "express";
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function (app: any) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/auth", auth);
  app.use(error);
};
