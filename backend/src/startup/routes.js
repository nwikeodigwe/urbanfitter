const express = require("express");
const auth = require("../routes/authRoute");
const user = require("../routes/userRoute");
const collection = require("../routes/collectionRoute");
const brand = require("../routes/brandRoute");
const style = require("../routes/styleRoute");
const item = require("../routes/itemRoute");
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
