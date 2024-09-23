const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, logo, owner, tags } = req.body;

  name = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  if (owner) owner = owner.trim().toLowerCase();

  if (!name) return res.status(400).json({ error: "Name is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  logo = await prisma.brand.findFirst({
    where: {
      logoId: logo,
    },
  });

  if (logo)
    return res
      .status(404)
      .json({ error: "No two brands can have the same logo" });

  logo = req.body.logo || undefined;

  let brand = await prisma.brand.findUnique({
    where: { name },
    select: {
      id: true,
    },
  });

  if (brand) return res.status(400).json({ error: "Brand already exists" });

  owner = await prisma.user.findFirst({
    where: {
      OR: [{ id: owner }, { name: owner }, { email: owner }],
    },
    select: {
      id: true,
    },
  });

  owner ? (owner = owner.id) : (owner = req.user.id);

  brand = await prisma.brand.create({
    data: {
      name,
      description: req.body.description.trim() || undefined,
      logo: {
        connect: {
          id: logo,
        },
      },
      owner: {
        connect: {
          id: owner,
        },
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
    },
    select: {
      id: true,
      name: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  res.status(201).json({ brand });
});

router.get("/", [auth], async (req, res) => {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  if (!brands) return res.status(404).json({ error: "No brand found" });

  res.status(200).json({ brands });
});

router.get("/:brand", [auth], async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  res.status(200).json({ brand });
});

router.patch("/:brand", [auth], async (req, res) => {
  if (!req.body) return res.status(400).send("No data provided");

  let { name, logo, description, owner, tags } = req.body;

  name = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  brand = await prisma.brand.findUnique({
    where: { id: req.params.brand },
  });

  if (brand.name !== name) {
    let brand = await prisma.brand.findUnique({
      where: { name },
      select: {
        id: true,
      },
    });

    if (brand) return res.status(400).json({ error: "Brand already exists" });
  }

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  owner ? (owner = owner.trim().toLowerCase()) : (owner = brand.ownerId);

  name = name || brand.name;
  description = description || brand.description;
  logo = logo || brand.logoId;

  owner = await prisma.user.findFirst({
    where: {
      OR: [{ id: owner }, { name: owner }, { email: owner }],
    },
    select: {
      id: true,
    },
  });

  if (!owner) return res.status(404).json({ error: "Owner is not a user" });

  owner = owner.id;

  brand = await prisma.brand.update({
    where: {
      id: req.params.brand,
      owner: { id: req.user.id },
    },
    data: {
      name,
      description,
      logo: {
        connect: {
          id: logo,
        },
      },
      owner: {
        connect: {
          id: owner,
        },
      },
      ...(tags &&
        tags.length > 0 && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
    },
    select: {
      id: true,
      name: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  res.status(200).json({ brand });
});

router.delete("/:brand", [auth], async (req, res) => {
  let brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
      owner: {
        id: req.user.id,
      },
    },
  });

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  await prisma.brand.delete({
    where: {
      id: req.params.brand,
    },
  });

  res.status(204).end();
});

module.exports = router;
