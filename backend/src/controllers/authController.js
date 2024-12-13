const jwt = require("jsonwebtoken");
const rug = require("random-username-generator");
const mail = require("../functions/mail");
const mailconf = require("../config/mailconf");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.signUp = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) return res.status(400).json({ message: "User already exists" });

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  const name = rug.generate(email.split("@")[0]);

  user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  user = _.pick(user, "id", "name", "email");
  result = await mail(user, mailconf.welcome);

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch)
    return res.status(400).json({ message: "Invalid password" });
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
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
  let { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  await prisma.reset.updateMany({
    where: { user: { id: user.id }, expires: { lte: new Date() } },
    data: { expires: new Date() },
  });

  const salt = await bcrypt.genSalt(10);
  const token = salt.substr(20);

  const reset = await prisma.reset.create({
    data: {
      token: token.toString(),
      expires: new Date(Date.now() + 600000),
      user: { connect: { id: user.id } },
    },
  });

  res.status(200).json({ reset });
};

exports.resetToken = async (req, res) => {
  let { token } = req.params;
  let { password } = req.body;

  if (!token || !password)
    return res.status(400).json({ message: "Token and password required" });

  const reset = await prisma.reset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset) return res.status(400).json({ message: "Invalid token" });

  if (reset.expires < new Date())
    return res.status(400).json({ message: "Token expired" });

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: reset.user.id },
    data: { password },
  });

  await prisma.reset.update({
    where: { token },
    data: { expires: new Date() },
  });

  token = jwt.sign(
    {
      id: reset.user.id,
      username: reset.user.name,
      email: reset.user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token });
};
