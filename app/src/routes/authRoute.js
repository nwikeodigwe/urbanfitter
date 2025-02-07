const express = require("express");
const passport = require("passport");
const mailconf = require("../config/mailconf");
const User = require("../utils/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  let userExits = await user.find();

  if (userExits)
    return res.status(400).json({ message: "User already exists" });

  await user.save();
  await user.mail(mailconf.welcome);

  const login = await user.login();

  res.status(200).json({ login });
});

router.post("/signin", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  const password = await user.passwordMatch();

  if (!password) return res.status(400).json({ message: "Invalid password" });

  const login = await user.login();

  res.json({ login });
});

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.displayName,
        email: (req.user.emails && req.user.emails[0].value) || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  }
);

router.post("/reset", async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ message: "Email required" });

  let user = new User();
  user.email = req.body.email;
  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  await user.createResetToken();

  res.status(200).end();
});

router.post("/reset/:token", async (req, res) => {
  if (!req.params.token || !req.body.password)
    return res.status(400).json({ message: "Token and password required" });

  let user = new User();
  user.resetToken = req.params.token;

  const isValidResetToken = await user.isValidResetToken();

  if (!isValidResetToken)
    return res.status(400).json({ message: "Invalid reset token" });

  user.password = req.body.password;

  await user.save();

  token = await user.createToken();

  res.status(200).json({ token });
});

module.exports = router;
