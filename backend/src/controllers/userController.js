const bcrypt = require("bcryptjs");
const User = require("../utils/User");
const _ = require("lodash");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  let users = new User();

  users = await users.findMany();

  if (users.length == 1)
    return res.status(404).json({ message: "No user found" });

  res.status(200).json(users);
};

exports.subscribeToUser = async (req, res) => {
  let user = new User();

  user = await user.findById(req.params.user);

  if (!user) return res.status(404).json({ message: "User not found" });

  let subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      subscriberId: req.user.id,
    },
  });

  if (subscription)
    return res.status(400).json({ message: "Already subscribed" });

  subscription = await prisma.userSubscription.create({
    data: {
      subscriber: {
        connect: {
          id: req.user.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  res.status(201).json({ subscription });
};

exports.unsubscribeFromUser = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: req.params.user },
        { name: req.params.user },
        { email: req.params.user },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      subscriberId: req.user.id,
    },
  });

  if (!subscription) return res.status(400).json({ message: "Not subscribed" });

  await prisma.userSubscription.delete({
    where: {
      id: subscription.id,
    },
  });

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
  const { name, email } = req.body;
  let user = new User();
  user.id = req.user.id;

  user = await user.update({ name, email });

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
  let user = await prisma.user.findFirst({
    where: {
      id: req.params.user,
    },
    select: {
      id: true,
    },
  });

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
  let user = await prisma.user.findFirst({
    where: {
      id: req.params.user,
    },
    select: {
      id: true,
    },
  });

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
  let { password, newpassword } = req.body;
  let user = new User();
  user.id = req.user.id;

  let usr = await user.find();

  if (!usr) return res.status(404).json({ message: "User not found" });

  password = await user.passwordMatch(password);

  if (!password) return res.status(400).send("Invalid password");

  user.password = newpassword;
  password = await user.hashPassword();

  await user.update({ password });

  res.status(200).send("Password updated");
};

exports.getUserById = async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
};
