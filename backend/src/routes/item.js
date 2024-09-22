const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  const { name, description, images } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "Name and description is required" });

  if (!Array.isArray(images) || images.length === 0)
    return res.status(400).json({ error: "At least one image is required" });

  const item = await prisma.item.create({
    data: {
      name,
      description,
      images: {
        create: images.map((imageId) => ({
          image: { connect: { id: imageId } },
        })),
      },
    },
    include: {
      images: true,
    },
  });

  res.status(201).json({ item });
});

router.get("/", [auth], async (req, res) => {
  const items = await prisma.item.findMany({
    where: {
      //   published: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      images: { select: { image: { select: { url: true } } } },
      _count: {
        select: {
          likedBy: true,
        },
      },
      createdAt: true,
    },
  });

  if (!items) return res.status(404).json({ error: "No item found" });

  res.status(200).json({ items });
});

router.get("/:item", [auth], async (req, res) => {
  const item = await prisma.item.findUnique({
    where: {
      id: req.params.item,
    },
    select: {
      id: true,
      name: true,
      description: true,
      images: { select: { image: { select: { url: true } } } },
      _count: {
        select: {
          likedBy: true,
        },
      },
      style: true,
      _count: {
        select: {
          likedBy: true,
        },
      },
      createdAt: true,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  res.status(200).json({ item });
});

router.patch("/:item", [auth], async (req, res) => {
  const { name, description, images } = req.body;

  if (!name && !description)
    return res.status(400).json({ error: "Name or description is required" });

  if (images && (!Array.isArray(images) || images.length === 0))
    return res.status(400).json({ error: "At least one image is required" });

  let item = await prisma.item.findUnique({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  item = await prisma.item.update({
    where: {
      id: req.params.item,
    },
    data: {
      name,
      description,
      images: {
        deleteMany: {},
        create: images.map((imageId) => ({
          image: { connect: { id: imageId } },
        })),
      },
    },
    include: {
      images: true,
    },
  });

  res.status(200).json({ item });
});

router.delete("/:item", [auth], async (req, res) => {
  const item = prisma.item.delete({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  res.status(204).end();
});

module.exports = router;
