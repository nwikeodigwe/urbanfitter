const User = require("../utils/User");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  let user = new User();
  let users = await user.findMany();

  if (users.length == 1)
    return res.status(404).json({ message: "No user found" });

  res.status(200).json(users);
};

exports.subscribeToUser = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists) return res.status(404).json({ message: "User not found" });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (isSubscribed)
    return res.status(400).json({ message: "Already subscribed" });

  let subscription = await user.subscribeTo(req.params.user);

  res.status(201).json({ subscription });
};

exports.unsubscribeFromUser = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists) return res.status(404).json({ message: "User not found" });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (!isSubscribed) return res.status(400).json({ message: "Not subscribed" });

  await user.unsubscribeFrom(req.params.user);

  res.status(200).end();
};

exports.getCurrentUser = async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
  let user = new User({
    id: req.user.id,
    name: req.body.name,
    email: req.body.email,
  });

  user = await user.save();

  res.status(200).json(user);
};

exports.updateProfile = async (req, res) => {
  const { firstname, lastname, bio } = req.body;

  const profileData = {
    ...(firstname !== undefined && { firstname }),
    ...(lastname !== undefined && { lastname }),
    ...(bio !== undefined && { bio }),
  };

  const profile = await prisma.profile.upsert({
    where: { userId: req.user.id },
    update: { ...profileData },
    create: { ...profileData, user: { connect: { id: req.user.id } } },
    select: {
      firstname: true,
      lastname: true,
      bio: true,
    },
  });

  return res.status(200).json(profile);
};

exports.getUserStyle = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  let style = await prisma.style.findMany({
    where: {
      userId: user.id,
    },
  });

  if (!style.length) return res.status(404).json({ message: "No style found" });

  return res.status(200).json({ style });
};

exports.getUserCollection = async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  let collection = await prisma.collection.findMany({
    where: {
      userId: user.id,
    },
  });

  if (!collection.length)
    return res.status(404).json({ message: "No collection found" });

  return res.status(200).json({ collection });
};

exports.updatePassword = async (req, res) => {
  let user = new User();
  user.id = req.user.id;

  let password = await user.passwordMatch(req.body.password);

  if (!password) return res.status(400).send("Invalid password");

  user.password = req.body.newpassword;
  await user.save();

  res.status(200).send("Password updated");
};

exports.getUserById = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
};
