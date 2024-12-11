const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signUp);

router.post("/signin", authController.signIn);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  authController.facebookCallback
);

router.post("/reset", authController.reset);

router.post("/reset/:token", authController.resetToken);

module.exports = router;
