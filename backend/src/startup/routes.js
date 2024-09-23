const express = require("express");
const auth = require("../routes/auth");
const user = require("../routes/user");
const collection = require("../routes/collection");
const brand = require("../routes/brand");
const style = require("../routes/style");
const item = require("../routes/item");
const error = require("../middleware/error");
const passport = require("passport");
const cors = require("cors");

module.exports = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/collection", collection);
  app.use("/api/brand", brand);
  app.use("/api/style", style);
  app.use("/api/item", item);
  app.use(error);
};
