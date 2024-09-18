const express = require("express");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.get("/me", [auth], async (req, res) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      profile: true,
    },
  });

  if (!user) return res.status(404).send("User not found");

  res.status(200).json(user);
});

router.patch("/me", [auth], async (req, res) => {
  if (!req.body) return res.status(400).send("No data provided");

  const { username } = req.body;

  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      username,
    },
    select: {
      username: true,
    },
  });

  res.status(200).json({ user });
});

router.patch("/profile", [auth], async (req, res) => {
  if (!req.body) return res.status(400).send("No data provided");

  const { firstname, lastname, bio } = req.body;

  let profile = await prisma.profile.findUnique({
    where: { userId: req.user.id },
  });

  const profileData = {
    ...(firstname !== undefined && { firstname }),
    ...(lastname !== undefined && { lastname }),
    ...(bio !== undefined && { bio }),
  };

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        ...profileData,
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.status(201).json({ profile });
  }

  profile = await prisma.profile.update({
    where: {
      userId: req.user.id,
    },
    data: profileData,
  });

  res.status(200).json({ profile });
});

router.patch("/password", [auth], async (req, res) => {
  const { password, newpassword } = req.body;

  if (!password || !newpassword)
    return res.status(400).send("Password required");

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
});

module.exports = router;
