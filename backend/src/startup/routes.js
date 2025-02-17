const express = require("express");
const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");
const brandRoute = require("../routes/brandRoute");
const styleRoute = require("../routes/styleRoute");
const itemRoute = require("../routes/itemRoute");
const collectionRoute = require("../routes/collectionRoute");
const error = require("../middleware/error");
const auth = require("../middleware/auth");
const passport = require("passport");
const cors = require("cors");

module.exports = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use("/api/auth", authRoute);
  app.use(auth);
  app.use("/api/user", userRoute);
  app.use("/api/collection", collectionRoute);
  app.use("/api/brand", brandRoute);
  app.use("/api/style", styleRoute);
  app.use("/api/item", itemRoute);
  app.use(error);
};
