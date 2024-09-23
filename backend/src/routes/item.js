const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, description, brand, images, creator, tags } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "Name and description is required" });

  if (!Array.isArray(images) || images.length === 0)
    return res.status(400).json({ error: "At least one image is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  console.log(tags);
  if (tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  if (!brand) return res.status(404).json({ error: "Brand is required" });

  brand = brand
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "");

  creator = await prisma.user.findFirst({
    where: {
      OR: [{ id: creator }, { name: creator }, { email: creator }],
    },
    select: {
      id: true,
    },
  });

  creator ? (creator = creator.id) : (creator = req.user.id);

  const item = await prisma.item.create({
    data: {
      name,
      description,
      brand: {
        connectOrCreate: {
          where: { name: brand },
          create: { name: brand },
        },
      },
      images: {
        create: images.map((imageId) => ({
          image: { connect: { id: imageId } },
        })),
      },
      ...(tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      creator: {
        connect: {
          id: creator,
        },
      },
    },
    include: {
      tags: { select: { name: true } },
      images: { select: { image: { select: { url: true } } } },
      brand: { select: { name: true } },
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
      tags: { select: { name: true } },
      brand: { select: { name: true } },
      creator: { select: { name: true } },
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
      tags: { select: { name: true } },
      brand: { select: { name: true } },
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
  let { name, description, images, tags, creator } = req.body;

  if (images && (!Array.isArray(images) || images.length === 0))
    return res.status(400).json({ error: "At least one image is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let item = await prisma.item.findUnique({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  if (creator) {
    creator = await prisma.user.findFirst({
      where: { OR: [{ id: creator }, { name: creator }, { email: creator }] },
      select: { id: true },
    });
    creator = creator.id || undefined;
  }

  name = name || item.name;
  description = description || item.description;
  images = images || item.images.map((image) => image.id);
  creator = creator || item.creatorId;

  item = await prisma.item.update({
    where: {
      id: req.params.item,
      creator: { id: req.user.id },
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
      ...(!!tags &&
        tags.length > 0 && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      ...(creator && {
        creator: {
          connect: {
            id: creator,
          },
        },
      }),
    },
    include: {
      images: { select: { image: { select: { url: true } } } },
      tags: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });

  res.status(200).json({ item });
});

router.delete("/:item", [auth], async (req, res) => {
  const item = prisma.item.delete({
    where: {
      id: req.params.item,
      creatorId: req.user.id,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  res.status(204).end();
});

module.exports = router;
