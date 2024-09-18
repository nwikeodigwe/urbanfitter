const express = require("express");
const auth = require("../routes/auth");
const user = require("../routes/user");
const post = require("../routes/post");
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
  app.use("/api/post", post);
  app.use(error);
};
