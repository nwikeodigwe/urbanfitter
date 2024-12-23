const jwt = require("jsonwebtoken");
const rug = require("random-username-generator");
const mailconf = require("../config/mailconf");
const bcrypt = require("bcryptjs");
const User = require("../utils/User");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.signUp = async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.name = rug.generate(req.body.email.split("@")[0]);

  let usr = await user.find();

  if (usr) return res.status(400).json({ message: "User already exists" });

  await user.save();
  await user.mail(mailconf.welcome);

  const token = await user.createToken();

  res.status(200).json({ token });
};

exports.signIn = async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ message: "Email and password required" });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  const password = await user.passwordMatch();

  if (!password) return res.status(400).json({ message: "Invalid password" });

  const token = await user.createToken();

  res.json({ token });
};

exports.facebookCallback = (req, res) => {
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
};

exports.reset = async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ message: "Email required" });

  let user = new User();
  user.email = req.body.email;
  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  await user.createResetToken();

  res.status(200).end();
};

exports.resetToken = async (req, res) => {
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
};
