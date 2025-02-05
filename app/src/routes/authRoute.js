const express = require("express");
const passport = require("passport");
const rug = require("random-username-generator");
const logger = require("../utils/Logger");
const mailconf = require("../config/mailconf");
const User = require("../utils/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.name = rug.generate(req.body.email.split("@")[0]);

  logger.info(`Finding user ${user.name}`);
  let userExits = await user.find();

  if (userExits)
    return res.status(400).json({ message: "User already exists" });

  logger.info(`Saving user ${user.name}`);
  await user.save();
  await user.mail(mailconf.welcome);

  logger.info(`Creating token for user ${user.name}`);
  const token = await user.createToken();

  res.status(200).json({ token });
});

router.post("/signin", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  logger.info(`Finding user...`);
  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  logger.info(`Matching password for user ${usr.id}`);
  const password = await user.passwordMatch();

  if (!password) return res.status(400).json({ message: "Invalid password" });

  logger.info(`Creating token for user ${usr.id}`);
  const token = await user.createToken();

  res.json({ token });
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
