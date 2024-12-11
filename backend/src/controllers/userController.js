const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { id: { not: req.user.id } },
    select: {
      id: true,
      name: true,
      profile: {
        select: {
          firstname: true,
          lastname: true,
          bio: true,
        },
      },
    },
  });

  if (!users.length) return res.status(404).json({ error: "No user found" });

  res.status(200).json(users);
};

exports.subscribeToUser = async (req, res) => {
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

  if (!user) return res.status(404).json({ error: "User not found" });

  let subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      subscriberId: req.user.id,
    },
  });

  if (subscription)
    return res.status(400).json({ error: "Already subscribed" });

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

  if (!user) return res.status(404).json({ error: "User not found" });

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      subscriberId: req.user.id,
    },
  });

  if (!subscription) return res.status(400).json({ error: "Not subscribed" });

  await prisma.userSubscription.delete({
    where: {
      id: subscription.id,
    },
  });

  res.status(200).end();
};

exports.getUser = async (req, res) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
    },
  });

  res.status(200).json(user);
};

exports.updateUser = async (req, res) => {
  const { name, email } = req.body;

  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      name,
      email,
    },
    select: {
      name: true,
      email: true,
    },
  });

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

exports.updatePassword = async (req, res) => {
  const { password, newpassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      password: true,
    },
  });

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) return res.status(400).send("Invalid password");

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newpassword, salt);

  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      password: hash,
    },
  });

  res.status(200).send("Password updated");
};

exports.getUserById = async (req, res) => {
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
      name: true,
      profile: {
        select: {
          firstname: true,
          lastname: true,
          bio: true,
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json(user);
};
